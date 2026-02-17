import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// CORS setup (important for cross-origin requests)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Check environment variables
console.log('🔍 Checking environment:');
console.log('📌 NODE_ENV:', process.env.NODE_ENV);
console.log('📌 PORT:', PORT);
console.log('📌 API Key exists:', !!process.env.GEMINI_API_KEY);
console.log('📌 API Key length:', process.env.GEMINI_API_KEY?.length || 0);
console.log('📌 API Key starts with:', process.env.GEMINI_API_KEY?.substring(0, 4));

// Gemini API setup
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in environment variables!');
    console.error('📝 Please add it in Render Dashboard -> Environment');
    process.exit(1);
}

// Initialize Gemini with correct model
const genAI = new GoogleGenerativeAI(apiKey);

// Try different model names if one doesn't work
let model;
try {
    // Try gemini-1.0-pro first (most stable)
    model = genAI.getGenerativeModel({ 
        model: 'gemini-1.0-pro',
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800,
        }
    });
    console.log('✅ Gemini model initialized: gemini-1.0-pro');
} catch (error) {
    console.log('⚠️ gemini-1.0-pro failed, trying gemini-pro...');
    try {
        model = genAI.getGenerativeModel({ 
            model: 'gemini-pro',
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 800,
            }
        });
        console.log('✅ Gemini model initialized: gemini-pro');
    } catch (error2) {
        console.error('❌ Failed to initialize any model:', error2.message);
        process.exit(1);
    }
}

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'API is working',
        apiKeySet: !!process.env.GEMINI_API_KEY,
        apiKeyPrefix: process.env.GEMINI_API_KEY?.substring(0, 4)
    });
});

// Chat endpoint with detailed error logging
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        console.log('\n📨 Incoming message:', message);
        console.log('🔑 API Key prefix:', process.env.GEMINI_API_KEY?.substring(0, 4));
        
        if (!message) {
            throw new Error('No message provided');
        }

        // Generate content
        console.log('⏳ Calling Gemini API...');
        const result = await model.generateContent(message);
        console.log('📤 Raw API result received');
        
        const response = await result.response;
        console.log('📤 Response object received');
        
        const text = response.text();
        console.log('✅ Final text:', text.substring(0, 100));
        
        res.json({ response: text });
        
    } catch (error) {
        // Log full error details
        console.error('\n❌ FULL ERROR OBJECT:');
        console.error('Message:', error.message);
        console.error('Name:', error.name);
        console.error('Status:', error.status || 'N/A');
        console.error('Stack:', error.stack);
        
        // Check for specific error types
        if (error.message.includes('API key')) {
            console.error('🔑 PROBLEM: Invalid API key');
        } else if (error.message.includes('model')) {
            console.error('🤖 PROBLEM: Model issue');
        } else if (error.message.includes('quota')) {
            console.error('💰 PROBLEM: Quota exceeded');
        }
        
        res.status(500).json({ 
            error: 'Error: ' + error.message 
        });
    }
});

// Serve HTML file
app.get('/', (req, res) => {
    const htmlPath = path.join(__dirname, 'public', 'index.html');
    console.log('📁 Serving HTML from:', htmlPath);
    res.sendFile(htmlPath);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n✅ Server running on port ${PORT}`);
    console.log(`📁 Public folder: ${path.join(__dirname, 'public')}`);
    console.log(`🌐 Test endpoint: http://localhost:${PORT}/api/test`);
    console.log(`💬 Chat endpoint: http://localhost:${PORT}/api/chat\n`);
});
