# YouTube Title Updater

Automatically updates YouTube video title with real-time view count.

## Setup

1. Install dependencies: `npm install`
2. Add `credentials.json` from Google Cloud Console
3. Run authentication: `npm run auth`
4. Update VIDEO_ID in `update-title.js`
5. Test locally: `npm start`

## Deploy to GitHub Actions

1. Create GitHub repository and push code
2. Add secrets in Settings > Secrets and variables > Actions:
   - VIDEO_ID
   - CREDENTIALS_JSON (base64 encoded)
   - TOKEN_JSON (base64 encoded)

## Encode files for GitHub Secrets

```bash
# On Linux/Mac
base64 -w 0 credentials.json
base64 -w 0 token.json

# On Windows (PowerShell)
[Convert]::ToBase64String([IO.File]::ReadAllBytes("credentials.json"))
[Convert]::ToBase64String([IO.File]::ReadAllBytes("token.json"))
