import React, { useState, useEffect, useRef } from "react";
import { Maximize, Minimize } from "lucide-react";

interface CodePreviewProps {
  code: string;
  height?: string;
  language?: string;
}

const CodePreview: React.FC<CodePreviewProps> = ({ code, height = "500px", language }) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Reset error message and set loading when code changes
    setErrorMessage(null);
    setLoading(true);
    
    // Simulate a small delay for loading state
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, [code]);

  // This will be called by the iframe if there's an error
  const handleIframeError = (event: MessageEvent) => {
    if (event.data && event.data.type === 'code-preview-error') {
      setErrorMessage(event.data.message);
    }
  };

  useEffect(() => {
    window.addEventListener('message', handleIframeError);
    return () => {
      window.removeEventListener('message', handleIframeError);
    };
  }, []);

  useEffect(() => {
    // Handle fullscreen change
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement && document.fullscreenElement === previewContainerRef.current);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!previewContainerRef.current) return;

    if (!document.fullscreenElement) {
      previewContainerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Format code to ensure it's properly processed
  const formattedCode = React.useMemo(() => {
    if (!code || !code.trim()) {
      return `
        const App = () => {
          return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
              <div className="p-6 bg-white rounded-lg shadow-lg">
                <h2 className="text-xl font-bold text-gray-800">No code to preview</h2>
                <p className="mt-2 text-gray-600">Generate code first to see a preview</p>
              </div>
            </div>
          );
        }
      `;
    }
    
    // If it's HTML/CSS code, wrap it properly for rendering
    if (language === 'html' || code.includes('<!DOCTYPE html>') || code.includes('<html>')) {
      // Return the HTML directly
      return code;
    }
    
    // Check if this is React code
    const isReactCode = 
      code.includes('import React') || 
      code.includes('from "react"') || 
      code.includes('from \'react\'') || 
      code.includes('<React.') || 
      code.includes('<>') || 
      (code.match(/<[A-Z][A-Za-z0-9]*/) !== null) || // JSX component tags
      code.includes('useState') || 
      code.includes('useEffect') || 
      code.includes('className=');
    
    // If it's React code
    if (isReactCode) {
      // Extract imports to add at the top
      const importStatements = [];
      const codeLines = code.split('\n');
      const processedLines = [];
      
      // Process imports and code separately
      for (const line of codeLines) {
        if (line.trim().startsWith('import ') && line.includes('from ')) {
          importStatements.push(line);
        } else {
          processedLines.push(line);
        }
      }
      
      // Join the non-import lines back together
      const codeWithoutImports = processedLines.join('\n');
      
      // If code doesn't explicitly export App, try to find a component that might be the main one
      if (!code.includes('const App') && !code.includes('function App') && !code.includes('export default function App')) {
        // Look for exported default component
        const exportDefaultMatch = code.match(/export\s+default\s+([A-Z][A-Za-z0-9_]*)/); 
        if (exportDefaultMatch && exportDefaultMatch[1]) {
          return `${code}\n\nconst App = ${exportDefaultMatch[1]};`;
        }
        
        // Look for component declarations
        const componentMatch = code.match(/(?:const|function|class)\s+([A-Z][A-Za-z0-9_]*)\s*(?:=|extends|{)/); 
        if (componentMatch && componentMatch[1]) {
          return `${code}\n\nconst App = ${componentMatch[1]};`;
        }
        
        // If we can't find a component, wrap the code in a component
        return `${importStatements.join('\n')}\n\nconst App = () => {\n  return (\n    <div className="container mx-auto p-4">\n      ${codeWithoutImports}\n    </div>\n  );\n};`;
      }
    }
    
    return code;
  }, [code, language]);

  // Determine if this is HTML-only content
  const isHtmlContent = language === 'html' || formattedCode.includes('<!DOCTYPE html>') || formattedCode.includes('<html>');

  // Create CSS for improved scrolling in code editor
  const editorStyle = `
    .code-editor-container {
      overflow: auto;
      scrollbar-width: thin;
      scrollbar-color: rgba(155, 155, 155, 0.5) transparent;
    }
    .code-editor-container::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    .code-editor-container::-webkit-scrollbar-track {
      background: transparent;
    }
    .code-editor-container::-webkit-scrollbar-thumb {
      background-color: rgba(155, 155, 155, 0.5);
      border-radius: 20px;
    }
    body {
      padding-left: 4px; /* Move the cursor left by 4px */
    }
  `;

  return (
    <div 
      ref={previewContainerRef}
      className={`relative w-full overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`} 
      style={{ height: isFullscreen ? '100vh' : height }}
    >
      <button
        onClick={toggleFullscreen}
        className="absolute top-2 right-2 z-10 p-1 bg-gray-800 text-white rounded-md opacity-70 hover:opacity-100 transition-opacity"
        title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
      >
        {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
      </button>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading preview...</p>
          </div>
        </div>
      )}
      
      {errorMessage && !loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 border border-red-300 rounded-md p-4 overflow-auto">
          <div className="text-red-600">
            <h3 className="font-medium text-lg mb-2">Error rendering preview:</h3>
            <pre className="whitespace-pre-wrap text-sm">{errorMessage}</pre>
          </div>
        </div>
      )}
      
      {!loading && !errorMessage && (
        <iframe 
          srcDoc={isHtmlContent ? formattedCode : `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <script src="https://cdn.tailwindcss.com"></script>
              <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
              <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
              <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
              <script src="https://unpkg.com/lucide-react@latest/dist/umd/lucide-react.js"></script>
              <script src="https://unpkg.com/prop-types@15.8.1/prop-types.js"></script>
              <script src="https://unpkg.com/react-router-dom@6.10.0/dist/umd/react-router-dom.production.min.js"></script>
              <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
              <script src="https://unpkg.com/@mui/material@5.11.16/umd/material-ui.development.js"></script>
              <style>
                ${editorStyle}
                body {
                  margin: 0;
                  padding: 0;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                }
                #root {
                  height: 100vh;
                  width: 100%;
                }
                .preview-error {
                  color: red;
                  padding: 20px;
                  border: 1px solid red;
                  border-radius: 4px;
                  background-color: #fff5f5;
                  margin: 20px;
                }
                /* Custom scrollbar for better visibility */
                ::-webkit-scrollbar {
                  width: 8px;
                  height: 8px;
                }
                ::-webkit-scrollbar-track {
                  background: #f1f1f1;
                }
                ::-webkit-scrollbar-thumb {
                  background: #888;
                  border-radius: 4px;
                }
                ::-webkit-scrollbar-thumb:hover {
                  background: #555;
                }
                /* Add some basic styling for common React components */
                .btn, button {
                  cursor: pointer;
                  padding: 8px 16px;
                  border-radius: 4px;
                  border: 1px solid #ddd;
                  background: #f5f5f5;
                  transition: all 0.2s;
                }
                .btn:hover, button:hover {
                  background: #e5e5e5;
                }
                input, select, textarea {
                  padding: 8px;
                  border: 1px solid #ddd;
                  border-radius: 4px;
                  margin-bottom: 10px;
                }
                .container {
                  padding: 20px;
                  max-width: 1200px;
                  margin: 0 auto;
                }
                .card {
                  border: 1px solid #ddd;
                  border-radius: 8px;
                  padding: 16px;
                  margin-bottom: 16px;
                  background: white;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
              </style>
            </head>
            <body>
              <div id="root" class="code-editor-container"></div>
              <script type="text/babel">
                try {
                  // Define common React hooks and components to make them available
                  const { useState, useEffect, useRef, useContext, useMemo, useCallback, useReducer } = React;
                  const { BrowserRouter, Routes, Route, Link, useNavigate, useParams, useLocation } = ReactRouterDOM;
                  
                  // Create a simple component library to handle common UI elements
                  const UI = {
                    Button: ({ children, onClick, className, ...props }) => {
                      // Wrap onClick to prevent default navigation
                      const handleClick = (e) => {
                        e.preventDefault(); // Prevent any default navigation
                        if (onClick) onClick(e);
                        return false; // Prevent default
                      };
                      return (
                        <button onClick={handleClick} className={\`btn \${className || ''}\`} {...props}>{children}</button>
                      );
                    },
                    Card: ({ children, className, ...props }) => (
                      <div className={\`card \${className || ''}\`} {...props}>{children}</div>
                    ),
                    Container: ({ children, className, ...props }) => (
                      <div className={\`container \${className || ''}\`} {...props}>{children}</div>
                    ),
                    Input: (props) => <input {...props} />,
                    Select: (props) => <select {...props} />,
                    Textarea: (props) => <textarea {...props} />
                  };
                  
                  // Add event prevention for all links and forms
                  window.addEventListener('click', function(e) {
                    // Prevent all link clicks from navigating
                    if (e.target.tagName === 'A' || e.target.closest('a')) {
                      e.preventDefault();
                      return false;
                    }
                  }, true);
                  
                  // Prevent form submissions
                  window.addEventListener('submit', function(e) {
                    e.preventDefault();
                    return false;
                  }, true);
                  
                  // Process the code to handle common import patterns
                  let processedCode = \`\${formattedCode}\`;
                  
                  // Add code to prevent navigation and handle UI state
                  processedCode = \`
                    // Create a global state manager for UI interactions
                    window.UIState = {};
                    
                    // Create a function to handle UI state changes
                    function updateUIState(key, value) {
                      window.UIState[key] = value;
                      // Trigger a custom event to notify state changes
                      const event = new CustomEvent('uiStateChange', { detail: { key, value } });
                      document.dispatchEvent(event);
                      return value; // Return the value for chaining
                    }
                    
                    // Create a function to get UI state
                    function getUIState(key, defaultValue) {
                      return key in window.UIState ? window.UIState[key] : defaultValue;
                    }
                    
                    // Override window.location methods to prevent navigation
                    const originalAssign = window.location.assign;
                    const originalReplace = window.location.replace;
                    const originalHref = Object.getOwnPropertyDescriptor(window.location, 'href');
                    
                    window.location.assign = function(url) {
                      console.log('Navigation prevented to:', url);
                      return false;
                    };
                    
                    window.location.replace = function(url) {
                      console.log('Navigation prevented to:', url);
                      return false;
                    };
                    
                    Object.defineProperty(window.location, 'href', {
                      get: function() {
                        return originalHref.get.call(this);
                      },
                      set: function(url) {
                        console.log('Navigation prevented to:', url);
                        return false;
                      }
                    });
                    
                    // Prevent page reloads
                    window.onbeforeunload = function(e) {
                      e.preventDefault();
                      e.returnValue = '';
                      return '';
                    };
                    
                    // Block all iframe loading
                    HTMLIFrameElement.prototype._setAttribute = HTMLIFrameElement.prototype.setAttribute;
                    HTMLIFrameElement.prototype.setAttribute = function(name, value) {
                      if (name === 'src') {
                        console.log('Blocked iframe src loading:', value);
                        return;
                      }
                      this._setAttribute(name, value);
                    };
                    
                    // Override iframe creation
                    const originalCreateElement = document.createElement;
                    document.createElement = function(tagName) {
                      const element = originalCreateElement.call(document, tagName);
                      if (tagName.toLowerCase() === 'iframe') {
                        // Override the src property
                        Object.defineProperty(element, 'src', {
                          set: function(value) {
                            console.log('Blocked iframe src setting:', value);
                            return false;
                          },
                          get: function() { return ''; }
                        });
                      }
                      return element;
                    };
                    
                    // Intercept all clicks
                    document.addEventListener('click', function(e) {
                      // Prevent default for all clicks
                      e.preventDefault();
                      e.stopPropagation();
                      
                      // If it's a button, still allow the click handler to run
                      if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
                        // Let the event handler run, but prevent any navigation
                        setTimeout(() => {
                          // Force a re-render of any state changes
                          const event = new CustomEvent('forceUpdate');
                          document.dispatchEvent(event);
                        }, 10);
                      }
                      
                      return false;
                    }, true);
                    
                    // Intercept all form submissions
                    document.addEventListener('submit', function(e) {
                      e.preventDefault();
                      e.stopPropagation();
                      
                      // Extract form data for state management
                      const formData = new FormData(e.target);
                      const formValues = {};
                      
                      for (let [key, value] of formData.entries()) {
                        formValues[key] = value;
                      }
                      
                      // Update UI state with form values
                      updateUIState('formData', formValues);
                      
                      // Force a re-render
                      const event = new CustomEvent('forceUpdate');
                      document.dispatchEvent(event);
                      
                      return false;
                    }, true);
                    
                    \${processedCode}
                  \`;
                  
                  // Handle React component exports
                  if (processedCode.includes('export default') && !processedCode.includes('const App =')) {
                    const exportMatch = processedCode.match(/export\\s+default\\s+([A-Za-z0-9_]+)/); 
                    if (exportMatch && exportMatch[1]) {
                      processedCode += \`\nconst App = \${exportMatch[1]};\`;
                    }
                  }
                  
                  // Create a wrapper component to handle state updates
                  const PreviewWrapper = () => {
                    const [, forceUpdate] = React.useState(0);
                    
                    React.useEffect(() => {
                      // Listen for UI state changes and force re-renders
                      const handleStateChange = () => forceUpdate(prev => prev + 1);
                      document.addEventListener('uiStateChange', handleStateChange);
                      document.addEventListener('forceUpdate', handleStateChange);
                      
                      return () => {
                        document.removeEventListener('uiStateChange', handleStateChange);
                        document.removeEventListener('forceUpdate', handleStateChange);
                      };
                    }, []);
                    
                    // Evaluate the processed code only once
                    if (!window.evaluatedCode) {
                      try {
                        eval(processedCode);
                        window.evaluatedCode = true;
                      } catch (error) {
                        console.error('Error evaluating code:', error);
                        return <div className="preview-error">Error evaluating code: {error.message}</div>;
                      }
                    }
                    
                    // Check if App component exists
                    if (typeof App !== 'undefined') {
                      // Wrap in BrowserRouter if the code seems to use React Router
                      const codeUsesRouter = processedCode.includes('useNavigate') || 
                                            processedCode.includes('useParams') || 
                                            processedCode.includes('useLocation') || 
                                            processedCode.includes('<Link') || 
                                            processedCode.includes('<Route') || 
                                            processedCode.includes('BrowserRouter');
                      
                      if (codeUsesRouter) {
                        return (
                          <BrowserRouter>
                            <App />
                          </BrowserRouter>
                        );
                      } else {
                        return <App />;
                      }
                    } else {
                      // Try to find any React component in the code
                      const componentMatch = processedCode.match(/(?:const|function|class)\\s+([A-Z][A-Za-z0-9_]*)\\s*(?:=|\\(|extends)/); 
                      if (componentMatch && componentMatch[1] && typeof window[componentMatch[1]] === 'function') {
                        const Component = window[componentMatch[1]];
                        return <Component />;
                      } else {
                        throw new Error('No React component found in the code. Make sure your code exports a component or defines an App component.');
                      }
                    }
                  };
                  
                  // Render the wrapper component
                  const rootElement = document.getElementById('root');
                  ReactDOM.render(<PreviewWrapper />, rootElement);
                  }
                } catch (error) {
                  console.error("Preview error:", error);
                  document.getElementById('root').innerHTML = 
                    '<div class="preview-error"><h3>Error rendering preview:</h3><p>' + 
                    error.message + '</p><pre style="white-space: pre-wrap; font-size: 12px; margin-top: 10px; background: #f5f5f5; padding: 10px; border-radius: 4px;">' + 
                    error.stack + '</pre></div>';
                  
                  // Send error to parent window
                  window.parent.postMessage({
                    type: 'code-preview-error',
                    message: error.message
                  }, '*');
                }
              </script>
            </body>
            </html>
          `}
          className="w-full h-full border-none"
          style={{ height: "100%", width: "100%" }}
          title="Code Preview"
          sandbox="allow-scripts allow-modals allow-forms allow-same-origin allow-popups"
          loading="lazy"
          onLoad={() => setLoading(false)}
        />
      )}
    </div>
  );
};

export default CodePreview;
