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

const net = require('net');

const client = net.createConnection({ port: 16801, host: '34.227.214.181' }, () => {
  // 'connect' listener
  console.log('connected to server!');
  client.write('world!\r\n');
});

client.on('data', (data) => {
  console.log(data.toString());
  client.end();
});

client.on('end', () => {
  console.log('disconnected from server');
});

client.on('error', () => {
  console.log('error?');
});

console.log('client: ' + client);