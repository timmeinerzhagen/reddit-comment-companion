import { useEffect, useState } from 'react'
import type { PlasmoCSConfig } from "plasmo"
import CommentsContainer from './components/CommentsContainer'

import styleText from "data-text:./style.scss"
import type { PlasmoGetStyle } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["*://*.reddit.com/*"]
}
 
export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement("style")
  style.textContent = styleText
  return style
}

const PlasmoOverlay = () => {
  const [href, setHref] = useState<string>('')
  const [title, setTitle] = useState<string>('')

  useEffect(() => {
    // Attach comment hover listeners
    const attachCommentHoverListeners = () => {
      document.querySelectorAll('a.comments').forEach(button => {
        button.addEventListener('mouseover', () => {
          const hrefPost = button.getAttribute('href')
          if (href !== hrefPost) {
            setHref(hrefPost)
            setTitle(button.parentNode.parentNode.parentNode.querySelector(".title a").textContent)
          }
        })
      })
    }
    attachCommentHoverListeners()

    // Observer for dynamic content
    const observer = new MutationObserver(attachCommentHoverListeners)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => observer.disconnect()
  }, [])

  return (
    <div>
      <CommentsContainer href={href} title={title}/>
    </div>
  )
}

export default PlasmoOverlay
