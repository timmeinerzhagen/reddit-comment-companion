import styleText from "data-text:./style.scss"
import type { PlasmoCSConfig, PlasmoGetStyle } from "plasmo"
import { useEffect, useState } from "react"

import CommentsContainer from "./components/CommentsContainer"

export const config: PlasmoCSConfig = {
  matches: ["*://*.reddit.com/*"]
}

export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement("style")
  style.textContent = styleText
  return style
}

const PlasmoOverlay = () => {
  const [href, setHref] = useState<string>("")
  const [title, setTitle] = useState<string>("")

  useEffect(() => {
    // Attach comment hover listeners
    const attachCommentHoverListeners = () => {
      // Support both old and new Reddit
      const selectors = [
        "a.comments", // Old Reddit
        'a[data-click-id="comments"]', // New Reddit data attribute
        'a[href*="/comments/"]' // Universal - any link with /comments/ in href
      ]

      selectors.forEach((selector) => {
        document.querySelectorAll(selector).forEach((button) => {
          // Skip if already has event listener
          if (button.hasAttribute("data-rcc-listener")) return
          button.setAttribute("data-rcc-listener", "true")

          button.addEventListener("mouseover", () => {
            const hrefPost = button.getAttribute("href")
            if (
              href !== hrefPost &&
              hrefPost &&
              hrefPost.includes("/comments/") &&
              hrefPost.match(/\/r\/[^\/]+\/comments\/[^\/]+/)
            ) {
              setHref(hrefPost)

              // Extract title with fallback logic for different Reddit layouts
              let title = ""

              // Try old Reddit structure first
              const oldRedditTitle =
                button.parentNode?.parentNode?.parentNode?.querySelector?.(
                  ".title a"
                )?.textContent
              if (oldRedditTitle) {
                title = oldRedditTitle
              } else {
                // Try new Reddit structures
                // Look for h3 with post title in ancestor elements
                let currentElement = button.parentElement
                let depth = 0
                while (currentElement && depth < 10) {
                  // Look for h3 elements (common in new Reddit)
                  const h3Title =
                    currentElement.querySelector("h3")?.textContent
                  if (h3Title) {
                    title = h3Title
                    break
                  }

                  // Look for elements with post title classes
                  const titleElement = currentElement.querySelector(
                    '[data-click-id="body"], [data-testid="post-content"], .Post'
                  )
                  if (titleElement) {
                    const titleInElement =
                      titleElement.querySelector("h3")?.textContent
                    if (titleInElement) {
                      title = titleInElement
                      break
                    }
                  }

                  // Try data-click-id="background" which often contains post content
                  const postContent = currentElement.querySelector(
                    '[data-click-id="background"]'
                  )
                  if (postContent) {
                    const h3InPost =
                      postContent.querySelector("h3")?.textContent
                    if (h3InPost) {
                      title = h3InPost
                      break
                    }
                  }

                  currentElement = currentElement.parentElement
                  depth++
                }

                // Final fallback - extract from href
                if (!title && hrefPost) {
                  const matches = hrefPost.match(
                    /\/comments\/[^\/]+\/([^\/]+)\//
                  )
                  if (matches && matches[1]) {
                    title = matches[1].replace(/_/g, " ")
                  }
                }
              }

              setTitle(title || "Reddit Post")
            }
          })
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
      <CommentsContainer href={href} title={title} />
    </div>
  )
}

export default PlasmoOverlay
