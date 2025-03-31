chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'fetchComments') {
    fetchComments(message.postId).then(comments => {
      sendResponse({ comments });
    });
    return true; // Will respond asynchronously.
  }
});

function fetchComments(postId) {
  return fetch(`https://www.reddit.com/comments/${postId}.json`)
    .then(response => response.json())
    .then(data => data[1].data.children.map(child => child.data));
}
