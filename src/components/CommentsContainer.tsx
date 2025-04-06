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
    parseInt(localStorage.getItem('reddit-comment-companion-containerWidth') || '20')
  )
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
    loadPost()
  }, [href, sortOption])

  if (!post) {
    return <div>Loading</div>
  }

  return (
    <div className="rcc-comments-container" style={{ width: `${containerWidth}vw`, display: showContainer ? 'block' : 'none' }} ref={scrollRef}>
      <div className="rcc-top-bar">
        <a 
          href={`https://www.reddit.com${href}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rcc-post-title"
          style={{ color: '#D7DADC' }}>
          {title}
        </a>
        <div className="rcc-controls">
          <button className="rcc-control-button" onClick={() => loadPost()}>
            <span className="rcc-button-icon">↻</span>
          </button>
          <button className="rcc-control-button" onClick={() => setShowSettings(true)}>
            <span className="rcc-button-icon">⚙</span>
          </button>
          <button className="rcc-control-button" onClick={() => setShowContainer(false)}>
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
      {loading && <LoadingIndicator/>}
      {!loading && post.comments.length && <div className="rcc-comments-list">       
        {post.comments.map((comment) => (
          <Comment 
            key={comment.id}
            comment={comment}
            level={0}
            maxLevel={maxLevel} 
          />
        ))}
      </div>}
    </div>
  )
}