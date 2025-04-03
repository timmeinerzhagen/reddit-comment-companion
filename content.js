
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

  // Load saved position and size with better defaults
  const savedPosition = { top: '100px', left: '400px' }
  const savedSize = { width: '400px', height: '600px' }

  Object.assign(commentsContainer.style, {
    position: 'fixed',
    top: savedPosition.top || `${button.getBoundingClientRect().top + window.scrollY + 20}px`,
    left: savedPosition.left || `${button.getBoundingClientRect().left + window.scrollX}px`,
    backgroundColor: '#1A1A1B',
    border: '1px solid #343536',
    padding: '10px',
    zIndex: '1000',
    width: savedSize.width || '400px',
    height: savedSize.height || 'auto',
    borderRadius: '8px',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.5)',
    color: '#D7DADC',
    fontFamily: 'Arial, sans-serif',
    overflow: 'auto',
    cursor: 'move',
  });

  comments.forEach(comment => {
    const commentElement = document.createElement('div');
    commentElement.classList.add('comment');
    Object.assign(commentElement.style, {
      padding: '5px 0',
      borderBottom: '1px solid #343536',
    });

    commentElement.textContent = comment.body;
    commentsContainer.appendChild(commentElement);
  });  

  return commentsContainer;
}
