/**
 * Main entry point for DMARC Report Analyzer Gmail Add-on
 * This file contains all the logic for the add-on, including UI building,
 * DMARC report parsing, and event handling.
 */

// ==================================================================
// UIBuilder Functions
// ==================================================================

/**
 * UI Builder for DMARC Report Analyzer
 * Creates cards for the Gmail Add-on interface
 */

/**
 * Build the main report card with DMARC data
 * @param {Object} reportData - Parsed DMARC report data
 * @return {Card} The main report card
 */
function buildReportCard(reportData) {
  var card = CardService.newCardBuilder();
  card.setHeader(CardService.newCardHeader()
    .setTitle('DMARC Report Summary')
    .setSubtitle(reportData.domain)
    .setImageUrl('https://www.gstatic.com/images/icons/material/system/2x/security_black_48dp.png'));

  var section = CardService.newCardSection();

  // Rating
  var rating = determineRating(reportData.passRate);
  var ratingColor = '#4CAF50'; // Green for GOOD
  if (rating === 'WARNING') ratingColor = '#FFC107'; // Amber
  if (rating === 'BAD') ratingColor = '#F44336'; // Red
  
  section.addWidget(CardService.newKeyValue()
    .setTopLabel('Overall Rating')
    .setContent('<font color="' + ratingColor + '"><b>' + rating + '</b></font>')
    .setButton(CardService.newTextButton()
      .setText('Details')
      .setOnClickAction(CardService.newAction()
        .setFunctionName('onShowDetails')
        .setParameters({reportData: JSON.stringify(reportData)}))));

  // Summary stats
  section.addWidget(CardService.newKeyValue()
    .setTopLabel('Total Messages')
    .setContent(reportData.totalMessages.toString()));
  
  section.addWidget(CardService.newKeyValue()
    .setTopLabel('DMARC Pass Rate')
    .setContent(reportData.passRate + '% (' + reportData.passedMessages + ' passed)'));

  // Policy section
  var policySection = CardService.newCardSection().setHeader('Published Policy');
  policySection.addWidget(CardService.newKeyValue()
    .setTopLabel('Policy (p)')
    .setContent(reportData.policy.toUpperCase()));
  policySection.addWidget(CardService.newKeyValue()
    .setTopLabel('Percentage (pct)')
    .setContent(reportData.pct + '%'));
  policySection.addWidget(CardService.newKeyValue()
    .setTopLabel('DKIM Alignment (adkim)')
    .setContent(reportData.adkim));
  policySection.addWidget(CardService.newKeyValue()
    .setTopLabel('SPF Alignment (aspf)')
    .setContent(reportData.aspf));
  
  // Top Sources section
  if (reportData.topSources && reportData.topSources.length > 0) {
    var sourcesSection = CardService.newCardSection().setHeader('Top 5 Sending Sources');
    reportData.topSources.forEach(function(source) {
      sourcesSection.addWidget(CardService.newKeyValue()
        .setTopLabel(source.ip)
        .setContent('Messages: ' + source.count));
    });
    card.addSection(sourcesSection);
  }

  card.addSection(section);
  card.addSection(policySection);
  
  // Add a fixed footer with a "Back" button for navigation
  card.setFixedFooter(CardService.newFixedFooter()
    .setPrimaryButton(CardService.newTextButton()
      .setText('Back')
      .setOnClickAction(CardService.newAction()
        .setFunctionName('onNavigateBack'))));

  return card.build();
}

/**
 * Build a detailed card with full DMARC report data, styled like the example image.
 * @param {Object} reportData - Parsed DMARC report data
 * @return {Card} The detailed report card
 */
