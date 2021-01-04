const ErrorHandler = require('../../reddit_comment_Reader/tools/ErrorHandler.js');
const DatabaseUtil = require('../../reddit_comment_Reader/tools/DatabaseUtil.js');
require('dotenv').config();

DatabaseUtil.writeErrorToDatabase(process.env.DATABASE_URL_TEST, 'a', 'b', 'c');

const errorHandler = new ErrorHandler(process.env.DATABASE_URL_TEST);

errorHandler.handleError('fromerrorHandler', '1', '2');