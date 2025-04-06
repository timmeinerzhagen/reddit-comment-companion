chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_REDDIT_TOKEN') {
    chrome.cookies.get({ 
      url: 'https://www.reddit.com', 
      name: 'reddit_session' 
    }).then(cookie => {
      if (!cookie) {
        sendResponse({ error: 'No Reddit session found. Please log in to Reddit.' });
      } else {
        sendResponse({ token: cookie.value });
      }
    });
    return true; // Required for async response
  }
});
