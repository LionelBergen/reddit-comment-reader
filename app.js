const Snoowrap = require('snoowrap');

const requestor = new Snoowrap({
  userAgent: 'Searching for certain keywords in all comments, displaying comments elsewhere',
  clientId: 'Wi7mH5fRbfl7Dw',
  clientSecret: 'Ysutdnu39r66jewCYd45gL37L-8',
  username: 'Lottery-Bot',
  password: 'redditFreinds123'
});

const intervalToWaitInMillisecondsBetweenReadingComments = 1100;

/*setInterval(function() {
	requestor.getNewComments('all').filter(filterCondition).forEach(comment => console.log(comment.body));
}, intervalToWaitInMillisecondsBetweenReadingComments);

function filterCondition(comment)
{
	return comment.body.includes('city');
}*/

let io = require( 'socket.io-client' );

var client = new faye.Client('http://reddit-agree-with-you.herokuapp.com:8000/');

client.subscribe('/foo', function(message) {
	console.log('glkfjgljkfdkjgfdjkgfdjklgjdf');
  // etc
});

client.subscribe('/', function(message) {
	console.log('ggggggggggggggggggggggggggggggggggggggggglkfjgljkfdkjgfdjkgfdjklgjdf');
  // etc
});
