const { Client } = require('pg');
const LogManager = require('./Logger.js');
const Logger = LogManager.createInstance('DatabaseUtil.js');

class DatabaseUtil {
  async writeErrorToDatabase(databaseConnectionString, errorDescription, errorTrace, additionalInfo, redditCommentInfo) {
    const client = await createPgClient(databaseConnectionString);
    const queryText = 'INSERT INTO "ErrorTable"(ErrorDescription, ErrorTrace, AdditionalInfo, RedditCommentInfo) VALUES($1, $2, $3, $4)';
    const tableValues = [errorDescription, errorTrace, additionalInfo, redditCommentInfo];
    
    client.query(queryText, tableValues, (err, res) => {
      if (err) {
        console.error(err.stack);
      } else {
        console.error(res.rows[0]);
      }
      client.end();
    });
  }
  
  getCommentSearchObjectsFromDatabase(databaseConnectionString, useSSL) {
    if (useSSL && !databaseConnectionString.includes("?sslmode=require")) {
      databaseConnectionString += "?sslmode=require";
    }
    
    Logger.info('trying to get comment objects from database: ' + databaseConnectionString);
    return new Promise(async function(resolve, reject) {
      let commentSearchPredicates = [];
      
      const client = await createPgClient(databaseConnectionString, useSSL);
      Logger.info('created PG Client');
      
      client.query('SELECT * FROM "RegexpComment"', function(err, result) {
        Logger.info('got results from client query...');
        Logger.info(result);
        if (err) {
          Logger.error('error getting data from database');
          Logger.error(err);
          return reject(err);
        }
        
        let results = result.rows;

        for (let i=0; i<results.length; i++) {
          let commentSearchObject = createCommentSearchObjectFromDatabaseObject(results[i]);
          commentSearchPredicates.push(commentSearchObject);
        }

        client.end();
        Logger.info('got comment search predicates from database: ' + commentSearchPredicates);
        resolve(commentSearchPredicates);
      });
    });
  }
}

async function createPgClient(databaseConnectionString, useSSL) {
  const client = new Client({connectionString: databaseConnectionString, ssl: (useSSL ? { rejectUnauthorized: false } : false)});
  await client.connect();
  
  return client;
}

function createCommentSearchObjectFromDatabaseObject(dbResult) {
  let commentExpressionText = dbResult.CommentMatch;
  let subredditExpressionText = dbResult.SubredditMatch;
	
  // Always use case insensetive. Strip the case insensetive flag if it exists (JS doesnt support it)
  commentExpressionText = commentExpressionText.replace('(?i)', '');
  subredditExpressionText = subredditExpressionText.replace('(?i)', '');
  let replyMessageText = dbResult.ReplyMessage;
	
  // Support reddit line break
  replyMessageText = replyMessageText.replace(/\\n/g, '  \r\n');
	
  let subredditMatchExpression = new RegExp(subredditExpressionText, 'i');
  let commentMatchExpression = new RegExp(commentExpressionText, 'i');
	
  return {SubredditMatch: subredditMatchExpression, 
    CommentMatch: commentMatchExpression,
    ReplyMessage: replyMessageText,
    IsReplyRegexp: dbResult.IsReplyRegexp,
    ClientHandler: dbResult.Handle};
}

module.exports = new DatabaseUtil();