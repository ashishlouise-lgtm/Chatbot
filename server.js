import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ES modules में __dirname के लिए
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Environment variables लोड करें
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Gemini API setup
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in .env file');
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ 
    model: 'gemini-1.5-flash',
    generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800,
    }
});

// Routes
app.post('/api/chat', async (req, res) => {
    try {
        const { message, history = [] } = req.body;
        
        console.log('📨 Received message:', message);
        
        const chat = model.startChat({
            history: history,
        });
        
        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();
        
        console.log('✅ Response sent');
        res.json({ response: text });
        
    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Serve HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
    console.log(`📁 Public folder: ${path.join(__dirname, 'public')}`);
});
