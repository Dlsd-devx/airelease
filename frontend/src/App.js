import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import FileList from './components/FileList';
import ValidationResults from './components/ValidationResults';
import RulesPanel from './components/RulesPanel';

// Configure axios defaults
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

function App() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [validationResults, setValidationResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [useSubset, setUseSubset] = useState(true);
  const [showRules, setShowRules] = useState(false);
  const [rules, setRules] = useState('');

  // Load files on mount
  useEffect(() => {
    loadFiles();
  }, [useSubset]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const endpoint = useSubset ? '/files/subset' : '/files';
      const response = await axios.get(`${API_BASE_URL}${endpoint}`);
      setFiles(response.data.files);
    } catch (err) {
      setError('Failed to load files: ' + err.message);
      console.error('Error loading files:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadRules = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/rules`);
      setRules(response.data.content);
      setShowRules(true);
    } catch (err) {
      setError('Failed to load rules: ' + err.message);
      console.error('Error loading rules:', err);
    }
  };

  const validateFile = async (filename) => {
    try {
      setLoading(true);
      setError(null);
      setSelectedFile(filename);
      const response = await axios.get(
        `${API_BASE_URL}/validate/${filename}?subset=${useSubset}`
      );
      setValidationResults(response.data);
    } catch (err) {
      setError('Failed to validate file: ' + err.message);
      console.error('Error validating file:', err);
    } finally {
      setLoading(false);
    }
  };

  const validateAll = async () => {
    try {
      setLoading(true);
      setError(null);
      setSelectedFile(null);
      const response = await axios.post(`${API_BASE_URL}/validate/all`, {
        useSubset,
        fileList: files
      });
      setValidationResults(response.data);
    } catch (err) {
      setError('Failed to validate all files: ' + err.message);
      console.error('Error validating all files:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <h1>🚀 AI Release - Change Note Validator</h1>
          <p>Validate change reports against SimCorp Dimension standards</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-secondary"
            onClick={() => setShowRules(!showRules)}
            onMouseEnter={() => !rules && loadRules()}
          >
            {showRules ? '📋 Hide Rules' : '📋 Show Rules'}
          </button>
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={useSubset}
              onChange={(e) => {
                setUseSubset(e.target.checked);
                setValidationResults(null);
                setSelectedFile(null);
              }}
            />
            <span>Use Subset</span>
          </label>
        </div>
      </header>

      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {showRules && <RulesPanel rules={rules} onClose={() => setShowRules(false)} />}

      <div className="main-content">
        <div className="sidebar">
          <FileList
            files={files}
            selectedFile={selectedFile}
            onSelectFile={validateFile}
            onValidateAll={validateAll}
            loading={loading}
            fileCount={files.length}
          />
        </div>

        <div className="content-area">
          {loading && !validationResults && (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Validating change reports...</p>
            </div>
          )}

          {!loading && !validationResults && (
            <div className="welcome-screen">
              <div className="welcome-icon">🔍</div>
              <h2>Welcome to Change Note Validator</h2>
              <p>Select a file from the list to validate its change notes</p>
              <p>or click "Validate All" to check all files at once</p>
              <div className="stats">
                <div className="stat-card">
                  <span className="stat-number">{files.length}</span>
                  <span className="stat-label">Files Available</span>
                </div>
              </div>
            </div>
          )}

          {validationResults && (
            <ValidationResults 
              results={validationResults}
              selectedFile={selectedFile}
              loading={loading}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
