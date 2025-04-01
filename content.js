
// On Hover for Reddit Comments
const commentButtons = document.querySelectorAll('a.comments');
commentButtons.forEach(button => {
  button.addEventListener('mouseover', async () => {
    const postId = button.getAttribute('data-post-id');
    const href = button.getAttribute('href');
    const comments = await fetchComments(href);
    console.log("Hi")
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

function showComments(button, comments) {
  hideComments();
  const commentsContainer = createCommentsContainer(comments);
  document.body.appendChild(commentsContainer);
}

function createCommentsContainer(comments) {
  const commentsContainer = document.createElement('div');
  commentsContainer.classList.add('comments-container');

  // Load saved position and size
  const savedPosition = JSON.parse(localStorage.getItem('commentsContainerPosition')) || {};
  const savedSize = JSON.parse(localStorage.getItem('commentsContainerSize')) || {};

  Object.assign(commentsContainer.style, {
    position: 'absolute',
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
    resize: 'both',
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

  // Make draggable
  let isDragging = false;
  let offsetX, offsetY;

  commentsContainer.addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.clientX - commentsContainer.getBoundingClientRect().left;
    offsetY = e.clientY - commentsContainer.getBoundingClientRect().top;
    commentsContainer.style.cursor = 'grabbing';
  });

  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      commentsContainer.style.left = `${e.clientX - offsetX}px`;
      commentsContainer.style.top = `${e.clientY - offsetY}px`;
    }
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;

      // Save position
      localStorage.setItem('commentsContainerPosition', JSON.stringify({
        top: commentsContainer.style.top,
        left: commentsContainer.style.left,
      }));
    }
  });

  // Save size on resize
  commentsContainer.addEventListener('resize', () => {
    localStorage.setItem('commentsContainerSize', JSON.stringify({
      width: commentsContainer.style.width,
      height: commentsContainer.style.height,
    }));
  });

  // Append to body
  return commentsContainer;
}

function hideComments() {
  const commentsContainer = document.querySelector('.comments-container');
  if (commentsContainer) {
    commentsContainer.remove();
  }
}
