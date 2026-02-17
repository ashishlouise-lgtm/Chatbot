// इस पूरे ब्लॉक को अपनी server.js में chat endpoint के अंदर डालें
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        console.log('📨 Incoming message:', message);
        console.log('🔑 API Key (first 5 chars):', process.env.GEMINI_API_KEY?.substring(0, 5));
        
        // जानबूझकर गलत मॉडल नाम से टेस्ट करें? नहीं, सही से करें
        const result = await model.generateContent(message);
        console.log('📤 Raw API result received');
        
        const response = await result.response;
        console.log('📤 Response object received');
        
        const text = response.text();
        console.log('✅ Final text:', text.substring(0, 50));
        
        res.json({ response: text });
        
    } catch (error) {
        // यहाँ पूरा error log करें
        console.error('❌ FULL ERROR OBJECT:', {
            message: error.message,
            name: error.name,
            stack: error.stack,
            status: error.status,
            details: error.details || 'No details'
        });
        
        res.status(500).json({ 
            error: 'Server error: ' + error.message 
        });
    }
});
