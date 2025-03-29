/**
 * Paper & Pen - Template Processor
 * Processes Markdown files and templates to generate blog post HTML
 * 
 * This script would typically run server-side, but is provided for reference
 * to show how the system processes templates and generates HTML files.
 */

const fs = require('fs');
const path = require('path');
const marked = require('marked');
const hljs = require('highlight.js');

// Configure paths
const BLOG_DIR = path.join(__dirname, '../../blog');
const POSTS_DIR = path.join(BLOG_DIR, 'posts');
const MARKDOWN_DIR = path.join(POSTS_DIR, 'markdown');
const TEMPLATE_PATH = path.join(POSTS_DIR, '_template.html');
const POSTS_JSON_PATH = path.join(POSTS_DIR, '_posts.json');

// Configure marked options
marked.setOptions({
    highlight: function(code, lang) {
        if (lang && hljs.getLanguage(lang)) {
            return hljs.highlight(code, { language: lang }).value;
        }
        return hljs.highlightAuto(code).value;
    },
    breaks: true,
    gfm: true,
    headerIds: true,
    mangle: false
});

/**
 * Processes templates by replacing placeholders with actual content
 * @param {string} template - HTML template string
 * @param {Object} data - Data object with values to replace in template
 * @return {string} Processed HTML
 */
function processTemplate(template, data) {
    // Replace simple variables: {{variable}}
    let processed = template.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
        return data[varName] !== undefined ? data[varName] : match;
    });
    
    // Process conditionals: {{#if variable}} content {{/if}}
    processed = processed.replace(/\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, varName, content) => {
        return data[varName] ? content : '';
    });
    
    // Process loops: {{#each items}} content with {{this}} {{/each}}
    processed = processed.replace(/\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (match, arrayName, content) => {
        if (!Array.isArray(data[arrayName])) return '';
        
        return data[arrayName].map(item => {
            return content.replace(/\{\{this\}\}/g, item);
        }).join('');
    });
    
    return processed;
}

/**
 * Processes a single markdown file and generates HTML
 * @param {string} slug - Post slug
 * @param {Object} postData - Post metadata
 */
async function processPost(slug, postData) {
    try {
        // Read template file
        const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');
        
        // Read markdown file
        const markdownPath = path.join(MARKDOWN_DIR, `${slug}.md`);
        const markdown = fs.readFileSync(markdownPath, 'utf8');
        
        // Convert markdown to HTML
        const contentHtml = marked.parse(markdown);
        
        // Get navigation data
        const posts = JSON.parse(fs.readFileSync(POSTS_JSON_PATH, 'utf8'));
        posts.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        const currentIndex = posts.findIndex(post => post.slug === slug);
        const prevPost = currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null;
        const nextPost = currentIndex > 0 ? posts[currentIndex - 1] : null;
        
        // Format date
        const date = new Date(postData.date);
        const formattedDate = date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        // Prepare data for template
        const templateData = {
            ...postData,
            date: formattedDate,
            content: contentHtml,
            prevPost,
            nextPost
        };
        
        // Process template
        let html = processTemplate(template, templateData);
        
        // Replace content placeholder with actual content
        html = html.replace('<div class="loading">Loading content...</div>', contentHtml);
        
        // Write output file
        const outputPath = path.join(POSTS_DIR, `${slug}.html`);
        fs.writeFileSync(outputPath, html);
        
        console.log(`Generated post: ${slug}.html`);
    } catch (error) {
        console.error(`Error processing post ${slug}:`, error);
    }
}

/**
 * Processes all markdown files and generates HTML files
 */
async function processAllPosts() {
    try {
        // Read posts metadata
        const posts = JSON.parse(fs.readFileSync(POSTS_JSON_PATH, 'utf8'));
        
        // Process each post
        for (const post of posts) {
            await processPost(post.slug, post);
        }
        
        console.log('All posts processed successfully.');
    } catch (error) {
        console.error('Error processing posts:', error);
    }
}

// Run the processor
processAllPosts();