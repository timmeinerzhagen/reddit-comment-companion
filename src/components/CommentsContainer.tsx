import { useState, useEffect, useRef } from 'react'
import { fetchPost, type RedditPost } from '../utils/reddit'
import Comment from './Comment'
import SettingsModal from './SettingsModal'
import LoadingIndicator from './LoadingIndicator'

interface CommentsContainerProps {
  href: string
  title: string
}

export default function CommentsContainer({ href, title }: CommentsContainerProps) {
  const [post, setPost] = useState<RedditPost>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showContainer, setShowContainer] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sortOption, setSortOption] = useState(
    localStorage.getItem('reddit-comment-companion-sortOption') || 'top'    
  )
  const [maxLevel, setMaxLevel] = useState(
    parseInt(localStorage.getItem('reddit-comment-companion-maxLevel') || '1')
  )
  const [containerWidth, setContainerWidth] = useState(
    parseInt(localStorage.getItem('reddit-comment-companion-containerWidth') || '25')
  )
  const [fontSize, setFontSize] = useState(
    parseInt(localStorage.getItem('reddit-comment-companion-fontSize') || '14')
  )
  const scrollRef = useRef(null);  

  useEffect(() => {
    let active = true
    
    const loadPost = async () => {
      setPost({title: '', permalink: '', comments: []})
      if(href) {
        setShowContainer(true)
        setLoading(true)
        const postData = await fetchPost(href, sortOption)
        if(active) {
          setPost(postData)
          if (scrollRef.current) {
            scrollRef.current.scrollTop = 0;
          }
          setLoading(false)
        }
      }
    }
    
    loadPost()
    return () => {
      active = false // invalidate if component unmounts
    }
  }, [href, sortOption])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && showContainer) {
        setShowContainer(false)
      }
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (showContainer && scrollRef.current && !scrollRef.current.contains(event.target as Node)) {
        setShowContainer(false)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showContainer])

  if (!post) {
    return <div>Loading</div>
  }

  return (
    <div className="rcc-comments-container" style={{ width: `${containerWidth}vw`, display: showContainer ? 'block' : 'none', fontSize: `${fontSize}px` }} ref={scrollRef}>
      <div className="rcc-top-bar">
        <a 
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="rcc-post-title"
          style={{ color: '#D7DADC' }}
          title={title}>
          {title}
        </a>
        <div className="rcc-controls">
          <button title="Settings" className="rcc-control-button" onClick={() => setShowSettings(true)}>
            <span className="rcc-button-icon">⚙</span>
          </button>
          <button title="Close" className="rcc-control-button" onClick={() => setShowContainer(false)}>
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
          fontSize={fontSize}
          setFontSize={setFontSize}
          onClose={() => {setShowSettings(false);  }} />}
      {loading && <LoadingIndicator/>}
      {!loading && post.comments.length > 0 && <div className="rcc-comments-list">       
        {post.comments.map((comment) => (
          <Comment 
            key={comment.id}
            comment={comment}
            level={0}
            maxLevel={maxLevel}
            fontSize={fontSize}
          />
        ))}
      </div>}
      {!loading && post.comments.length === 0 && (
        <div style={{ padding: '20px', textAlign: 'center', color: '#D7DADC' }}>
          No comments available
        </div>
      )}
    </div>
  )
}