// File: js/categoryManager.js
// Now only handles search and UI interactions, not content loading

document.addEventListener('DOMContentLoaded', function() {
    // Handle search functionality
    const searchInput = document.getElementById('categorySearch');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            
            // Filter categories
            document.querySelectorAll('.category-group').forEach(group => {
                const groupText = group.textContent.toLowerCase();
                const isVisible = groupText.includes(searchTerm);
                group.style.display = isVisible ? 'block' : 'none';
            });

            // Filter Q&A content
            document.querySelectorAll('.qa-item').forEach(item => {
                const itemText = item.textContent.toLowerCase();
                const isVisible = itemText.includes(searchTerm);
                item.style.display = isVisible ? 'block' : 'none';
            });
        });
    }

    // Handle responsive design
    function handleResponsiveDesign() {
        const categories = document.querySelector('.categories');
        if (categories) {
            const width = window.innerWidth;
            categories.style.gridTemplateColumns = 
                width < 576 ? '1fr' :
                width < 992 ? 'repeat(2, 1fr)' :
                'repeat(3, 1fr)';
        }
    }

    handleResponsiveDesign();
    window.addEventListener('resize', handleResponsiveDesign);
});
