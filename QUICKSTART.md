# Quick Start Guide

Get your DMARC Report Analyzer add-on running in Gmail in under 10 minutes!

## Prerequisites Checklist

- [ ] Google Account with Gmail
- [ ] Node.js installed ([Download](https://nodejs.org/))
- [ ] 10 minutes of time

## Quick Setup (5 Steps)

### 1. Install Dependencies (1 min)

```bash
cd dmarc-gmail-addon
npm install
```

### 2. Login to Google (1 min)

```bash
npm run login
```

Click through the browser authorization flow.

### 3. Create & Push (2 min)

```bash
# Create the Apps Script project
npm run setup

# Upload your code
npm run push
```

### 4. Test Deploy (1 min)

```bash
# Open Apps Script editor
npm run open
```

In the editor:
- Click **Deploy** → **Test deployments**
- Click **Install**

### 5. Test in Gmail (1 min)

1. Open Gmail
2. Open an email with a DMARC report (or use the test file in `test/`)
3. Look for the add-on in the right sidebar
4. See your DMARC analysis!

## Test With Sample Report

Don't have a DMARC report? Use our sample:

```bash
# Email yourself the test report
# Attach: test/sample-dmarc-report.xml
# Or compress it first:
gzip -c test/sample-dmarc-report.xml > sample.gz
```

Then attach `sample.gz` to an email to yourself.

## Common Issues

**"clasp: command not found"**
→ Run `npm install` first

**"User has not enabled the Apps Script API"**
→ Go to https://script.google.com/home/usersettings and enable it

**"Add-on not showing in Gmail"**
→ Refresh Gmail (Ctrl+Shift+R) and wait 30 seconds

**"Permission denied"**
→ Make sure you authorized all scopes during login

## Next Steps

✅ **Working?** Great! Now:
- Read the full [README.md](README.md) for all features
- Check [DEPLOYMENT.md](DEPLOYMENT.md) for publishing steps
- Customize the code for your needs

## Need Help?

- 📚 Full documentation: [README.md](README.md)
- 🚀 Deployment guide: [DEPLOYMENT.md](DEPLOYMENT.md)
- 🧪 Test samples: [test/README.md](test/README.md)

---

**Ready to publish to Marketplace?** See the [Publishing Guide](README.md#publishing-to-google-workspace-marketplace) in the README.
