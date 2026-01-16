import React from 'react';
import './RulesPanel.css';

function RulesPanel({ rules, onClose }) {
  return (
    <div className="rules-panel-overlay" onClick={onClose}>
      <div className="rules-panel" onClick={(e) => e.stopPropagation()}>
        <div className="rules-panel-header">
          <h2>📋 Change Note Rules & Best Practices</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>
        <div className="rules-content">
          <div className="markdown-content">
            {renderMarkdown(rules)}
          </div>
        </div>
      </div>
    </div>
  );
}

function renderMarkdown(text) {
  if (!text) return null;

  // Simple markdown rendering
  const lines = text.split('\n');
  const elements = [];
  let currentList = [];
  let inCodeBlock = false;
  let codeBlockLines = [];

  lines.forEach((line, idx) => {
    // Code blocks
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <pre key={`code-${idx}`} className="code-block">
            <code>{codeBlockLines.join('\n')}</code>
          </pre>
        );
        codeBlockLines = [];
      }
      inCodeBlock = !inCodeBlock;
      return;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      return;
    }

    // Flush current list
    if (currentList.length > 0 && !line.trim().startsWith('-')) {
      elements.push(
        <ul key={`list-${idx}`}>
          {currentList.map((item, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </ul>
      );
      currentList = [];
    }

    // Headers
    if (line.startsWith('# ')) {
      elements.push(<h1 key={idx}>{line.substring(2)}</h1>);
    } else if (line.startsWith('## ')) {
      elements.push(<h2 key={idx}>{line.substring(3)}</h2>);
    } else if (line.startsWith('### ')) {
      elements.push(<h3 key={idx}>{line.substring(4)}</h3>);
    }
    // Lists
    else if (line.trim().startsWith('-')) {
      const content = line.trim().substring(1).trim();
      currentList.push(formatInlineMarkdown(content));
    }
    // Paragraphs
    else if (line.trim()) {
      elements.push(
        <p key={idx} dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(line) }} />
      );
    }
    // Empty lines
    else {
      elements.push(<br key={idx} />);
    }
  });

  // Flush any remaining list
  if (currentList.length > 0) {
    elements.push(
      <ul key="list-final">
        {currentList.map((item, i) => (
          <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
        ))}
      </ul>
    );
  }

  return elements;
}

function formatInlineMarkdown(text) {
  // Bold
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Italic
  text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
  // Code
  text = text.replace(/`(.*?)`/g, '<code>$1</code>');
  // Warning emoji
  text = text.replace(/⚠️/g, '<span class="warning-emoji">⚠️</span>');
  
  return text;
}

export default RulesPanel;
