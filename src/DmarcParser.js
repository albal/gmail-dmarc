/**
 * DMARC Report Parser
 * Handles decompression and parsing of DMARC reports from various formats
 */

/**
 * Decompress Gzip attachment
 * @param {Blob} blob - The compressed blob
 * @return {string} Decompressed XML content
 */
function decompressGzip(blob) {
  try {
    var compressed = blob.getBytes();
    var uncompressed = Utilities.ungzip(Utilities.newBlob(compressed));
    return uncompressed.getDataAsString();
  } catch (e) {
    Logger.log('Error decompressing gzip: ' + e.toString());
    throw new Error('Failed to decompress gzip file');
  }
}

/**
 * Decompress Zip attachment
 * @param {Blob} blob - The compressed blob
 * @return {string} Decompressed XML content
 */
function decompressZip(blob) {
  try {
    var unzipped = Utilities.unzip(blob);
    if (unzipped.length === 0) {
      throw new Error('Empty zip file');
    }
    // DMARC reports usually contain one XML file
    for (var i = 0; i < unzipped.length; i++) {
      var fileName = unzipped[i].getName();
      if (fileName.toLowerCase().endsWith('.xml')) {
        return unzipped[i].getDataAsString();
      }
    }
    // If no .xml extension found, try the first file
    return unzipped[0].getDataAsString();
  } catch (e) {
    Logger.log('Error decompressing zip: ' + e.toString());
    throw new Error('Failed to decompress zip file');
  }
}

/**
 * Extract XML content from attachment based on type
 * @param {Blob} blob - The attachment blob
 * @param {string} contentType - The MIME type of the attachment
 * @param {string} fileName - The name of the file
 * @return {string} XML content
 */
function extractXmlContent(blob, contentType, fileName) {
  var lowerFileName = fileName.toLowerCase();
  
  // Check if it's a gzip file
  if (contentType.indexOf('gzip') !== -1 || 
      lowerFileName.endsWith('.gz') || 
      lowerFileName.endsWith('.gzip')) {
    return decompressGzip(blob);
  }
  
  // Check if it's a zip file
  if (contentType.indexOf('zip') !== -1 || 
      lowerFileName.endsWith('.zip')) {
    return decompressZip(blob);
  }
  
  // Assume it's already XML
  if (lowerFileName.endsWith('.xml') || contentType.indexOf('xml') !== -1) {
    return blob.getDataAsString();
  }
  
  throw new Error('Unsupported file format: ' + fileName);
}

/**
 * Parse DMARC XML report
 * @param {string} xmlContent - The XML content to parse
 * @return {Object} Parsed DMARC report data
 */
function parseDmarcXml(xmlContent) {
  try {
    var document = XmlService.parse(xmlContent);
    var root = document.getRootElement();
    var feedback = root.getNamespace() ? root : root;
    
    // Extract metadata
    var reportMetadata = feedback.getChild('report_metadata');
    var orgName = getElementText(reportMetadata, 'org_name') || 'Unknown';
    var email = getElementText(reportMetadata, 'email') || 'N/A';
    var reportId = getElementText(reportMetadata, 'report_id') || 'N/A';
    
    var dateRange = reportMetadata.getChild('date_range');
    var beginDate = getElementText(dateRange, 'begin') || '0';
    var endDate = getElementText(dateRange, 'end') || '0';
    
    // Extract policy
    var policyPublished = feedback.getChild('policy_published');
    var domain = getElementText(policyPublished, 'domain') || 'Unknown';
    var dmarcPolicy = getElementText(policyPublished, 'p') || 'none';
    var subdomainPolicy = getElementText(policyPublished, 'sp') || dmarcPolicy;
    var pct = getElementText(policyPublished, 'pct') || '100';
    
    // Extract records
    var records = feedback.getChildren('record');
    var totalMessages = 0;
    var passedMessages = 0;
    var failedMessages = 0;
    var recordDetails = [];
    
    for (var i = 0; i < records.length; i++) {
      var record = records[i];
      var row = record.getChild('row');
      var sourceIp = getElementText(row, 'source_ip') || 'Unknown';
      var count = parseInt(getElementText(row, 'count') || '0');
      
      var policyEvaluated = row.getChild('policy_evaluated');
      var disposition = getElementText(policyEvaluated, 'disposition') || 'none';
      var dkim = getElementText(policyEvaluated, 'dkim') || 'fail';
      var spf = getElementText(policyEvaluated, 'spf') || 'fail';
      
      totalMessages += count;
      
      var passed = (dkim === 'pass' || spf === 'pass');
      if (passed) {
        passedMessages += count;
      } else {
        failedMessages += count;
      }
      
      recordDetails.push({
        sourceIp: sourceIp,
        count: count,
        disposition: disposition,
        dkim: dkim,
        spf: spf,
        passed: passed
      });
    }
    
    return {
      metadata: {
        orgName: orgName,
        email: email,
        reportId: reportId,
        beginDate: new Date(parseInt(beginDate) * 1000),
        endDate: new Date(parseInt(endDate) * 1000)
      },
      policy: {
        domain: domain,
        dmarcPolicy: dmarcPolicy,
        subdomainPolicy: subdomainPolicy,
        pct: pct
      },
      summary: {
        totalMessages: totalMessages,
        passedMessages: passedMessages,
        failedMessages: failedMessages,
        passRate: totalMessages > 0 ? (passedMessages / totalMessages * 100).toFixed(2) : 0
      },
      records: recordDetails
    };
  } catch (e) {
    Logger.log('Error parsing DMARC XML: ' + e.toString());
    throw new Error('Failed to parse DMARC report: ' + e.toString());
  }
}

