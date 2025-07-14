import { useState, useEffect, type ReactNode } from 'react'
import { Rnd } from 'react-rnd'

interface FloatingSidebarProps {
  children: ReactNode
  show: boolean
}

export default function FloatingSidebar({ children, show }: FloatingSidebarProps) {
  // Base position relative to page content (what user set)
  const [basePosition, setBasePosition] = useState({
    x: parseInt(localStorage.getItem('reddit-comment-companion-floatingX') || '100'),
    y: parseInt(localStorage.getItem('reddit-comment-companion-floatingY') || '100')
  })
  
  // Current visual position adjusted for scroll
  const [currentPosition, setCurrentPosition] = useState(basePosition)
  
  const [floatingSize, setFloatingSize] = useState({
    width: parseInt(localStorage.getItem('reddit-comment-companion-floatingWidth') || '400'),
    height: parseInt(localStorage.getItem('reddit-comment-companion-floatingHeight') || '600')
  })

  // Track scroll position and update floating window position
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const scrollX = window.scrollX
      setCurrentPosition({
        x: basePosition.x + scrollX,
        y: basePosition.y + scrollY
      })
    }

    // Set initial position based on current scroll
    handleScroll()

    // Add scroll listener
    window.addEventListener('scroll', handleScroll)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [basePosition])

  const handleFloatingDrag = (e: any, data: any) => {
    // Calculate base position by subtracting current scroll offset
    const scrollY = window.scrollY
    const scrollX = window.scrollX
    const newBasePosition = { 
      x: data.x - scrollX, 
      y: data.y - scrollY 
    }
    setBasePosition(newBasePosition)
    setCurrentPosition({ x: data.x, y: data.y })
    localStorage.setItem('reddit-comment-companion-floatingX', newBasePosition.x.toString())
    localStorage.setItem('reddit-comment-companion-floatingY', newBasePosition.y.toString())
  }

  const handleFloatingResize = (e: any, direction: any, ref: any, delta: any, position: any) => {
    const newSize = {
      width: parseInt(ref.style.width),
      height: parseInt(ref.style.height)
    }
    // Calculate base position by subtracting current scroll offset
    const scrollY = window.scrollY
    const scrollX = window.scrollX
    const newBasePosition = { 
      x: position.x - scrollX, 
      y: position.y - scrollY 
    }
    setFloatingSize(newSize)
    setBasePosition(newBasePosition)
    setCurrentPosition({ x: position.x, y: position.y })
    localStorage.setItem('reddit-comment-companion-floatingWidth', newSize.width.toString())
    localStorage.setItem('reddit-comment-companion-floatingHeight', newSize.height.toString())
    localStorage.setItem('reddit-comment-companion-floatingX', newBasePosition.x.toString())
    localStorage.setItem('reddit-comment-companion-floatingY', newBasePosition.y.toString())
  }

  return (
    <Rnd
      size={{ width: floatingSize.width, height: floatingSize.height }}
      position={{ x: currentPosition.x, y: currentPosition.y }}
      onDragStop={handleFloatingDrag}
      onResizeStop={handleFloatingResize}
      minWidth={300}
      minHeight={400}
      bounds="body"
      style={{ display: show ? 'block' : 'none' }}
    >
      {children}
    </Rnd>
  )
}