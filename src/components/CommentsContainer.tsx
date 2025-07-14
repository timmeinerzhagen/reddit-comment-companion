import { useState, useEffect, useRef } from 'react'
import { Rnd } from 'react-rnd'
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
  const [sidebarMode, setSidebarMode] = useState(
    localStorage.getItem('reddit-comment-companion-sidebarMode') || 'docked'
  )
  const [floatingPosition, setFloatingPosition] = useState({
    x: parseInt(localStorage.getItem('reddit-comment-companion-floatingX') || '100'),
    y: parseInt(localStorage.getItem('reddit-comment-companion-floatingY') || '100')
  })
  const [floatingSize, setFloatingSize] = useState({
    width: parseInt(localStorage.getItem('reddit-comment-companion-floatingWidth') || '400'),
    height: parseInt(localStorage.getItem('reddit-comment-companion-floatingHeight') || '600')
  })
  const scrollRef = useRef(null);  

  const loadPost = async () => {
    setPost({title: '', permalink: '', comments: []})
    if(href) {
      setShowContainer(true)
      setLoading(true)
      const postData = await fetchPost(href, sortOption)
      setPost(postData)
      if (scrollRef.current) {
        scrollRef.current.scrollTop = 0;
      }
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    const loadPostEffect = async () => {
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
    loadPostEffect()
    return () => {
      active = false // invalidate if component unmounts
    }
  }, [href, sortOption])

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape" && showContainer) {
      setShowContainer(false)
    }
  }
  document.addEventListener("keydown", handleKeyDown)

  const handleFloatingDrag = (e, data) => {
    const newPosition = { x: data.x, y: data.y }
    setFloatingPosition(newPosition)
    localStorage.setItem('reddit-comment-companion-floatingX', newPosition.x.toString())
    localStorage.setItem('reddit-comment-companion-floatingY', newPosition.y.toString())
  }

  const handleFloatingResize = (e, direction, ref, delta, position) => {
    const newSize = {
      width: parseInt(ref.style.width),
      height: parseInt(ref.style.height)
    }
    const newPosition = { x: position.x, y: position.y }
    setFloatingSize(newSize)
    setFloatingPosition(newPosition)
    localStorage.setItem('reddit-comment-companion-floatingWidth', newSize.width.toString())
    localStorage.setItem('reddit-comment-companion-floatingHeight', newSize.height.toString())
    localStorage.setItem('reddit-comment-companion-floatingX', newPosition.x.toString())
    localStorage.setItem('reddit-comment-companion-floatingY', newPosition.y.toString())
  }

  if (!post) {
    return <div>Loading</div>
  }

  const containerStyle = sidebarMode === 'docked' 
    ? { width: `${containerWidth}vw`, display: showContainer ? 'block' : 'none', fontSize: `${fontSize}px` }
    : { display: showContainer ? 'block' : 'none', fontSize: `${fontSize}px` }

  const containerClassName = sidebarMode === 'docked' 
    ? "rcc-comments-container" 
    : "rcc-comments-container-floating"

  const renderContent = () => (
    <div className={containerClassName} style={containerStyle} ref={scrollRef}>
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
          sidebarMode={sidebarMode}
          setSidebarMode={setSidebarMode}
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

  if (sidebarMode === 'floating') {
    return (
      <Rnd
        size={{ width: floatingSize.width, height: floatingSize.height }}
        position={{ x: floatingPosition.x, y: floatingPosition.y }}
        onDragStop={handleFloatingDrag}
        onResizeStop={handleFloatingResize}
        minWidth={300}
        minHeight={400}
        bounds="window"
        style={{ display: showContainer ? 'block' : 'none' }}
      >
        {renderContent()}
      </Rnd>
    )
  }

  return renderContent()
}