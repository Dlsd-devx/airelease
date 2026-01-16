import React, { useState } from 'react';
import './ValidationResults.css';

function ValidationResults({ results, selectedFile, loading }) {
  const [expandedEntries, setExpandedEntries] = useState({});
  const [filterSeverity, setFilterSeverity] = useState('all');

  // Handle single file validation results
  if (results && !results.results) {
    return <SingleFileResults results={results} selectedFile={selectedFile} />;
  }

  // Handle multiple files validation results
  if (results && results.results) {
    return (
      <MultiFileResults 
        results={results} 
        expandedEntries={expandedEntries}
        setExpandedEntries={setExpandedEntries}
        filterSeverity={filterSeverity}
        setFilterSeverity={setFilterSeverity}
      />
    );
  }

  return null;
}

function SingleFileResults({ results, selectedFile }) {
  const [expandedEntries, setExpandedEntries] = useState({});
  const [filterSeverity, setFilterSeverity] = useState('all');

  const toggleEntry = (index) => {
    setExpandedEntries(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const filteredViolations = results.violations.filter(entry => {
    if (filterSeverity === 'all') return true;
    return entry.violations.some(v => v.severity === filterSeverity);
  });

  return (
    <div className="validation-results">
      <div className="results-header">
        <h2>📊 Validation Results</h2>
        <span className="file-badge">{selectedFile || results.filename}</span>
      </div>

      <div className="summary-cards">
        <div className="summary-card">
          <span className="summary-number">{results.totalEntries}</span>
          <span className="summary-label">Total Entries</span>
        </div>
        <div className="summary-card warning">
          <span className="summary-number">{results.entriesWithViolations}</span>
          <span className="summary-label">With Issues</span>
        </div>
        <div className="summary-card error">
          <span className="summary-number">{results.statistics?.errors || 0}</span>
          <span className="summary-label">Errors</span>
        </div>
        <div className="summary-card warning">
          <span className="summary-number">{results.statistics?.warnings || 0}</span>
          <span className="summary-label">Warnings</span>
        </div>
        <div className="summary-card info">
          <span className="summary-number">{results.statistics?.info || 0}</span>
          <span className="summary-label">Info</span>
        </div>
      </div>

      {results.entriesWithViolations > 0 && (
        <div className="filter-bar">
          <label>Filter by severity:</label>
          <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)}>
            <option value="all">All ({results.violations.length})</option>
            <option value="error">Errors ({results.statistics?.errors || 0})</option>
            <option value="warning">Warnings ({results.statistics?.warnings || 0})</option>
            <option value="info">Info ({results.statistics?.info || 0})</option>
          </select>
        </div>
      )}

      <div className="violations-list">
        {filteredViolations.length === 0 ? (
          <div className="no-violations">
            <div className="success-icon">✓</div>
            <h3>No Issues Found!</h3>
            <p>All change notes comply with the standards.</p>
          </div>
        ) : (
          filteredViolations.map((entry, idx) => (
            <ViolationEntry 
              key={idx}
              entry={entry}
              expanded={expandedEntries[idx]}
              onToggle={() => toggleEntry(idx)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function MultiFileResults({ results, expandedEntries, setExpandedEntries, filterSeverity, setFilterSeverity }) {
  const [expandedFiles, setExpandedFiles] = useState({});

  const toggleFile = (filename) => {
    setExpandedFiles(prev => ({
      ...prev,
      [filename]: !prev[filename]
    }));
  };

  const totalErrors = results.results.reduce((sum, r) => sum + (r.statistics?.errors || 0), 0);
  const totalWarnings = results.results.reduce((sum, r) => sum + (r.statistics?.warnings || 0), 0);
  const totalInfo = results.results.reduce((sum, r) => sum + (r.statistics?.info || 0), 0);
  const totalEntries = results.results.reduce((sum, r) => sum + r.totalEntries, 0);
  const totalWithIssues = results.results.reduce((sum, r) => sum + r.entriesWithViolations, 0);

  return (
    <div className="validation-results">
      <div className="results-header">
        <h2>📊 Batch Validation Results</h2>
        <span className="file-badge">{results.totalFiles} files</span>
      </div>

      <div className="summary-cards">
        <div className="summary-card">
          <span className="summary-number">{totalEntries}</span>
          <span className="summary-label">Total Entries</span>
        </div>
        <div className="summary-card warning">
          <span className="summary-number">{totalWithIssues}</span>
          <span className="summary-label">With Issues</span>
        </div>
        <div className="summary-card error">
          <span className="summary-number">{totalErrors}</span>
          <span className="summary-label">Errors</span>
        </div>
        <div className="summary-card warning">
          <span className="summary-number">{totalWarnings}</span>
          <span className="summary-label">Warnings</span>
        </div>
        <div className="summary-card info">
          <span className="summary-number">{totalInfo}</span>
          <span className="summary-label">Info</span>
        </div>
      </div>

      <div className="files-results-list">
        {results.results.map((fileResult, idx) => (
          <div key={idx} className="file-result-item">
            <div 
              className="file-result-header"
              onClick={() => toggleFile(fileResult.filename)}
            >
              <div className="file-result-info">
                <span className="file-result-icon">
                  {expandedFiles[fileResult.filename] ? '📂' : '📁'}
                </span>
                <span className="file-result-name">{fileResult.filename}</span>
              </div>
              <div className="file-result-stats">
                {fileResult.statistics?.errors > 0 && (
                  <span className="badge badge-error">{fileResult.statistics.errors} errors</span>
                )}
                {fileResult.statistics?.warnings > 0 && (
                  <span className="badge badge-warning">{fileResult.statistics.warnings} warnings</span>
                )}
                {fileResult.statistics?.info > 0 && (
                  <span className="badge badge-info">{fileResult.statistics.info} info</span>
                )}
                {fileResult.entriesWithViolations === 0 && (
                  <span className="badge badge-success">✓ Clean</span>
                )}
              </div>
            </div>

            {expandedFiles[fileResult.filename] && fileResult.violations.length > 0 && (
              <div className="file-violations">
                {fileResult.violations.map((entry, entryIdx) => (
                  <ViolationEntry 
                    key={entryIdx}
                    entry={entry}
                    expanded={expandedEntries[`${fileResult.filename}-${entryIdx}`]}
                    onToggle={() => setExpandedEntries(prev => ({
                      ...prev,
                      [`${fileResult.filename}-${entryIdx}`]: !prev[`${fileResult.filename}-${entryIdx}`]
                    }))}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ViolationEntry({ entry, expanded, onToggle }) {
  const severityIcon = {
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  const highestSeverity = entry.violations.reduce((highest, v) => {
    if (v.severity === 'error') return 'error';
    if (v.severity === 'warning' && highest !== 'error') return 'warning';
    return highest;
  }, 'info');

  return (
    <div className={`violation-entry severity-${highestSeverity}`}>
      <div className="violation-header" onClick={onToggle}>
        <div className="violation-title">
          <span className="expand-icon">{expanded ? '▼' : '▶'}</span>
          <span className="severity-icon">{severityIcon[highestSeverity]}</span>
          <span className="reference">{entry.reference}</span>
        </div>
        <span className="violation-count">
          {entry.violations.length} issue{entry.violations.length > 1 ? 's' : ''}
        </span>
      </div>

      {expanded && (
        <div className="violation-details">
          <div className="change-note-preview">
            <strong>Change Note:</strong>
            <p>{entry.changeNote}</p>
          </div>

          <div className="violations-items">
            {entry.violations.map((violation, idx) => (
              <div key={idx} className={`violation-item severity-${violation.severity}`}>
                <div className="violation-item-header">
                  <span className="severity-badge">{violation.severity.toUpperCase()}</span>
                  <span className="rule-name">{violation.rule}</span>
                </div>
                <p className="violation-message">{violation.message}</p>
                {violation.details && (
                  <div className="violation-details-extra">
                    <strong>Details:</strong> {JSON.stringify(violation.details)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ValidationResults;
