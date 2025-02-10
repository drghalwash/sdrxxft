// File: /js/search.js
/********************************************
 * File: /js/search.js
 * Description:
 * - Handles search functionality.
 * - Filters categories and Q&A blocks based on the search term.
 * - Displays a styled "No results found" message when no matches exist.
 * - Hides Categories and Q&A sections when no matches are found.
 * - Highlights search terms in Q&A answers with a pop-up effect.
 * - Integrates with DeepSeek-R1 via OpenRouter for enhanced search.
 ********************************************/

// Inject inline CSS for search styling
function injectSearchStyles() {
    const style = document.createElement('style');
    style.textContent = `
    /* Hide mismatched elements */
    .category-hidden { display: none !important; }
    .qa-hidden {
        opacity: 0;
        height: 0;
        overflow: hidden;
        transition: all 0.3s ease;
    }
    /* Highlight for potential search term wrap */
    .search-highlight {
        background-color: #fff3d6;
        padding: 2px 5px;
        border-radius: 3px;
        animation: pulseHighlight 1.5s ease-in-out;
    }
    @keyframes pulseHighlight {
        0% { transform: scale(1); background-color: #fff3d6; }
        50% { transform: scale(1.1); background-color: #ffef99; }
        100% { transform: scale(1); background-color: #fff3d6; }
    }
    /* Results counter style */
    .search-results-count {
        color: #394464;
        font-weight: bold;
        margin: 15px 0;
        display: none; /* Hidden by default */
    }
    .search-results-count.search-no-results {
        color: #d9534f;
        font-style: italic;
        font-size: 2em; /* Makes the font bigger */
        text-align: center; /* Centers the text */
        width: 100%; /* Ensures it takes the full width */
        padding: 20px; /* Adds some padding for better visibility */
        background-color: #f2dede; /* Light red background */
        border: 1px solid #ebccd1; /* Red border */
        border-radius: 5px; /* Rounded corners */
    }
     /* Loading indicator */
    .search-loading {
      color: #007bff;
      font-style: italic;
    }
  `;
    document.head.appendChild(style);
}

// Debounce function to limit search execution frequency
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Highlight search terms in text content
function highlightText(content, term, deepSeekResponse = null) {
    let searchTerm = term;
    if (deepSeekResponse) {
        searchTerm = deepSeekResponse;
    }
    if (!searchTerm) return content; // If no term, return original content

    const regex = new RegExp(`(${searchTerm})`, 'gi'); // Match term case-insensitively
    return content.replace(regex, '<span class="search-highlight">$1</span>');
}

