const RedditApi = require('reddit-oauth');

// This is the max number of posts Reddit allows to be retrieved at once. If a higher number is used, this is used anyway
const MAX_NUM_POSTS = 100;
const https = require('https');

if (!process.env.REDDIT_APP_ID || !process.env.REDDIT_APP_SECRET) {
  // throw 'REDDIT_APP_ID && REDDIT_APP_SECRET environment variables must be set!';
}

const reddit = new RedditApi({
    app_id: 'iqrBfPi95jyfK1G2Q5PqcQ',
    app_secret: 'HPp1wjOpLSvn3xSKd0MhVO-Mu8QBvA',
    redirect_uri: 'https://127.0.0.1/'
});


function getCommentsFromURL(url)
{
  return new Promise(function(resolve, reject) {
    getDataFromUrl(url).then(getCommentObjectFromRawURLData).then(resolve).catch(function(error) {  
      reject('error thrown for url: ' + url + ' error: ' + error);
    });
  });
}

/**
 * Returns an object based on the data returned from a Reddit URL.
 *
 * @param rawDataFromURL Data from a Reddit URL, containing all the comment info
 * @return A Comment object containing body, subreddit etc
*/
function getPostObjectsFromRawURLData(rawDataFromURL)
{
  const jsonDataFromUrl = JSON.parse(rawDataFromURL);
  
  if (!jsonDataFromUrl) {
    throw 'Cannot get JSON from rawdata: ' + rawDataFromURL;
  } else if (!jsonDataFromUrl.data || !jsonDataFromUrl.data.children) {
    throw 'Malformed data. Raw data was: ' + rawDataFromURL + ' json data was: ' + jsonDataFromUrl;
  }
  
  return jsonDataFromUrl.data.children.map(post => 
  {
    post = post.data;
    return new RedditPost({
      body: post.selftext,
      subreddit: post.subreddit,
      authorFullname: post.author_fullname,
      postTitle: post.title,
      name: post.name,
      ups: post.ups,
      score: post.score,
      created: post.created_utc,
      id: post.id,
      author: post.author,
      url: post.url,
      permalink: post.permalink
    });
  });
}

/**
 * Returns an object based on the data returned from a Reddit URL.
 *
 * @param rawDataFromURL Data from a Reddit URL, containing all the comment info
 * @return A Comment object containing body, subreddit etc
*/
function getCommentObjectFromRawURLData(rawDataFromURL)
{
  console.log('about to throww error? for rawData:');
  console.log(rawDataFromURL)
  const jsonDataFromUrl = JSON.parse(rawDataFromURL);
  
  if (!jsonDataFromUrl) {
    throw 'Cannot get JSON from rawdata: ' + rawDataFromURL;
  } else if (!jsonDataFromUrl.data || !jsonDataFromUrl.data.children) {
    throw 'Malformed data. Raw data was: ' + rawDataFromURL + ' json data was: ' + jsonDataFromUrl;
  }
  
  return jsonDataFromUrl.data.children.map(comment => 
  {
    comment = comment.data;
    return new RedditComment({
      body: comment.body,
      subreddit: comment.subreddit,
      authorFullname: comment.author_fullname,
      postTitle: comment.title,
      name: comment.name,
      ups: comment.ups,
      score: comment.score,
      created: comment.created_utc,
      id: comment.id,
      author: comment.author,
      url: comment.link_url,
      permalink: comment.permalink
    });
  });
}

/**
 * Run a GET request on a URL and return all the data
 *
 * @param url URL to get data from
 * @return a promise containing data returned from the url
*/
function getDataFromUrl(url)
{
  return new Promise(function(resolve, reject) {
    // console.debug('running GET request for url: ' + url);
    https.get(url, (resp) => 
    {
      let data = '';

      // A chunk of data has been recieved.
      resp.on('data', (chunk) => {
        data += chunk;
      });

      // The whole response has been received. Print out the result.
      resp.on('end', () => {
        resolve(data);
      });
    }).on("error", (err) => {
      reject('error getting data from url', err, ('url is: ' + url));
    });
  });
}

/**
 * This is what happens anyway. Reddit accepts numbers over 100 as 100 and less then 1 as 1
 * 
 * @param numberOfPosts
 * @return
 */
function getValidNumberOfPosts(numberOfPosts) 
{
  if(numberOfPosts > MAX_NUM_POSTS)
  {
    numberOfPosts = MAX_NUM_POSTS;
  }
  else if (numberOfPosts < 1 || !numberOfPosts)
  {
    numberOfPosts = 1;
  }
	
  return numberOfPosts;
}

function getCommentsFromURL(url)
{
  return new Promise(function(resolve, reject) {
    getDataFromUrl(url).then(getCommentObjectFromRawURLData).then(resolve).catch(function(error) {  
      reject('error thrown for url: ' + url + ' error: ' + error);
    });
  });
}

class RedditClient
{
	constructor(redditAccountUsername, redditAccountPassword, callback)
	{
		this.accountUsername = redditAccountUsername;
		this.accountPassword = redditAccountPassword;
		this.accessToken = null;
		// this.getAuth(callback);
	}
	
	getAuth(callback)
	{
		let self = this;
		reddit.passAuth(
			'agree-with-you',
			'agreeDpp5588',
			function (success) {
				if (success) {
					reddit.oAuthUrl('some_state', 'identity');
					// Print the access token we just retrieved
					console.log('got access token: ' + reddit.access_token);
					self.accessToken = reddit.access_token;
          
					callback();
				}
				else
				{
					console.log('error retrieving Reddit Access Token!');
				}
			},
			function (error) {
				console.log('error on Reddit auth:');
				console.log(error);
			}
		);
	}
	
	postComment(commentId, textToComment)
	{
		console.log('trying to post comment : ' + textToComment + ' with id: ' + commentId);
		reddit.post(
			'/api/comment',
			{
				api_type: 'json',
				thing_id: commentId,
				text: textToComment
			},
			function (error, response, body) {
				console.log('error: ' + error);
				console.log('error body: ' + body);
			}
		);
	}

	/**
	 * Get a list of the newest comments from Reddit
	 *
	 * @param numberOfComments A number between 10-100 (between 1-9 does not work for Reddit)
	 * @return List of comment objects
	 */
	getLatestCommentsFromReddit(numberOfComments)
	{
	  numberOfComments = getValidNumberOfPosts(numberOfComments);

	  return new Promise(function(resolve, reject) {
		reddit.get(
			'/r/all/new',
			{
				api_type: 'json'
			},
			function (error, response, body) {
				console.log(response)
				console.log('error: ' + error);
				console.log('error body: ' + body);
				resolve(response)
			}
		)
	  })
		/* return new Promise(function(resolve, reject) {
		numberOfComments = getValidNumberOfPosts(numberOfComments);
		const url = SUBREDDIT_URL + "all/comments.json?limit=" + numberOfComments;
  
		getCommentsFromURL(url).then(resolve).catch(reject);
	  }); */
	}
}

module.exports = RedditClient;