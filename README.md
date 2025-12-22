<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# VaultConnect - Confidential SNS

A privacy-focused social network with AI-powered content analysis.

## Features

- 🔒 End-to-end encryption simulation
- 🤖 AI-powered privacy risk analysis (Gemini API)
- 🛡️ PII detection and anonymization
- 🎨 Modern cyber-themed UI

## Run Locally

**Prerequisites:** Node.js 20+

1. Install dependencies:
   ```bash
   npm install
   ```

2. (Optional) Set the `GEMINI_API_KEY` in `.env.local`:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```
   > Note: The app works without an API key, but AI analysis will use mock data.

3. Run the app:
   ```bash
   npm run dev
   ```

## Run with Docker

```bash
docker compose up --build
```

Access at: http://localhost:3000

## Deploy to GitHub Pages

1. Push to the `main` branch
2. Go to **Settings → Secrets and variables → Actions**
3. Add `GEMINI_API_KEY` secret (optional)
4. Enable GitHub Pages in **Settings → Pages** (Source: GitHub Actions)

The app will be available at: `https://<username>.github.io/vaultconnect/`
