const Snoowrap = require('snoowrap');

const requestor = new Snoowrap({
  userAgent: 'Searching for certain keywords in all comments, displaying comments elsewhere',
  clientId: 'Wi7mH5fRbfl7Dw',
  clientSecret: 'Ysutdnu39r66jewCYd45gL37L-8',
  username: 'Lottery-Bot',
  password: 'redditFreinds123'
});

const intervalToWaitInMillisecondsBetweenReadingComments = 1100;

let faye = require('faye');
let client = new faye.Client('http://reddit-agree-with-you.herokuapp.com/');

setInterval(function() {
	requestor.getNewComments('all').filter(filterCondition).forEach(comment => processComment(comment));
}, intervalToWaitInMillisecondsBetweenReadingComments);

function filterCondition(comment)
{
	var myregExp = new RegExp("^/r/theydidthemath$", 'i');
	var regexp2 = new RegExp("^(no you|no u|nou)$", 'i');
	
	return myregExp.test(comment.body) || regexp2.test(comment.body);
	//
}

function processComment(comment)
{
	client.publish('/messages', {comment: comment.body});
}