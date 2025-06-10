
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "@/context/ClerkAuthContext";
import { useNavigate } from "react-router-dom";
import { X, Upload, Code, Eye, Maximize, Minimize } from "lucide-react";
import { cloudinaryConfig, validateImage, uploadToCloudinary } from "@/lib/cloudinary";
import { analyzeImage, generateCodeFromWireframe } from "@/lib/openrouter";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CodePreview from "@/components/CodePreview";

// Helper function to detect the language of the generated code
const detectCodeLanguage = (code: string | null, description: string): string | undefined => {
  if (!code) return undefined;
  
  // Check if it's HTML
  if (
    code.includes('<!DOCTYPE html>') || 
    code.includes('<html>') || 
    description.toLowerCase().includes('html')
  ) {
    return 'html';
  }
  
  // Check if it's React code
  if (
    code.includes('import React') || 
    code.includes('from "react"') || 
    code.includes('from \'react\'') || 
    code.includes('<React.') || 
    code.includes('useState') || 
    code.includes('useEffect') || 
    code.includes('className=') ||
    (code.match(/<[A-Z][A-Za-z0-9]*/) !== null) || // JSX component tags
    description.toLowerCase().includes('react')
  ) {
    return 'react';
  }
  
  // Default to undefined if we can't determine
  return undefined;
};