function buildDetailsCard(reportData) {
  var card = CardService.newCardBuilder();
  card.setHeader(CardService.newCardHeader()
    .setTitle('Report Analysis')
    .setSubtitle(reportData.domain + ' from ' + reportData.orgName));

  // Top Summary Section
  var summarySection = CardService.newCardSection();
  summarySection.addWidget(CardService.newKeyValue()
    .setTopLabel('Overall Status')
    .setContent('Good') // This is static for now, can be dynamic later
    .setIcon(CardService.Icon.CONFIRMATION));
    
  summarySection.addWidget(CardService.newKeyValue()
    .setTopLabel('Report Period')
    .setContent(new Date(reportData.beginDate).toLocaleDateString() + ' to ' + new Date(reportData.endDate).toLocaleDateString()));
  
  card.addSection(summarySection);

  // Detailed Records Header
  var recordsHeaderSection = CardService.newCardSection()
    .setHeader('All Email Records');
  recordsHeaderSection.addWidget(CardService.newTextParagraph()
    .setText('Complete breakdown of each source that sent emails on your behalf.'));
  card.addSection(recordsHeaderSection);

  // Add a section for each detailed record
  if (reportData.records && reportData.records.length > 0) {
    reportData.records.forEach(function(record) {
      var recordSection = CardService.newCardSection();
      
      recordSection.addWidget(CardService.newKeyValue()
        .setTopLabel('Source IP')
        .setContent(record.sourceIp + (record.sourceHost ? ' (' + record.sourceHost + ')' : '')));

      recordSection.addWidget(CardService.newKeyValue()
        .setTopLabel('Header From')
        .setContent(record.headerFrom));
        
      recordSection.addWidget(CardService.newKeyValue()
        .setTopLabel('Email Count')
        .setContent(record.count.toString()));

      recordSection.addWidget(CardService.newKeyValue()
        .setTopLabel('Disposition')
        .setContent(formatResult(record.disposition)));

      recordSection.addWidget(CardService.newKeyValue()
        .setTopLabel('SPF Result')
        .setContent(formatResult(record.spfResult, record.spfDomain)));

      recordSection.addWidget(CardService.newKeyValue()
        .setTopLabel('DKIM Result')
        .setContent(formatResult(record.dkimResult, record.dkimDomain)));
        
      card.addSection(recordSection);
    });
  } else {
    card.addSection(CardService.newCardSection()
      .addWidget(CardService.newTextParagraph().setText('No individual records found in the report.')));
  }

  // Add a back button to the footer
  card.setFixedFooter(CardService.newFixedFooter()
    .setPrimaryButton(CardService.newTextButton()
      .setText('Back to Summary')
      .setOnClickAction(CardService.newAction()
        .setFunctionName('onNavigateToRoot'))));

  return card.build();
}

/**
 * Formats a DMARC result (SPF, DKIM, Disposition) with color coding.
 * @param {string} result - The result string (e.g., 'pass', 'fail', 'none').
 * @param {string} [domain] - The domain associated with the result.
 * @return {string} An HTML formatted string.
 */
function formatResult(result, domain) {
  var color = '#000000'; // Default black
  var text = result.charAt(0).toUpperCase() + result.slice(1);
  
  switch(result.toLowerCase()) {
    case 'pass':
      color = '#38761d'; // Green
      break;
    case 'fail':
      color = '#cc0000'; // Red
      break;
    case 'none':
    case 'neutral':
    case 'softfail':
      color = '#f1c232'; // Yellow/Orange
      break;
  }
  
  var content = '<font color="' + color + '"><b>' + text + '</b></font>';
  if (domain) {
    content += ' (' + domain + ')';
  }
  return content;
}

/**
 * Build a card for displaying errors
 * @param {string} errorMessage - The error message to display
 * @return {Card} The error card
 */
function buildErrorCard(errorMessage) {
  return CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader()
      .setTitle('Error')
      .setSubtitle('Could not process DMARC report')
      .setImageUrl('https://www.gstatic.com/images/icons/material/system/1x/error_red_48dp.png'))
    .addSection(CardService.newCardSection()
      .addWidget(CardService.newTextParagraph()
        .setText('An error occurred: ' + errorMessage)))
    .build();
}

/**
 * Build a welcome card for the homepage trigger
 * @return {Card} The welcome card
 */
function buildWelcomeCard() {
  return CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader().setTitle('DMARC Report Analyzer'))
    .addSection(CardService.newCardSection()
      .addWidget(CardService.newTextParagraph()
        .setText('Welcome! Open an email with a DMARC report attachment to see the analysis.')))
    .build();
}

