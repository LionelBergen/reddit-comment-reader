let Snoowrap = require('snoowrap');

let requestor = new Snoowrap({
  userAgent: 'Searching for certain keywords in all comments, displaying comments elsewhere',
  clientId: 'Wi7mH5fRbfl7Dw',
  clientSecret: 'Ysutdnu39r66jewCYd45gL37L-8',
  username: 'Lottery-Bot',
  password: 'redditFreinds123'
});

const config = {
    user: 'postgres',
    database: 'YOURDBNAME',
    password: 'YOURPASSWORD',
    port: 5432
};

let pg = require('pg');
let pool = new pg.pool(config);

pool.connect(process.env.DATABASE_URL, function(err, client, done) {
  if(err) {
    return console.error('Client error.', err);
  }
  //
  client.query('SELECT * FROM RegexpComment', function(err, result) {
    done();

    if(err) {
      return console.error('Query error.', err);
    }
    
    console.log(result.rows);
  });
});

// load all env variables from .env file into process.env object.
require('dotenv').config();

let intervalToWaitInMillisecondsBetweenReadingComments = 1100;
let intervalToWaitBeforeSendingIdleMessage = 60;

var lastMessageSentAt = new Date().getTime();

let faye = require('faye');
let client = new faye.Client('http://reddit-agree-with-you.herokuapp.com/');

let commentCache = getArrayWithLimitedLength(2400, false);

setInterval(function() {
	requestor.getNewComments('all').filter(filterCondition).forEach(comment => processComment(comment));
	
	if (getSecondsSince(lastMessageSentAt) > intervalToWaitBeforeSendingIdleMessage)
	{
		console.log('sending inactive message');
		client.publish('/messages', {inactive: '1'});
		lastMessageSentAt = new Date().getTime();
	}
}, intervalToWaitInMillisecondsBetweenReadingComments);

function filterCondition(comment)
{
	var myregExp = new RegExp("^/r/theydidthemath$", 'i');
	var regexp2 = new RegExp("^(no you|no u|nou)$", 'i');
	
	return (myregExp.test(comment.body) || regexp2.test(comment.body))
		&& !commentCache.includes(comment);
}

function processComment(comment)
{
	commentCache.push(comment);
	
	client.publish('/messages', {comment: comment});
	lastMessageSentAt = new Date().getTime();
}

function getSecondsSince(time)
{
	var distance = new Date().getTime() - time;
	return Math.floor((distance % (1000 * 60)) / 1000);
}

function getArrayWithLimitedLength(length, allowDuplicates) 
{
	var array = new Array();

	array.push = function () {
		if (!allowDuplicates && this.includes(arguments[0]))
		{
			return null;
		}
		if (this.length >= length) {
			this.shift();
		}
		return Array.prototype.push.apply(this,arguments);
	}

	return array;

}