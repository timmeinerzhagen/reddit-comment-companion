import { useState, type ReactNode } from 'react'
import { Rnd } from 'react-rnd'

interface FloatingSidebarProps {
  children: ReactNode
  show: boolean
}

export default function FloatingSidebar({ children, show }: FloatingSidebarProps) {
  const [floatingPosition, setFloatingPosition] = useState({
    x: parseInt(localStorage.getItem('reddit-comment-companion-floatingX') || '100'),
    y: parseInt(localStorage.getItem('reddit-comment-companion-floatingY') || '100')
  })
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
    <Rnd
      size={{ width: floatingSize.width, height: floatingSize.height }}
      offsetFromParent={{ x: floatingPosition.x, y: floatingPosition.y }}
      onDragStop={handleFloatingDrag}
      onResizeStop={handleFloatingResize}
      minWidth={300}
      minHeight={400}
      bounds="window"
      style={{ display: show ? 'block' : 'none', position: `fixed` }}
    >
      {children}
    </Rnd>
  )
}