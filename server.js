import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Check environment
console.log('🔍 Starting server...');
console.log('📌 NODE_ENV:', process.env.NODE_ENV);
console.log('📌 PORT:', PORT);

// Gemini API setup
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found!');
    process.exit(1);
}
console.log('✅ API Key found, length:', apiKey.length);
console.log('🔑 API Key prefix:', apiKey.substring(0, 4));

// Initialize Gemini with CORRECT model - GEMINI-1.5-FLASH
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ 
    model: 'gemini-1.5-flash',  // ✅ यह सही model है
    generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800,
    }
});
console.log('✅ Gemini model initialized: gemini-1.5-flash'); // यह लाइन अब सही दिखेगी

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'API is working',
        model: 'gemini-1.5-flash',
        apiKeySet: !!process.env.GEMINI_API_KEY
    });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'No message provided' });
        }

        console.log('📨 Message received:', message);
        
        const result = await model.generateContent(message);
        const response = await result.response;
        const text = response.text();
        
        console.log('✅ Response sent');
        res.json({ response: text });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        res.status(500).json({ 
            error: 'Sorry, something went wrong. Please try again.' 
        });
    }
});

// Serve HTML
app.get('/', (req, res) => {
    const htmlPath = path.join(__dirname, 'public', 'index.html');
    res.sendFile(htmlPath);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📁 Public folder: ${path.join(__dirname, 'public')}`);
});
