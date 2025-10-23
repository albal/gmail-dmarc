# Project Structure

```
dmarc-gmail-addon/
│
├── src/                          # Source code files
│   ├── Code.js                   # Main add-on entry point and triggers
│   ├── DmarcParser.js           # DMARC report parsing & analysis logic
│   └── UIBuilder.js             # Gmail Card UI components
│
├── test/                         # Test files and samples
│   ├── README.md                # Testing guide
│   └── sample-dmarc-report.xml  # Sample DMARC report for testing
│
├── appsscript.json              # Add-on manifest & configuration
├── package.json                 # npm dependencies & scripts
├── .clasp.json.template         # Clasp configuration template
├── .claspignore                 # Files to exclude from deployment
├── .gitignore                   # Git ignore rules
│
├── README.md                    # Complete documentation
├── QUICKSTART.md               # Quick start guide (5 minutes)
├── DEPLOYMENT.md               # Deployment instructions
└── LICENSE                      # MIT License
```

## File Descriptions

### Source Code (`src/`)

**Code.js** (Main Entry Point)
- `onGmailMessageOpen()` - Triggered when email is opened
- `findDmarcAttachment()` - Locates DMARC report attachments
- `onHomepage()` - Homepage view
- `onGmailCompose()` - Compose mode view
- `testAddon()` - Test function for debugging

**DmarcParser.js** (Parser & Analyzer)
- `decompressGzip()` - Decompress .gz files
- `decompressZip()` - Decompress .zip files
- `extractXmlContent()` - Extract XML from various formats
- `parseDmarcXml()` - Parse DMARC XML structure
- `analyzeDmarcReport()` - Analyze and rate the report
- `getElementText()` - Helper for XML parsing

**UIBuilder.js** (User Interface)
- `buildDmarcReportCard()` - Main analysis card
- `buildErrorCard()` - Error display card
- `buildNoDmarcCard()` - No report found card
- `buildHomepageCard()` - Homepage card
- `showDetailedRecords()` - Detailed records view
- `formatDate()` - Date formatting helper

### Configuration Files

**appsscript.json**
- Add-on manifest
- OAuth scopes
- Gmail triggers configuration
- Add-on metadata (name, description, icons)

**package.json**
- npm scripts for development
- Dependencies (@google/clasp)
- Project metadata

**.clasp.json.template**
- Template for clasp configuration
- Will be created automatically by `npm run setup`

**.claspignore**
- Excludes node_modules, README, etc. from deployment
- Ensures only source code is pushed to Apps Script

**.gitignore**
- Standard git ignore file
- Excludes node_modules, .clasp.json, logs, etc.

### Documentation

**README.md** (Main Documentation)
- Complete feature list
- Installation guide
- Publishing to Marketplace guide
- Usage instructions
- Troubleshooting
- FAQ

**QUICKSTART.md** (Quick Start)
- 5-minute setup guide
- Simple step-by-step instructions
- Common issues and solutions

**DEPLOYMENT.md** (Deployment Guide)
- Deployment script
- Manual deployment steps
- Testing instructions
- Troubleshooting tips

**LICENSE**
- MIT License
- Open source project

### Test Files (`test/`)

**sample-dmarc-report.xml**
- Real-world DMARC report example
- Contains pass and fail records
- Can be used to test the add-on

**test/README.md**
- Testing guide
- How to use sample reports
- Expected results

## File Sizes (Approximate)

```
Code.js           ~5 KB
DmarcParser.js    ~8 KB
UIBuilder.js      ~7 KB
README.md         ~25 KB
appsscript.json   ~1 KB
Total Source:     ~20 KB
```

## Development Workflow

```
1. Edit files in src/
2. Run: npm run push
3. Test in Gmail
4. Check logs: npm run logs
5. Iterate
```

## Deployment Workflow

```
1. npm install
2. npm run login
3. npm run setup
4. npm run push
5. npm run open
6. Deploy → Test deployments → Install
7. Test in Gmail
8. Deploy → Manage deployments → Production
9. Publish to Marketplace
```

## Key Features Implementation

| Feature | File | Function |
|---------|------|----------|
| Auto-detect DMARC reports | Code.js | `findDmarcAttachment()` |
| Decompress GZIP | DmarcParser.js | `decompressGzip()` |
| Decompress ZIP | DmarcParser.js | `decompressZip()` |
| Parse XML | DmarcParser.js | `parseDmarcXml()` |
| Calculate rating | DmarcParser.js | `analyzeDmarcReport()` |
| Display analysis | UIBuilder.js | `buildDmarcReportCard()` |
| Show details | UIBuilder.js | `showDetailedRecords()` |
| Gmail integration | Code.js | `onGmailMessageOpen()` |

## Technology Stack

- **Runtime**: Google Apps Script (V8)
- **Language**: JavaScript (ES5 compatible)
- **UI Framework**: CardService (Gmail Add-on Cards)
- **Deployment**: clasp (Command Line Apps Script Projects)
- **Package Manager**: npm
- **Version Control**: Git

## APIs & Services Used

- Gmail API (v1)
- Google Apps Script API
- CardService (for UI)
- XmlService (for parsing)
- Utilities (for compression/decompression)

## OAuth Scopes Required

1. `gmail.addons.current.message.readonly` - Read current message
2. `gmail.addons.current.message.metadata` - Access message metadata
3. `gmail.readonly` - Read Gmail messages

## Code Statistics

- **Total Lines**: ~1,000
- **Functions**: 25+
- **Files**: 3 main source files
- **Test Files**: 1 sample report
- **Documentation**: 4 markdown files

## Next Steps for Development

1. Add support for forensic reports (RUF)
2. Implement historical tracking
3. Add export functionality
4. Create comparison views
5. Add more detailed analytics
6. Support multiple languages
7. Add custom alert thresholds

---

For complete instructions, see [README.md](README.md) or [QUICKSTART.md](QUICKSTART.md)
