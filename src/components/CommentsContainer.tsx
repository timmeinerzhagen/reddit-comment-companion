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
  const [windowMode, setWindowMode] = useState(
    localStorage.getItem('reddit-comment-companion-windowMode') || 'docked'
  )
  const [position, setPosition] = useState({
    x: parseInt(localStorage.getItem('reddit-comment-companion-positionX') || '0'),
    y: parseInt(localStorage.getItem('reddit-comment-companion-positionY') || '0')
  })
  const [size, setSize] = useState({
    width: parseInt(localStorage.getItem('reddit-comment-companion-floatingWidth') || '400'),
    height: parseInt(localStorage.getItem('reddit-comment-companion-floatingHeight') || '600')
  })
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

  // Resize functionality for floating mode
  const [isResizing, setIsResizing] = useState(false)

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    if (windowMode === 'floating') {
      e.preventDefault()
      e.stopPropagation()
      setIsResizing(true)
    }
  }

  const handleResizeMouseMove = (e: MouseEvent) => {
    if (isResizing && windowMode === 'floating') {
      const newWidth = Math.max(300, Math.min(e.clientX - position.x, window.innerWidth - position.x))
      const newHeight = Math.max(200, Math.min(e.clientY - position.y, window.innerHeight - position.y))
      
      setSize({ width: newWidth, height: newHeight })
      localStorage.setItem('reddit-comment-companion-floatingWidth', newWidth.toString())
      localStorage.setItem('reddit-comment-companion-floatingHeight', newHeight.toString())
    }
  }

  const handleResizeMouseUp = () => {
    setIsResizing(false)
  }

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMouseMove)
      document.addEventListener('mouseup', handleResizeMouseUp)
    }
    
    return () => {
      document.removeEventListener('mousemove', handleResizeMouseMove)
      document.removeEventListener('mouseup', handleResizeMouseUp)
    }
  }, [isResizing, position, windowMode])

  // Drag functionality for floating mode
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const handleMouseDown = (e: React.MouseEvent) => {
    if (windowMode === 'floating') {
      setIsDragging(true)
      const rect = e.currentTarget.getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && windowMode === 'floating') {
      const newX = e.clientX - dragOffset.x
      const newY = e.clientY - dragOffset.y
      
      // Keep window within screen bounds
      const maxX = window.innerWidth - size.width
      const maxY = window.innerHeight - size.height
      
      const constrainedX = Math.max(0, Math.min(newX, maxX))
      const constrainedY = Math.max(0, Math.min(newY, maxY))
      
      setPosition({ x: constrainedX, y: constrainedY })
      localStorage.setItem('reddit-comment-companion-positionX', constrainedX.toString())
      localStorage.setItem('reddit-comment-companion-positionY', constrainedY.toString())
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragOffset, size, windowMode])

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape" && showContainer) {
      setShowContainer(false)
    }
  }
  document.addEventListener("keydown", handleKeyDown)

  if (!post) {
    return <div>Loading</div>
  }

  // Get container styles based on window mode
  const getContainerStyle = () => {
    const baseStyle = {
      display: showContainer ? 'block' : 'none',
      fontSize: `${fontSize}px`
    }

    if (windowMode === 'floating') {
      return {
        ...baseStyle,
        position: 'fixed' as const,
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        right: 'auto'
      }
    } else {
      return {
        ...baseStyle,
        width: `${containerWidth}vw`
      }
    }
  }

  return (
    <div 
      className={`rcc-comments-container ${windowMode === 'floating' ? 'rcc-floating' : 'rcc-docked'}`} 
      style={getContainerStyle()} 
      ref={scrollRef}
    >
      <div 
        className="rcc-top-bar" 
        onMouseDown={handleMouseDown}
        style={{ cursor: windowMode === 'floating' ? 'move' : 'default' }}
      >
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
          <button title="Reload Comments" className="rcc-control-button" onClick={() => loadPost()}>
            <span className="rcc-button-icon">↻</span>
          </button>
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
          windowMode={windowMode}
          setWindowMode={setWindowMode}
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
      {windowMode === 'floating' && (
        <div 
          className="rcc-resize-handle"
          onMouseDown={handleResizeMouseDown}
        />
      )}
    </div>
  )
}