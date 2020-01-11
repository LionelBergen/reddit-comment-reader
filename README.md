Reddit Comment Reader
---------------------

Reads comments from all of reddit and picks out *phrases*, then sends any found matches to another application

Database Connection
-------------------

Phrases to look for are taken from the PostgreSQL database. 

Database must contain a table named *RegexpComment* with the layout:

|SubredditMatch|CommentMatch|ReplyMessage|IsReplyRegexp|id
|--------------|------------|------------|-------------|--

Database connection is expected to be contained in an evironment variable 'DATABASE_URL'

Example: SET DATABASE_URL=postgres://XXXXX<span>:</span>XXXX<span>@</span>ecX-50-1X-XXX-1XX.compute-1.amazonaws.com:5432/XdaXXXXXiuXevp?ssl=true&slfactory=org.postgresql.ssl.NonValidatingFactory

*Note on windows I get an error when setting the above, but it works regardless of error*