const WorkspacePage = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>("llava");  // Default to llava
  const [description, setDescription] = useState("");
  const [isConverting, setIsConverting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isWireframe, setIsWireframe] = useState<boolean | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [wireframeAnalysis, setWireframeAnalysis] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<string>("code");
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Ensure OpenRouter API key is available
  useEffect(() => {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    if (!apiKey) {
      console.warn("OpenRouter API key not found. Code generation may not work properly.");
    }
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate image
      const validation = validateImage(file);
      if (!validation.valid) {
        toast.error(validation.message);
        return;
      }
      
      setSelectedImage(file);
      const objectUrl = URL.createObjectURL(file);
      setImageUrl(objectUrl);
      
      // Reset states when new image is selected
      setIsWireframe(null);
      setWireframeAnalysis(null);
      setGeneratedCode(null);
      
      console.log("Image selected:", {
        name: file.name,
        size: `${(file.size / 1024).toFixed(2)} KB`,
        type: file.type,
        objectUrl
      });
    }
  };

  const validateWireframe = async () => {
    if (!imageUrl) {
      toast.error("No image selected");
      return false;
    }
    
    setIsWireframe(null);
    setIsAnalyzing(true);
    setError(null);
    
    try {
      // If the image is still a blob URL (not yet uploaded to cloudinary)
      let imageUrlToAnalyze = imageUrl;
      if (imageUrl.startsWith('blob:') && selectedImage) {
        toast.info("Uploading image for analysis...");
        imageUrlToAnalyze = await uploadToCloudinary(selectedImage);
        setImageUrl(imageUrlToAnalyze);
      }
      
      // Use OpenRouter AI to analyze the image
      const analysisResult = await analyzeImage(imageUrlToAnalyze);
      setWireframeAnalysis(analysisResult);
      
      const isWireframe = analysisResult.isWireframe;
      setIsWireframe(isWireframe);
      
      if (isWireframe) {
        toast.success(`Image validated as wireframe (${Math.round(analysisResult.confidence * 100)}% confidence)`);
      } else {
        toast.warning("The uploaded image doesn't appear to be a wireframe");
      }
      
      return isWireframe;
    } catch (error) {
      console.error("Error validating wireframe:", error);
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to validate wireframe: ${errorMsg}`);
      setError(`Failed to validate wireframe: ${errorMsg}`);
      setIsWireframe(false);
      return false;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedImage) {
      toast.error("No image selected");
      return null;
    }
    
    setIsUploading(true);
    setError(null);
    
    try {
      const uploadedUrl = await uploadToCloudinary(selectedImage);
      setImageUrl(uploadedUrl);
      toast.success("Image uploaded successfully!");
      return uploadedUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to upload image: ${errorMsg}`);
      setError(`Failed to upload image: ${errorMsg}`);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleClearImage = () => {
    if (imageUrl && imageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(imageUrl);
    }
    
    setSelectedImage(null);
    setImageUrl(null);
    setIsWireframe(null);
    setWireframeAnalysis(null);
    setGeneratedCode(null);
    setError(null);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Save the generated code as a template in localStorage
  const saveAsTemplate = (imageUrl: string, code: string, customTitle?: string) => {
    try {
      // Create a title from the description (up to 50 chars) or use custom title if provided
      const title = customTitle || (description.length > 50 ? `${description.substring(0, 47)}...` : description);
      
      // Get current templates from localStorage
      const storedTemplates = localStorage.getItem('userCreatedTemplates');
      let templates = [];
      
      if (storedTemplates) {
        templates = JSON.parse(storedTemplates);
      }
      
      // Create new template object
      const newTemplate = {
        id: `user-${Date.now()}`,
        title,
        imageUrl,
        category: "User Created",
        aiModel: "Gemini AI",
        aiLogo: "/google-logo.png",
        description: `Converted wireframe: ${description.substring(0, 100)}${description.length > 100 ? '...' : ''}`,
        code,
        createdAt: Date.now(),
        isUserCreated: true
      };
      
      // Add new template to the array
      templates.unshift(newTemplate); // Add to the beginning of the array
      
      // Save to localStorage
      localStorage.setItem('userCreatedTemplates', JSON.stringify(templates));
      
      toast.success("Wireframe saved to Design tab!");
      return newTemplate.id; // Return the ID of the newly created template
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error("Failed to save design template");
      return null;
    }
  };

  const handleConvertToCode = async () => {
    if (!user) {
      toast.error("Please log in to continue");
      navigate("/login");
      return;
    }
    
    if (!selectedImage && !imageUrl) {
      toast.error("Please select an image");
      return;
    }
    
    if (!selectedModel) {
      toast.error("Please select an AI model");
      return;
    }
    
    if (!description) {
      toast.error("Please provide a description");
      return;
    }
    
    setIsConverting(true);
    setError(null);
    
    try {
      // Upload image first if not already uploaded to cloudinary
      let finalImageUrl = imageUrl;
      if (imageUrl?.startsWith('blob:') && selectedImage) {
        toast.info("Uploading image for processing...");
        finalImageUrl = await handleImageUpload();
      }
      
      if (!finalImageUrl) {
        toast.error("Failed to process image");
        return;
      }
      
      // Validate if the image is a wireframe
      const isValidWireframe = isWireframe === null ? await validateWireframe() : isWireframe;
      
      if (!isValidWireframe) {
        toast.warning("This doesn't appear to be a wireframe. Results may not be accurate.");
        // Continuing with conversion anyway, but with a warning
      }
      
      toast.info(`Generating code using ${selectedModel}...`);
      
      // Generate code using selected AI model
      const code = await generateCodeFromWireframe(finalImageUrl, description, selectedModel);
      
      // Display the generated code
      setGeneratedCode(code);
      setActiveTab("preview"); // Switch to preview tab automatically
      
      toast.success("Conversion complete! Your code is ready.");
    } catch (error) {
      console.error("Error converting image:", error);
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to convert image to code: ${errorMsg}`);
      setError(`Failed to convert image to code: ${errorMsg}`);
    } finally {
      setIsConverting(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-8 text-center text-foreground">Convert Wireframe to Code</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left side - Upload wireframe */}
          <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center text-card-foreground">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white flex items-center justify-center mr-2">
                  <span>1</span>
                </div>
                Upload Image
              </h2>
              
              {imageUrl ? (
                <div className="relative">
                  <img 
                    src={imageUrl} 
                    alt="Selected wireframe" 
                    className="w-full h-auto rounded-lg border border-gray-200 shadow-md"
                    onError={() => {
                      toast.error("Failed to load image");
                      setError("Failed to load image - URL might be invalid");
                    }}
                  />
                  <button
                    onClick={handleClearImage}
                    className="absolute top-2 right-2 bg-gray-800 rounded-full p-1 shadow-md hover:bg-gray-700 transition-colors"
                  >
                    <X size={18} className="text-white" />
                  </button>
                  
                  {isWireframe !== null && (
                    <div className={`absolute bottom-2 right-2 rounded-full px-3 py-1 text-xs font-medium text-white ${
                      isWireframe ? 'bg-green-500' : 'bg-amber-500'
                    }`}>
                      {isWireframe ? 'Valid Wireframe' : 'Not a Wireframe'}
                    </div>
                  )}
                </div>
              ) : (
                <div 
                  className="border-2 border-dashed border-border rounded-lg p-10 text-center cursor-pointer hover:bg-muted/20 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="mx-auto w-16 h-16 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] bg-opacity-10 rounded-full flex items-center justify-center mb-4">
                    <Upload size={28} className="text-white" />
                  </div>
                  <p className="text-muted-foreground mb-2">Click to upload your wireframe image</p>
                  <p className="text-muted-foreground text-sm mb-3">Supports PNG, JPG, JPEG, GIF, SVG (Max 20MB)</p>
                  <Button variant="outline" className="mx-auto hover:bg-gradient-to-r hover:from-[#6366F1] hover:to-[#8B5CF6] hover:text-white transition-colors">
                    Select Image
                  </Button>
                </div>
              )}
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                className="hidden"
              />
              
              {error && (
                <Alert className="mt-4 bg-red-50 border-red-200">
                  <AlertDescription className="text-red-700">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
          
          {/* Right side - AI settings */}
          <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
            {/* AI Model selection */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center text-card-foreground">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white flex items-center justify-center mr-2">
                  <span>2</span>
                </div>
                Select AI Model
              </h2>
              
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select AI Model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gemini">
                    <div className="flex items-center">
                      <img src="/gemini-logo.jpeg" alt="Gemini" className="w-5 h-5 mr-2" />
                      Gemini AI
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center text-card-foreground">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white flex items-center justify-center mr-2">
                  <span>3</span>
                </div>
                Enter Description about your webpage
              </h2>
              
              <Textarea
                placeholder="Describe what your web page should do, specify functionality, layout preferences, color schemes, etc."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-32 resize-none bg-secondary text-secondary-foreground"
              />
              
              {description.length > 0 && description.length < 20 && (
                <p className="text-amber-400 mt-2 text-sm">
                  Add more details to get better results (at least 20 characters)
                </p>
              )}
            </div>
            
            {/* Convert button */}
            <Button 
              onClick={handleConvertToCode}
              className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white hover:from-[#5253d4] hover:to-[#7a4ce4] transition-all duration-300"
              disabled={!imageUrl || !selectedModel || !description || isConverting || isUploading || isAnalyzing}
            >
              {isConverting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Converting...
                </>
              ) : isAnalyzing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                </>
              ) : isUploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </>
              ) : (
                <>Convert to Code</>
              )}
            </Button>
          </div>
        </div>
        
        {/* Generated Code Section */}
        {generatedCode && (
          <div ref={previewContainerRef} className={`mt-8 bg-card rounded-xl p-6 shadow-lg border border-border ${isFullscreen ? 'fixed inset-0 z-50 mt-0 rounded-none' : ''}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold flex items-center text-card-foreground">
                <Code className="mr-2" /> Generated Code
              </h2>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={toggleFullscreen}
                title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
              </Button>
            </div>
            
            {wireframeAnalysis && (
              <Alert className="mb-4 bg-blue-50 border-blue-200">
                <AlertDescription>
                  <div className="flex flex-col gap-1">
                    <div><span className="font-medium">Analysis:</span> {wireframeAnalysis.isWireframe ? 'Valid wireframe detected' : 'Not a wireframe'}</div>
                    <div><span className="font-medium">Confidence:</span> {Math.round(wireframeAnalysis.confidence * 100)}%</div>
                    {wireframeAnalysis.suggested && (
                      <div><span className="font-medium">Suggested:</span> {wireframeAnalysis.suggested}</div>
                    )}
                    {wireframeAnalysis.elements && (
                      <div><span className="font-medium">Detected Elements:</span> {wireframeAnalysis.elements.join(', ')}</div>
                    )}
                    {wireframeAnalysis.wireframeDetails?.structure && (
                      <div><span className="font-medium">Structure:</span> {wireframeAnalysis.wireframeDetails.structure}</div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <Tabs defaultValue="preview" value={activeTab} onValueChange={setActiveTab} className="mt-4">
              <TabsList>
                <TabsTrigger value="code" className="flex items-center">
                  <Code size={16} className="mr-1" />
                  Code
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex items-center">
                  <Eye size={16} className="mr-1" />
                  Preview
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="code" className="mt-4 code-editor-container">
                <div className="bg-black text-gray-100 p-4 rounded-md overflow-x-auto max-h-[600px] overflow-y-auto">
                  <pre className="text-sm pl-3"><code>{generatedCode}</code></pre>
                </div>
              </TabsContent>
              
              <TabsContent value="preview" className="mt-4">
                <div className="bg-white border border-gray-200 rounded-md h-[600px]">
                  <CodePreview 
                    code={generatedCode} 
                    height="600px" 
                    language={detectCodeLanguage(generatedCode, description)}
                  />
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="mt-4 flex justify-end">
              <Button 
                variant="outline" 
                className="mr-2"
                onClick={() => {
                  navigator.clipboard.writeText(generatedCode);
                  toast.success("Code copied to clipboard");
                }}
              >
                Copy Code
              </Button>
              
              <Button 
                onClick={() => navigate("/editor", { 
                  state: { generatedCode, language: description.toLowerCase().includes('html') ? 'html' : 'jsx' } 
                })}
                className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white mr-2"
              >
                Open in Editor
              </Button>
              
              <Button 
                onClick={() => {
                  // Open a prompt for custom title
                  const customTitle = prompt("Enter a title for your saved template:", 
                    description.length > 50 ? `${description.substring(0, 47)}...` : description
                  );
                  
                  if (customTitle) {
                    // Save with custom title
                    const savedId = saveAsTemplate(imageUrl, generatedCode, customTitle);
                    if (savedId) {
                      toast.success(`Saved as "${customTitle}" in Design tab`);
                    }
                  }
                }}
                className="bg-green-600 hover:bg-green-700 text-white mr-2"
              >
                Save Template
              </Button>
              
              <Button 
                onClick={() => navigate("/design")}
                variant="outline"
              >
                View All Templates
              </Button>
            </div>
          </div>
        )}
        
        <style>{`
          .code-editor-container::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          .code-editor-container::-webkit-scrollbar-track {
            background: #f1f1f1;
          }
          .code-editor-container::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 4px;
          }
          .code-editor-container::-webkit-scrollbar-thumb:hover {
            background: #555;
          }
        `}</style>
      </div>
    </div>
  );
};

export default WorkspacePage;
