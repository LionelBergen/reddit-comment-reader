import ErrorHandler from '../../reddit-comment-reader/tools/error-handler.js';
import DatabaseUtil from '../../reddit-comment-reader/tools/database/database-util.js';
import 'dotenv/config';

try {
  const result = await DatabaseUtil.writeErrorToDatabase(process.env.DATABASE_URL_TEST, 'a', 'b', 'c');
  console.log('Got result:');
  console.log(result);
} catch(e) {
  console.error('error...');
  console.error(e);
}

const errorHandler = new ErrorHandler(process.env.DATABASE_URL_TEST);

await errorHandler.handleError('fromerrorHandler', '1', '2');
