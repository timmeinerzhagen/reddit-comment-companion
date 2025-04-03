
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

  // Hide scrollbar for Webkit-based browsers (Chrome, Safari, etc.)
  commentsContainer.style.setProperty('overflow', 'auto');
  commentsContainer.style.setProperty('scrollbar-width', 'none'); // Firefox
  commentsContainer.style.setProperty('-ms-overflow-style', 'none'); // IE/Edge
  commentsContainer.style.setProperty('::-webkit-scrollbar', 'display', 'none'); // Webkit

  comments.forEach(comment => {
    const commentElement = document.createElement('div');
    commentElement.classList.add('comment');
    Object.assign(commentElement.style, {
      'padding': '5px 0',
      'font-size': '14px',
      'borderBottom': '1px solid #343536',
    });

    commentElement.textContent = comment.body;
    commentsContainer.appendChild(commentElement);
  });  

  return commentsContainer;
}
