# Relevant Reddit APIs

GET /api/comments/article used when requesting API

## GET /api/comments/article

https://www.reddit.com/dev/api#GET_comments_{article}

GET [/r/subreddit]/comments/articlereadrss support
Get the comment tree for a given Link article.

If supplied, comment is the ID36 of a comment in the comment tree for article. This comment will be the (highlighted) focal point of the returned view and context will be the number of parents shown.

depth is the maximum depth of subtrees in the thread.

limit is the maximum number of comments to return.

See also: /api/morechildren and /api/comment.

article	
ID36 of a link

comment	
(optional) ID36 of a comment

context	
an integer between 0 and 8

depth	
(optional) an integer

limit	
(optional) an integer

showedits	
boolean value

showmedia	
boolean value

showmore	
boolean value

showtitle	
boolean value

sort	
one of (confidence, top, new, controversial, old, random, qa, live)

sr_detail	
(optional) expand subreddits

theme	
one of (default, dark)

threaded	
boolean value

truncate	
an integer between 0 and 50

## GET api/morechildren

https://www.reddit.com/dev/api#GET_api_morechildren

GET /api/morechildrenread
Retrieve additional comments omitted from a base comment tree.

When a comment tree is rendered, the most relevant comments are selected for display first. Remaining comments are stubbed out with "MoreComments" links. This API call is used to retrieve the additional comments represented by those stubs, up to 100 at a time.

The two core parameters required are link and children. link is the fullname of the link whose comments are being fetched. children is a comma-delimited list of comment ID36s that need to be fetched.

If id is passed, it should be the ID of the MoreComments object this call is replacing. This is needed only for the HTML UI's purposes and is optional otherwise.

NOTE: you may only make one request at a time to this API endpoint. Higher concurrency will result in an error being returned.

If limit_children is True, only return the children requested.

depth is the maximum depth of subtrees in the thread.

api_type	
the string json

children	
depth	
(optional) an integer

id	
(optional) id of the associated MoreChildren object

limit_children	
boolean value

link_id	
fullname of a link

sort	
one of (confidence, top, new, controversial, old, random, qa, live)

## POST api/vote

https://www.reddit.com/dev/api#POST_api_vote

Cast a vote on a thing.

id should be the fullname of the Link or Comment to vote on.

dir indicates the direction of the vote. Voting 1 is an upvote, -1 is a downvote, and 0 is equivalent to "un-voting" by clicking again on a highlighted arrow.

Note: votes must be cast by humans. That is, API clients proxying a human's action one-for-one are OK, but bots deciding how to vote on content or amplifying a human's vote are not. See the reddit rules for more details on what constitutes vote cheating.

dir	
vote direction. one of (1, 0, -1)

id	
fullname of a thing

rank	
an integer greater than 1

uh / X-Modhash header	
a modhash