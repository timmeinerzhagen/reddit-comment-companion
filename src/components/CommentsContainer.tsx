import { useState, useEffect } from 'react'
import { fetchPost } from '../utils/reddit'
import Comment from './Comment'
import SettingsModal from './SettingsModal'

interface CommentsContainerProps {
  href: string
  onClose: () => void
}

export default function CommentsContainer({ href, onClose }: CommentsContainerProps) {
  const [post, setPost] = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  const containerWidth = localStorage.getItem('reddit-comment-companion-containerWidth') || '20'

  useEffect(() => {
    const loadPost = async () => {
      const data = await fetchPost(href)
      setPost(data)
    }
    loadPost()
  }, [href])

  if (!post) {
    return <div>Loading</div>
  }

  return (
    <div className="rcc-comments-container" style={{ width: `${containerWidth}vw` }}>
      <div className="rcc-top-bar">
        <a 
          href={`https://www.reddit.com${post.permalink}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rcc-post-title"
          style={{ color: '#D7DADC' }}>
          {post.title}
        </a>
        <div className="rcc-controls">
          <button className="rcc-control-button" onClick={() => loadPost()}>
            <span className="rcc-button-icon">↻</span>
          </button>
          <button className="rcc-control-button" onClick={() => setShowSettings(true)}>
            <span className="rcc-button-icon">⚙</span>
          </button>
          <button className="rcc-control-button" onClick={onClose}>
            <span className="rcc-button-icon">✖</span>
          </button>
        </div>
      </div>
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      <div className="rcc-comments-list">
        {post.comments.map((comment) => (
          <Comment 
            key={comment.id}
            comment={comment}
            level={0}
            maxLevel={parseInt(localStorage.getItem('reddit-comment-companion-maxLevel') || '1')} 
          />
        ))}
      </div>
    </div>
  )
}