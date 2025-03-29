/**
 * Paper & Pen - Main JavaScript
 * Handles general site functionality and homepage features
 */

document.addEventListener('DOMContentLoaded', function() {
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
    
    // Fetch the posts metadata
    fetch('/blog/posts/_posts.json')
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
                    <a href="/blog/posts/${post.slug}.html" class="note-card">
                        <h3>${post.title}</h3>
                        <div class="note-meta">
                            <span>${formatDate(post.date)}</span>
                            <span>${post.tags[0] || 'General'}</span>
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
 * Formats a date string (YYYY-MM-DD) into a more readable format
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @return {string} Formatted date
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}
