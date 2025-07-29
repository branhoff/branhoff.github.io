// Load recent blog posts for main page
async function loadRecentBlogPosts() {
    try {
        const response = await fetch('blog-posts.json');
        const data = await response.json();
        const container = document.getElementById('recent-blog-posts');
        
        // Get latest 3 posts
        const recentPosts = data.blog_posts.slice(0, 3);
        
        // Clear loading message
        container.innerHTML = '';

        // Create post cards
        recentPosts.forEach(post => {
            const postCard = createBlogPostCard(post);
            container.appendChild(postCard);
        });

    } catch (error) {
        console.error('Error loading recent blog posts:', error);
        document.getElementById('recent-blog-posts').innerHTML = 
            '<div style="text-align: center; color: var(--secondaryText); padding: 40px;">Unable to load recent posts.</div>';
    }
}

function createBlogPostCard(post) {
    const postDiv = document.createElement('div');
    
    const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long', 
        day: 'numeric'
    });

    postDiv.innerHTML = `
        <div class="post">
            <div class="blog-post-preview">
                <div class="blog-post-meta">
                    <time>${formattedDate}</time>
                    <span class="blog-tags">${post.tags.slice(0, 2).join(', ')}</span>
                </div>
                <h6 class="post-title">${post.title}</h6>
                <p class="post-intro">${post.excerpt}</p>
                <a href="${post.file}">Read More</a>
            </div>
        </div>
    `;
    
    return postDiv;
}

// Load recent posts when page loads
document.addEventListener('DOMContentLoaded', loadRecentBlogPosts);