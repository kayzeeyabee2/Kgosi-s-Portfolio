// script.js
// Page navigation
function showPage(pageId) {
    // Update navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === pageId) {
            link.classList.add('active');
        }
    });
    
    // Hide all pages
    document.querySelectorAll('.page-container').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show the requested page
    document.getElementById(`${pageId}-page`).classList.add('active');
    
    // If showing models page, initialize the 3D viewer
    if (pageId === 'models') {
        init3DViewer();
    }
}

// Set up navigation links
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        showPage(link.dataset.page);
    });
});