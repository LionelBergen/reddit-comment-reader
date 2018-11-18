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

let net = require('net');
let JsonSocket = require('json-socket');

let port = 51361;
let host = 'reddit-agree-with-you.herokuapp.com';

let socket = new JsonSocket(new net.Socket());

socket.connect(port, host);

socket.on('connect', function() 
{
    socket.sendMessage({a: 5, b: 7});
	
    socket.on('message', function(message) {
        console.log('The result is: '+message.result);
    });
});

socket.on('error', function(error) {
	console.log('ERROR');
	console.log(error);
});