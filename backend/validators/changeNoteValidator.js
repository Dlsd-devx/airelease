/**
 * Change Note Validator
 * Validates change report entries against the rules defined in change-notes.md
 */

// Known abbreviations that are acceptable
const KNOWN_ABBREVIATIONS = [
  'FX', 'API', 'FRN', 'TRS', 'DWH', 'PFC', 'CSDR', 'RVP', 'APL', 'DFS',
  'NOMA', 'NFRD', 'NACE', 'SCD', 'FIX', 'USD', 'EUR', 'GBP', 'INS',
  'P/L', 'PnL', 'ID', 'UI', 'URL', 'SQL', 'DB', 'PR', 'RC', 'PC'
];

// Common SimCorp Dimension terms
const SIMCORP_TERMS = [
  'Asset Manager', 'Portfolio', 'Transaction', 'Dealer Window', 'Order Manager',
  'Compliance', 'Front Office', 'Middle Office', 'Back Office', 'Match',
  'Settlement', 'Reconciliation', 'Batch', 'Data Warehouse', 'Market Data',
  'Securities Lending', 'Call Money', 'Loan Facility', 'Cash Viewer',
  'Central Trade Manager', 'Data Selector', 'FlexAnalytics'
];

// Patterns that suggest internal references
const INTERNAL_REFERENCE_PATTERNS = [
  /\b[DS]-\d{5,}\b/gi,  // Agility references like D-12345, S-12345
  /\bS-\d{5,}\b/gi,
  /\battachment\b/gi,
  /\bmonkey test\b/gi,
  /\bagility\b/gi,
  /\bsiebel\b/gi,
  /\bworksheet\b/gi
];

// Customer-specific indicators
const CUSTOMER_PATTERNS = [
  /customer specific/gi,
  /\bcustomer name\b/gi,
  /\bfor customer\b/gi
];

/**
 * Validates a single change report entry
 */
function validateEntry(entry, index) {
  const violations = [];
  const reference = entry.SimCorpReference || 'Unknown';
  const changeNote = entry.ChangeNote || '';
  const customerApplyNote = entry.CustomerApplyNote || '';
  const products = entry.Products || [];

  // Rule 1: Change Note is mandatory (as of 16.10.2024)
  if (!changeNote || changeNote.trim() === '') {
    violations.push({
      severity: 'error',
      rule: 'mandatory-change-note',
      field: 'ChangeNote',
      message: `Empty Change Note is not allowed (mandatory as of 16.10.2024)`,
      reference
    });
  }

  if (changeNote) {
    // Rule 2: Check for abbreviations not in known list
    const words = changeNote.match(/\b[A-Z]{2,}\b/g) || [];
    const unknownAbbreviations = words.filter(word => 
      !KNOWN_ABBREVIATIONS.includes(word) && 
      !SIMCORP_TERMS.some(term => term.toUpperCase().includes(word))
    );
    
    if (unknownAbbreviations.length > 0) {
      violations.push({
        severity: 'warning',
        rule: 'unknown-abbreviation',
        field: 'ChangeNote',
        message: `Potential unknown abbreviation(s): ${unknownAbbreviations.join(', ')}. Verify if known to customers.`,
        reference,
        details: unknownAbbreviations
      });
    }

    // Rule 3: Check for customer name references
    for (const pattern of CUSTOMER_PATTERNS) {
      if (pattern.test(changeNote)) {
        violations.push({
          severity: 'error',
          rule: 'customer-reference',
          field: 'ChangeNote',
          message: `Change Note should not reference customer names or be customer-specific`,
          reference
        });
        break;
      }
    }

    // Rule 4: Check for internal references (Agility items, etc.)
    for (const pattern of INTERNAL_REFERENCE_PATTERNS) {
      const matches = changeNote.match(pattern);
      if (matches && matches.length > 0) {
        violations.push({
          severity: 'error',
          rule: 'internal-reference',
          field: 'ChangeNote',
          message: `Change Note contains internal references that customers won't understand: ${matches.join(', ')}`,
          reference,
          details: matches
        });
        break;
      }
    }

    // Rule 5: Check for overly technical internal details
    const technicalPatterns = [
      /\bmonkey test\b/gi,
      /\bworksheet\b/gi,
      /\bagility item\b/gi
    ];
    
    for (const pattern of technicalPatterns) {
      if (pattern.test(changeNote)) {
        violations.push({
          severity: 'warning',
          rule: 'technical-internal-detail',
          field: 'ChangeNote',
          message: `Change Note may contain internal tool/process references not known to customers`,
          reference
        });
        break;
      }
    }
  }

  // Rule 6: Check CustomerApplyNote doesn't repeat ChangeNote
  if (customerApplyNote && changeNote) {
    const similarity = calculateSimilarity(customerApplyNote.toLowerCase(), changeNote.toLowerCase());
    if (similarity > 0.8) {
      violations.push({
        severity: 'warning',
        rule: 'apply-note-repetition',
        field: 'CustomerApplyNote',
        message: `Customer Apply Note appears to repeat Change Note information. Provide additional apply instructions instead.`,
        reference
      });
    }
  }

  // Rule 7: Check if entry has a reference but no change note (might be internal only)
  if (reference && (!changeNote || changeNote.trim() === '')) {
    violations.push({
      severity: 'info',
      rule: 'reference-without-note',
      field: 'ChangeNote',
      message: `Entry has reference but no Change Note. Verify if this should be excluded from change report or if Product field is set to 'Other'.`,
      reference
    });
  }

  return violations;
}

/**
 * Simple string similarity calculation (Dice coefficient)
 */
function calculateSimilarity(str1, str2) {
  const bigrams1 = getBigrams(str1);
  const bigrams2 = getBigrams(str2);
  
  const intersection = bigrams1.filter(b => bigrams2.includes(b)).length;
  return (2.0 * intersection) / (bigrams1.length + bigrams2.length);
}

function getBigrams(str) {
  const bigrams = [];
  for (let i = 0; i < str.length - 1; i++) {
    bigrams.push(str.substring(i, i + 2));
  }
  return bigrams;
}

/**
 * Main validation function
 */
function validateChangeReports(data, filename = 'unknown') {
  if (!Array.isArray(data)) {
    return {
      filename,
      error: 'Invalid data format: expected array of entries',
      totalEntries: 0,
      totalViolations: 0,
      violations: []
    };
  }

  const allViolations = [];
  
  data.forEach((entry, index) => {
    const entryViolations = validateEntry(entry, index);
    if (entryViolations.length > 0) {
      allViolations.push({
        entryIndex: index,
        reference: entry.SimCorpReference,
        changeNote: entry.ChangeNote || '(empty)',
        violations: entryViolations
      });
    }
  });

  // Calculate statistics
  const errorCount = allViolations.reduce((sum, entry) => 
    sum + entry.violations.filter(v => v.severity === 'error').length, 0
  );
  const warningCount = allViolations.reduce((sum, entry) => 
    sum + entry.violations.filter(v => v.severity === 'warning').length, 0
  );
  const infoCount = allViolations.reduce((sum, entry) => 
    sum + entry.violations.filter(v => v.severity === 'info').length, 0
  );

  return {
    filename,
    totalEntries: data.length,
    entriesWithViolations: allViolations.length,
    totalViolations: allViolations.reduce((sum, entry) => sum + entry.violations.length, 0),
    statistics: {
      errors: errorCount,
      warnings: warningCount,
      info: infoCount
    },
    violations: allViolations
  };
}

module.exports = {
  validateChangeReports,
  validateEntry
};
