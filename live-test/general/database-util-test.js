import ErrorHandler from '../../reddit-comment-reader/tools/error-handler.js';
import DatabaseUtil from '../../reddit-comment-reader/tools/database/database-util.js';
import 'dotenv/config';
import { CreateSimpleLogger } from '../../reddit-comment-reader/tools/logger.js';

const Logger = CreateSimpleLogger('database-util-test');

(async () => {
  try {
    const result = await DatabaseUtil.writeErrorToDatabase(process.env.DATABASE_URL_TEST, 'a', 'b', 'c');
    Logger.info('Got result:');
    Logger.info(result);

    const errorHandler = new ErrorHandler(process.env.DATABASE_URL_TEST);
    await errorHandler.handleError('fromerrorHandler', '1', '2');
  } catch(e) {
    console.error('error...');
    console.error(e);
  }
})();
