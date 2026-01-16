import React from 'react';
import './FileList.css';

function FileList({ files, selectedFile, onSelectFile, onValidateAll, loading, fileCount }) {
  return (
    <div className="file-list">
      <div className="file-list-header">
        <h3>📁 Change Reports</h3>
        <span className="file-count">{fileCount} files</span>
      </div>

      <div className="action-buttons">
        <button 
          className="btn btn-validate-all"
          onClick={onValidateAll}
          disabled={loading || files.length === 0}
        >
          {loading ? '⏳ Validating...' : '✓ Validate All'}
        </button>
      </div>

      <div className="files-container">
        {files.length === 0 ? (
          <div className="no-files">
            <p>No files found</p>
          </div>
        ) : (
          files.map((file) => (
            <div
              key={file}
              className={`file-item ${selectedFile === file ? 'active' : ''}`}
              onClick={() => !loading && onSelectFile(file)}
            >
              <span className="file-icon">📄</span>
              <div className="file-info">
                <div className="file-name">{file}</div>
                <div className="file-meta">
                  {extractDateFromFilename(file)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function extractDateFromFilename(filename) {
  // Extract date from filename like: SimCorpDimensionSolutionBundle-2407.20240618.153856.45-change-report.json
  const match = filename.match(/(\d{8})/);
  if (match) {
    const dateStr = match[1];
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    return `${year}-${month}-${day}`;
  }
  return 'Unknown date';
}

export default FileList;
