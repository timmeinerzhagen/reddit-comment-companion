import { useState } from 'react'
import { fetchMoreChildren, type RedditComment } from '../utils/reddit'

interface LoadMoreCommentsProps {
  comment: RedditComment
  linkId: string
  sortOption: string
  level: number
  maxLevel: number
  fontSize: number
  onCommentsLoaded: (comments: RedditComment[]) => void
}

export default function LoadMoreComments({ 
  comment, 
  linkId, 
  sortOption, 
  level, 
  maxLevel, 
  fontSize,
  onCommentsLoaded 
}: LoadMoreCommentsProps) {
  const [loading, setLoading] = useState(false)

  const handleLoadMore = async () => {
    if (!comment.children || comment.children.length === 0) return
    
    setLoading(true)
    try {
      const moreComments = await fetchMoreChildren(linkId, comment.children, sortOption)
      onCommentsLoaded(moreComments)
    } catch (error) {
      console.error('Error loading more comments:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!comment.children || comment.children.length === 0) return null

  return (
    <div 
      className={level > 0 ? 'rcc-reply' : 'rcc-comment'}
      style={{ fontSize: `${fontSize}px` }}
    >
      <button 
        onClick={handleLoadMore}
        disabled={loading}
        style={{
          background: 'none',
          border: '1px solid #666',
          color: '#0079D3',
          padding: '4px 8px',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: `${fontSize}px`
        }}
      >
        {loading ? 'Loading...' : `Load ${comment.count || comment.children.length} more comments`}
      </button>
    </div>
  )
}