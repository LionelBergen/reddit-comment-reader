let SUBREDDIT_URL = "https://www.reddit.com/r/";
let https = require('https');

class RedditClient
{
	getRawResponse(numberOfPosts, subreddit, sortType)
	{
		return getRawResponse(numberOfPosts, subreddit, sortType);
	}
}

function getRawResponse(numberOfPosts, subreddit, sortType)
{
	var rawResponse = "";
	numberOfPosts = getValidNumberOfPosts(numberOfPosts);
	
	var url = SUBREDDIT_URL + subreddit + "/" + sortType + ".json?limit=" + numberOfPosts;
	
	// TODO:
	// To ensure we're not spamming reddit
	//waitIfNeeded();
	
	// Create get request
	rawResponse = getRawResponseFromUrl(url);
	
	return rawResponse;
}

function getRawResponseFromUrl(url)
{
	console.log('trying: ' + url);
	https.get(url, (resp) => {
	let data = '';

	// A chunk of data has been recieved.
	resp.on('data', (chunk) => {
		data += chunk;
	});

	// The whole response has been received. Print out the result.
	resp.on('end', () => {
		console.log(JSON.parse(data).explanation);
	});

	}).on("error", (err) => {
		console.log("Error: " + err.message);
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