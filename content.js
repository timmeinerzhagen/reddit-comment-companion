// On Hover for Reddit Comments //

const commentButtons = document.querySelectorAll('a.comments');
getRedditSessionToken()
  .then(token => localStorage.setItem('reddit-comment-companion-session', token));

  function attachCommentHoverListeners() {
  const commentButtons = document.querySelectorAll('a.comments');
  commentButtons.forEach(button => {
    button.addEventListener('mouseover', async () => {
      const href = button.getAttribute('href');
      if (localStorage.getItem('reddit-comment-companion-post') !== href) {
        localStorage.setItem('reddit-comment-companion-post', href);
        const commentsContainer = document.querySelector('.comments-container');
        if (commentsContainer) {
          const reloadButton = commentsContainer.querySelector('button');
          if (reloadButton) {
            const reloadIcon = reloadButton.querySelector('span');
            reloadIcon.style.animation = 'spin 1s linear infinite'; // Add spinning animation
            try {
              const post = await fetchPost(href);
              const newCommentsContainer = createCommentsContainer(post.comments, post.title);
              commentsContainer.replaceWith(newCommentsContainer);
            } catch (error) {
              console.error('Error reloading comments:', error);
            } finally {
              reloadIcon.style.animation = ''; // Remove animation after loading
            }
            return;
          }
        }
        const post = await fetchPost(href);
        hideComments();
        const commentsContainerNew = createCommentsContainer(post.comments, post.title);
        document.body.appendChild(commentsContainerNew);
      }
    });
  });
}

// Initial attachment of listeners
attachCommentHoverListeners();
// Observe for dynamically loaded comment buttons
const observer = new MutationObserver(() => {
  attachCommentHoverListeners();
});
observer.observe(document.body, { childList: true, subtree: true });

async function fetchPost(href) {
  const sortOption = localStorage.getItem('reddit-comment-companion-sortOption') || 'top';
  
  const response = await fetch(`${href}.json?sort=${sortOption}`, {
    headers: {
      'Cookie': `reddit_session=${localStorage.getItem('reddit-comment-companion-session')}`,
      'User-Agent': 'Reddit Comment Companion Chrome Extension v1.0'
    }
  });
  if (!response.ok) {
    throw new Error(`Error fetching comments: ${response.statusText}`);
  }
  const data = await response.json();
  function extractReplies(comment) {
    if (!comment.replies || !comment.replies.data) return [];
    return comment.replies.data.children.map(child => ({
      ...child.data,
      replies: extractReplies(child.data)
    }));
  }

  const comments = data[1].data.children.map(child => ({
    ...child.data,
    replies: extractReplies(child.data)
  }));
  return {
    comments,
    title: data[0].data.children[0].data.title
  }
}

async function getRedditSessionToken() {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type: 'GET_REDDIT_TOKEN' }, response => {
      if (response.error) {
        reject(new Error(response.error));
      } else {
        resolve(response.token);
      }
    });
  });
}

function hideComments() {
  const commentsContainer = document.querySelector('.comments-container');
  if (commentsContainer) {
    commentsContainer.remove();
  }
}

// Manage Comments Container //
function createCommentsContainer(comments, title) {
  const commentsContainer = document.createElement('div');
  commentsContainer.classList.add('comments-container');

  const containerWidth = localStorage.getItem('reddit-comment-companion-containerWidth') || '20';

  Object.assign(commentsContainer.style, {
    position: 'fixed',
    top: '0',
    right: '0',
    backgroundColor: '#1A1A1B',
    border: '1px solid #343536',
    zIndex: '10000001',
    width: `${containerWidth}vw`,
    height: '100vh',
    borderRadius: '8px',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.5)',
    color: '#D7DADC',
    fontFamily: 'Arial, sans-serif',
    overflow: 'auto',
    scrollbarWidth: 'none', // For Firefox
    msOverflowStyle: 'none', // For Internet Explorer and Edge
  });
  
  const bar = document.createElement('div');
  Object.assign(bar.style, {
    position: 'sticky',
    top: '0',
    padding: '10px',
    backgroundColor: '#1A1A1B',
    color: '#D7DADC',
    height: '10px',
    fontWeight: 'bold',
    borderBottom: '1px solid #343536',
    textAlign: 'center',
  });
  const postTitle = document.createElement('span');
  postTitle.textContent = title;
  postTitle.style.whiteSpace = 'nowrap';
  postTitle.style.overflow = 'hidden';
  postTitle.style.textOverflow = 'ellipsis';
  postTitle.style.flexGrow = '1';
  postTitle.style.textAlign = 'left';
  postTitle.style.fontSize = '14px';
  postTitle.style.fontWeight = 'bold';

  bar.style.display = 'flex';
  bar.style.alignItems = 'center';
  bar.style.justifyContent = 'space-between';
  bar.appendChild(postTitle);
  bar.appendChild(createButtonReload());
  bar.appendChild(createButtonSettings());
  bar.appendChild(createButtonClose());
  commentsContainer.appendChild(bar);

  comments.forEach(comment => {
    const commentElement = createComment(comment, 0, localStorage.getItem('reddit-comment-companion-maxLevel') || 1);
    commentsContainer.appendChild(commentElement);
  });

  return commentsContainer;
}

