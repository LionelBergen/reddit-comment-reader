let SUBREDDIT_URL = "https://www.reddit.com/r/";
let https = require('https');

class RedditClient
{
	constructor(minimumWaitTimeBetweenRequestsInMilliseconds)
	{
		this.minimumWaitTimeBetweenRequestsInMilliseconds = minimumWaitTimeBetweenRequestsInMilliseconds;
		this.lastRequestSentAt = 0;
	}
	
	getCommentsFromSubreddit(numberOfPosts, subreddit, sortType, callbackFunction)
	{
		numberOfPosts = getValidNumberOfPosts(numberOfPosts);
		let url = SUBREDDIT_URL + subreddit + "/" + sortType + ".json?limit=" + numberOfPosts;
		
		// TODO:
		// To ensure we're not spamming reddit
		//waitIfNeeded();
		
		this.getCommentsFromURL(url, function(data) {
			callbackFunction(data);
		});
	}
	
	waitIfNeeded(runAfterWait)
	{
		// TODO: use Window.timout if needed......
	}

	getCommentsFromURL(url, callbackFunction)
	{
		getDataFromUrl(url, function(data)
		{
			let comments = getCommentObjectFromRawURLData(data);
			callbackFunction(comments);
		});
	}
}

// TODO: move to inside class.
function getDataFromUrl(url, callbackFunction)
{
	console.log('trying: ' + url);
	
	https.get(url, (resp) => 
	{
		let data = '';

		// A chunk of data has been recieved.
		resp.on('data', (chunk) => {
			data += chunk;
		});

		// The whole response has been received. Print out the result.
		resp.on('end', () => {
			callbackFunction(data);
		});
	}).on("error", (err) => {
		console.log("Error: " + err.message);
	});
}

function getCommentObjectFromRawURLData(rawDataFromURL)
{
	return JSON.parse(rawDataFromURL).data.children.map(comment => 
	{ 
		comment = comment.data;
		return {
			comment: comment.selftext,
			subreddit: comment.subreddit,
			authorFullname: comment.author_fullname,
			postTitle: comment.title,
			name: comment.name,
			ups: comment.ups,
			score: comment.score,
			created: comment.created,
			id: comment.id,
			author: comment.author,
			url: comment.url
		}
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
	if(numberOfPosts > 100)
	{
		numberOfPosts = 100;
	}
	else if (numberOfPosts < 1 || !numberOfPosts)
	{
		numberOfPosts = 1;
	}
	
	return numberOfPosts;
}

module.exports = RedditClient;