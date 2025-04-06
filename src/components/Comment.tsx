import { timeAgo } from '../utils/time'
import type { RedditComment } from '../utils/reddit'

interface CommentProps {
  comment: RedditComment
  level: number
  maxLevel: number
}

const decodeHtml = (html: string): string => {  
  return html.trim().replace(/&apos;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}

export default function Comment({ comment, level, maxLevel }: CommentProps) {
  if (!comment.author) return null

  let authorColor = 'inherit'
  if (comment.distinguished === 'moderator') {
    authorColor = 'green'
  } else if (comment.distinguished === 'admin') {
    authorColor = 'red'
  } else if (comment.is_submitter) {
    authorColor = 'blue'
  }

  const decodedHtml = decodeHtml(comment.body_html)
  
  // Replace links to images with actual images
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = decodedHtml
  const links = tempDiv.querySelectorAll('a')
  links.forEach(link => {
    const url = link.getAttribute('href')
    if (url && /\.(jpeg|jpg|png|gif|webp)(\?.*)?$/i.test(url)) {
      const img = document.createElement('img')
      img.src = url
      link.replaceWith(img)
    }
  })
  
  return (
    <div className={level > 0 ? 'rcc-reply' : 'rcc-comment'}>
      <div 
        className="rcc-metadata"
        style={{ fontSize: level > 0 ? '11px' : '12px' }}
      >
        <a 
          href={`https://www.reddit.com/user/${comment.author}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <strong style={{ 
            background: authorColor,
            color: authorColor === 'inherit' ? 'inherit' : 'white'
          }}>
            {comment.author}
          </strong>
        </a>
        <span> | </span>
        <span>
          {comment.score_hidden ? '?' : (comment.score > 0 ? '+' : '') + comment.score}
        </span>
        <span> | </span>
        <span>{timeAgo(comment.created_utc)}</span>
        <span> | </span>
        <a 
          href={`https://www.reddit.com${comment.permalink}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
        >
          Comment
          <span style={{ display: 'inline-block', transform: 'rotate(0deg)' }}>
            ➡️
          </span>
        </a>
      </div>

      <div dangerouslySetInnerHTML={{ __html: tempDiv.innerHTML }} />

      {comment.replies && comment.replies[0] && level < maxLevel && (
        comment.replies
          .slice(0, maxLevel - level)
          .map(reply => (
            <Comment 
              key={reply.id || reply.created_utc}
              comment={reply}
              level={level + 1}
              maxLevel={maxLevel}
            />
          ))
      )}
    </div>
  )
}