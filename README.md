# Utility Bill AI Extractor - Setup Guide

A web application that uses Claude AI to extract structured data from utility bill PDFs.

## 📁 Project Structure

```
your-project/
├── index.html          # Frontend application
├── server.js           # Backend proxy server
├── package.json        # Node.js dependencies
└── README.md          # This file
```

## 🚀 Quick Start

### Step 1: Install Dependencies

First, make sure you have Node.js installed (v14 or higher).

Then install the required packages:

```bash
npm install
```

### Step 2: Start the Server

```bash
npm start
```

You should see:
```
╔═══════════════════════════════════════════╗
║   Utility Bill Extractor Server Started  ║
╚═══════════════════════════════════════════╝

🚀 Server running on: http://localhost:3000
📊 Health check: http://localhost:3000/health
🔌 API endpoint: http://localhost:3000/api/extract

✅ Ready to receive requests!
```

### Step 3: Open the Frontend

Open `index.html` in your web browser:
- Double-click the file, OR
- Right-click → "Open with" → Your browser

### Step 4: Use the Application

1. **Enter your Anthropic API key**
   - Get one from: https://console.anthropic.com/
   - Format: `sk-ant-api03-...`

2. **Upload a utility bill PDF**

3. **Get extracted JSON data**
   - Copy or download the structured data

## 🔧 Troubleshooting

### Error: "Failed to fetch"
- ✅ Make sure the server is running (`npm start`)
- ✅ Check that the server is on port 3000
- ✅ Open browser console (F12) for detailed errors

### Error: "Invalid API key"
- ✅ Verify your API key starts with `sk-ant-`
- ✅ Check that it's not expired at console.anthropic.com

### Error: "EADDRINUSE"
- Another process is using port 3000
- Change the port in server.js or kill the process:
  ```bash
  # Find process on port 3000
  lsof -i :3000
  
  # Kill it
  kill -9 <PID>
  ```

## 📝 Development

For auto-restart during development:

```bash
npm run dev
```

## 🌐 Deploying to Production

### Option 1: Heroku

```bash
heroku create your-app-name
git push heroku main
```

Update `index.html` line 68:
```javascript
const response = await fetch('https://your-app-name.herokuapp.com/api/extract', {
```

### Option 2: Vercel

Create `api/extract.js`:
```javascript
export default async function handler(req, res) {
  // Same logic as server.js
}
```

### Option 3: AWS Lambda + API Gateway

Use the AWS Serverless Application Model (SAM) or Serverless Framework.

## 🔒 Security Notes

**Important for Production:**

1. **Don't expose API keys in frontend code**
   - Store them as environment variables on the server
   - Never commit them to Git

2. **Restrict CORS**
   ```javascript
   app.use(cors({
     origin: 'https://yourdomain.com'
   }));
   ```

3. **Add rate limiting**
   ```bash
   npm install express-rate-limit
   ```

4. **Use HTTPS** in production

5. **Add authentication** for your API endpoint

## 📦 Dependencies

- **express**: Web server framework
- **cors**: Enable cross-origin requests
- **nodemon**: Auto-restart during development (optional)

## 🆘 Support

For issues or questions:
1. Check the browser console (F12)
2. Check the server logs in terminal
3. Review Anthropic API docs: https://docs.anthropic.com/

## 📄 License

MIT
