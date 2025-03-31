document.addEventListener('DOMContentLoaded', () => {
  const commentButtons = document.querySelectorAll('.comment-button');

  commentButtons.forEach(button => {
    button.addEventListener('mouseover', async () => {
      const postId = button.getAttribute('data-post-id');
      const comments = await fetchComments(postId);
      showComments(button, comments);
    });

    button.addEventListener('mouseleave', () => {
      hideComments();
    });
  });
});

async function fetchComments(postId) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type: 'fetchComments', postId }, (response) => {
      if (response.error) {
        reject(response.error);
      } else {
        resolve(response.comments);
      }
    });
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
