const https = require('https');

const SUBREDDIT_URL = "https://www.reddit.com/r/";
// This is the max number of posts Reddit allows to be retrieved at once. If a higher number is used, this is used anyway
const MAX_NUM_POSTS = 100;

class RedditClient
{
	constructor()
	{
	}
  
  static get MAX_NUM_POSTS() { return MAX_NUM_POSTS };
	
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
	
	getSubredditModList(subreddit, callback)
	{
		var url = 'https://www.reddit.com/r/' + subreddit + '/about/moderators.json?';
		console.log('trying get mod list from url : ' + subreddit + ' url: ' + url);
		https.get(url, (res) => {
			var message = '';
			res.on('data', (d) => {
				message += d;
			});
			
			res.on('end',function(){
				if (res.statusCode != 200) 
				{
					callback("Api call failed with response code " + res.statusCode);
				} 
				else 
				{
					var messages = JSON.parse(message).data.children;
					var modNamesCommaDelimitedList = messages.map(function(m) { return m.name; });
					callback(modNamesCommaDelimitedList);
				}
			});
		}).on('error', (e) => {
			console.log('error getting subreddit: ' + subreddit);
			console.error(e);
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
	try
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
				created: comment.created_utc,
				id: comment.id,
				author: comment.author,
				url: comment.link_url
			}
		});
	}
	catch (err)
	{
		console.log('error while parsing JSON!!!');
		console.log(err.message);
		console.log('url to parse: ' + rawDataFromURL);
	}
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