const Snoowrap = require('snoowrap');

const requestor = new Snoowrap({
  userAgent: 'Searching for certain keywords in all comments, displaying comments elsewhere',
  clientId: 'Wi7mH5fRbfl7Dw',
  clientSecret: 'Ysutdnu39r66jewCYd45gL37L-8',
  username: 'Lottery-Bot',
  password: 'redditFreinds123'
});

setInterval(function() {
requestor.getNewComments('all').filter(filterCondition).then(console.log);
}, 1000);

function filterCondition(comment)
{
	return comment.body.includes('e');
}