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
  const [sortOption, setSortOption] = useState(
    localStorage.getItem('reddit-comment-companion-sortOption') || 'top'    
  )
  const [maxLevel, setMaxLevel] = useState(
    parseInt(localStorage.getItem('reddit-comment-companion-maxLevel') || '1')
  )
  const [containerWidth, setContainerWidth] = useState(
    parseInt(localStorage.getItem('reddit-comment-companion-containerWidth') || '20')
  ) 
  useEffect(() => {
    if(href){
      fetchPost(href, sortOption).then(data => {
        setPost(data)
      })
    }
  }, [href, sortOption])

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
      {showSettings && 
        <SettingsModal 
          maxLevel={maxLevel}
          setMaxLevel={setMaxLevel}
          sortOption={sortOption}
          setSortOption={setSortOption}
          containerWidth={containerWidth}
          setContainerWidth={setContainerWidth}
          onClose={() => {setShowSettings(false);  }} />}
      <div className="rcc-comments-list">
        {post.comments.map((comment) => (
          <Comment 
            key={comment.id}
            comment={comment}
            level={0}
            maxLevel={maxLevel} 
          />
        ))}
      </div>
    </div>
  )
}