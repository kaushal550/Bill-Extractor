const express = require('express');
const cors = require('cors');
const app = express();

// Enable CORS for all origins in development (restrict in production)
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',') 
    : '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
};

app.use(cors(corsOptions));

// Parse JSON bodies with larger limit for PDFs
app.use(express.json({ limit: '50mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Main extraction endpoint
app.post('/api/extract', async (req, res) => {
  const startTime = Date.now();
  console.log(`[${new Date().toISOString()}] Received extraction request`);
  
  try {
    const { apiKey, payload } = req.body;

    // Use server-side API key if available (more secure)
    const effectiveApiKey = process.env.ANTHROPIC_API_KEY || apiKey;

    // Validate request
    if (!effectiveApiKey) {
      return res.status(400).json({ 
        error: { message: 'API key is required' } 
      });
    }

    if (!payload) {
      return res.status(400).json({ 
        error: { message: 'Payload is required' } 
      });
    }

    // Validate API key format
    if (!effectiveApiKey.startsWith('sk-ant-')) {
      return res.status(400).json({ 
        error: { message: 'Invalid API key format' } 
      });
    }

    console.log('→ Calling Anthropic API...');

    // Call Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': effectiveApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(payload)
    });

    const duration = Date.now() - startTime;
    console.log(`← Anthropic API response: ${response.status} (${duration}ms)`);

    // Handle API errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('✗ Anthropic API error:', errorData);
      
      return res.status(response.status).json({
        error: {
          message: errorData.error?.message || `API request failed with status ${response.status}`,
          type: errorData.error?.type || 'api_error'
        }
      });
    }

    // Parse and return successful response
    const data = await response.json();
    console.log(`✓ Extraction successful (total: ${duration}ms)`);
    
    res.json(data);

  } catch (error) {
    console.error('✗ Server error:', error);
    res.status(500).json({
      error: {
        message: error.message || 'Internal server error',
        type: 'server_error'
      }
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: 'Endpoint not found',
      availableEndpoints: [
        'GET /health',
        'POST /api/extract'
      ]
    }
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════╗
║   Utility Bill Extractor Server Started  ║
╚═══════════════════════════════════════════╝

🚀 Server: http://localhost:${PORT}
📊 Health: http://localhost:${PORT}/health
🔌 API:    http://localhost:${PORT}/api/extract

${process.env.ANTHROPIC_API_KEY ? '🔐 Using server-side API key' : '🔑 Using client-provided API keys'}
${process.env.ALLOWED_ORIGINS ? `🌐 CORS: ${process.env.ALLOWED_ORIGINS}` : '🌐 CORS: Accepting all origins (dev mode)'}

✅ Ready to receive requests!
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n🛑 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n🛑 SIGINT received, shutting down gracefully...');
  process.exit(0);
});
