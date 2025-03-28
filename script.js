// script.js

// Add a subtle fade-in animation when the page loads
document.addEventListener('DOMContentLoaded', function() {
    document.body.classList.add('fade-in');
    
    // Add smooth scrolling for all links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Add active class to current page in navigation
    const currentLocation = window.location.pathname;
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        
        // Check if the current page matches the link
        if (currentLocation.includes(linkPath) && linkPath !== '/') {
            link.classList.add('active');
        } else if (currentLocation === '/' && linkPath === '/') {
            link.classList.add('active');
        }
    });
    
    // Mobile menu toggle (if needed for smaller screens)
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('nav ul');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
    }
});

// Simple function to create a new blog post from Markdown
// This would be used in an admin interface
function createBlogPost(title, markdown, category, date) {
    // In a real implementation, this would send data to a server
    // For now, it just demonstrates the concept
    console.log('New blog post:', {
        title,
        markdown,
        category,
        date
    });
    
    // Convert markdown to HTML (using the marked library)
    if (typeof marked !== 'undefined') {
        const html = marked.parse(markdown);
        console.log('Converted HTML:', html);
    }
    
    return {
        success: true,
        message: 'Post created successfully!'
    };
}

// Add scroll animations
window.addEventListener('scroll', function() {
    const elements = document.querySelectorAll('.fade-in-element');
    
    elements.forEach(element => {
        const position = element.getBoundingClientRect().top;
        const screenPosition = window.innerHeight / 1.3;
        
        if (position < screenPosition) {
            element.classList.add('visible');
        }
    });
});
