import ErrorHandler from '../../reddit-comment-reader/tools/error-handler.js';
import DatabaseUtil from '../../reddit-comment-reader/tools/database-util.js';
import 'dotenv/config';

DatabaseUtil.writeErrorToDatabase(process.env.DATABASE_URL_TEST, 'a', 'b', 'c');

const errorHandler = new ErrorHandler(process.env.DATABASE_URL_TEST);

errorHandler.handleError('fromerrorHandler', '1', '2');
