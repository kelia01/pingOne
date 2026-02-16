import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try loading with explicit path
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('Current directory:', __dirname);
console.log('Looking for .env at:', path.join(__dirname, '.env'));
console.log('MONGODB_URI:', process.env.MONGO_URI);
console.log('PORT:', process.env.PORT);
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);