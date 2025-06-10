import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";

interface HtmlPreviewButtonProps {
  htmlContent: string;
  label?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

const HtmlPreviewButton = ({ 
  htmlContent, 
  label = "Open Interactive Preview", 
  variant = "secondary" 
}: HtmlPreviewButtonProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const openInteractivePreview = () => {
    // Create a blob URL from the HTML content
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // Store the URL so we can revoke it later
    setPreviewUrl(url);
    
    // Open the preview in a new window
    window.open(url, '_blank', 'width=1024,height=768');
  };

  // Clean up the blob URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <Button 
      variant={variant} 
      onClick={openInteractivePreview}
      className="flex items-center gap-2"
    >
      <ExternalLink size={16} />
      {label}
    </Button>
  );
};

export default HtmlPreviewButton; 