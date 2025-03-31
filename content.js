
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

  button.addEventListener('mouseleave', () => {
    hideComments();
    console.log("Bye")
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
  const commentsContainer = document.createElement('div');
  commentsContainer.classList.add('comments-container');
  commentsContainer.style.position = 'absolute';
  commentsContainer.style.top = `${button.getBoundingClientRect().top + window.scrollY}px`;
  commentsContainer.style.left = `${button.getBoundingClientRect().left + window.scrollX}px`;
  commentsContainer.style.backgroundColor = 'white';
  commentsContainer.style.border = '1px solid #ddd';
  commentsContainer.style.padding = '10px';
  commentsContainer.style.zIndex = '1000';

  comments.forEach(comment => {
    const commentElement = document.createElement('div');
    commentElement.classList.add('comment');
    commentElement.textContent = comment.body;
    commentsContainer.appendChild(commentElement);
  });

  document.body.appendChild(commentsContainer);

  commentsContainer.addEventListener('mouseleave', () => {
    hideComments();
  });
}

function hideComments() {
  const commentsContainer = document.querySelector('.comments-container');
  if (commentsContainer) {
    commentsContainer.remove();
  }
}
