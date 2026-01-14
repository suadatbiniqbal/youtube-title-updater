const fs = require('fs');
const { google } = require('googleapis');

// Configuration
const VIDEO_ID = process.env.VIDEO_ID || 'Ic0sUP7D-9Y';
const CREDENTIALS_PATH = 'credentials.json';
const TOKEN_PATH = 'token.json';

async function getAuth() {
  let credentials, token;

  // Check if running in GitHub Actions
  if (process.env.CREDENTIALS_JSON && process.env.TOKEN_JSON) {
    // Decode from base64 environment variables
    credentials = JSON.parse(
      Buffer.from(process.env.CREDENTIALS_JSON, 'base64').toString()
    );
    token = JSON.parse(
      Buffer.from(process.env.TOKEN_JSON, 'base64').toString()
    );
  } else {
    // Load from local files
    if (!fs.existsSync(CREDENTIALS_PATH)) {
      throw new Error('credentials.json not found! Run: npm run auth');
    }
    if (!fs.existsSync(TOKEN_PATH)) {
      throw new Error('token.json not found! Run: npm run auth');
    }
    
    credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
    token = JSON.parse(fs.readFileSync(TOKEN_PATH));
  }

  const { client_secret, client_id, redirect_uris } = 
    credentials.installed || credentials.web;
  
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );
  
  oAuth2Client.setCredentials(token);
  return oAuth2Client;
}

async function updateVideoTitle() {
  try {
    console.log('🚀 Starting YouTube title update...');
    console.log('📹 Video ID:', VIDEO_ID);
    
    if (VIDEO_ID === 'YOUR_VIDEO_ID_HERE') {
      throw new Error('Please set VIDEO_ID in the script or environment variable!');
    }

    const auth = await getAuth();
    const youtube = google.youtube({ version: 'v3', auth });
    
    // Step 1: Get current video data
    console.log('📊 Fetching video statistics...');
    const videoData = await youtube.videos.list({
      part: 'snippet,statistics',
      id: VIDEO_ID
    });
    
    if (!videoData.data.items || videoData.data.items.length === 0) {
      throw new Error('Video not found! Check your VIDEO_ID');
    }
    
    const video = videoData.data.items[0];
    const viewCount = video.statistics.viewCount;
    const snippet = video.snippet;
    
    // Step 2: Format new title with commas
    const formattedViews = parseInt(viewCount).toLocaleString();
    const newTitle = `This Video Has ${formattedViews} Views`;
    
    console.log('👀 Current views:', formattedViews);
    console.log('📝 Current title:', snippet.title);
    console.log('🆕 New title:', newTitle);
    
    // Skip update if title is already correct
    if (snippet.title === newTitle) {
      console.log('✅ Title is already up to date!');
      return;
    }
    
    // Step 3: Update the video
    console.log('⏳ Updating video title...');
    await youtube.videos.update({
      part: 'snippet',
      requestBody: {
        id: VIDEO_ID,
        snippet: {
          title: newTitle,
          description: snippet.description,
          categoryId: snippet.categoryId,
          tags: snippet.tags || [],
          defaultLanguage: snippet.defaultLanguage || 'en'
        }
      }
    });
    
    console.log('✅ Title updated successfully!');
    console.log('🕐 Timestamp:', new Date().toISOString());
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.errors) {
      console.error('Details:', JSON.stringify(error.errors, null, 2));
    }
    process.exit(1);
  }
}

// Run the update
updateVideoTitle();
