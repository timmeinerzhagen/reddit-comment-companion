
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
}

export interface RedditPost {
  title: string
  permalink: string
  comments: RedditComment[]
  id?: string
  name?: string
  score?: number
  ups?: number
  downs?: number
  likes?: boolean | null
  url?: string
}

export type SortOption = 'top' | 'confidence' | 'new' | 'controversial' | 'old' | 'qa'

export async function fetchPost(href: string, sortOption: string): Promise<RedditPost> {
  const response = await fetch(`${href}.json?sort=${sortOption}`)

  if (!response.ok) {
    throw new Error(`Error fetching comments: ${response.statusText}`)
  }

  const data = await response.json()
  
  function extractReplies(comment: any): RedditComment[] {
    if (!comment.replies || !comment.replies.data) return []
    return comment.replies.data.children.map(child => ({
      ...child.data,
      replies: extractReplies(child.data)
    }))
  }

  const comments = data[1].data.children.map(child => ({
    ...child.data,
    replies: extractReplies(child.data)
  }))

  const postData = data[0].data.children[0].data

  return {
    comments,
    title: postData.title,
    permalink: postData.permalink,
    id: postData.id,
    name: postData.name,
    score: postData.score,
    ups: postData.ups,
    downs: postData.downs,
    likes: postData.likes,
    url: postData.url
  }
}