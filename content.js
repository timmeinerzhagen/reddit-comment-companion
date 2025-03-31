document.addEventListener('DOMContentLoaded', () => {
  const commentButtons = document.querySelectorAll('.comment-button');

  commentButtons.forEach(button => {
    button.addEventListener('mouseover', async () => {
      const postId = button.getAttribute('data-post-id');
      const comments = await fetchComments(postId);
      showComments(button, comments);
    });
  });
});

async function fetchComments(postId) {
  const response = await fetch(`https://www.reddit.com/comments/${postId}.json`);
  const data = await response.json();
  return data[1].data.children.map(child => child.data);
}

function showComments(button, comments) {
  const commentsContainer = document.createElement('div');
  commentsContainer.classList.add('comments-container');

  comments.forEach(comment => {
    const commentElement = document.createElement('div');
    commentElement.classList.add('comment');
    commentElement.textContent = comment.body;
    commentsContainer.appendChild(commentElement);
  });

  button.parentElement.appendChild(commentsContainer);
}
