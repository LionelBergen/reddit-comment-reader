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

/*var x = */client.publish('/messages', {text: 'hfklgjflkjg'});
/*
x.then(function() {
  console.log('Message received by server!');
}, function(error) {
  console.log('There was a problem: ' + error.message);
});*/

/*setInterval(function() {
	requestor.getNewComments('all').filter(filterCondition).forEach(comment => console.log(comment.body));
}, intervalToWaitInMillisecondsBetweenReadingComments);

function filterCondition(comment)
{
	return comment.body.includes('city');
}*/
