/**
 * UI Builder for DMARC Report Analyzer
 * Creates Card-based UI for Gmail add-on
 */

/**
 * Build the main DMARC report card
 * @param {Object} dmarcData - Parsed DMARC data
 * @param {Object} analysis - Analysis results
 * @return {Card} The card to display
 */
function buildDmarcReportCard(dmarcData, analysis) {
  var card = CardService.newCardBuilder();
  
  // Header
  var header = CardService.newCardHeader()
    .setTitle('DMARC Report Analysis')
    .setSubtitle(dmarcData.policy.domain)
    .setImageUrl('https://www.gstatic.com/images/branding/product/1x/gmail_48dp.png');
  
  card.setHeader(header);
  
  // Rating Section
  var ratingSection = CardService.newCardSection();
  ratingSection.addWidget(
    CardService.newDecoratedText()
      .setTopLabel('Overall Rating')
      .setText('<b><font color="' + analysis.ratingColor + '">' + analysis.rating + '</font></b>')
      .setBottomLabel('Health Score: ' + analysis.healthScore + '%')
  );
  card.addSection(ratingSection);
  
  // Summary Section
  var summarySection = CardService.newCardSection()
    .setHeader('<b>Report Summary</b>');
  
  summarySection.addWidget(
    CardService.newDecoratedText()
      .setTopLabel('Reporting Organization')
      .setText(dmarcData.metadata.orgName)
  );
  
  summarySection.addWidget(
    CardService.newDecoratedText()
      .setTopLabel('Report Period')
      .setText(formatDate(dmarcData.metadata.beginDate) + ' - ' + formatDate(dmarcData.metadata.endDate))
  );
  
  summarySection.addWidget(
    CardService.newDecoratedText()
      .setTopLabel('Total Messages')
      .setText(dmarcData.summary.totalMessages.toString())
  );
  
  summarySection.addWidget(
    CardService.newDecoratedText()
      .setTopLabel('Passed Authentication')
      .setText(dmarcData.summary.passedMessages + ' (' + dmarcData.summary.passRate + '%)')
      .setIconUrl(dmarcData.summary.passedMessages > 0 ? 
        'https://www.gstatic.com/images/icons/material/system/1x/check_circle_googgreen_24dp.png' : 
        'https://www.gstatic.com/images/icons/material/system/1x/error_googred_24dp.png')
  );
  
  summarySection.addWidget(
    CardService.newDecoratedText()
      .setTopLabel('Failed Authentication')
      .setText(dmarcData.summary.failedMessages + ' (' + (100 - parseFloat(dmarcData.summary.passRate)).toFixed(2) + '%)')
      .setIconUrl(dmarcData.summary.failedMessages > 0 ? 
        'https://www.gstatic.com/images/icons/material/system/1x/error_googred_24dp.png' : 
        'https://www.gstatic.com/images/icons/material/system/1x/check_circle_googgreen_24dp.png')
  );
  
  card.addSection(summarySection);
  
  // Policy Section
  var policySection = CardService.newCardSection()
    .setHeader('<b>DMARC Policy</b>');
  
  policySection.addWidget(
    CardService.newDecoratedText()
      .setTopLabel('Policy')
      .setText(dmarcData.policy.dmarcPolicy.toUpperCase())
      .setBottomLabel('Applied to ' + dmarcData.policy.pct + '% of messages')
  );
  
  card.addSection(policySection);
  
  // Issues Section
  if (analysis.issues.length > 0) {
    var issuesSection = CardService.newCardSection()
      .setHeader('<b>⚠️ Issues Detected</b>');
    
    for (var i = 0; i < analysis.issues.length && i < 5; i++) {
      issuesSection.addWidget(
        CardService.newTextParagraph()
          .setText('• ' + analysis.issues[i])
      );
    }
    
    card.addSection(issuesSection);
  }
  
  // Recommendations Section
  if (analysis.recommendations.length > 0) {
    var recSection = CardService.newCardSection()
      .setHeader('<b>💡 Recommendations</b>');
    
    for (var i = 0; i < analysis.recommendations.length && i < 5; i++) {
      recSection.addWidget(
        CardService.newTextParagraph()
          .setText('• ' + analysis.recommendations[i])
      );
    }
    
    card.addSection(recSection);
  }
  
  // Details Button
  var detailsSection = CardService.newCardSection();
  var detailsButton = CardService.newTextButton()
    .setText('View Detailed Records')
    .setOnClickAction(
      CardService.newAction()
        .setFunctionName('showDetailedRecords')
        .setParameters({
          'reportData': JSON.stringify(dmarcData)
        })
    );
  
  detailsSection.addWidget(
    CardService.newButtonSet()
      .addButton(detailsButton)
  );
  
  card.addSection(detailsSection);
  
  return card.build();
}

