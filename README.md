Reddit Comment Reader
---------------------
Reads comments from all of reddit and picks out *phrases*, then sends any found matches to either 'localhost' if local, or another heroku application depending on if application is run locally or on heroku

Database Connection
-------------------
Phrases to look for are taken from the PostgreSQL database. 

Database must contain **a table named RegexpComment with this layout:**

|SubredditMatch|CommentMatch|ReplyMessage|IsReplyRegexp|id
|--------------|------------|------------|-------------|--

Database connection is expected to be contained in an evironment variable 'DATABASE_URL'

Example: SET DATABASE_URL=postgres://XXXXX<span>:</span>XXXX<span>@</span>ecX-50-1X-XXX-1XX.compute-1.amazonaws.com:5432/XdaXXXXXiuXevp?ssl=true&slfactory=org.postgresql.ssl.NonValidatingFactory

*Note on windows I get an error when setting the above, but it works regardless of error*

Reddit API connection
---------------------
This program does not use an authenticated client. Since none is required  for reading data from Reddit's api.

Uses an https client *require('https')* to make requests to 'reddit.com/all/comments.json' and occassionally 'reddit.com/subreddit/moderators.json'.

Sending data
------------
Uses Faye *require('faye')* to send data to either another heroku application, or localhost.com when comments are found matching regular expressions taken from the database

Other notes
-----------
**Program is hardcoded to ignore moderator comments**. Done by querying the URL for the appropriate subreddit. A variable is maintained and requests to a single subreddit are only made once per program duration

**Makes a request to a Reddit URL every 1100 milliseconds**. Reddit may block connections that make requests less than 1000 milliseconds and I've found using that exact limit causes issues

**Ignores comments from blacklisted subreddits**. Some serious subreddits are hardcoded to be ignored, such as /r/depression

**Doesn't post the same comment to the same subreddit too many times within a duration**