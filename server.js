const express = require('express');
const cors = require('cors');
const app = express();

// Enable CORS for all origins (restrict this in production)
app.use(cors());

// Parse JSON bodies with larger limit for PDFs
app.use(express.json({ limit: '50mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Main extraction endpoint
app.post('/api/extract', async (req, res) => {
  console.log('Received extraction request');
  
  try {
    const { apiKey, payload } = req.body;

    // Validate request
    if (!apiKey) {
      return res.status(400).json({ error: { message: 'API key is required' } });
    }

    if (!payload) {
      return res.status(400).json({ error: { message: 'Payload is required' } });
    }

    console.log('Calling Anthropic API...');

    // Call Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(payload)
    });

    console.log('Anthropic API response status:', response.status);

    // Handle API errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Anthropic API error:', errorData);
      
      return res.status(response.status).json({
        error: {
          message: errorData.error?.message || `API request failed with status ${response.status}`
        }
      });
    }

    // Parse and return successful response
    const data = await response.json();
    console.log('Extraction successful');
    res.json(data);

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      error: {
        message: error.message || 'Internal server error'
      }
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`╔═══════════════════════════════════════════╗`);
  console.log(`║   Utility Bill Extractor Server Started  ║`);
  console.log(`╚═══════════════════════════════════════════╝`);
  console.log(`\n🚀 Server running on: http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔌 API endpoint: http://localhost:${PORT}/api/extract`);
  console.log(`\n✅ Ready to receive requests!\n`);
});