/**
 * Build error card
 * @param {string} errorMessage - Error message to display
 * @return {Card} Error card
 */
function buildErrorCard(errorMessage) {
  var card = CardService.newCardBuilder();
  
  var header = CardService.newCardHeader()
    .setTitle('DMARC Report Analyzer')
    .setSubtitle('Error');
  
  card.setHeader(header);
  
  var section = CardService.newCardSection();
  section.addWidget(
    CardService.newTextParagraph()
      .setText('<b>Unable to process DMARC report</b><br><br>' + errorMessage)
  );
  
  card.addSection(section);
  
  return card.build();
}

/**
 * Build no DMARC report card
 * @return {Card} Info card
 */
function buildNoDmarcCard() {
  var card = CardService.newCardBuilder();
  
  var header = CardService.newCardHeader()
    .setTitle('DMARC Report Analyzer')
    .setSubtitle('No Report Found');
  
  card.setHeader(header);
  
  var section = CardService.newCardSection();
  section.addWidget(
    CardService.newTextParagraph()
      .setText('This email does not contain a DMARC report attachment.<br><br>' +
              'DMARC reports are typically sent as:<br>' +
              '• .xml files<br>' +
              '• .gz (gzip) files<br>' +
              '• .zip files')
  );
  
  card.addSection(section);
  
  return card.build();
}

/**
 * Show detailed records in a separate card
 * @param {Object} e - Event object with parameters
 * @return {ActionResponse} Navigation to details card
 */
function showDetailedRecords(e) {
  var reportData = JSON.parse(e.parameters.reportData);
  
  var card = CardService.newCardBuilder();
  
  var header = CardService.newCardHeader()
    .setTitle('Detailed Records')
    .setSubtitle(reportData.policy.domain);
  
  card.setHeader(header);
  
  // Show up to 20 records
  var recordsToShow = Math.min(reportData.records.length, 20);
  
  for (var i = 0; i < recordsToShow; i++) {
    var record = reportData.records[i];
    var section = CardService.newCardSection();
    
    var statusIcon = record.passed ? 
      'https://www.gstatic.com/images/icons/material/system/1x/check_circle_googgreen_24dp.png' : 
      'https://www.gstatic.com/images/icons/material/system/1x/error_googred_24dp.png';
    
    section.addWidget(
      CardService.newDecoratedText()
        .setTopLabel('Source IP')
        .setText(record.sourceIp)
        .setBottomLabel('Count: ' + record.count + ' | SPF: ' + record.spf.toUpperCase() + ' | DKIM: ' + record.dkim.toUpperCase())
        .setIconUrl(statusIcon)
    );
    
    card.addSection(section);
  }
  
  if (reportData.records.length > recordsToShow) {
    var moreSection = CardService.newCardSection();
    moreSection.addWidget(
      CardService.newTextParagraph()
        .setText('... and ' + (reportData.records.length - recordsToShow) + ' more records')
    );
    card.addSection(moreSection);
  }
  
  // Back button
  var backSection = CardService.newCardSection();
  var backButton = CardService.newTextButton()
    .setText('← Back to Summary')
    .setOnClickAction(CardService.newAction().setFunctionName('onGmailMessageOpen'));
  
  backSection.addWidget(
    CardService.newButtonSet()
      .addButton(backButton)
  );
  
  card.addSection(backSection);
  
  return CardService.newActionResponseBuilder()
    .setNavigation(CardService.newNavigation().pushCard(card.build()))
    .build();
}

/**
 * Format date for display
 * @param {Date} date - Date to format
 * @return {string} Formatted date string
 */
function formatDate(date) {
  if (!date || !(date instanceof Date)) {
    return 'N/A';
  }
  return Utilities.formatDate(date, Session.getScriptTimeZone(), 'MMM d, yyyy');
}

/**
 * Build homepage card
 * @return {Card} Homepage card
 */
function buildHomepageCard() {
  var card = CardService.newCardBuilder();
  
  var header = CardService.newCardHeader()
    .setTitle('DMARC Report Analyzer')
    .setSubtitle('Email Security Analysis Tool');
  
  card.setHeader(header);
  
  var section = CardService.newCardSection();
  section.addWidget(
    CardService.newTextParagraph()
      .setText('<b>Welcome!</b><br><br>' +
              'This add-on automatically detects and analyzes DMARC reports in your emails.<br><br>' +
              'Open an email with a DMARC report attachment to see the analysis.')
  );
  
  card.addSection(section);
  
  return card.build();
}
