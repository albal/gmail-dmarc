/**
 * Main entry point for DMARC Report Analyzer Gmail Add-on
 * Handles Gmail triggers and orchestrates the analysis
 */

/**
 * Called when a message is opened in Gmail
 * @param {Object} e - Event object from Gmail
 * @return {Card[]} Array of cards to display
 */
function onGmailMessageOpen(e) {
  try {
    Logger.log('Gmail message opened');
    
    // Get the current message
    var accessToken = e.gmail.accessToken;
    var messageId = e.gmail.messageId;
    
    GmailApp.setCurrentMessageAccessToken(accessToken);
    var message = GmailApp.getMessageById(messageId);
    
    if (!message) {
      Logger.log('Could not retrieve message');
      return [buildNoDmarcCard()];
    }
    
    // Get attachments
    var attachments = message.getAttachments();
    
    if (!attachments || attachments.length === 0) {
      Logger.log('No attachments found');
      return [buildNoDmarcCard()];
    }
    
    // Look for DMARC report attachments
    var dmarcAttachment = findDmarcAttachment(attachments);
    
    if (!dmarcAttachment) {
      Logger.log('No DMARC report attachment found');
      return [buildNoDmarcCard()];
    }
    
    Logger.log('Found DMARC attachment: ' + dmarcAttachment.getName());
    
    // Process the DMARC report
    var xmlContent = extractXmlContent(
      dmarcAttachment, 
      dmarcAttachment.getContentType(), 
      dmarcAttachment.getName()
    );
    
    Logger.log('Extracted XML content, length: ' + xmlContent.length);
    
    // Parse the DMARC report
    var dmarcData = parseDmarcXml(xmlContent);
    
    Logger.log('Parsed DMARC data for domain: ' + dmarcData.policy.domain);
    
    // Analyze the report
    var analysis = analyzeDmarcReport(dmarcData);
    
    Logger.log('Analysis complete. Rating: ' + analysis.rating);
    
    // Build and return the UI card
    return [buildDmarcReportCard(dmarcData, analysis)];
    
  } catch (error) {
    Logger.log('Error in onGmailMessageOpen: ' + error.toString());
    return [buildErrorCard(error.toString())];
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
    var fileName = attachment.getName().toLowerCase();
    var contentType = attachment.getContentType().toLowerCase();
    
    // Check if it's a potential DMARC report
    // DMARC reports are typically XML, gzip, or zip files
    if (fileName.endsWith('.xml') || 
        fileName.endsWith('.gz') || 
        fileName.endsWith('.gzip') ||
        fileName.endsWith('.zip') ||
        contentType.indexOf('xml') !== -1 ||
        contentType.indexOf('gzip') !== -1 ||
        contentType.indexOf('zip') !== -1) {
      
      // Additional check: DMARC reports often have specific naming patterns
      if (fileName.indexOf('dmarc') !== -1 || 
          fileName.indexOf('rua') !== -1 ||
          isDmarcReportLikely(attachment)) {
        return attachment;
      }
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
    var fileName = attachment.getName().toLowerCase();
    
    // Check file extension first
    if (!fileName.endsWith('.xml') && 
        !fileName.endsWith('.gz') && 
        !fileName.endsWith('.gzip') &&
        !fileName.endsWith('.zip')) {
      return false;
    }
    
    // For XML files, peek at content
    if (fileName.endsWith('.xml')) {
      var content = attachment.getDataAsString();
      if (content.indexOf('<feedback') !== -1 || 
          content.indexOf('report_metadata') !== -1 ||
          content.indexOf('policy_published') !== -1) {
        return true;
      }
    }
    
    // For compressed files, check sender patterns
    return true;
    
  } catch (e) {
    Logger.log('Error checking if DMARC report: ' + e.toString());
    return false;
  }
}

/**
 * Homepage trigger - shown when add-on is opened from homepage
 * @param {Object} e - Event object
 * @return {Card[]} Array of cards to display
 */
function onHomepage(e) {
  Logger.log('Homepage opened');
  return [buildHomepageCard()];
}

/**
 * Compose trigger - shown when composing an email
 * @param {Object} e - Event object
 * @return {Card[]} Array of cards to display
 */
function onGmailCompose(e) {
  Logger.log('Compose triggered');
  
  var card = CardService.newCardBuilder();
  
  var header = CardService.newCardHeader()
    .setTitle('DMARC Report Analyzer')
    .setSubtitle('Compose Mode');
  
  card.setHeader(header);
  
  var section = CardService.newCardSection();
  section.addWidget(
    CardService.newTextParagraph()
      .setText('This add-on analyzes DMARC reports in received emails.<br><br>' +
              'Open an email with a DMARC report to use this feature.')
  );
  
  card.addSection(section);
  
  return [card.build()];
}

/**
 * Test function to validate the add-on locally
 * This won't work in production but useful for debugging
 */
function testAddon() {
  try {
    // This is a sample DMARC XML for testing
    var sampleXml = '<?xml version="1.0"?>' +
      '<feedback>' +
      '<report_metadata>' +
      '<org_name>Google</org_name>' +
      '<email>noreply-dmarc-support@google.com</email>' +
      '<report_id>12345</report_id>' +
      '<date_range><begin>1634256000</begin><end>1634342400</end></date_range>' +
      '</report_metadata>' +
      '<policy_published>' +
      '<domain>example.com</domain>' +
      '<p>quarantine</p>' +
      '<sp>quarantine</sp>' +
      '<pct>100</pct>' +
      '</policy_published>' +
      '<record>' +
      '<row>' +
      '<source_ip>192.0.2.1</source_ip>' +
      '<count>5</count>' +
      '<policy_evaluated>' +
      '<disposition>none</disposition>' +
      '<dkim>pass</dkim>' +
      '<spf>pass</spf>' +
      '</policy_evaluated>' +
      '</row>' +
      '</record>' +
      '</feedback>';
    
    var dmarcData = parseDmarcXml(sampleXml);
    var analysis = analyzeDmarcReport(dmarcData);
    
    Logger.log('Test successful!');
    Logger.log('Domain: ' + dmarcData.policy.domain);
    Logger.log('Rating: ' + analysis.rating);
    Logger.log('Pass Rate: ' + dmarcData.summary.passRate + '%');
    
    return {
      success: true,
      dmarcData: dmarcData,
      analysis: analysis
    };
  } catch (error) {
    Logger.log('Test failed: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}
