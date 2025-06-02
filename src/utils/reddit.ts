
export interface RedditComment {
  id: string
  author: string
  score: number
  score_hidden: boolean
  created_utc: number
  permalink: string
  body_html: string
  distinguished: string
  is_submitter: boolean
  ups: number
  downs: number
  collapsed: boolean
  replies: RedditComment[]
  // For "more comments" objects
  kind?: string
  children?: string[]
  count?: number
  parent_id?: string
}

export interface RedditPost {
  title: string
  permalink: string
  comments: RedditComment[]
  link_id: string
}

export type SortOption = 'top' | 'confidence' | 'new' | 'controversial' | 'old' | 'qa'

export async function fetchMoreChildren(linkId: string, children: string[], sort: string = 'top'): Promise<RedditComment[]> {
  const childrenStr = children.join(',')
  const response = await fetch(`https://www.reddit.com/api/morechildren.json?api_type=json&link_id=${linkId}&children=${childrenStr}&sort=${sort}`)
  
  if (!response.ok) {
    throw new Error(`Error fetching more comments: ${response.statusText}`)
  }
  
  const data = await response.json()
  
  function extractReplies(comment: any): RedditComment[] {
    if (!comment.replies || !comment.replies.data) return []
    return comment.replies.data.children.map(child => {
      if (child.kind === 'more') {
        return {
          id: child.data.id,
          kind: 'more',
          children: child.data.children,
          count: child.data.count,
          parent_id: child.data.parent_id,
          author: '',
          score: 0,
          score_hidden: false,
          created_utc: 0,
          permalink: '',
          body_html: '',
          distinguished: '',
          is_submitter: false,
          ups: 0,
          downs: 0,
          collapsed: false,
          replies: []
        }
      }
      return {
        ...child.data,
        replies: extractReplies(child.data)
      }
    })
  }
  
  if (data.json && data.json.data && data.json.data.things) {
    return data.json.data.things.map(child => {
      if (child.kind === 'more') {
        return {
          id: child.data.id,
          kind: 'more',
          children: child.data.children,
          count: child.data.count,
          parent_id: child.data.parent_id,
          author: '',
          score: 0,
          score_hidden: false,
          created_utc: 0,
          permalink: '',
          body_html: '',
          distinguished: '',
          is_submitter: false,
          ups: 0,
          downs: 0,
          collapsed: false,
          replies: []
        }
      }
      return {
        ...child.data,
        replies: extractReplies(child.data)
      }
    })
  }
  
  return []
}

export async function fetchPost(href: string, sortOption: string): Promise<RedditPost> {
  const response = await fetch(`${href}.json?sort=${sortOption}&depth=2&limit=100`)

  if (!response.ok) {
    throw new Error(`Error fetching comments: ${response.statusText}`)
  }

  const data = await response.json()
  
  function extractReplies(comment: any): RedditComment[] {
    if (!comment.replies || !comment.replies.data) return []
    return comment.replies.data.children.map(child => {
      if (child.kind === 'more') {
        // Handle "more comments" objects
        return {
          id: child.data.id,
          kind: 'more',
          children: child.data.children,
          count: child.data.count,
          parent_id: child.data.parent_id,
          // Default values for required fields
          author: '',
          score: 0,
          score_hidden: false,
          created_utc: 0,
          permalink: '',
          body_html: '',
          distinguished: '',
          is_submitter: false,
          ups: 0,
          downs: 0,
          collapsed: false,
          replies: []
        }
      }
      return {
        ...child.data,
        replies: extractReplies(child.data)
      }
    })
  }

  const comments = data[1].data.children.map(child => {
    if (child.kind === 'more') {
      // Handle "more comments" objects
      return {
        id: child.data.id,
        kind: 'more',
        children: child.data.children,
        count: child.data.count,
        parent_id: child.data.parent_id,
        // Default values for required fields
        author: '',
        score: 0,
        score_hidden: false,
        created_utc: 0,
        permalink: '',
        body_html: '',
        distinguished: '',
        is_submitter: false,
        ups: 0,
        downs: 0,
        collapsed: false,
        replies: []
      }
    }
    return {
      ...child.data,
      replies: extractReplies(child.data)
    }
  })

  return {
    comments,
    title: data[0].data.children[0].data.title,
    permalink: data[0].data.children[0].data.permalink,
    link_id: data[0].data.children[0].data.name
  }
}