/**
 * Build a card for when no DMARC report is found
 * @return {Card} The info card
 */
function buildNoReportCard() {
  return CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader().setTitle('DMARC Report Not Found'))
    .addSection(CardService.newCardSection()
      .addWidget(CardService.newTextParagraph()
        .setText('No DMARC report attachment (.xml, .zip, .gz) found in this email.')))
    .build();
}

/**
 * Build a card for when no attachments are found
 * @return {Card} The info card
 */
function buildNoAttachmentCard() {
  return CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader().setTitle('No Attachments'))
    .addSection(CardService.newCardSection()
      .addWidget(CardService.newTextParagraph()
        .setText('This email has no attachments.')))
    .build();
}

// ==================================================================
// DmarcParser Functions
// ==================================================================

/**
 * DMARC Report Parser
 * Handles parsing of DMARC XML reports from various formats
 */

/**
 * Parse DMARC report from attachment
 * @param {GmailAttachment} attachment - The email attachment
 * @return {Object} Parsed DMARC report data
 */
function parseDmarcReport(attachment) {
  try {
    var contentType = attachment.getContentType();
    var filename = attachment.getName();
    var blob = attachment.copyBlob();
    
    Logger.log('Processing attachment: ' + filename);
    Logger.log('Content type: ' + contentType);
    Logger.log('Blob size: ' + blob.getBytes().length);
    
    var xmlContent = null;
    
    // Handle different file formats
    if (filename.toLowerCase().endsWith('.gz') || filename.toLowerCase().endsWith('.gzip')) {
      xmlContent = decompressGzip(blob);
    } else if (filename.toLowerCase().endsWith('.zip')) {
      xmlContent = decompressZip(blob);
    } else if (filename.toLowerCase().endsWith('.xml')) {
      xmlContent = blob.getDataAsString();
    } else {
      // Try to detect by content
      try {
        xmlContent = decompressGzip(blob);
      } catch (e1) {
        try {
          xmlContent = decompressZip(blob);
        } catch (e2) {
          xmlContent = blob.getDataAsString();
        }
      }
    }
    
    if (!xmlContent) {
      throw new Error('Failed to extract XML content');
    }
    
    Logger.log('XML content length: ' + xmlContent.length);
    Logger.log('XML preview: ' + xmlContent.substring(0, 200));
    
    return parseXml(xmlContent);
    
  } catch (error) {
    Logger.log('Error in parseDmarcReport: ' + error.toString());
    throw error;
  }
}

/**
 * Decompress gzip file
 * @param {Blob} blob - The gzip compressed blob
 * @return {string} Decompressed XML content
 */
function decompressGzip(blob) {
  try {
    Logger.log('Attempting gzip decompression...');
    
    // Get the raw bytes
    var bytes = blob.getBytes();
    Logger.log('Gzip blob size: ' + bytes.length);
    
    // Check for gzip magic number (1f 8b)
    if (bytes.length < 2 || bytes[0] !== 0x1f || bytes[1] !== -117) {
      Logger.log('Not a valid gzip file (magic number check failed)');
      throw new Error('Invalid gzip format');
    }
    
    // Create a new blob with the correct content type
    var gzipBlob = Utilities.newBlob(bytes, 'application/x-gzip', 'temp.gz');
    
    // Decompress using Utilities.ungzip()
    var uncompressedBlob = Utilities.ungzip(gzipBlob);
    
    // Convert to string
    var xmlContent = uncompressedBlob.getDataAsString('UTF-8');
    
    Logger.log('Gzip decompression successful, content length: ' + xmlContent.length);
    return xmlContent;
    
  } catch (error) {
    Logger.log('Gzip decompression error: ' + error.toString());
    Logger.log('Error stack: ' + error.stack);
    throw new Error('Failed to decompress gzip file: ' + error.message);
  }
}

/**
 * Decompress zip file
 * @param {Blob} blob - The zip compressed blob
 * @return {string} Decompressed XML content
 */
