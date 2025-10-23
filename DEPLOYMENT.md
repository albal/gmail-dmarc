# DMARC Report Analyzer - Deployment Guide

## Quick Deployment Script

Run this script after setting up your Google Apps Script project:

```bash
#!/bin/bash

# Install dependencies
npm install

# Login to Google (if not already logged in)
npm run login

# Push code to Apps Script
npm run push

# Deploy the add-on
npm run deploy

# Open the Apps Script editor
npm run open
```

## Manual Deployment Steps

1. **Install Node.js and npm** (if not already installed)
   - Download from: https://nodejs.org/

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Login to Google Account**
   ```bash
   npm run login
   ```
   - This will open a browser window
   - Authorize clasp to access your Google account

4. **Create the Apps Script project**
   ```bash
   npm run setup
   ```
   - Note the Script ID that is generated
   - Update `.clasp.json` with your Script ID

5. **Push code to Google Apps Script**
   ```bash
   npm run push
   ```

6. **Deploy as Add-on**
   ```bash
   npm run deploy
   ```

7. **View in Apps Script Editor**
   ```bash
   npm run open
   ```

## Testing the Add-on

1. In the Apps Script editor, click on "Deploy" → "Test deployments"
2. Click "Install" to install the test version
3. Open Gmail and look for the add-on in the sidebar
4. Open an email with a DMARC report attachment
5. The add-on should automatically analyze and display the report

## Troubleshooting

- **Login issues**: Make sure you're using the correct Google account
- **Permission errors**: Ensure you've authorized all required scopes
- **Push fails**: Check that all files are valid JavaScript
- **Add-on not appearing**: Clear browser cache and refresh Gmail
