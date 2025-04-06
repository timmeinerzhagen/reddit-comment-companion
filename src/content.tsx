import { useEffect } from 'react'
import type { PlasmoCSConfig } from "plasmo"
import CommentsContainer from './components/CommentsContainer'
import { getRedditSessionToken } from './utils/reddit'

import styleText from "data-text:./style.scss"
import type { PlasmoGetStyle } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["*://*.reddit.com/*"],
  all_frames: true
}
 
export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement("style")
  style.textContent = styleText
  return style
}

const PlasmoOverlay = () => {
  useEffect(() => {
    // Initialize session token
    getRedditSessionToken()
      .then(token => localStorage.setItem('reddit-comment-companion-session', token))

    // Attach comment hover listeners
    const attachCommentHoverListeners = () => {
      document.querySelectorAll('a.comments').forEach(button => {
        button.addEventListener('mouseover', () => {
          const href = button.getAttribute('href')
          if (localStorage.getItem('reddit-comment-companion-post') !== href) {
            localStorage.setItem('reddit-comment-companion-post', href)
            // Update state to show comments
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
      <CommentsContainer href={localStorage.getItem('reddit-comment-companion-post')} />
    </div>
  )
}

export default PlasmoOverlay
