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

var ioc = require( 'socket.io-client' );
var client = ioc.connect( "wss://reddit-agree-with-you.herokuapp.com/", {
	reconnection: true
});

client.on('connect', function () {
    console.log('connected to localhost:3000');
    socket.on('clientEvent', function (data) {
        console.log('message from the server:', data);
        socket.emit('serverEvent', "thanks server! for sending '" + data + "'");
    });
});

/*var HOST = location.origin.replace(/^http/, 'ws')
      var ws = new WebSocket(HOST);
      var el = document.getElementById('server-time');
      ws.onmessage = function (event) {
        el.innerHTML = 'Server time: ' + event.data;
      };*/