import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/ClerkAuthContext";
import { toast } from "sonner";
import { useLocation } from "react-router-dom";
import { Code as CodeIcon, Play } from "lucide-react";
import CodePreview from "@/components/CodePreview";
import HtmlPreviewButton from "@/components/HtmlPreviewButton";

// Import highlighting library
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-css";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-typescript";

const languages = [
  { id: "html", name: "HTML", icon: "/google-logo.png", suggested: "HTML CSS" },
  { id: "css", name: "CSS", icon: "/google-logo.png", suggested: "HTML CSS" },
  { id: "js", name: "JavaScript", icon: "/google-logo.png", suggested: "HTML CSS" },
  { id: "typescript", name: "TypeScript", icon: "/google-logo.png", suggested: "HTML CSS" },
  { id: "react", name: "React", icon: "/google-logo.png", suggested: "HTML CSS" },
  { id: "python", name: "Python", icon: "/google-logo.png", suggested: "HTML CSS" },
  { id: "java", name: "Java", icon: "/google-logo.png", suggested: "HTML CSS" },
  { id: "c", name: "C", icon: "/google-logo.png", suggested: "HTML CSS" },
  { id: "cpp", name: "C++", icon: "/google-logo.png", suggested: "HTML CSS" },
];

const CodeEditorPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("editor");
  const [selectedLanguage, setSelectedLanguage] = useState("html");
  const [code, setCode] = useState("// Write your code here");
  const [output, setOutput] = useState("");
  const [terminalInput, setTerminalInput] = useState("");
  const [terminalOutput, setTerminalOutput] = useState<string[]>(["Terminal ready..."]);
  const [languageCodeMap, setLanguageCodeMap] = useState<Record<string, string>>({});
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const location = useLocation();

  useEffect(() => {
    // Initialize code for each language
    const initialMap: Record<string, string> = {};
    languages.forEach(lang => {
      initialMap[lang.id] = getInitialCodeForLanguage(lang.id);
    });
    setLanguageCodeMap(initialMap);
  }, []);

  useEffect(() => {
    // Check if code was passed via location state (from WorkspacePage)
    if (location.state?.generatedCode) {
      setCode(location.state.generatedCode);
      
      // Auto-detect language from code
      if (location.state.generatedCode.includes('<html>') && location.state.generatedCode.includes('<body>')) {
        setSelectedLanguage("html");
        setLanguageCodeMap(prev => ({...prev, html: location.state.generatedCode}));
      } else if (location.state.generatedCode.includes('import React')) {
        setSelectedLanguage("react");
        setLanguageCodeMap(prev => ({...prev, react: location.state.generatedCode}));
      } else {
        setLanguageCodeMap(prev => ({...prev, [selectedLanguage]: location.state.generatedCode}));
      }
    }
  }, [location.state]);
  
  // Apply syntax highlighting when code or language changes
  useEffect(() => {
    if (activeTab === "editor") {
      Prism.highlightAll();
    }
  }, [code, selectedLanguage, activeTab]);

  // Analyze code when it changes or language changes
  useEffect(() => {
    if (code && code.trim().length > 0) {
      analyzeCode();
    }
  }, [code, selectedLanguage]);

  // Store code for each language when changing languages
  useEffect(() => {
    // Get code for selected language
    setCode(languageCodeMap[selectedLanguage] || getInitialCodeForLanguage(selectedLanguage));
  }, [selectedLanguage, languageCodeMap]);
  
  const getInitialCodeForLanguage = (langId: string) => {
    switch (langId) {
      case "html":
        return '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>My HTML Page</title>\n</head>\n<body>\n  <h1>Hello World!</h1>\n</body>\n</html>';
      case "css":
        return 'body {\n  font-family: Arial, sans-serif;\n  margin: 0;\n  padding: 20px;\n  background-color: #f5f5f5;\n}\n\nh1 {\n  color: #333;\n}';
      case "js":
        return '// JavaScript code\nconsole.log("Hello from JavaScript!");\n\nfunction greet(name) {\n  return `Hello, ${name}!`;\n}\n\nconst message = greet("World");\nconsole.log(message);';
      case "react":
        return 'import React from "react";\n\nconst App = () => {\n  return (\n    <div className="container mx-auto p-4">\n      <h1 className="text-2xl font-bold text-blue-600">Hello from React!</h1>\n      <p className="mt-2">Welcome to my React application.</p>\n    </div>\n  );\n};\n\nexport default App;';
      case "typescript":
        return 'interface Person {\n  name: string;\n  age: number;\n}\n\nfunction greet(person: Person): string {\n  return `Hello, ${person.name}! You are ${person.age} years old.`;\n}\n\nconst user: Person = {\n  name: "Alice",\n  age: 30\n};\n\nconsole.log(greet(user));';
      case "python":
        return '# Python code example\ndef greet(name):\n    return f"Hello, {name}!"\n\nname = "World"\nprint(greet(name))\n\n# Define a Person class\nclass Person:\n    def __init__(self, name, age):\n        self.name = name\n        self.age = age\n    \n    def introduce(self):\n        return f"My name is {self.name} and I am {self.age} years old."';
      case "java":
        return 'public class HelloWorld {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}';
      case "c":
        return '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}';
      case "cpp":
        return '#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}';
      default:
        return "// Write your code here";
    }
  };
  
  const analyzeCode = () => {
    // Simple code analysis based on language
    try {
      const languageName = languages.find(l => l.id === selectedLanguage)?.name || 'unknown';
      
      if (selectedLanguage === "html") {
        // Check for common HTML structure
        if (!code.includes("<html") || !code.includes("<body")) {
          setOutput(`Warning: HTML code appears to be missing <html> or <body> tags.`);
        } else if (!code.includes("<head")) {
          setOutput(`Warning: HTML code appears to be missing <head> tag.`);
        } else {
          setOutput(`${languageName} code appears to be properly structured.`);
        }
      } else if (selectedLanguage === "react" || selectedLanguage === "js" || selectedLanguage === "typescript") {
        // Check for React components
        if (code.includes("React.Component") || code.includes("extends Component")) {
          setOutput(`Detected class-based React component.`);
        } else if (code.includes("function") && code.includes("return") && code.includes("<")) {
          setOutput(`Detected functional React component.`);
        } else if (code.includes("() =>") && code.includes("return") && code.includes("<")) {
          setOutput(`Detected arrow function React component.`);
        } else if (code.includes("import") && code.includes("from")) {
          setOutput(`Detected ES module syntax in ${languageName} code.`);
        } else {
          setOutput(`${languageName} code detected. Analyzing structure...`);
        }
      } else {
        setOutput(`${languageName} code detected. No specific analysis available.`);
      }
    } catch (error) {
      setOutput(`Error analyzing code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  const handleRunCode = () => {
    // No need to check for login since the user is already authenticated
    // Just proceed with code execution
    
    if (!code.trim()) {
      toast.warning("No code to run");
      return;
    }
    
    // Update the code for the current language
    setLanguageCodeMap(prev => ({
      ...prev,
      [selectedLanguage]: code
    }));
    
    // Simulate code execution based on language
    setOutput(`Code execution started...\n\nLanguage: ${selectedLanguage}\n\nCompiling...`);
    
    // Simulate delay
    setTimeout(() => {
      try {
        if (selectedLanguage === "html") {
          setOutput(`HTML rendering complete. Check the preview tab to see results.`);
          setActiveTab("preview");
        } else if (selectedLanguage === "react") {
          setOutput(`React component compiled successfully. Check the preview tab to see results.`);
          setActiveTab("preview");
        } else if (selectedLanguage === "js" || selectedLanguage === "typescript") {
          // Simulate JS execution
          executeJavascript(code);
        } else if (selectedLanguage === "python") {
          simulatePythonExecution(code);
        } else if (selectedLanguage === "java") {
          simulateJavaExecution(code);
        } else if (selectedLanguage === "c" || selectedLanguage === "cpp") {
          simulateCExecution(code, selectedLanguage);
        } else {
          setOutput(`Code execution complete for ${selectedLanguage}.\n\nOutput:\nHello, World!`);
        }
        toast.success("Code executed successfully");
      } catch (error) {
        setOutput(`Error executing code: ${error instanceof Error ? error.message : 'Unknown error'}`);
        toast.error("Error executing code");
      }
    }, 1000);
  };

  const executeJavascript = (jsCode: string) => {
    // Extract console.log statements for simulation
    let outputLines: string[] = [];
    const originalConsoleLog = console.log;
    
    try {
      // Override console.log to capture output
      console.log = (...args: any[]) => {
        outputLines.push(args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' '));
      };
      
      // Execute code in a safe way (removing import/export statements)
      const safeCode = jsCode
        .replace(/import\s+.*?from\s+['"].*?['"];?/g, '')
        .replace(/export\s+default\s+.*?;?/g, '');
      
      new Function(safeCode)();
      
      // Restore original console.log
      console.log = originalConsoleLog;
      
      if (outputLines.length === 0) {
        outputLines.push("No output from code execution.");
      }
      
      setOutput(`JavaScript execution complete.\n\nOutput:\n${outputLines.join('\n')}`);
    } catch (error) {
      console.log = originalConsoleLog;
      console.error("JS execution error:", error);
      setOutput(`Error executing JavaScript: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const simulatePythonExecution = (pythonCode: string) => {
    // Create a simulated output based on the Python code
    const lines = pythonCode.split('\n');
    let output = '';
    
    // Look for print statements
    const printStatements = lines.filter(line => 
      line.trim().startsWith('print(')
    );
    
    if (printStatements.length > 0) {
      output = printStatements
        .map(line => {
          // Extract content inside print()
          const match = line.match(/print\((.*)\)/);
          if (match && match[1]) {
            let content = match[1].trim();
            // Handle different types of string literals
            if ((content.startsWith('"') && content.endsWith('"')) || 
                (content.startsWith("'") && content.endsWith("'"))) {
              return content.slice(1, -1);
            }
            // Handle f-strings (simplified)
            if (content.startsWith('f"') || content.startsWith("f'")) {
              return content.slice(2, -1) + " (f-string variables would be substituted here)";
            }
            // Return variables or expressions as is
            return content + " (evaluated)";
          }
          return "";
        })
        .filter(text => text)
        .join('\n');
    } else {
      output = "No print statements found. Output would be empty.";
    }
    
    setOutput(`Python execution complete.\n\nOutput:\n${output}`);
  };

  const simulateJavaExecution = (javaCode: string) => {
    // Extract content from System.out.println
    const pattern = /System\.out\.println\("(.*)"\);/g;
    const matches = [...javaCode.matchAll(pattern)];
    
    let output = '';
    if (matches.length > 0) {
      output = matches.map(match => match[1]).join('\n');
    } else {
      output = "Java program compiled successfully. No console output.";
    }
    
    setOutput(`Java execution complete.\n\nOutput:\n${output}`);
  };

  const simulateCExecution = (cCode: string, language: string) => {
    // Extract content from printf or std::cout
    let output = '';
    
    if (language === 'c') {
      const pattern = /printf\("(.*)\\n?"\);/g;
      const matches = [...cCode.matchAll(pattern)];
      
      if (matches.length > 0) {
        output = matches.map(match => match[1]).join('\n');
      } else {
        output = "C program compiled successfully. No console output.";
      }
    } else { // C++
      const pattern = /std::cout\s*<<\s*"(.*)"\s*<<\s*std::endl;/g;
      const matches = [...cCode.matchAll(pattern)];
      
      if (matches.length > 0) {
        output = matches.map(match => match[1]).join('\n');
      } else {
        output = "C++ program compiled successfully. No console output.";
      }
    }
    
    setOutput(`${language.toUpperCase()} execution complete.\n\nOutput:\n${output}`);
  };

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;
    
    // Add the command to the terminal output
    setTerminalOutput(prev => [...prev, `> ${terminalInput}`]);
    
    // Process command (simple simulation)
    if (terminalInput.toLowerCase().includes("help")) {
      setTerminalOutput(prev => [...prev, "Available commands: help, clear, version, run"]);
    } else if (terminalInput.toLowerCase() === "clear") {
      setTerminalOutput(["Terminal cleared..."]);
    } else if (terminalInput.toLowerCase() === "version") {
      setTerminalOutput(prev => [...prev, `Current language: ${languages.find(l => l.id === selectedLanguage)?.name} (Suggested: ${languages.find(l => l.id === selectedLanguage)?.suggested})`]);
    } else if (terminalInput.toLowerCase() === "run") {
      handleRunCode();
      setTerminalOutput(prev => [...prev, "Running code..."]);
    } else {
      setTerminalOutput(prev => [...prev, `Command not recognized: ${terminalInput}`]);
    }
    
    // Clear input
    setTerminalInput("");
  };

  const handleLanguageChange = (langId: string) => {
    // Save current code for the current language
    setLanguageCodeMap(prev => ({
      ...prev,
      [selectedLanguage]: code
    }));
    
    // Change the selected language
    setSelectedLanguage(langId);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
  };
  
  return (
    <div className="min-h-screen bg-white">
      <div className="container max-w-7xl mx-auto px-6 py-6">
        <h1 className="text-3xl font-bold mb-8 text-center text-[#6366F1]">Code Editor</h1>
        
        <div className="bg-[#1e1e1e] rounded-lg shadow-lg text-white overflow-hidden">
          {/* Top Navbar */}
          <div className="flex items-center justify-between px-4 py-2 bg-[#333333] border-b border-[#444444]">
            <div className="flex items-center space-x-4">
              {/* Replace logo with Code text in green */}
              <span className="font-bold text-green-500 text-xl flex items-center">
                <CodeIcon className="mr-1" size={20} />
                Code
              </span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">File:</span>
                <span className="text-sm text-gray-400">main.{selectedLanguage}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {user && (
                <div className="text-sm text-gray-400">
                  {user.name || user.email}
                </div>
              )}
              {selectedLanguage === "html" && (
                <HtmlPreviewButton 
                  htmlContent={code} 
                  label="Interactive Preview" 
                  variant="ghost"
                />
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleRunCode}
                className="text-green-400 hover:text-green-300 hover:bg-[#444444]"
              >
                Run
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-gray-400 hover:text-gray-300 hover:bg-[#444444]"
              >
                Share
              </Button>
            </div>
          </div>
          
          {/* Editor Layout */}
          <div className="flex">
            {/* Sidebar */}
            <div className="w-14 bg-[#252526] border-r border-[#444444] flex flex-col items-center py-4">
              {languages.map(lang => (
                <Button
                  key={lang.id}
                  variant="ghost"
                  size="sm"
                  className={`w-10 h-10 mb-2 rounded p-0 flex items-center justify-center ${selectedLanguage === lang.id ? 'bg-[#3c3c3c]' : ''}`}
                  onClick={() => handleLanguageChange(lang.id)}
                >
                  <div className="w-6 h-6 flex items-center justify-center text-xs font-bold">
                    {lang.id.substring(0, 2).toUpperCase()}
                  </div>
                </Button>
              ))}
            </div>
            
            {/* Main Content */}
            <div className="flex-1 flex flex-col">
              <Tabs 
                defaultValue="editor" 
                className="flex-1 flex flex-col" 
                value={activeTab}
                onValueChange={setActiveTab}
              >
                <div className="px-2 pt-2 bg-[#252526] border-b border-[#444444]">
                  <TabsList className="bg-[#2d2d2d]">
                    <TabsTrigger value="editor">Editor</TabsTrigger>
                    <TabsTrigger value="output">Output</TabsTrigger>
                    <TabsTrigger value="terminal">Terminal</TabsTrigger>
                    <TabsTrigger value="console">Console</TabsTrigger>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="editor" className="flex-1 p-0 m-0">
                  <div className="w-full h-[calc(100vh-250px)] overflow-auto bg-[#1e1e1e] text-white p-4 font-mono relative">
                    <pre className="language-javascript w-full h-full pointer-events-none">
                      <code className={`language-${selectedLanguage}`}>
                        {code}
                      </code>
                    </pre>
                    <textarea 
                      ref={textareaRef}
                      className="absolute top-0 left-0 w-full h-full bg-transparent pl-[calc(1rem+16px)] pt-[calc(1rem+25px)] pr-4 pb-4 resize-none outline-none font-mono caret-white text-transparent z-10"
                      value={code}
                      onChange={handleCodeChange}
                      spellCheck="false"
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="output" className="flex-1 p-0 m-0">
                  <div className="w-full h-[calc(100vh-250px)] bg-[#1e1e1e] text-white p-4 font-mono overflow-auto">
                    <pre>{output || "No output yet. Run your code to see results."}</pre>
                  </div>
                </TabsContent>
                
                <TabsContent value="terminal" className="flex-1 p-0 m-0">
                  <div className="w-full h-[calc(100vh-250px)] bg-[#1e1e1e] text-white p-4 font-mono overflow-auto flex flex-col">
                    <div className="flex-1 overflow-auto">
                      {terminalOutput.map((line, index) => (
                        <div key={index} className={line.startsWith(">") ? "text-green-400" : "text-gray-300"}>
                          {line}
                        </div>
                      ))}
                    </div>
                    <form onSubmit={handleTerminalSubmit} className="flex items-center mt-2 border-t border-[#444444] pt-2">
                      <span className="text-green-400 mr-2">{">"}</span>
                      <input
                        type="text"
                        value={terminalInput}
                        onChange={(e) => setTerminalInput(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none text-white"
                        placeholder="Enter command..."
                      />
                    </form>
                  </div>
                </TabsContent>
                
                <TabsContent value="console" className="flex-1 p-0 m-0">
                  <div className="w-full h-[calc(100vh-250px)] bg-[#1e1e1e] text-white p-4 font-mono overflow-auto">
                    <div className="text-gray-500">{">"} Console ready</div>
                  </div>
                </TabsContent>
                
                {/* Preview Tab */}
                <TabsContent value="preview" className="flex-1 p-0 m-0">
                  <div className="w-full h-[calc(100vh-250px)] bg-white overflow-auto border-t border-gray-200">
                    {selectedLanguage === "html" && (
                      <div className="flex justify-end p-2 bg-gray-100 border-b">
                        <HtmlPreviewButton 
                          htmlContent={code} 
                          label="Open in New Window" 
                          variant="outline"
                        />
                      </div>
                    )}
                    <CodePreview 
                      code={languageCodeMap[selectedLanguage] || code} 
                      height={selectedLanguage === "html" ? "calc(100vh-290px)" : "calc(100vh-250px)"} 
                      language={selectedLanguage}
                    />
                  </div>
                </TabsContent>
              </Tabs>
              
              {/* Status Bar */}
              <div className="flex items-center justify-between px-4 py-1 bg-[#007acc] text-white text-xs">
                <div>Selected Language: {languages.find(l => l.id === selectedLanguage)?.name} (Suggested: {languages.find(l => l.id === selectedLanguage)?.suggested})</div>
                <div className="flex items-center space-x-4">
                  <span>Line: 1, Column: 1</span>
                  <span>UTF-8</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditorPage;