function createComment(comment, level, maxLevel) {
  const commentElement = document.createElement('div');
  if (!comment.author) return commentElement
  commentElement.classList.add(level>0 ? 'reply' : 'comment');
  Object.assign(commentElement.style, level>0 ? {
    marginLeft: '10px',
    borderLeft: '2px solid #343536',
    paddingLeft: '5px',
    paddingBottom: '5px',
    padding: '5px',
    fontSize: '13px'
  } : {
    padding: '6px 0',
    fontSize: '14px',
    borderBottom: '1px solid #343536',
  });

  // Add comment metadata (author, votes, and link)
  const metadata = document.createElement('div');
  metadata.style.color = 'rgb(166, 166, 166)';

  author_color = 'inherit';
  if (comment.distinguished === 'moderator') {
    author_color = 'green';
  } else if (comment.distinguished === 'admin') {
    author_color = 'red';
  } else if (comment.is_submitter) {
    author_color = 'blue';
  }

  metadata.innerHTML = `
    <a href="https://www.reddit.com/user/${comment.author}" target="_blank" style="color: inherit; text-decoration: none;">
      <strong style="background: ${author_color}; color: ${author_color=='inherit' ? 'inherit' : 'white'}">${comment.author}</strong>
    </a> |
    ${comment.score_hidden ? '?' : (comment.score > 0 ? '+' : '') + comment.score} |
    ${timeAgo(comment.created_utc)} |
    <a href="https://www.reddit.com${comment.permalink}" target="_blank" style="color: inherit; text-decoration: none;">
      Comment
    </a>
  `;

  
  Object.assign(metadata.style, {
    marginBottom: '5px',
    fontSize: level>0 ? '11px' : '12px',
  });
  commentElement.appendChild(metadata);

  // Add comment body
  if (comment.body_html) {
    let body = document.createElement('div')
    body.innerHTML = comment.body_html.trim().replace(/&apos;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    // Replace links to images with actual images
    const links = body.querySelectorAll('a');
    links.forEach(link => {
      const url = link.getAttribute('href');
      if (url && /\.(jpeg|jpg|png|gif|webp)(\?.*)?$/i.test(url)) {
        const img = document.createElement('img');
        img.src = url;
        img.style.maxWidth = '100%';
        img.style.borderRadius = '4px';
        link.replaceWith(img);
      }
    });
    
    commentElement.append(body);
  }

  // Add top reply if available
  if (comment.replies && comment.replies[0] && level<maxLevel) {
    comment.replies.slice(0, maxLevel - level).forEach(reply => {
      const replyElement = createComment(reply, level + 1, maxLevel);
      commentElement.appendChild(replyElement);
    });
  }

  return commentElement;
}

function createButtonReload() {
  // Add reload button
  const reloadButton = document.createElement('button');
  const reloadIcon = document.createElement('span');
  // Unicode for reload icon
  reloadIcon.innerHTML = '&#x21bb;';
  reloadIcon.style.fontSize = '12px';
  reloadIcon.style.display = 'inline-block';
  reloadIcon.style.verticalAlign = 'middle';

  reloadButton.addEventListener('click', async () => {
    reloadIcon.style.animation = 'spin 1s linear infinite'; // Add spinning animation
    const commentsContainer = document.querySelector('.comments-container');
    if (commentsContainer) {
      const href = localStorage.getItem('reddit-comment-companion-post');
      try {
        const post = await fetchPost(href);
        const newCommentsContainer = createCommentsContainer(post.comments, post.title);
        commentsContainer.replaceWith(newCommentsContainer);
      } catch (error) {
        console.error('Error reloading comments:', error);
      } finally {
        reloadIcon.style.animation = ''; // Remove animation after loading
      }
    }
  });

  // Add CSS for spinning animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
  `;
  document.head.appendChild(style);
  reloadButton.appendChild(reloadIcon);

  Object.assign(reloadButton.style, {
    top: '10px',
    right: '45px',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '4px',
    padding: '2px 4px',
    cursor: 'pointer',
    fontSize: '12px',
  });

  reloadButton.addEventListener('click', () => {
    const commentsContainer = document.querySelector('.comments-container');
    if (commentsContainer) {
      const href = localStorage.getItem('reddit-comment-companion-post');
      fetchPost(href).then(post => {
        const newCommentsContainer = createCommentsContainer(post.comments, post.title);
        commentsContainer.replaceWith(newCommentsContainer);
      }).catch(error => {
        console.error('Error reloading comments:', error);
      });
    }
  });

  return reloadButton;
}

function createButtonSettings() {
  // Add settings button
  const settingsButton = document.createElement('button');
  const settingsIcon = document.createElement('span');
  // Unicode for gear icon
  settingsIcon.innerHTML = '&#9881;'; 
  settingsIcon.style.fontSize = '12px';
  settingsIcon.style.display = 'inline-block';
  settingsIcon.style.verticalAlign = 'middle';
  settingsButton.appendChild(settingsIcon);

  Object.assign(settingsButton.style, {
   // position: 'absolute',
    top: '10px',
    right: '25px',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '4px',
    padding: '2px 4px',
    cursor: 'pointer',
    fontSize: '12px',
  });  

  settingsButton.addEventListener('click', () => {
    const settingsModal = document.createElement('div');
    Object.assign(settingsModal.style, {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: '#1A1A1B',
      color: '#D7DADC',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.5)',
      zIndex: '1001',
    });

    const sortOption = localStorage.getItem("reddit-comment-companion-sortOption") || "top";
    const maxLevel = localStorage.getItem("reddit-comment-companion-maxLevel") || 1;
    const containerWidth = localStorage.getItem("reddit-comment-companion-containerWidth") || 20;

    settingsModal.innerHTML = `
      <label style="display: block; margin-bottom: 10px;">
      Sort Comments By:
      <select id="sortOptionInput" style="margin-left: 10px; padding: 5px; border-radius: 4px; border: 1px solid #343536; background-color: #2A2A2B; color: #D7DADC;">
        <option value="top" ${ sortOption === "top" ? "selected" : ""}>Top</option>
        <option value="confidence" ${sortOption === "confidence" ? "selected" : ""}>Best</option>
        <option value="new" ${sortOption === "new" ? "selected" : ""}>New</option>
        <option value="controversial" ${sortOption === "controversial" ? "selected" : ""}>Controversial</option>
        <option value="old" ${sortOption === "old" ? "selected" : ""}>Old</option>
        <option value="qa" ${sortOption === "qa" ? "selected" : ""}>Q&A</option>
      </select>
      </label>
      <label style="display: block; margin-bottom: 10px;">
      Max Reply Level:
      <input type="number" id="maxLevelInput" value="${maxLevel}" min="1" style="margin-left: 10px; padding: 5px; border-radius: 4px; border: 1px solid #343536; background-color: #2A2A2B; color: #D7DADC;">
      </label>
      <label style="display: block; margin-bottom: 10px;">
      Container Width (% of screen):
      <input type="number" id="containerWidthInput" value="${containerWidth}" style="margin-left: 10px; padding: 5px; border-radius: 4px; border: 1px solid #343536; background-color: #2A2A2B; color: #D7DADC;">
      </label>
      <button id="saveSettingsButton" style="margin-top: 10px; background-color: #0079D3; color: #FFFFFF; border: none; border-radius: 4px; padding: 5px 10px; cursor: pointer;">Save</button>
    `;

    document.body.appendChild(settingsModal);

    document.getElementById('saveSettingsButton').addEventListener('click', () => {
      const maxLevel = parseInt(document.getElementById('maxLevelInput').value, 10);
      const sortOption = document.getElementById('sortOptionInput').value;
      const containerWidth = document.getElementById('containerWidthInput').value;

      localStorage.setItem('reddit-comment-companion-maxLevel', maxLevel);
      localStorage.setItem('reddit-comment-companion-sortOption', sortOption);
      localStorage.setItem('reddit-comment-companion-containerWidth', containerWidth);

      settingsModal.remove();

      // Reload comments container
      const commentsContainer = document.querySelector('.comments-container');
      if (commentsContainer) {
        const href = localStorage.getItem('reddit-comment-companion-post');
        fetchPost(href).then(post => {
          const newCommentsContainer = createCommentsContainer(post.comments, post.title);
          commentsContainer.replaceWith(newCommentsContainer);
        }).catch(error => {
          console.error('Error reloading comments:', error);
        });
      }
    });   
  });
  return settingsButton;
}  

function createButtonClose() {
  // Add close button
  const closeButton = document.createElement('button');
  const closeIcon = document.createElement('span');
  // Unicode for gear icon
  closeIcon.innerHTML = '&#10006;'; 
  closeIcon.style.fontSize = '12px';
  closeIcon.style.display = 'inline-block';
  closeIcon.style.verticalAlign = 'middle';
  closeButton.appendChild(closeIcon);

  Object.assign(closeButton.style, {
  //  position: 'absolute',
    top: '10px',
    right: '5px',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '4px',
    padding: '2px 4px',
    cursor: 'pointer',
    fontSize: '12px',
  });

  closeButton.addEventListener('click', () => {
    hideComments();
  });
  return closeButton;
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