function decompressZip(blob) {
  try {
    Logger.log('Attempting zip decompression...');
    
    // Unzip the blob
    var unzippedBlobs = Utilities.unzip(blob);
    
    Logger.log('Zip contains ' + unzippedBlobs.length + ' file(s)');
    
    // Find the XML file (usually the first one)
    for (var i = 0; i < unzippedBlobs.length; i++) {
      var fileName = unzippedBlobs[i].getName();
      Logger.log('Zip entry ' + i + ': ' + fileName);
      
      if (fileName.toLowerCase().endsWith('.xml')) {
        var xmlContent = unzippedBlobs[i].getDataAsString('UTF-8');
        Logger.log('Zip decompression successful, content length: ' + xmlContent.length);
        return xmlContent;
      }
    }
    
    // If no .xml file found, try the first file
    if (unzippedBlobs.length > 0) {
      var xmlContent = unzippedBlobs[0].getDataAsString('UTF-8');
      Logger.log('Using first zip entry, content length: ' + xmlContent.length);
      return xmlContent;
    }
    
    throw new Error('No XML file found in zip archive');
    
  } catch (error) {
    Logger.log('Zip decompression error: ' + error.toString());
    throw new Error('Failed to decompress zip file: ' + error.message);
  }
}

/**
 * Parse XML content into DMARC report object
 * @param {string} xmlContent - The XML string
 * @return {Object} Parsed DMARC data
 */
function parseXml(xmlContent) {
  try {
    Logger.log('Parsing XML...');
    
    // Clean up the XML content
    xmlContent = xmlContent.trim();
    
    // Remove BOM if present
    if (xmlContent.charCodeAt(0) === 0xFEFF) {
      xmlContent = xmlContent.substring(1);
    }
    
    // Parse XML
    var document = XmlService.parse(xmlContent);
    var root = document.getRootElement();
    
    Logger.log('Root element: ' + root.getName());
    
    // Extract report metadata
    var reportMetadata = root.getChild('report_metadata');
    var policyPublished = root.getChild('policy_published');
    var records = root.getChildren('record');
    
    Logger.log('Found ' + records.length + ' record(s)');
    
    // Parse organization info
    var orgName = getElementText(reportMetadata, 'org_name') || 'Unknown';
    var email = getElementText(reportMetadata, 'email') || '';
    var reportId = getElementText(reportMetadata, 'report_id') || '';
    
    // Parse date range
    var dateRange = reportMetadata.getChild('date_range');
    var beginDate = parseInt(getElementText(dateRange, 'begin')) * 1000;
    var endDate = parseInt(getElementText(dateRange, 'end')) * 1000;
    
    // Parse policy
    var domain = getElementText(policyPublished, 'domain');
    var dmarcPolicy = getElementText(policyPublished, 'p') || 'none';
    var dmarcPct = getElementText(policyPublished, 'pct') || '100';
    var adkim = getElementText(policyPublished, 'adkim') || 'r';
    var aspf = getElementText(policyPublished, 'aspf') || 'r';
    
    // Parse records and calculate statistics
    var totalMessages = 0;
    var passedMessages = 0;
    var dkimPass = 0;
    var spfPass = 0;
    var sourceIps = {};
    var detailedRecords = [];
    
    for (var i = 0; i < records.length; i++) {
      var record = records[i];
      var row = record.getChild('row');
      var identifiers = record.getChild('identifiers');
      var authResults = record.getChild('auth_results');
      var policyEvaluated = row.getChild('policy_evaluated');
      var count = parseInt(getElementText(row, 'count')) || 0;
      
      totalMessages += count;
      
      // DMARC results
      var disposition = getElementText(policyEvaluated, 'disposition');
      var dkimResult = getElementText(policyEvaluated, 'dkim');
      var spfResult = getElementText(policyEvaluated, 'spf');
      
      // Auth results for domains
      var spfAuth = authResults.getChild('spf');
      var dkimAuth = authResults.getChild('dkim');

      if (dkimResult === 'pass') dkimPass += count;
      if (spfResult === 'pass') spfPass += count;
      if (dkimResult === 'pass' || spfResult === 'pass') passedMessages += count;
      
      // Track source IPs
      var sourceIp = getElementText(row, 'source_ip');
      if (sourceIp) {
        sourceIps[sourceIp] = (sourceIps[sourceIp] || 0) + count;
      }

      // Store detailed record for the new view
      detailedRecords.push({
        sourceIp: sourceIp,
        sourceHost: getElementText(row, 'source_ip_reverse_dns'), // Assuming reverse DNS might be available
        headerFrom: getElementText(identifiers, 'header_from'),
        count: count,
        disposition: disposition,
        spfResult: getElementText(spfAuth, 'result'),
        spfDomain: getElementText(spfAuth, 'domain'),
        dkimResult: getElementText(dkimAuth, 'result'),
        dkimDomain: getElementText(dkimAuth, 'domain')
      });
    }
    
    // Calculate percentages
    var passRate = totalMessages > 0 ? (passedMessages / totalMessages * 100).toFixed(1) : 0;
    var dkimPassRate = totalMessages > 0 ? (dkimPass / totalMessages * 100).toFixed(1) : 0;
    var spfPassRate = totalMessages > 0 ? (spfPass / totalMessages * 100).toFixed(1) : 0;
    
    // Get top source IPs
    var topSources = Object.keys(sourceIps)
      .map(function(ip) {
        return { ip: ip, count: sourceIps[ip] };
      })
      .sort(function(a, b) {
        return b.count - a.count;
      })
      .slice(0, 5);
    
    Logger.log('Parsing complete. Total messages: ' + totalMessages);
    
    return {
      domain: domain,
      orgName: orgName,
      reportId: reportId,
      beginDate: new Date(beginDate),
      endDate: new Date(endDate),
      totalMessages: totalMessages,
      passedMessages: passedMessages,
      passRate: parseFloat(passRate),
      dkimPassRate: parseFloat(dkimPassRate),
      spfPassRate: parseFloat(spfPassRate),
      policy: dmarcPolicy,
      pct: dmarcPct,
      adkim: adkim,
      aspf: aspf,
      topSources: topSources,
      recordCount: records.length,
      records: detailedRecords // Add detailed records to the data object
    };
    
  } catch (error) {
    Logger.log('XML parsing error: ' + error.toString());
    Logger.log('Error stack: ' + error.stack);
    throw new Error('Failed to parse XML: ' + error.message);
  }
}

