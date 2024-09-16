import { CreatePgClient, Query } from './database-client-manager.js';
import LogManager from '../logger.js';
const Logger = LogManager.createInstance('database-util.js');

class DatabaseUtil {
  async writeErrorToDatabase(
    databaseConnectionString,
    errorDescription,
    errorTrace,
    additionalInfo,
    redditCommentInfo
  ) {
    const client = await CreatePgClient(databaseConnectionString);
    const queryText = 'INSERT INTO "ErrorTable"(ErrorDescription, ErrorTrace, AdditionalInfo, RedditCommentInfo)'
      + ' VALUES($1, $2, $3, $4)';
    const tableValues = [errorDescription, errorTrace, additionalInfo, redditCommentInfo];

    return Query(client, queryText, tableValues);
  }

  async getCommentSearchObjectsFromDatabase(databaseConnectionString, useSSL) {
    if (useSSL && !databaseConnectionString.includes("?sslmode=require")) {
      databaseConnectionString += "?sslmode=require";
    }

    Logger.info('trying to get comment objects from database: ' + databaseConnectionString);
    const client = await createPgClient(databaseConnectionString, useSSL);
    return new Promise(function(resolve, reject) {
      const commentSearchPredicates = [];

      Logger.info('created PG Client');

      client.query('SELECT * FROM "RegexpComment"', function(err, result) {
        Logger.info('got results from client query...');
        Logger.info(result);
        if (err) {
          Logger.error('error getting data from database');
          Logger.error(err);
          return reject(err);
        }

        const results = result.rows;

        for (let i=0; i<results.length; i++) {
          const commentSearchObject = createCommentSearchObjectFromDatabaseObject(results[i]);
          commentSearchPredicates.push(commentSearchObject);
        }

        client.end();
        Logger.info('got comment search predicates from database: ' + commentSearchPredicates);
        resolve(commentSearchPredicates);
      });
    });
  }

  async getDiscordClientsFromDatabase(databaseConnectionString, useSSL) {
    if (useSSL && !databaseConnectionString.includes("?sslmode=require")) {
      databaseConnectionString += "?sslmode=require";
    }

    Logger.info('trying to get discord clients from database: ' + databaseConnectionString);
    const client = await createPgClient(databaseConnectionString, useSSL);
    return new Promise(function(resolve, reject) {
      const discordClients = [];

      Logger.info('created PG Client');

      client.query('SELECT * FROM "RegexpCommentHandle" WHERE type="Discord"', function(err, result) {
        Logger.info('got results from client query...');
        Logger.info(result);
        if (err) {
          Logger.error('error getting data from database');
          Logger.error(err);
          return reject(err);
        }

        const results = result.rows;

        for (let i=0; i<results.length; i++) {
          // TODO: continue here
          // let discordClient = createCommentSearchObjectFromDatabaseObject(results[i]);
          // discordClients.push(discordClient);
        }

        client.end();
        Logger.info('got discord clients from database: ' + discordClients);
        resolve(discordClients);
      });
    });
  }
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

  const subredditMatchExpression = new RegExp(subredditExpressionText, 'i');
  const commentMatchExpression = new RegExp(commentExpressionText, 'i');

  return { SubredditMatch: subredditMatchExpression,
    CommentMatch: commentMatchExpression,
    ReplyMessage: replyMessageText,
    IsReplyRegexp: dbResult.IsReplyRegexp,
    ClientHandler: dbResult.Handle };
}

export default new DatabaseUtil();
