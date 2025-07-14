import { useEffect, useState, type ReactNode } from 'react'
import { Rnd } from 'react-rnd'

interface FloatingSidebarProps {
  children: ReactNode
  show: boolean
}

export default function FloatingSidebar({ children, show }: FloatingSidebarProps) {
  const [floatingPosition, setFloatingPosition] = useState({
    x: 0,
    y: 0
  })
  // initialize to 0, then set to saved position; overwise reltaive position is wrong
  useEffect(() => {
    const initialPosition = {
      x: parseInt(localStorage.getItem('reddit-comment-companion-floatingX') || '100'),
      y: parseInt(localStorage.getItem('reddit-comment-companion-floatingY') || '100')
    }
    setFloatingPosition(initialPosition)
  }, [])

  const [floatingSize, setFloatingSize] = useState({
    width: parseInt(localStorage.getItem('reddit-comment-companion-floatingWidth') || '400'),
    height: parseInt(localStorage.getItem('reddit-comment-companion-floatingHeight') || '600')
  })

  const handleFloatingDrag = (e: any, data: any) => {
    const newPosition = { x: data.x, y: data.y }
    setFloatingPosition(newPosition)
    localStorage.setItem('reddit-comment-companion-floatingX', newPosition.x.toString())
    localStorage.setItem('reddit-comment-companion-floatingY', newPosition.y.toString())
  }

  const handleFloatingResize = (e: any, direction: any, ref: any, delta: any, position: any) => {
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

  return (
    <div style={{ 
      position: 'fixed', 
      width: '100vw', 
      height: '100vh', 
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      pointerEvents: 'none' 
    }}>
      <Rnd
        size={{ width: floatingSize.width, height: floatingSize.height }}
        position={{ x: floatingPosition.x, y: floatingPosition.y }}
        onDragStop={handleFloatingDrag}
        onResizeStop={handleFloatingResize}
        minWidth={300}
        minHeight={400}
        bounds="window"
        cancel=".rcc-comments-list"
        style={{ display: show ? 'block' : 'none', pointerEvents: `auto`, position: 'absolute' }}
      >
        {children}
      </Rnd>
    </div>
  )
}