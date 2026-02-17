// API key को properly load करें
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// .env file को explicitly load करें
dotenv.config({ path: path.join(__dirname, '.env') });

// API key check
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in environment variables!');
    console.error('📝 Please set it in Render dashboard');
    process.exit(1);
}

// Model name check करें (सही name use करें)
const model = genAI.getGenerativeModel({ 
    model: 'gemini-1.5-flash',  // या 'gemini-pro' अगर 1.5 flash नहीं चले
    generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800,
    }
});
