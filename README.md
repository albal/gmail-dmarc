# DMARC Report Analyzer - Gmail Add-on

A Gmail add-on that automatically detects, decodes, and analyzes DMARC (Domain-based Message Authentication, Reporting, and Conformance) reports from email attachments. The add-on provides instant visual feedback with ratings and recommendations directly in Gmail.

## Features

- 🔍 **Automatic Detection**: Automatically identifies DMARC report attachments in emails
- 📦 **Multiple Formats**: Supports GZIP (.gz), ZIP (.zip), and XML (.xml) formats
- 📊 **Visual Analysis**: Displays comprehensive analysis with color-coded ratings
- ✅ **Health Scoring**: Provides overall health scores and pass/fail statistics
- 💡 **Recommendations**: Offers actionable recommendations to improve email security
- 🎯 **Detailed Records**: View individual authentication records by source IP
- 🔒 **Privacy-Focused**: All processing happens within Google Apps Script (no external servers)

## How It Works

1. Open an email containing a DMARC report attachment
2. The add-on automatically detects and processes the report
3. View the analysis in the Gmail sidebar with:
   - Overall rating (Excellent, Good, Fair, Poor, or Bad)
   - Summary statistics (total messages, pass/fail counts)
   - DMARC policy information
   - Issues and recommendations
   - Detailed authentication records

## Screenshots

The add-on displays an information card in Gmail's sidebar showing:
- Color-coded rating (Green = Good, Yellow = Fair, Red = Bad)
- Report metadata and date range
- Authentication statistics
- Policy configuration
- Security issues and recommendations

## Installation Guide

### Prerequisites

1. **Google Account** with Gmail access
2. **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
3. **npm** (comes with Node.js)
4. **Google Apps Script** project

### Step 1: Set Up Your Development Environment

```bash
# Clone or download this repository
cd dmarc-gmail-addon

# Install dependencies
npm install
```

### Step 2: Enable Google Apps Script API

