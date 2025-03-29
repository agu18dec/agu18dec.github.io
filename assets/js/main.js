/**
 * Paper & Pen - Main JavaScript
 * Handles general site functionality, dark mode toggle, and homepage features
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check for dark mode preference
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');
    
    // Apply dark mode if preferred or saved
    if (savedTheme === 'dark' || (prefersDarkMode && savedTheme !== 'light')) {
        document.body.classList.add('dark-mode');
        toggleDarkModeIcons(true);
    }
    
    // Setup dark mode toggle
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', function() {
            const isDarkMode = document.body.classList.toggle('dark-mode');
            localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
            toggleDarkModeIcons(isDarkMode);
        });
    }
    
    function toggleDarkModeIcons(isDarkMode) {
        const sunIcon = document.querySelector('.sun-icon');
        const moonIcon = document.querySelector('.moon-icon');
        
        if (sunIcon && moonIcon) {
            sunIcon.style.display = isDarkMode ? 'none' : 'block';
            moonIcon.style.display = isDarkMode ? 'block' : 'none';
        }
    }
    
    // Smooth fade-in animation for main content
    setTimeout(() => {
        document.querySelector('main').style.opacity = 1;
    }, 100);
    
    // Fetch recent blog posts for the homepage
    fetchRecentPosts();
    
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Add fade-in animation for elements as they scroll into view
    const fadeElements = document.querySelectorAll('.fade-in-element');
    
    if (fadeElements.length > 0) {
        const fadeInObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    fadeInObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1
        });
        
        fadeElements.forEach(element => {
            fadeInObserver.observe(element);
        });
    }
});

/**
 * Fetches recent blog posts and displays them on the homepage
 */
function fetchRecentPosts() {
    const recentNotesContainer = document.getElementById('recent-notes');
    
    if (!recentNotesContainer) return;
    
    // Get base URL for GitHub Pages compatibility
    const baseUrl = getBaseUrl();
    
    // Fetch the posts metadata
    fetch(`${baseUrl}blog/posts/_posts.json`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load posts');
            }
            return response.json();
        })
        .then(posts => {
            // Sort by date (newest first) and take the 3 most recent
            const recentPosts = posts
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 3);
                
            if (recentPosts.length === 0) {
                recentNotesContainer.innerHTML = '<p>No posts yet. Check back soon!</p>';
                return;
            }
            
            // Create HTML for each post
            const postsHTML = recentPosts.map(post => {
                return `
                    <a href="${baseUrl}blog/posts/${post.slug}.html" class="note-card">
                        <h3>${post.title}</h3>
                        <div class="note-meta">
                            <span>${formatDate(post.date)}</span>
                        </div>
                        <p class="note-excerpt">${post.excerpt}</p>
                        <span class="read-more">Read more →</span>
                    </a>
                `;
            }).join('');
            
            recentNotesContainer.innerHTML = postsHTML;
        })
        .catch(error => {
            console.error('Error loading recent posts:', error);
            recentNotesContainer.innerHTML = '<p>Error loading recent notes. Please try again later.</p>';
        });
}

/**
 * Gets the base URL for the site, accounting for GitHub Pages project sites
 * @return {string} The base URL with trailing slash
 */
function getBaseUrl() {
    // For GitHub Pages project sites, this will correctly determine the base URL
    const baseTag = document.querySelector('base');
    if (baseTag && baseTag.href) {
        return baseTag.href;
    }
    
    // Extract from current URL for GitHub Pages project sites
    const pathSegments = window.location.pathname.split('/');
    if (pathSegments.length > 1 && pathSegments[1] !== '') {
        // This is a GitHub Pages project site (username.github.io/repository/)
        return '/' + pathSegments[1] + '/';
    }
    
    // Default for root sites (including GitHub Pages user sites)
    return '/';
}

/**
 * Formats a date string (YYYY-MM-DD) into a more readable format
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @return {string} Formatted date
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}