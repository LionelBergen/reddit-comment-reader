var express = require('express');
var app = express();

const snoowrap = require('snoowrap');

const requestor = new snoowrap({
  userAgent: 'Searching for certain keywords in all comments, displaying comments elsewhere',
  clientId: 'EkRCRBmwlW9c1Q',
  clientSecret: '_eUrRZr0qQ2ltrCuCg4JoRdj3zA',
  username: 'Lottery-Bot',
  password: 'redditFreinds123'
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.get('/', function (req, res) 
{
  res.send('Hello World!');
  console.log(requestor);
  
  requestor.getSubreddit('all').getComments();
});

app.listen(port, function () {
  console.log('Example app listening on port ' + port + '!');
});