1. Go to [Google Apps Script API](https://script.google.com/home/usersettings)
2. Turn ON "Google Apps Script API"

### Step 3: Login with Clasp

```bash
# Login to your Google account
npm run login
```

This will:
- Open a browser window
- Ask you to select your Google account
- Request permissions for clasp
- Save credentials locally

### Step 4: Create the Apps Script Project

```bash
# Create a new Apps Script project
npm run setup
```

This creates a new standalone Apps Script project. Note the **Script ID** displayed.

### Step 5: Configure Clasp

After creating the project, you'll have a `.clasp.json` file. Verify it looks like:

```json
{
  "scriptId": "YOUR_SCRIPT_ID_HERE",
  "rootDir": "./src"
}
```

### Step 6: Push Your Code

```bash
# Upload all code to Google Apps Script
npm run push
```

This uploads:
- `Code.js` - Main add-on logic
- `DmarcParser.js` - DMARC parsing and analysis
- `UIBuilder.js` - Gmail card UI components
- `appsscript.json` - Add-on configuration

### Step 7: Configure OAuth Scopes

The add-on requires these OAuth scopes (already configured in `appsscript.json`):

- `https://www.googleapis.com/auth/gmail.addons.current.message.readonly`
- `https://www.googleapis.com/auth/gmail.addons.current.message.metadata`
- `https://www.googleapis.com/auth/gmail.readonly`

### Step 8: Test the Add-on

1. Open the Apps Script editor:
   ```bash
   npm run open
   ```

2. In the editor:
   - Click **Deploy** → **Test deployments**
   - Click **Install** under "Latest"
   - Select your Google account

3. Test in Gmail:
   - Open Gmail in a new tab
   - Find an email with a DMARC report (or send yourself a test DMARC report)
   - Open the email
   - Look for the add-on in the right sidebar
   - The add-on should automatically display the analysis

### Step 9: Debug (If Needed)

View logs in Apps Script:
```bash
# View execution logs
npm run logs
```

Or in the Apps Script editor:
- Click **Executions** (clock icon) to see execution history
- Click on any execution to see detailed logs

## Publishing to Google Workspace Marketplace

### Prerequisites for Publishing

1. **Google Cloud Project** with billing enabled
2. **OAuth consent screen** configured
3. **Add-on editor access** and testing completed
4. **Privacy policy** and **Terms of Service** URLs

### Step 1: Prepare for Publication

#### 1.1 Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable billing (required for Marketplace listing)

#### 1.2 Link Apps Script to Cloud Project

1. Open your Apps Script project: `npm run open`
2. Click **Project Settings** (gear icon)
3. Under "Google Cloud Platform (GCP) Project":
   - Click **Change project**
   - Enter your GCP project number
   - Click **Set project**

#### 1.3 Configure OAuth Consent Screen

1. Go to [OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent)
2. Choose **External** or **Internal** (Internal only for Google Workspace domains)
3. Fill in required information:
   - **App name**: DMARC Report Analyzer
   - **User support email**: Your email
   - **App logo**: Upload a 120x120px logo
   - **Application home page**: Your website or GitHub repo
   - **Application privacy policy**: URL to your privacy policy
   - **Application terms of service**: URL to your ToS
   - **Authorized domains**: Add your domain if applicable
   - **Developer contact**: Your email

4. Add scopes:
   - `https://www.googleapis.com/auth/gmail.addons.current.message.readonly`
   - `https://www.googleapis.com/auth/gmail.addons.current.message.metadata`
   - `https://www.googleapis.com/auth/gmail.readonly`

5. Click **Save and Continue**

### Step 2: Deploy as Production Version

1. In Apps Script editor, click **Deploy** → **New deployment**
2. Click **Select type** → **Editor Add-on**
3. Configure deployment:
   - **Version**: Enter description (e.g., "v1.0 - Initial release")
   - **Description**: "DMARC Report Analyzer for Gmail"
4. Click **Deploy**
5. Note the **Deployment ID**

### Step 3: Create Marketplace Listing

#### 3.1 Access Google Workspace Marketplace SDK

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **APIs & Services** → **Library**
4. Search for "Google Workspace Marketplace SDK"
5. Click **Enable**

#### 3.2 Configure Marketplace Listing

1. Go to [Google Workspace Marketplace SDK Configuration](https://console.cloud.google.com/apis/api/appsmarket-component.googleapis.com/googleapps_sdk)
2. Click **Configuration** tab

3. Fill in **Application Information**:
   - **Application Name**: DMARC Report Analyzer
   - **Application Description**: 
     ```
     Automatically analyze DMARC reports in Gmail. This add-on detects DMARC 
     report attachments (XML, GZIP, ZIP formats), parses them, and displays 
     comprehensive analysis with ratings, statistics, and security recommendations 
     directly in Gmail's sidebar.
     ```
   - **Application Icons**:
     - 128x128px icon
     - 32x32px icon
   - **Category**: Productivity
   - **Language**: English (or your language)

4. Fill in **Developer Information**:
   - **Developer name**: Your name or company
   - **Developer email**: Support email
   - **Developer website**: Your website

5. Add **Support URLs**:
   - **Terms of Service**: Your ToS URL
   - **Privacy Policy**: Your privacy policy URL
   - **Support page**: Support documentation or contact

6. Configure **Extensions**:
   - **Extension type**: Gmail Add-on
   - **Deployment ID**: Paste your deployment ID from Step 2
   - **Script ID**: Your Apps Script project ID

7. Add **Screenshots** (minimum 3):
   - Screenshot of add-on analyzing a report
   - Screenshot showing rating and summary
   - Screenshot of detailed records view
   - Recommended size: 1280x800px

8. Configure **OAuth Scopes**:
   - Verify all scopes are listed
   - Provide justification for each scope

9. Set **Visibility**:
   - **Public**: Available to all Gmail users
   - **Private**: Only for your Google Workspace domain
   - **Unlisted**: Accessible via direct link only

### Step 4: Submit for Review

1. Review all information carefully
2. Click **Publish** → **Submit for review**
3. Google will review your add-on (typically 3-5 business days)

### Step 5: Respond to Review Feedback

Google may request:
- **Verification**: Prove you own domains/URLs
- **Privacy policy**: Detailed explanation of data handling
- **Demo video**: Screen recording showing add-on functionality
- **Test accounts**: Credentials to test your add-on
- **Clarifications**: Additional information about features

Respond promptly to speed up approval.

### Step 6: Publication

Once approved:
1. Your add-on appears in Google Workspace Marketplace
2. Users can install it from: [https://workspace.google.com/marketplace](https://workspace.google.com/marketplace)
3. Search for "DMARC Report Analyzer"

## Post-Publication

### Monitor Usage

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. View **APIs & Services** → **Dashboard** for API usage
4. Monitor **Executions** in Apps Script editor

### Update the Add-on

To release updates:

```bash
# Make code changes
# Test thoroughly

# Push updated code
npm run push

# Create new deployment
npm run deploy
```

Then in Apps Script editor:
- **Deploy** → **Manage deployments**
- Edit the deployment version
- Update version description
- Save changes

Marketplace listing updates:
- Go to Google Workspace Marketplace SDK
- Update screenshots, description, or other details
- Resubmit for review if major changes

### Handle User Feedback

- Monitor reviews on Marketplace
- Respond to user issues
- Update documentation
- Release bug fixes promptly

## Usage Instructions for End Users

### Installing the Add-on

1. Visit [Google Workspace Marketplace](https://workspace.google.com/marketplace)
2. Search for "DMARC Report Analyzer"
3. Click **Install**
4. Review and accept permissions
5. Click **Continue** and authorize

### Using the Add-on

1. **Open Gmail** in your browser
2. **Find an email** with a DMARC report attachment
   - DMARC reports are typically sent from email providers
   - Common file formats: `.xml`, `.gz`, `.zip`
   - Often from addresses like: `noreply@dmarc.domain.com`

3. **Open the email** containing the DMARC report

4. **View the analysis** in the sidebar:
   - The add-on automatically detects the report
   - Color-coded rating appears at the top
   - Summary shows pass/fail statistics
   - Issues and recommendations are listed

5. **View detailed records**:
   - Click "View Detailed Records" button
   - See authentication results by source IP
   - Review SPF and DKIM status for each source

### Understanding the Analysis

#### Ratings

- **EXCELLENT** (Green): 95%+ pass rate with quarantine/reject policy
- **GOOD** (Green): 90%+ pass rate with active policy
- **FAIR** (Yellow): 80-89% pass rate
- **POOR** (Orange): 60-79% pass rate
- **BAD** (Red): Below 60% pass rate

#### Common Issues

- **Policy set to "none"**: No action taken on authentication failures
- **Low pass rate**: Many emails failing SPF/DKIM checks
- **High-volume failures**: Potential spoofing from specific IPs

#### Recommendations

The add-on provides specific recommendations such as:
- Upgrading DMARC policy from "none" to "quarantine" or "reject"
- Reviewing SPF and DKIM configurations
- Investigating suspicious source IPs

## Technical Architecture

### Components

1. **Code.js**: Main orchestration and Gmail triggers
2. **DmarcParser.js**: DMARC report parsing and analysis logic
3. **UIBuilder.js**: Card-based UI components for Gmail
4. **appsscript.json**: Add-on manifest and configuration

### Data Flow

```
Email Opened → Gmail Trigger → Detect Attachments → 
Find DMARC Report → Extract (decompress if needed) → 
Parse XML → Analyze Data → Calculate Rating → 
Build UI Card → Display in Gmail
```

### Security & Privacy

- **No external servers**: All processing in Google Apps Script
- **No data storage**: Reports analyzed in memory only
- **Minimal permissions**: Only reads current message
- **Google infrastructure**: Runs on Google's secure platform

## DMARC Report Format

DMARC reports follow the RFC 7489 standard and contain:

### Report Metadata
- Reporting organization name and contact
- Report ID and date range
- Domain policy details

### Policy Published
- Domain name
- DMARC policy (none, quarantine, reject)
- Subdomain policy
- Percentage of messages to apply policy

### Records
- Source IP addresses
- Message counts
- Authentication results (SPF, DKIM)
- Disposition (how messages were handled)

## Troubleshooting

### Add-on Not Appearing

1. **Refresh Gmail**: Press Ctrl+Shift+R (Cmd+Shift+R on Mac)
2. **Check installation**: Go to Gmail Settings → Add-ons
3. **Clear cache**: Clear browser cache and cookies
4. **Reinstall**: Uninstall and reinstall the add-on

### No Analysis Shown

1. **Verify attachment format**: Must be .xml, .gz, or .zip
2. **Check file content**: File must contain valid DMARC XML
3. **View logs**: Check Apps Script logs for errors
4. **Try different email**: Test with a known DMARC report

### Permission Errors

1. **Re-authorize**: Remove and re-grant permissions
2. **Check OAuth scopes**: Verify all required scopes are approved
3. **Admin restrictions**: Contact G Suite admin if in organization

### Parsing Errors

1. **Verify XML format**: DMARC report must follow RFC 7489
2. **Check compression**: Ensure .gz/.zip files aren't corrupted
3. **File size**: Very large reports may timeout (>10MB)
4. **Report version**: Some report formats may vary slightly

## Development

### Local Development

```bash
# Install dependencies
npm install

# Login to Google
npm run login

# Create project
npm run setup

# Make changes to src/*.js files

# Push changes
npm run push

# View logs
npm run logs
```

### Testing

1. Create test DMARC reports (samples in `test/` directory)
2. Email test reports to yourself
3. Open in Gmail and verify add-on behavior
4. Check Apps Script logs for errors

### Code Structure

```
dmarc-gmail-addon/
├── src/
│   ├── Code.js           # Main add-on logic
│   ├── DmarcParser.js    # Parsing and analysis
│   └── UIBuilder.js      # UI components
├── appsscript.json       # Add-on configuration
├── package.json          # npm configuration
├── .claspignore          # Files to exclude from push
├── .gitignore           # Git ignore rules
├── README.md            # This file
└── DEPLOYMENT.md        # Deployment guide
```

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - See LICENSE file for details

## Support

For issues, questions, or suggestions:
- Create an issue on GitHub
- Email: your-support-email@example.com
- Documentation: [Your documentation URL]

## Credits

Created with ❤️ for better email security

## Changelog

### v1.0.0 (Initial Release)
- Automatic DMARC report detection
- Support for XML, GZIP, and ZIP formats
- Visual analysis with color-coded ratings
- Detailed authentication records view
- Security recommendations

## Resources

- [DMARC Specification (RFC 7489)](https://tools.ietf.org/html/rfc7489)
- [Google Apps Script Documentation](https://developers.google.com/apps-script)
- [Gmail Add-ons Guide](https://developers.google.com/gmail/add-ons)
- [Google Workspace Marketplace](https://workspace.google.com/marketplace)
- [Clasp Documentation](https://github.com/google/clasp)

## FAQ

**Q: Does this add-on send data to external servers?**  
A: No, all processing happens within Google Apps Script.

**Q: Can I use this for my organization's DMARC reports?**  
A: Yes, it works with any RFC 7489-compliant DMARC report.

**Q: Does it work with mobile Gmail?**  
A: Add-ons currently only work in Gmail web interface, not mobile apps.

**Q: How often should I review DMARC reports?**  
A: We recommend weekly reviews to catch authentication issues early.

**Q: Can I customize the rating thresholds?**  
A: Yes, modify the `analyzeDmarcReport()` function in `DmarcParser.js`.

**Q: Does it support aggregate vs forensic reports?**  
A: Currently supports aggregate reports (RUA). Forensic reports (RUF) may be added in future versions.

---

**Happy DMARC analyzing! 📧🔒**
