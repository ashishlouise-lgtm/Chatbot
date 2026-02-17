import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Force .env load
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// Log all environment variables (safely)
console.log('🔍 Checking environment:');
console.log('📌 NODE_ENV:', process.env.NODE_ENV);
console.log('📌 PORT:', PORT);
console.log('📌 API Key exists:', !!process.env.GEMINI_API_KEY);
console.log('📌 API Key length:', process.env.GEMINI_API_KEY?.length || 0);

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Gemini API setup
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error('❌ GEMINI_API_KEY is missing!');
    console.error('📝 Please add it in Render Environment Variables');
    process.exit(1);
}

// Initialize Gemini
const genAI = new GoogleGenerativeAI(apiKey);

// Use the correct model name
const model = genAI.getGenerativeModel({ 
    model: 'gemini-pro',  // यही सही नाम है
    generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800,
    }
});

console.log('✅ Gemini model initialized: gemini-pro');

// Test route
app.get('/api/test', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'API is working',
        apiKeySet: !!process.env.GEMINI_API_KEY 
    });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        console.log('📨 Received message:', message);
        
        const result = await model.generateContent(message);
        const response = await result.response;
        const text = response.text();
        
        console.log('✅ Response sent');
        res.json({ response: text });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Full error:', error);
        
        res.status(500).json({ 
            error: 'Error: ' + error.message 
        });
    }
});

// Serve HTML
app.get('/', (req, res) => {
    const htmlPath = path.join(__dirname, 'public', 'index.html');
    console.log('📁 Looking for HTML at:', htmlPath);
    res.sendFile(htmlPath);
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📁 Public folder: ${path.join(__dirname, 'public')}`);
});
