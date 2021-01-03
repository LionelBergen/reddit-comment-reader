require('../../reddit_comment_Reader/DatabaseUtil.js')();
require('dotenv').config();
const ErrorHandler = require('../../reddit_comment_Reader/ErrorHandler.js');

WriteErrorToDatabase(process.env.DATABASE_URL_TEST, 'a', 'b', 'c');

const errorHandler = new ErrorHandler(process.env.DATABASE_URL_TEST);

errorHandler.handleError('fromerrorHandler', '1', '2');