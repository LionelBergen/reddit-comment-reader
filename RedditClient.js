let SUBREDDIT_URL = "https://www.reddit.com/r/";
let https = require('https');

class RedditClient
{
	constructor()
	{
	}
	
	getCommentsFromSubreddit(numberOfPosts, subreddit, sortType, callbackFunction)
	{
		numberOfPosts = getValidNumberOfPosts(numberOfPosts);
		let url = SUBREDDIT_URL + subreddit + "/" + sortType + ".json?limit=" + numberOfPosts;
		
		this.getCommentsFromURL(url, function(data) {
			callbackFunction(data);
		});
	}

	getCommentsFromURL(url, callbackFunction)
	{
		this.getDataFromUrl(url, function(data)
		{
			let comments = getCommentObjectFromRawURLData(data);
			callbackFunction(comments);
		});
	}
	
	getDataFromUrl(url, callbackFunction)
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
				this.lastRequestSentAt = new Date().getTime();
				callbackFunction(data);
			});
		}).on("error", (err) => {
			console.log("Error: " + err.message);
		});
	}
}

function getCommentObjectFromRawURLData(rawDataFromURL)
{
	return JSON.parse(rawDataFromURL).data.children.map(comment => 
	{ 
		comment = comment.data;
		return {
			body: comment.body,
			subreddit: comment.subreddit,
			authorFullname: comment.author_fullname,
			postTitle: comment.title,
			name: comment.name,
			ups: comment.ups,
			score: comment.score,
			created: comment.created,
			id: comment.id,
			author: comment.author,
			url: comment.link_url
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