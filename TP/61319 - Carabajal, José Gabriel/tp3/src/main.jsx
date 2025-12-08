import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error('💥 Error render:', error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, fontFamily: 'system-ui' }}>
          <h1>Algo se rompió 😅</h1>
          <pre style={{ whiteSpace: 'pre-wrap', background:'#fff4f4', border:'1px solid #f3c2c2', padding:12 }}>
            {String(this.state.error?.stack || this.state.error)}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
