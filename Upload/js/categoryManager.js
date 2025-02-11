// File: js/categoryManager.js
document.addEventListener('DOMContentLoaded', function() {

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
