import 'source-map-support/register';
import './axiosInterceptors';
import sendMessage from './sendMessage';

const gracefulShutdownHandler = async (): Promise<void> => {
  await sendMessage('Backup bot shutting down due to `SIGINT/SIGTERM` signals.');
  process.exit(0);
};

// docker stop sends `SIGTERM`, but let's listen to SIGINT as well just in case
process.on('SIGINT', gracefulShutdownHandler);
process.on('SIGTERM', gracefulShutdownHandler);
