// Load blog posts dynamically for blog page
async function loadBlogPosts() {
    try {
        const response = await fetch('blog-posts.json');
        const data = await response.json();
        const container = document.getElementById('blog-posts-container');
        
        // Clear loading message
        container.innerHTML = '';

        // Create posts
        data.blog_posts.forEach(post => {
            const postElement = createPostElement(post);
            container.appendChild(postElement);
        });

        // Generate topic tags
        generateTopicTags(data.blog_posts);

    } catch (error) {
        console.error('Error loading blog posts:', error);
        document.getElementById('blog-posts-container').innerHTML = 
            '<div class="loading">Error loading posts. Please try again later.</div>';
    }
}

function createPostElement(post) {
    const article = document.createElement('article');
    article.className = 'blog-post';

    const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long', 
        day: 'numeric'
    });

    article.innerHTML = `
        <header class="post-header">
            <h2>${post.title}</h2>
            <div class="post-meta">
                <time datetime="${post.date}">${formattedDate}</time>
                <span class="tags">${post.tags.join(', ')}</span>
            </div>
        </header>
        <div class="post-content">
            <p>${post.excerpt}</p>
            <a href="${post.file}" class="read-more">Read More →</a>
        </div>
    `;

    return article;
}

function generateTopicTags(posts) {
    const allTags = new Set();
    posts.forEach(post => {
        post.tags.forEach(tag => allTags.add(tag));
    });

    const tagsContainer = document.getElementById('topic-tags');
    allTags.forEach(tag => {
        const tagElement = document.createElement('span');
        tagElement.className = 'topic-tag';
        tagElement.textContent = tag;
        tagsContainer.appendChild(tagElement);
    });
}

// Load posts when page loads
document.addEventListener('DOMContentLoaded', loadBlogPosts);