/**
 * Helper function to safely get element text
 * @param {XmlService.Element} parent - Parent element
 * @param {string} childName - Child element name
 * @return {string} Element text or empty string
 */
function getElementText(parent, childName) {
  if (!parent) return '';
  var child = parent.getChild(childName);
  return child ? child.getText() : '';
}

/**
 * Analyze DMARC report and provide rating
 * @param {Object} dmarcData - Parsed DMARC data
 * @return {Object} Analysis with rating and recommendations
 */
function analyzeDmarcReport(dmarcData) {
  var passRate = parseFloat(dmarcData.summary.passRate);
  var policy = dmarcData.policy.dmarcPolicy;
  var failedMessages = dmarcData.summary.failedMessages;
  
  var rating = 'UNKNOWN';
  var ratingColor = '#9E9E9E';
  var issues = [];
  var recommendations = [];
  
  // Determine rating based on pass rate and policy
  if (passRate >= 95 && (policy === 'quarantine' || policy === 'reject')) {
    rating = 'EXCELLENT';
    ratingColor = '#34A853'; // Green
  } else if (passRate >= 90 && policy !== 'none') {
    rating = 'GOOD';
    ratingColor = '#34A853'; // Green
  } else if (passRate >= 80) {
    rating = 'FAIR';
    ratingColor = '#FBBC04'; // Yellow
  } else if (passRate >= 60) {
    rating = 'POOR';
    ratingColor = '#FF9800'; // Orange
  } else {
    rating = 'BAD';
    ratingColor = '#EA4335'; // Red
  }
  
  // Identify issues
  if (passRate < 100) {
    issues.push(failedMessages + ' message(s) failed DMARC authentication');
  }
  
  if (policy === 'none') {
    issues.push('DMARC policy is set to "none" - no action taken on failures');
    recommendations.push('Consider upgrading to "quarantine" or "reject" policy');
  }
  
  if (passRate < 90) {
    recommendations.push('Review failed authentication records and fix SPF/DKIM configuration');
  }
  
  // Check for suspicious sources
  var suspiciousSources = [];
  for (var i = 0; i < dmarcData.records.length; i++) {
    var record = dmarcData.records[i];
    if (!record.passed && record.count > 10) {
      suspiciousSources.push(record.sourceIp + ' (' + record.count + ' messages)');
    }
  }
  
  if (suspiciousSources.length > 0) {
    issues.push('High volume of failures from: ' + suspiciousSources.join(', '));
    recommendations.push('Investigate sources with high failure counts for potential spoofing');
  }
  
  return {
    rating: rating,
    ratingColor: ratingColor,
    issues: issues,
    recommendations: recommendations,
    healthScore: passRate
  };
}