/**
 * Helper function to get text content from XML element
 * @param {XmlElement} parent - Parent XML element
 * @param {string} childName - Name of child element
 * @return {string} Text content or empty string
 */
function getElementText(parent, childName) {
  try {
    var child = parent.getChild(childName);
    return child ? child.getText() : '';
  } catch (e) {
    return '';
  }
}

/**
 * Determine rating based on pass rate
 * @param {number} passRate - Pass rate percentage
 * @return {string} Rating (GOOD, WARNING, or BAD)
 */
function determineRating(passRate) {
  if (passRate >= 90) return 'GOOD';
  if (passRate >= 70) return 'WARNING';
  return 'BAD';
}

// ==================================================================
// Action Handlers & Navigation
// ==================================================================

/**
 * Action handler for the "Details" button.
 * Pushes a new card with detailed information.
 * @param {Object} e - Event object containing parameters
 * @return {ActionResponse} The response to navigate to the details card
 */
function onShowDetails(e) {
  Logger.log('onShowDetails triggered');
  var reportData = JSON.parse(e.parameters.reportData);
  var detailsCard = buildDetailsCard(reportData);
  
  return CardService.newActionResponseBuilder()
    .setNavigation(CardService.newNavigation().pushCard(detailsCard))
    .build();
}

/**
 * Action handler to navigate back to the root card.
 * @return {ActionResponse} The response to pop to the root
 */
function onNavigateToRoot() {
  return CardService.newActionResponseBuilder()
    .setNavigation(CardService.newNavigation().popToRoot())
    .build();
}

// ==================================================================
// Main Triggers and Event Handlers
// ==================================================================

/**
 * Called when a message is opened in Gmail
 * @param {Object} e - Event object from Gmail
 * @return {Card[]} Array of cards to display
 */
