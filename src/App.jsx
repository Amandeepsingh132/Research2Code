import { useState, useRef } from 'react';
import './App.css';

// API Base URL - Update this to your backend URL
const API_BASE_URL = 'http://localhost:8000';

function App() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [expandedSteps, setExpandedSteps] = useState({});
  const [copiedCode, setCopiedCode] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
      setError(null);
    } else {
      setError('Please upload a PDF file');
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
    } else if (selectedFile) {
      setError('Please upload a PDF file');
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processStages = [
    'Extracting text from PDF...',
    'Researcher agent analyzing paper...',
    'Coder agent generating implementation...',
    'Executing code in Docker sandbox...',
    'Verifier agent validating results...'
  ];

  const processPaper = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setResult(null);

    // Simulate processing stages for visual feedback
    let stageIndex = 0;
    const stageInterval = setInterval(() => {
      if (stageIndex < processStages.length) {
        setProcessingStage(processStages[stageIndex]);
        stageIndex++;
      }
    }, 3000);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/process-paper`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      clearInterval(stageInterval);

      if (data.status === 'success') {
        setResult(data);
        // Auto-expand all steps
        setExpandedSteps({
          researcher: true,
          coder: true,
          execution: true,
          verifier: true,
        });
      } else {
        setError(data.message || 'An error occurred while processing the paper');
      }
    } catch (err) {
      clearInterval(stageInterval);
      setError('Failed to connect to the server. Please ensure the backend is running.');
      console.error('Error:', err);
    } finally {
      setIsProcessing(false);
      setProcessingStage('');
    }
  };

  const toggleStep = (stepKey) => {
    setExpandedSteps(prev => ({
      ...prev,
      [stepKey]: !prev[stepKey]
    }));
  };

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const resetApp = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setExpandedSteps({});
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const renderCodeWithLineNumbers = (code) => {
    const lines = code.split('\n');
    return lines.map((line, index) => (
      <div key={index} className="code-line">
        <span className="line-number">{index + 1}</span>
        <span className="line-content">{line || ' '}</span>
      </div>
    ));
  };

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <div className="logo-icon">R2R</div>
          <div>
            <div className="logo-text">Research2Runtime</div>
            <div className="logo-subtitle"></div>
          </div>
        </div>
      </header>

      <main className="main-container">
        {!result ? (
          <>
            <section className="hero">
              <div className="hero-badge">
                <span className="hero-badge-dot"></span>
                <span>Powered by AI Agents</span>
              </div>
              <h1 className="hero-title">
                Transform Research Papers<br />Into Working Code
              </h1>
              <p className="hero-description">
                Upload your academic paper and let our AI agents analyze, implement,
                and verify the code for you. From PDF to code in minutes.
              </p>
            </section>

            <section className="upload-section">
              <div
                className={`upload-card ${isDragging ? 'dragging' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleUploadClick}
              >
                <div className="upload-icon-wrapper">
                  <span className="upload-icon">+</span>
                </div>
                <h2 className="upload-title">
                  {isDragging ? 'Drop your PDF here' : 'Upload Research Paper'}
                </h2>
                <p className="upload-subtitle">
                  Drag and drop your PDF file here, or click to browse
                </p>
                <div className="upload-formats">
                  <span className="format-tag">PDF</span>
                  <span className="format-tag">Research Papers</span>
                  <span className="format-tag">Academic Articles</span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileSelect}
                  className="file-input"
                />

                {file && (
                  <div className="selected-file" onClick={(e) => e.stopPropagation()}>
                    <span className="selected-file-icon">[PDF]</span>
                    <span className="selected-file-name">{file.name}</span>
                    <button className="selected-file-remove" onClick={removeFile}>
                      ×
                    </button>
                  </div>
                )}
              </div>

              {error && !result && (
                <div className="error-card" style={{ marginTop: '1.5rem' }}>
                  <div className="error-icon">!</div>
                  <div className="error-title">Error</div>
                  <div className="error-message">{error}</div>
                </div>
              )}

              <div style={{ textAlign: 'center' }}>
                <button
                  className="process-button"
                  onClick={processPaper}
                  disabled={!file || isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <span className="animate-spin">*</span>
                      Processing...
                    </>
                  ) : (
                    <>
                      Process Paper
                    </>
                  )}
                </button>
              </div>
            </section>
          </>
        ) : (
          <section className="results-section">
            <div className="results-header">
              <h2 className="results-title">
                Analysis Complete
                {result.metadata?.is_authentic && (
                  <span className="results-success-badge">
                    Verified Authentic
                  </span>
                )}
              </h2>
              <button className="new-upload-button" onClick={resetApp}>
                New Upload
              </button>
            </div>

            {result.metadata && (
              <div className="metadata-card">
                <div className="metadata-item">
                  <span className="metadata-label">Session ID</span>
                  <span className="metadata-value">{result.metadata.session_id}</span>
                </div>
                <div className="metadata-item">
                  <span className="metadata-label">Filename</span>
                  <span className="metadata-value">{result.metadata.filename}</span>
                </div>
                <div className="metadata-item">
                  <span className="metadata-label">Verdict</span>
                  <span className={`metadata-value ${result.metadata.is_authentic ? 'authentic' : 'not-authentic'}`}>
                    {result.metadata.verdict_label || (result.metadata.is_authentic ? 'AUTHENTIC' : 'NOT_VERIFIED')}
                  </span>
                </div>
              </div>
            )}

            <div className="steps-container">
              {/* Step 1: Researcher Agent */}
              {result.steps?.researcher && (
                <div className="step-card">
                  <div
                    className="step-header"
                    onClick={() => toggleStep('researcher')}
                  >
                    <div className="step-number">1</div>
                    <h3 className="step-title">
                      {result.steps.researcher.title}
                    </h3>
                    <span className={`step-toggle ${expandedSteps.researcher ? 'expanded' : ''}`}>
                      ▼
                    </span>
                  </div>
                  <div className={`step-content ${expandedSteps.researcher ? 'expanded' : ''}`}>
                    <div className="summary-content">
                      {result.steps.researcher.content.split('\n').map((para, idx) => (
                        <p key={idx}>{para}</p>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Coder Agent - Code Block */}
              {result.steps?.coder && (
                <div className="step-card">
                  <div
                    className="step-header"
                    onClick={() => toggleStep('coder')}
                  >
                    <div className="step-number">2</div>
                    <h3 className="step-title">
                      {result.steps.coder.title}
                    </h3>
                    <span className={`step-toggle ${expandedSteps.coder ? 'expanded' : ''}`}>
                      ▼
                    </span>
                  </div>
                  <div className={`step-content ${expandedSteps.coder ? 'expanded' : ''}`}>
                    <div className="code-block">
                      <div className="code-header">
                        <span className="code-language">
                          <span className="code-language-dot"></span>
                          {result.steps.coder.language || 'python'}
                        </span>
                        <button
                          className={`copy-button ${copiedCode ? 'copied' : ''}`}
                          onClick={() => copyCode(result.steps.coder.content)}
                        >
                          {copiedCode ? 'Copied!' : 'Copy Code'}
                        </button>
                      </div>
                      <div className="code-content">
                        <pre>
                          {renderCodeWithLineNumbers(result.steps.coder.content)}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Execution Logs */}
              {result.steps?.execution && (
                <div className="step-card">
                  <div
                    className="step-header"
                    onClick={() => toggleStep('execution')}
                  >
                    <div className="step-number">3</div>
                    <h3 className="step-title">
                      {result.steps.execution.title}
                    </h3>
                    <span className={`step-toggle ${expandedSteps.execution ? 'expanded' : ''}`}>
                      ▼
                    </span>
                  </div>
                  <div className={`step-content ${expandedSteps.execution ? 'expanded' : ''}`}>
                    <div className="logs-content">
                      {result.steps.execution.content || 'No logs available'}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Verifier Verdict */}
              {result.steps?.verifier && (
                <div className="step-card">
                  <div
                    className="step-header"
                    onClick={() => toggleStep('verifier')}
                  >
                    <div className="step-number">4</div>
                    <h3 className="step-title">
                      {result.steps.verifier.title}
                    </h3>
                    <span className={`step-toggle ${expandedSteps.verifier ? 'expanded' : ''}`}>
                      ▼
                    </span>
                  </div>
                  <div className={`step-content ${expandedSteps.verifier ? 'expanded' : ''}`}>
                    <div className="verdict-content">
                      <p className="verdict-text">
                        {result.steps.verifier.content}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      {/* Processing Overlay */}
      {isProcessing && (
        <div className="processing-overlay">
          <div className="processing-spinner"></div>
          <div className="processing-text">Processing your research paper...</div>
          {processingStage && (
            <div className="processing-stage">
              <span className="processing-stage-icon">*</span>
              {processingStage}
            </div>
          )}
        </div>
      )}

      <footer className="footer">
        <p>Research2Runtime © 2026 </p>
      </footer>
    </div>
  );
}

export default App;
