// File: /js/search.js
function handleSearch(generateCategoryLinkText) {
    const searchInput = document.getElementById('categorySearch');
    if (!searchInput) return;

    const debouncedSearch = debounce(function (term) {
        let matchCount = 0;

        // --- Selectors ---
        const categorySection = document.querySelector('.categories-container');
        const qaContainer = document.querySelector('.bsb-faq-3 .row');
        const countElement = document.querySelector('.search-results-count');
        const categoryWrapper = document.querySelector('[style="width: 85%;"]'); // Select the category wrapper

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
        document.querySelectorAll('.mb-8').forEach(section => {
            const sectionTitle = section.querySelector('h3')?.textContent.toLowerCase() || '';
            const questions = section.querySelectorAll('.accordion-item');
            let sectionHasMatch = false;

            questions.forEach(item => {
                const questionText = item.querySelector('.btn-link')?.textContent.toLowerCase() || '';
                const answerText = item.querySelector('.accordion-body')?.textContent.toLowerCase() || '';
                const contentText = `${questionText} ${answerText}`;

                const isMatch = contentText.includes(term);
                item.style.display = isMatch ? '' : 'none';
                if (isMatch) sectionHasMatch = true;

                // Expand matching items
                if (isMatch && term.length > 0) {
                    const collapseElement = item.querySelector('.collapse');
                    if (collapseElement && !collapseElement.classList.contains('show')) {
                        new bootstrap.Collapse(collapseElement, { show: true });
                    }
                }
            });

            // Show/hide entire section based on matches
            section.style.display = sectionHasMatch || sectionTitle.includes(term) ? '' : 'none';

            if ((sectionHasMatch || sectionTitle.includes(term)) && term !== "") {
                section.classList.remove('qa-hidden');
                matchCount++;
            } else if (term === "") {
                // When search term is cleared, reset all blocks
                section.classList.remove('qa-hidden');
            } else {
                section.classList.add('qa-hidden');
            }
        });

        // --- Update the Search Results Counter and Hide Sections ---
        if (term) {
            if (matchCount > 0) {
                countElement.textContent = `${matchCount} result${matchCount > 1 ? 's' : ''} found`;
                countElement.classList.remove('search-no-results');
                countElement.style.fontSize = ''; // Reset font size
                countElement.style.textAlign = ''; // Reset text align
                countElement.style.color = ''; // Reset color
                countElement.style.padding = ''; // Reset padding
                countElement.style.display = 'block';

                if (categorySection) categorySection.style.display = 'block';
                if (qaContainer) qaContainer.style.display = 'block';
                if (categoryWrapper) categoryWrapper.style.display = 'block'; // Show category wrapper

            } else {
                countElement.textContent = `No results found for "${term}". Please try a different search.`;
                countElement.classList.add('search-no-results');
                countElement.style.fontSize = '3em'; // Larger font size
                countElement.style.textAlign = 'center'; // Center align
                countElement.style.color = '#d9534f'; // Error color
                countElement.style.padding = '50px 0'; // Add vertical padding
                countElement.style.display = 'block';

                if (categorySection) categorySection.style.display = 'none';
                if (qaContainer) qaContainer.style.display = 'none';
                if (categoryWrapper) categoryWrapper.style.display = 'flex'; // Use flex to center the message
                categoryWrapper.style.justifyContent = 'center'; // Center horizontally
                categoryWrapper.style.alignItems = 'center'; // Center vertically
            }
        } else {
            countElement.style.display = 'none';
            if (categorySection) categorySection.style.display = 'block';
            if (qaContainer) qaContainer.style.display = 'block';
             if (categoryWrapper) categoryWrapper.style.display = 'block'; // Ensure wrapper is visible when clearing search
             if (categoryWrapper) categoryWrapper.style.justifyContent = ''; // Ensure wrapper is visible when clearing search
             if (categoryWrapper) categoryWrapper.style.alignItems = ''; // Ensure wrapper is visible when clearing search
        }

        // --- Auto Labeling of Visible Q&A Results ---
        const visibleBlocks = document.querySelectorAll('.mb-8:not(.qa-hidden)');
        // Remove any existing result labels
        visibleBlocks.forEach(block => {
            const prevLabel = block.querySelector('.result-label');
            if (prevLabel) {
                prevLabel.remove();
            }
        });
        // If search term is active, add a label to each visible result
        if (visibleBlocks.length > 0 && term !== "") {
            let count = 1;
            visibleBlocks.forEach(block => {
                const label = document.createElement('div');
                label.className = 'result-label';
                label.textContent = 'Result ' + count++;
                block.insertBefore(label, block.firstChild);
            });
        }
    }, 300);

    searchInput.addEventListener('input', function (e) {
        const term = e.target.value.toLowerCase().trim();
        debouncedSearch(term);
    });
}
