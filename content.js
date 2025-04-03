
// On Hover for Reddit Comments //
const commentButtons = document.querySelectorAll('a.comments');
commentButtons.forEach(button => {
  button.addEventListener('mouseover', async () => {
    const postId = button.getAttribute('data-post-id');
    const href = button.getAttribute('href');
    const comments = await fetchComments(href);
    showComments(button, comments);
  });
});

async function fetchComments(href) {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(`${href}.json`);
      if (!response.ok) {
        reject(`Error fetching comments: ${response.statusText}`);
      }
      const data = await response.json();
      const comments = data[1].data.children.map(child => child.data);
      resolve(comments);
    } catch (error) {
      reject(`Error: ${error.message}`);
    }
  });
}

function hideComments() {
  const commentsContainer = document.querySelector('.comments-container');
  if (commentsContainer) {
    commentsContainer.remove();
  }
}

function showComments(button, comments) {
  hideComments();
  const commentsContainer = createCommentsContainer(comments);
  document.body.appendChild(commentsContainer);
}



// Manage Comments Container //
function createCommentsContainer(comments) {
  const commentsContainer = document.createElement('div');
  commentsContainer.classList.add('comments-container');

  Object.assign(commentsContainer.style, {
    position: 'fixed',
    top: '0',
    right: '0',
    backgroundColor: '#1A1A1B',
    border: '1px solid #343536',
    padding: '10px',
    zIndex: '1000',
    width: '20vw', // 20% of the viewport width
    height: '100vh', // Full viewport height
    borderRadius: '8px',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.5)',
    color: '#D7DADC',
    fontFamily: 'Arial, sans-serif',
    overflow: 'auto',
    scrollbarWidth: 'none', // For Firefox
    msOverflowStyle: 'none', // For Internet Explorer and Edge
  });

  comments.forEach(comment => {
    const commentElement = document.createElement('div');
    commentElement.classList.add('comment');
    Object.assign(commentElement.style, {
      'padding': '10px 0',
      'font-size': '14px',
      'borderBottom': '1px solid #343536',
    });

    // Add comment metadata (author, votes, and link) in one line
      const metadata = document.createElement('div');
      metadata.innerHTML = `
        <a href="https://www.reddit.com/user/${comment.author}" target="_blank" style="color: #0079D3; text-decoration: none;">
          <strong>${comment.author}</strong>
        </a> | 
        ${comment.ups > 0 ? '+' : ''}${comment.ups} |
        ${timeAgo(comment.created_utc)} |
        <a href="https://www.reddit.com${comment.permalink}" target="_blank" style="color: #0079D3; text-decoration: none;">
          Comment
        </a>
      `;
            
      Object.assign(metadata.style, {
        marginBottom: '5px',
        fontSize: '12px',
      });
      commentElement.appendChild(metadata);

      // Add comment body
      const commentBody = document.createElement('p');
      commentBody.textContent = comment.body;
      Object.assign(commentBody.style, {
        margin: '5px 0',
      });
      commentElement.appendChild(commentBody);

      commentsContainer.appendChild(commentElement);
  });
  return commentsContainer;
}


function timeAgo(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp * 1000) / 1000);
  const intervals = [
    { label: 'y', seconds: 31536000 },
    { label: 'm', seconds: 2592000 },
    { label: 'd', seconds: 86400 },
    { label: 'h', seconds: 3600 },
    { label: 'm', seconds: 60 },
    { label: 's', seconds: 1 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count > 0) {
      return `${count} ${interval.label}${count !== 1 ? 's' : ''} ago`;
    }
  }
  return 'just now';
}