function onGmailMessageOpen(e) {
  try {
    Logger.log('onGmailMessageOpen triggered');
    
    var accessToken = e.gmail.accessToken;
    var messageId = e.gmail.messageId;
    
    GmailApp.setCurrentMessageAccessToken(accessToken);
    var message = GmailApp.getMessageById(messageId);
    
    var attachments = message.getAttachments();
    Logger.log('Found ' + attachments.length + ' attachment(s)');
    
    if (attachments.length === 0) {
      return [buildNoAttachmentCard()];
    }
    
    // Find DMARC report attachment
    var dmarcAttachment = findDmarcAttachment(attachments);
    
    if (!dmarcAttachment) {
      return [buildNoReportCard()];
    }
    
    Logger.log('Processing DMARC attachment: ' + dmarcAttachment.getName());
    
    // Parse the DMARC report
    var reportData = parseDmarcReport(dmarcAttachment);
    
    // Build and return the UI card
    return [buildReportCard(reportData)];
    
  } catch (error) {
    Logger.log('Error in onGmailMessageOpen: ' + error.toString());
    Logger.log('Error stack: ' + error.stack);
    return [buildErrorCard(error.message)];
  }
}

/**
 * Find DMARC report attachment from the list of attachments
 * @param {GmailAttachment[]} attachments - Array of email attachments
 * @return {GmailAttachment|null} DMARC report attachment or null
 */
function findDmarcAttachment(attachments) {
  for (var i = 0; i < attachments.length; i++) {
    var attachment = attachments[i];
    var filename = attachment.getName().toLowerCase();
    var contentType = attachment.getContentType();
    
    Logger.log('Checking attachment: ' + filename + ' (type: ' + contentType + ')');
    
    // Check by filename extension
    if (filename.endsWith('.xml') || 
        filename.endsWith('.gz') || 
        filename.endsWith('.gzip') || 
        filename.endsWith('.zip')) {
      
      // Additional check: filename should contain indicators of DMARC report
      if (filename.indexOf('dmarc') > -1 || 
          filename.indexOf('!') > -1 ||  // DMARC reports often have ! in filename
          isDmarcReportLikely(attachment)) {
        Logger.log('Found DMARC attachment: ' + filename);
        return attachment;
      }
    }
  }
  
  // Fallback: check all attachments for DMARC content
  for (var j = 0; j < attachments.length; j++) {
    if (isDmarcReportLikely(attachments[j])) {
      Logger.log('Found DMARC attachment by content check: ' + attachments[j].getName());
      return attachments[j];
    }
  }
  
  return null;
}

/**
 * Check if attachment is likely a DMARC report by inspecting content
 * @param {GmailAttachment} attachment - The attachment to check
 * @return {boolean} True if likely a DMARC report
 */
function isDmarcReportLikely(attachment) {
  try {
    var blob = attachment.copyBlob();
    var bytes = blob.getBytes();
    
    // Check if it's a gzip file (magic number: 1f 8b)
    if (bytes.length >= 2 && bytes[0] === 0x1f && bytes[1] === -117) {
      return true; // Likely compressed DMARC report
    }
    
    // Check if it's a zip file (magic number: 50 4b)
    if (bytes.length >= 2 && bytes[0] === 0x50 && bytes[1] === 0x4b) {
      return true; // Likely zip compressed DMARC report
    }
    
    // For XML files, check content
    if (bytes.length > 100) {
      var preview = blob.getDataAsString().substring(0, 500);
      if (preview.indexOf('<?xml') > -1 && 
          (preview.indexOf('feedback') > -1 || preview.indexOf('report_metadata') > -1)) {
        return true;
      }
    }
    
    return false;
  } catch (e) {
    Logger.log('Error in isDmarcReportLikely: ' + e.toString());
    return false;
  }
}

/**
 * Homepage trigger - shown when add-on is opened from homepage
 * @param {Object} e - Event object
 * @return {Card[]} Array of cards to display
 */
function onHomepage(e) {
  Logger.log('onHomepage triggered');
  return [buildWelcomeCard()];
}
