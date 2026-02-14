import 'dotenv/config'; // <--- THIS IS THE MAGIC LINE that loads your Neon DB URL
import { startServer } from './infrastructure/server';

const PORT = parseInt(process.env.PORT || '3000', 10);

startServer(PORT).catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
