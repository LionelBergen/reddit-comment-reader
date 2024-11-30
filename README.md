Reddit Comment Reader
---------------------
Reads comments from all of reddit and picks out *phrases*, then sends any found matches to either 'localhost' if local, or another heroku application depending on if application is run locally or on heroku  

`npm run start` - Starts the program  
`npm run test` - Runs tests, not including 'live' tests, which require environment variables filled with tokens.  
`npm run eslint` - Used to keep consistent format. This should be pass before every commit  

Quick Start  
-----------  
1) Have postgresql service running  
2) Ensure you have a database user `postgres` with password `postgresql` (Or modify the batch file below to correct username/password)  
3) Run `reddit-comment-reader\database\create_local_database.sql` **This will drop the database if it exists and recreate it**   

Database Connection
-------------------
Database connection is expected to be contained in an evironment variable 'DATABASE_URL'

Example: SET DATABASE_URL=postgres://XXXXX<span>:</span>XXXX<span>@</span>ecX-50-1X-XXX-1XX.compute-1.amazonaws.com:5432/XdaXXXXXiuXevp?ssl=true&slfactory=org.postgresql.ssl.NonValidatingFactory

*Note on windows I get an error when setting the above, but it works regardless of error*

Database Tables
---------------
**RegexpComment** - Phrases to look for are taken from the PostgreSQL database

|SubredditMatch|CommentMatch|ReplyMessage|IsReplyRegexp|id
|--------------|------------|------------|-------------|--

<details>
	<summary>RegexpComment Creation script</summary>
	
	-- Table: public."RegexpComment"
	-- DROP TABLE public."RegexpComment";

	CREATE TABLE public."RegexpComment"
	(
		"SubredditMatch" text COLLATE pg_catalog."default" NOT NULL DEFAULT '.*'::text,
		"CommentMatch" text COLLATE pg_catalog."default" NOT NULL,
		"ReplyMessage" text COLLATE pg_catalog."default" NOT NULL,
		"IsReplyRegexp" boolean DEFAULT false,
		id integer NOT NULL DEFAULT nextval('"RegexpComment_id_seq"'::regclass)
	)
	WITH (
		OIDS = FALSE
	)
	TABLESPACE pg_default;

	ALTER TABLE public."RegexpComment"
		OWNER to uuhsiyqcwwsszg;
</details>
<br />

**ErrorTable** - Errors are logged here. Application is hosted on Heroku, which doesn't keep a second log for errors

|id|ErrorDescription|ErrorTrace|AdditionalInfo|CreatedOn
|--|----------------|----------|--------------|---------

<details>
	<summary>ErrorTable Creation script</summary>
	
	-- Table: public."ErrorTable"
	-- DROP TABLE public."ErrorTable";

	CREATE TABLE public."ErrorTable"
	(
		id integer NOT NULL DEFAULT nextval('errortable_id_seq'::regclass),
		errordescription character varying(255) COLLATE pg_catalog."default",
		errortrace character varying(5000) COLLATE pg_catalog."default",
		additionalinfo character varying(1000) COLLATE pg_catalog."default",
		createdon timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
		CONSTRAINT errortable_pkey PRIMARY KEY (id)
	)
	WITH (
		OIDS = FALSE
	)
	TABLESPACE pg_default;

	ALTER TABLE public."ErrorTable"
		OWNER to uuhsiyqcwwsszg;
</details>
<br />

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