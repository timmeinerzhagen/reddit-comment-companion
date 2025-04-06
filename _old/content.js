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
        createOrUpdateCommentsContainer(href);
      }
    });
  });
}

function createOrUpdateCommentsContainer(comments, title, permalink) {
  const reloadIcon = document.querySelector('.rcc-button-reload-icon');
  if (reloadIcon) {
    reloadIcon.style.animation = 'spin 1s linear infinite'; // Start spinning animation
  }

  createCommentsContainer(comments, title, permalink).then(container => {
    let container_old = document.querySelector('.rcc-comments-container');
    if(container_old) {
      container_old.replaceWith(container);
    } else {
      document.body.appendChild(container);
    }
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
    title: data[0].data.children[0].data.title,
    permalink: data[0].data.children[0].data.permalink,  
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

// Manage Comments Container //
async function createCommentsContainer(href) {
  const post = await fetchPost(href);

  const commentsContainer = document.createElement('div');
  commentsContainer.classList.add('rcc-comments-container');
  
  const containerWidth = localStorage.getItem('reddit-comment-companion-containerWidth') || '20';
  commentsContainer.style.width = `${containerWidth}vw`;

  const bar = document.createElement('div');
  bar.classList.add('rcc-top-bar');

  const postTitle = document.createElement('a');
  postTitle.textContent = post.title;
  postTitle.title = post.title;
  postTitle.href = `https://www.reddit.com${post.permalink}`;
  postTitle.target = '_blank';
  postTitle.classList.add('rcc-post-title');
  postTitle.style.color = '#D7DADC'; // otherwise RES will override it

  bar.appendChild(postTitle);
  bar.appendChild(createButtonReload());
  bar.appendChild(createButtonSettings());
  bar.appendChild(createButtonClose());
  commentsContainer.appendChild(bar);

  post.comments.forEach(comment => {
    const commentElement = createComment(comment, 0, localStorage.getItem('reddit-comment-companion-maxLevel') || 1);
    commentsContainer.appendChild(commentElement);
  });

  return commentsContainer;
}

function createComment(comment, level, maxLevel) {
  const commentElement = document.createElement('div');
  if (!comment.author) return commentElement;
  
  commentElement.classList.add(level > 0 ? 'rcc-reply' : 'rcc-comment');

  const metadata = document.createElement('div');
  metadata.classList.add('rcc-metadata');
  metadata.style.fontSize = level > 0 ? '11px' : '12px';

  author_color = 'inherit';
  if (comment.distinguished === 'moderator') {
    author_color = 'green';
  } else if (comment.distinguished === 'admin') {
    author_color = 'red';
  } else if (comment.is_submitter) {
    author_color = 'blue';
  }

  metadata.innerHTML = `
    <a href="https://www.reddit.com/user/${comment.author}" target="_blank">
      <strong style="background: ${author_color}; color: ${author_color=='inherit' ? 'inherit' : 'white'}">${comment.author}</strong>
    </a> |
    ${comment.score_hidden ? '?' : (comment.score > 0 ? '+' : '') + comment.score} |
    ${timeAgo(comment.created_utc)} |
    <a href="https://www.reddit.com${comment.permalink}" target="_blank">
      Comment
    </a>
  `;

  
  Object.assign(metadata.style, {
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
  const reloadButton = document.createElement('button');
  reloadButton.classList.add('rcc-control-button');
  
  const reloadIcon = document.createElement('span');
  reloadIcon.classList.add('rcc-button-reload-icon');
  reloadIcon.innerHTML = '&#x21bb;';

  reloadButton.addEventListener('click', async () => {
    const href = localStorage.getItem('reddit-comment-companion-post');
    createOrUpdateCommentsContainer(href);
  });
  reloadButton.appendChild(reloadIcon);

  return reloadButton;
}

function createButtonSettings() {
  const settingsButton = document.createElement('button');
  settingsButton.classList.add('rcc-control-button');
  settingsButton.innerHTML = '&#9881;';

  settingsButton.addEventListener('click', () => {
    const settingsModal = document.createElement('div');
    settingsModal.classList.add('rcc-settings-modal');

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

      const href = localStorage.getItem('reddit-comment-companion-post');
      createOrUpdateCommentsContainer(href);
    });   
  });
  return settingsButton;
}

function createButtonClose() {
  const closeButton = document.createElement('button');
  closeButton.classList.add('rcc-control-button');
  closeButton.innerHTML = '&#10006;';

  closeButton.addEventListener('click', () => {
    const commentsContainer = document.querySelector('.rcc-comments-container');
    if (commentsContainer) {
      commentsContainer.remove();
    }
  });
  return closeButton;
}

