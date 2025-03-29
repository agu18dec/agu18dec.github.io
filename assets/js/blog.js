/**
 * Paper & Pen - Blog JavaScript
 * Handles blog listing, pagination, and dark mode
 */

// Global variables
let allPosts = [];
const postsPerPage = 8;
let currentPage = 1;

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
    
    // Load all posts
    loadPosts();
});

/**
 * Loads all blog posts from the JSON metadata file
 */
function loadPosts() {
    const blogItemsContainer = document.getElementById('blog-items');
    
    if (!blogItemsContainer) return;
    
    // Get base URL for GitHub Pages compatibility
    const baseUrl = getBaseUrl();
    
    fetch(`${baseUrl}posts/_posts.json`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load posts');
            }
            return response.json();
        })
        .then(posts => {
            // Sort by date (newest first)
            allPosts = posts.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            if (allPosts.length === 0) {
                blogItemsContainer.innerHTML = '<p>No posts yet. Check back soon!</p>';
                return;
            }
            
            // Render first page
            renderPosts();
            
            // Only add pagination if we have more than one page
            if (allPosts.length > postsPerPage) {
                renderPagination();
            }
        })
        .catch(error => {
            console.error('Error loading posts:', error);
            blogItemsContainer.innerHTML = '<p>Error loading posts. Please try again later.</p>';
        });
}

/**
 * Renders the current page of posts
 */
function renderPosts() {
    const blogItemsContainer = document.getElementById('blog-items');
    
    if (!blogItemsContainer) return;
    
    // Get base URL for GitHub Pages compatibility
    const baseUrl = getBaseUrl();
    
    // Calculate pagination
    const startIndex = (currentPage - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const currentPosts = allPosts.slice(startIndex, endIndex);
    
    if (currentPosts.length === 0) {
        blogItemsContainer.innerHTML = '<p>No posts found.</p>';
        return;
    }
    
    // Build HTML for posts
    const postsHTML = currentPosts.map(post => {
        return `
            <a href="${baseUrl}posts/${post.slug}.html" class="blog-item">
                <div class="meta">
                    <div class="date">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        ${formatDate(post.date)}
                    </div>
                </div>
                <h2>${post.title}</h2>
                <p class="excerpt">${post.excerpt}</p>
                <span class="read-more">
                    Read more
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </span>
            </a>
        `;
    }).join('');
    
    blogItemsContainer.innerHTML = postsHTML;
}

/**
 * Renders the pagination controls
 */
function renderPagination() {
    const paginationContainer = document.getElementById('pagination');
    
    if (!paginationContainer) return;
    
    const totalPages = Math.ceil(allPosts.length / postsPerPage);
    
    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
        <a href="#" class="prev" data-page="${currentPage - 1}" ${currentPage === 1 ? 'style="pointer-events: none; opacity: 0.5;"' : ''}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Prev
        </a>
    `;
    
    // Page numbers
    const maxPageButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);
    
    // Adjust if we're at the end
    if (endPage - startPage + 1 < maxPageButtons) {
        startPage = Math.max(1, endPage - maxPageButtons + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        if (i === currentPage) {
            paginationHTML += `<span class="current">${i}</span>`;
        } else {
            paginationHTML += `<a href="#" data-page="${i}">${i}</a>`;
        }
    }
    
    // Next button
    paginationHTML += `
        <a href="#" class="next" data-page="${currentPage + 1}" ${currentPage === totalPages ? 'style="pointer-events: none; opacity: 0.5;"' : ''}>
            Next
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </a>
    `;
    
    paginationContainer.innerHTML = paginationHTML;
    
    // Add event listeners to pagination links
    paginationContainer.querySelectorAll('a[data-page]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            currentPage = parseInt(this.getAttribute('data-page'));
            renderPosts();
            renderPagination();
            
            // Scroll to top of blog list
            document.querySelector('.blog-list').scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        });
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
    if (pathSegments.length > 2 && pathSegments[1] !== '') {
        // We're in blog/index.html, so we need to go up one level
        const repoName = pathSegments[1];
        return `/${repoName}/`;
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