// DeepSeek-R1 API interaction (OpenRouter)
async function queryDeepSeek(searchTerm) {
    const apiKey = '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'; // Replace with your actual API key
    const apiUrl = 'https://openrouter.ai/api/v1/chat/completions';  // Correct OpenRouter endpoint
    const model = 'deepseek/deepseek-r1:free'; // Specify the DeepSeek model

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json`,
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    {
                        role: "system",
                        content: `You are a medical search assistant specialized in helping patients understand healthcare information. 
                        Analyze the search query for:
                        1. Potential medical conditions/symptoms
                        2. Treatment options
                        3. Medication questions
                        4. Procedure explanations
                        5. Recovery guidance
                        Always prioritize:
                        - Patient safety
                        - Clear layman explanations
                        - Credible sources (WHO, CDC, peer-reviewed journals)
                        - Red flag symptom identification
                        Format responses with relevant medical keywords for Q&A matching.`
                    },
                    { 
                        role: "user", 
                        content: `Patient query: "${searchTerm}". 
                        Provide medical-context search terms and related Q&A topics. 
                        Highlight urgent care recommendations if needed.` 
                    }
                ],
                temperature: 0.3,
                max_tokens: 150,
                top_p: 0.9
            }),
        });

        if (!response.ok) {
            console.error('DeepSeek API error:', response.status, response.statusText);
            return null;
        }

        const data = await response.json();
        // Assuming the response structure has a 'choices' array, and the first choice has a 'message' with 'content'
        if (data.choices && data.choices.length > 0 && data.choices[0].message && data.choices[0].message.content) {
            return data.choices[0].message.content.trim();
        } else {
            console.warn('Unexpected DeepSeek API response structure:', data);
            return null;
        }
    } catch (error) {
        console.error('Error querying DeepSeek API:', error);
        return null;
    }
}

// Core search handler function
async function handleSearch(generateCategoryLinkText) {
    const searchInput = document.getElementById('categorySearch');
    if (!searchInput) return;

    const countElement = document.querySelector('.search-results-count');

    const debouncedSearch = debounce(async function (term) {
        let matchCount = 0;

        // --- Selectors for Categories and Q&A Sections ---
        const categorySection = document.querySelector('.categories-container'); // Categories container
        const qaContainer = document.querySelector('.bsb-faq-3 .row'); // Q&A container

        // --- Filter Category Navigation ---
        document.querySelectorAll('.category-group').forEach(group => {
            const groupName = group.querySelector('h3').textContent.toLowerCase();
            let hasVisibleItems = false;

            group.querySelectorAll('.category-item').forEach(item => {
                const itemText = item.textContent.toLowerCase();
                const isMatch = itemText.includes(term) || groupName.includes(term);
                item.style.display = isMatch ? 'block' : 'none';
                if (isMatch) hasVisibleItems = true;
            });

            group.style.display = hasVisibleItems ? 'block' : 'none';
        });

        // --- Filter Q&A Blocks ---
        if (term) {
            //Loading indicator
            countElement.textContent = 'Searching...';
            countElement.classList.add('search-loading');
            countElement.style.display = 'block';

            const deepSeekResponse = await queryDeepSeek(term);
            countElement.classList.remove('search-loading');

            document.querySelectorAll('.mb-8').forEach(section => {
                const sectionTitle = section.querySelector('h3')?.textContent.toLowerCase() || '';
                const questions = section.querySelectorAll('.accordion-item');
                let sectionHasMatch = false;

                questions.forEach(item => {
                    const questionElement = item.querySelector('.btn-link');
                    const answerElement = item.querySelector('.accordion-body');

                    // Save original content to avoid duplication issues
                    if (!answerElement.dataset.originalContent) {
                        answerElement.dataset.originalContent = answerElement.innerHTML.trim();
                    }

                    const originalQuestionText = questionElement.textContent.toLowerCase();
                    const originalAnswerText = answerElement.dataset.originalContent.toLowerCase();

                    let isMatch = false;
                    if (deepSeekResponse) {
                        isMatch = originalQuestionText.includes(deepSeekResponse) || originalAnswerText.includes(deepSeekResponse);
                    }
                    if (!deepSeekResponse || !isMatch) {
                        // Fallback to original term if DeepSeek fails or doesn't match
                        isMatch = originalQuestionText.includes(term) || originalAnswerText.includes(term);
                    }

                    if (isMatch && term.length > 0) {
                        // Highlight matching terms
                        questionElement.innerHTML = highlightText(questionElement.textContent, term, deepSeekResponse);
                        answerElement.innerHTML = highlightText(
                            answerElement.dataset.originalContent,
                            term,
                            deepSeekResponse
                        );
                        sectionHasMatch = true;
                    } else if (term.length === 0) {
                        // Reset to original content when term is cleared
                        questionElement.innerHTML = questionElement.textContent;
                        answerElement.innerHTML = answerElement.dataset.originalContent;
                    }

                    item.style.display = isMatch ? '' : 'none';

                    // Expand matching items
                    if (isMatch && term.length > 0) {
                        const collapseElement = item.querySelector('.collapse');
                        if (collapseElement && !collapseElement.classList.contains('show')) {
                            new bootstrap.Collapse(collapseElement, { show: true });
                        }
                    }
                });

                // Show/hide entire section based on matches
                section.style.display = questions.some(item => item.style.display !== 'none') ? '' : 'none';

                if ((sectionHasMatch || sectionTitle.includes(term)) && term !== '') {
                    section.classList.remove('qa-hidden');
                    matchCount++;
                } else if (term === '') {
                    // When search term is cleared, reset all blocks
                    section.classList.remove('qa-hidden');
                } else {
                    section.classList.add('qa-hidden');
                }
            });
        } else {
            //When the search term is cleared.
            countElement.style.display = 'none';

            // Show Categories and Q&A sections when input is cleared
            if (categorySection) categorySection.style.display = 'block';
            if (qaContainer) qaContainer.style.display = 'block';
            // Remove highlights when search term is cleared
            document.querySelectorAll('.accordion-body').forEach(body => {
                body.innerHTML = body.dataset.originalContent || body.textContent; // Revert to original text
            });
        }

        // --- Update the Search Results Counter and Hide Sections ---
        if (term) {
            if (matchCount > 0) {
                countElement.textContent = `${matchCount} result${matchCount > 1 ? 's' : ''} found`;
                countElement.classList.remove('search-no-results');

                // Show Categories and Q&A sections
                if (categorySection) categorySection.style.display = 'block';
                if (qaContainer) qaContainer.style.display = 'block';
            } else {
                countElement.textContent = `No results found for "${term}". Please try a different search.`;
                countElement.classList.add('search-no-results');

                // Hide Categories and Q&A sections
                if (categorySection) categorySection.style.display = 'none';
                if (qaContainer) qaContainer.style.display = 'none';
            }

            countElement.style.display = 'block'; // Ensure the counter is visible
        } else {
            countElement.style.display = 'none'; // Hide counter when input is cleared

            // Show Categories and Q&A sections when input is cleared
            if (categorySection) categorySection.style.display = 'block';
            if (qaContainer) qaContainer.style.display = 'block';
            // Remove highlights when search term is cleared
            document.querySelectorAll('.accordion-body').forEach(body => {
                body.innerHTML = body.dataset.originalContent || body.textContent; // Revert to original text
            });
        }
    }, 300);

    searchInput.addEventListener('input', function (e) {
        const term = e.target.value.toLowerCase().trim();
        debouncedSearch(term);
    });
}

// Initialize search functionality—inject styles and set up event handlers
function initializeSearch(generateCategoryLinkText) {
    injectSearchStyles();
    handleSearch(generateCategoryLinkText);
}

// Expose our initialization so it can be invoked on DOMContentLoaded
window.initializeSearch = initializeSearch;
