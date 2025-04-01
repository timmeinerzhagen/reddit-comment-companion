
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

function createCommentsContainer(comments) {
  const commentsContainer = document.createElement('div');
  commentsContainer.classList.add('comments-container');

  // Load saved position and size with better defaults
  const savedPosition = { top: '100px', left: '400px' }
  const savedSize = { width: '400px', height: '600px' }
  //const savedPosition = JSON.parse(localStorage.getItem('commentsContainerPosition')) || { top: '100px', left: '100px' };
  //const savedSize = JSON.parse(localStorage.getItem('commentsContainerSize')) || { width: '400px', height: 'auto' };

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
    if (!resizeEdge && (e.target === commentsContainer || commentsContainer.contains(e.target))) {
      isDragging = true;
      offsetX = e.clientX - commentsContainer.getBoundingClientRect().left;
      offsetY = e.clientY - commentsContainer.getBoundingClientRect().top;
      commentsContainer.style.cursor = 'grabbing';
    }
  });

  document.addEventListener('mousemove', (e) => {
    if (isDragging && !resizeEdge) {
      //commentsContainer.style.left = `${e.clientX - offsetX}px`;
      commentsContainer.style.top = `${e.clientY - offsetY}px`;
    }
  });

  document.addEventListener('mouseup', () => {
    if (isDragging && !resizeEdge) {
      isDragging = false;

      // Save position
      localStorage.setItem('commentsContainerPosition', JSON.stringify({
        top: commentsContainer.style.top,
        left: commentsContainer.style.left,
      }));
    }
  });

  // Resize logic
  let isResizing = false;
  let resizeEdge = null;

  commentsContainer.addEventListener('mousemove', (e) => {
    const rect = commentsContainer.getBoundingClientRect();
    const edgeSize = 10;

    if (e.clientX >= rect.left && e.clientX <= rect.left + edgeSize) {
      commentsContainer.style.cursor = 'w-resize';
      resizeEdge = 'left';
    } else if (e.clientX >= rect.right - edgeSize && e.clientX <= rect.right) {
      commentsContainer.style.cursor = 'e-resize';
      resizeEdge = 'right';
    } else if (e.clientY >= rect.top && e.clientY <= rect.top + edgeSize) {
      commentsContainer.style.cursor = 'n-resize';
      resizeEdge = 'top';
    } else if (e.clientY >= rect.bottom - edgeSize && e.clientY <= rect.bottom) {
      commentsContainer.style.cursor = 's-resize';
      resizeEdge = 'bottom';
    }
    else {
      if(!isResizing) {
        commentsContainer.style.cursor = 'default';
        resizeEdge = null;
      }
    }
  });

  commentsContainer.addEventListener('mousedown', (e) => {
    if (resizeEdge) {
      isResizing = true;
      console.log("Resizing = True")
    }
  });

  document.addEventListener('mousemove', (e) => {
    if (isResizing) {
      console.log("resizeEdge", resizeEdge)
      const rect = commentsContainer.getBoundingClientRect();

      if (resizeEdge === 'left') {
        const newWidth = rect.width - (e.clientX - rect.left);
        console.log("newWidth", newWidth, "rect.width", rect.width, "e.clientX", e.clientX, "rect.left", rect.left)
        console.log(rect.width - newWidth)
        if (newWidth > 100 && e.clientX >= 0) {
          commentsContainer.style.width = `${newWidth}px`;
          //commentsContainer.style.left = `${e.clientX}px`;
        }
      } else if (resizeEdge === 'right') {
        const newWidth = e.clientX - rect.left;
        console.log(newWidth, e.clientX, rect.left)
        if (newWidth > 100 && e.clientX <= window.innerWidth) {
          commentsContainer.style.width = `${newWidth}px`;
        }
      } else if (resizeEdge === 'top') {
        const newHeight = rect.bottom - e.clientY;
        console.log(newHeight, e.clientY, rect.bottom)
        if (newHeight > 50 && e.clientY >= 0) {
          commentsContainer.style.height = `${newHeight}px`;
          commentsContainer.style.top = `${e.clientY}px`;
        }
      } else if (resizeEdge === 'bottom') {
        const newHeight = e.clientY - rect.top;
        console.log(newHeight, e.clientY, rect.top)
        if (newHeight > 50 && e.clientY <= window.innerHeight) {
          commentsContainer.style.height = `${newHeight}px`;
        }
      }
    }
  });

  document.addEventListener('mouseup', () => {
    if (isResizing) {
      isResizing = false;
      commentsContainer.style.cursor = 'default';
      resizeEdge = null;

      // Save size
      localStorage.setItem('commentsContainerSize', JSON.stringify({
        width: commentsContainer.style.width,
        height: commentsContainer.style.height,
      }));
    }
  });

  return commentsContainer;
}
