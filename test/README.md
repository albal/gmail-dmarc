# Test DMARC Reports

This directory contains sample DMARC reports for testing the add-on.

## Files

- `sample-dmarc-report.xml` - A sample XML DMARC report with mixed pass/fail results

## How to Test

### Method 1: Email Yourself the Test Report

1. Compress the XML file (optional):
   ```bash
   # Create gzip version
   gzip -c sample-dmarc-report.xml > sample-dmarc-report.xml.gz
   
   # Create zip version
   zip sample-dmarc-report.zip sample-dmarc-report.xml
   ```

2. Email it to yourself:
   - Attach the file (XML, GZ, or ZIP)
   - Send the email

3. Open the email in Gmail with the add-on installed

### Method 2: Test Locally

Use the `testAddon()` function in `Code.js`:

1. Open Apps Script editor:
   ```bash
   npm run open
   ```

2. Select `testAddon` function from dropdown

3. Click Run button

4. Check logs for results

## Sample Report Details

The sample report includes:

- **Domain**: example.com
- **Policy**: quarantine
- **Date Range**: October 21-22, 2023
- **Total Messages**: 19
- **Passed**: 15 (78.9%)
- **Failed**: 4 (21.1%)

### Records:

1. **209.85.220.41**: 15 messages, all passed (likely legitimate mail server)
2. **198.51.100.22**: 3 messages, failed (possibly forwarded)
3. **203.0.113.45**: 1 message, failed (potential spoofing attempt)

Expected rating: **FAIR** (Yellow) - Due to 21% failure rate
