import { createApp } from './app';
import { env } from './config/env';
import { logger } from './lib/logger';

const app = createApp();
// Start the server and listen on the specified port
app.listen(env.PORT, () => {
  logger.info(` Ugnay API listening on http://localhost:${env.PORT}`);
  logger.info(` Health check: http://localhost:${env.PORT}/health`);
});
