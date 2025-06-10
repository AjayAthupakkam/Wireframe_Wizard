// Gemini API integration for wireframe-to-code conversion
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta';
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'not-set';
const GEMINI_MODEL = 'gemini-2.0-flash';

import { AnalysisResponse } from './openrouter';

/**
 * Analyze an image using Gemini Vision capabilities to identify wireframe elements
 * @param imageUrl URL of the wireframe image to analyze
 * @returns Analysis response with wireframe details
 */
export const analyzeImageWithGemini = async (imageUrl: string): Promise<AnalysisResponse> => {
  try {
    console.log('Analyzing image with Gemini:', imageUrl);
    
    // Check if the image URL is valid
    if (!imageUrl) {
      throw new Error('Invalid image URL');
    }
    
    // Convert image URL to base64 if it's a remote URL
    let imageContent;
    if (imageUrl.startsWith('data:')) {
      // Already a data URL
      imageContent = imageUrl.split(',')[1];
    } else {
      // Fetch the image and convert to base64
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      imageContent = await convertBlobToBase64(blob);
    }
    
    // Construct the prompt for wireframe analysis
    const prompt = `
      Analyze this wireframe image in detail. Identify:
      1. All UI components present (buttons, forms, navigation, etc.)
      2. The layout structure and organization
      3. Any interactive elements
      4. The general purpose of this wireframe (e-commerce, blog, dashboard, etc.)
      5. Color scheme if visible
      
      Provide a structured analysis that can be used for code generation.
    `;
    
    // Make API request to Gemini
    const apiUrl = `${GEMINI_API_URL}/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: 'image/jpeg',
                data: imageContent
              }
            }
          ]
        }]
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API error: ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    const analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!analysisText) {
      throw new Error('No analysis returned from Gemini');
    }
    
    // Extract structured data from the analysis text
    // This is a simple implementation - in production you would want more robust parsing
    const isEcommerce = analysisText.toLowerCase().includes('e-commerce') || 
                       analysisText.toLowerCase().includes('product') ||
                       analysisText.toLowerCase().includes('shop');
    
    // Extract component mentions
    const componentMatches = analysisText.match(/button|form|nav|header|footer|image|gallery|search|menu|card|section/gi) || [];
    const uniqueComponents = Array.from(new Set(componentMatches)) as string[];
    
    return {
      isWireframe: true,
      confidence: 0.95,
      suggested: 'HTML CSS',
      elements: extractElements(analysisText),
      layout: {
        type: determineLayoutType(analysisText),
        sections: extractSections(analysisText)
      },
      colorScheme: extractColors(analysisText),
      wireframeDetails: {
        components: uniqueComponents,
        structure: extractStructure(analysisText),
        interactions: extractInteractions(analysisText),
        dimensionsEstimate: 'Desktop view, approximately 1200px width'
      }
    };
  } catch (error) {
    console.error('Error analyzing image with Gemini:', error);
    throw new Error(`Failed to analyze image with Gemini: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Generate code from a wireframe image and description using Gemini
 * @param imageUrl URL of the wireframe image
 * @param description User's description of what they want
 * @returns Generated code as a string
 */
export const generateCodeWithGemini = async (
  imageUrl: string,
  description: string,
  modelId: string = "gemini"
): Promise<string> => {
  try {
    console.log('Generating code with Gemini from:', imageUrl);
    console.log('Description:', description);
    
    // Check if the image URL is valid
    if (!imageUrl) {
      throw new Error('Invalid image URL');
    }
    
    // Convert image URL to base64 if it's a remote URL
    let imageContent;
    if (imageUrl.startsWith('data:')) {
      // Already a data URL
      imageContent = imageUrl.split(',')[1];
    } else {
      // Fetch the image and convert to base64
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      imageContent = await convertBlobToBase64(blob);
    }
    
    // Determine if user wants React or HTML/CSS
    // Check if HTML/CSS is explicitly requested - this takes highest priority
    const isHtmlExplicitlyRequested = description.toLowerCase().includes('html and css only') ||
                                    description.toLowerCase().includes('html & css only') ||
                                    description.toLowerCase().includes('html css only') ||
                                    description.toLowerCase().includes('only html') ||
                                    description.toLowerCase().includes('only html and css') ||
                                    description.toLowerCase().includes('give the code in html') ||
                                    description.toLowerCase().includes('generate html');
    
    // If HTML is explicitly requested, we'll prioritize that over React
    if (isHtmlExplicitlyRequested) {
      console.log('User explicitly requested HTML/CSS code');
    }
    
    // Check if React is requested (but only if HTML isn't explicitly requested)
    const isReactRequested = !isHtmlExplicitlyRequested && (
                           description.toLowerCase().includes('react') || 
                           description.toLowerCase().includes('jsx') ||
                           description.toLowerCase().includes('component') ||
                           description.toLowerCase().includes('hooks') ||
                           description.toLowerCase().includes('useState'));
    
    // Default to HTML/CSS unless React is explicitly requested
    // This makes HTML/CSS the default output format
    const isHtmlCssRequested = isHtmlExplicitlyRequested || 
                             !isReactRequested || 
                             description.toLowerCase().includes('html') || 
                             description.toLowerCase().includes('css') || 
                             description.toLowerCase().includes('default');
    
    // Add interactivity requirement to description
    const enhancedDescription = description + " Make it fully interactive with JavaScript functionality.";
    
    // Construct the prompt for code generation
    const prompt = `
      You are a senior full-stack developer tasked with converting a wireframe into fully functional, production-ready code.
      
      IMPORTANT: You MUST generate COMPLETE, UNCONDENSED CODE with NO ABBREVIATIONS, NO PLACEHOLDERS, and NO TRUNCATIONS.
      
      ${isReactRequested 
        ? 'IMPORTANT: The user has specifically requested REACT code. You MUST generate React components, NOT HTML/CSS.'
        : 'IMPORTANT: Generate complete HTML with inline CSS code based on this wireframe image. Do NOT generate React components unless specifically requested.'}
      
      User's requirements: ${enhancedDescription}
      
      The code should:
      1. Be 100% complete and fully functional - ready to copy and paste into a project
      2. Include ALL necessary imports, dependencies, and boilerplate
      3. Follow best practices for accessibility and responsive design
      4. Be well-structured and organized
      5. Include comments only where absolutely necessary
      
      ${isReactRequested || !isHtmlCssRequested 
        ? '// REACT-SPECIFIC REQUIREMENTS:\n' +
          '1. Create a modern React component structure\n' +
          '2. Include all necessary React imports (React, useState, useEffect, etc.)\n' +
          '3. Use functional components with hooks\n' +
          '4. Use inline style objects (style={{property: \'value\'}})\n' +
          '5. Make all UI elements fully interactive with proper event handlers\n' +
          '6. Include state management for all interactive elements\n' +
          '7. Export the component as default\n' +
          '8. Make sure the component can be imported and used in a React application'
        : '// HTML-SPECIFIC REQUIREMENTS:\n' +
          '1. Use inline styles directly on HTML elements\n' +
          '2. Add JavaScript event handlers directly in the HTML\n' +
          '3. Include onclick, onchange, onsubmit handlers for interactive elements\n' +
          '4. Include a complete JavaScript section at the end of the HTML file\n' +
          '5. Make sure all interactive elements are fully functional'}
      
      EXTREMELY IMPORTANT: You MUST provide the COMPLETE CODE without any missing parts, placeholders, or comments like "//more code here" or "//additional implementation". DO NOT truncate or abbreviate any part of the code. Include ALL import statements, ALL function implementations, and ALL event handlers.
      
      ${isReactRequested || !isHtmlCssRequested 
        ? 'Return a complete React component with ALL imports, ALL state variables, ALL event handlers, and ALL helper functions. The code should start with import statements and end with export default ComponentName. DO NOT RETURN HTML CODE.' 
        : 'Return the complete HTML with inline styles and embedded JavaScript to make all UI elements interactive. Include <script> tags with all event handler functions at the end of the document.'}
      
      I need to use this code directly without modification, so make sure it is 100% complete and functional.
    `;
    
    // Make API request to Gemini
    const apiUrl = `${GEMINI_API_URL}/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: 'image/jpeg',
                data: imageContent
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 100000,
          topK: 40,
          topP: 0.95
        }
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API error: ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    let generatedCode = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedCode) {
      throw new Error('No code generated from Gemini');
    }
    
    // Clean up the generated code - remove markdown code block markers if present
    generatedCode = generatedCode.replace(/```(html|css|jsx|tsx|javascript|js|react)?\n/g, '');
    generatedCode = generatedCode.replace(/```\n?$/g, '');
    
    // Process the code to ensure styles are inline and interactivity is present
    if (!isHtmlCssRequested) {
      // For React code, check if it still contains Tailwind classes and add a warning
      if (generatedCode.includes('className=') && 
          (generatedCode.includes('text-') || 
           generatedCode.includes('bg-') || 
           generatedCode.includes('flex') || 
           generatedCode.includes('grid') || 
           generatedCode.includes('p-') || 
           generatedCode.includes('m-'))) {
        console.warn('Generated React code may still contain Tailwind classes instead of inline styles');
        generatedCode = `// Note: This code uses Tailwind classes. You specified inline styles, but the model generated Tailwind styles.\n// If you prefer pure inline styles, you may need to convert these classes to inline style objects.\n\n${generatedCode}`;
      }
      
      // Check if React code has event handlers
      if (!generatedCode.includes('onClick={') && !generatedCode.includes('onChange={') && !generatedCode.includes('onSubmit={')) {
        console.warn('Generated React code may lack interactive event handlers');
        generatedCode = `// Note: This code may lack interactive elements. Consider adding event handlers like onClick, onChange, etc.\n\n${generatedCode}`;
      }
    } else {
      // For HTML code, check if it contains a separate style tag and add a warning
      if (generatedCode.includes('<style>') || generatedCode.includes('<link rel="stylesheet"')) {
        console.warn('Generated HTML code may contain external styles instead of inline styles');
        generatedCode = `<!-- Note: This code contains external styles. You specified inline styles, but the model generated external styles. -->
<!-- If you prefer pure inline styles, you may need to move these styles to inline style attributes. -->\n\n${generatedCode}`;
      }
      
      // Check if HTML code has JavaScript interactivity
      if (!generatedCode.includes('<script>') && !generatedCode.includes('onclick="') && !generatedCode.includes('onchange="')) {
        console.warn('Generated HTML code may lack JavaScript interactivity');
        
        // Add basic script template if missing
        if (!generatedCode.includes('<script>')) {
          generatedCode = generatedCode.replace('</body>', 
`<script>
// Add interactive functionality here
document.addEventListener('DOMContentLoaded', function() {
  // Find all buttons and add click handlers
  const buttons = document.querySelectorAll('button');
  buttons.forEach(button => {
    button.addEventListener('click', function(e) {
      console.log('Button clicked:', e.target.textContent);
      // Add appropriate functionality based on button text/purpose
    });
  });
  
  // Find all forms and add submit handlers
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      console.log('Form submitted');
      // Process form data here
    });
  });
  
  // Find all links and enhance them
  const links = document.querySelectorAll('a:not([href^="http"])');
  links.forEach(link => {
    link.addEventListener('click', function(e) {
      if (!link.getAttribute('href').startsWith('http')) {
        e.preventDefault();
        console.log('Navigation link clicked:', link.textContent);
        // Handle navigation as needed
      }
    });
  });
});
</script>
</body>`);
        }
        
        generatedCode = `<!-- Note: This code may lack sufficient JavaScript interactivity. Basic event handlers have been added. -->
<!-- You may need to customize the event handlers for your specific UI elements. -->\n\n${generatedCode}`;
      }
    }
    
    return generatedCode;
  } catch (error) {
    console.error('Error generating code with Gemini:', error);
    throw new Error(`Failed to generate code with Gemini: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Helper functions for processing analysis results

/**
 * Convert Blob to base64 string
 */
const convertBlobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Extract just the base64 data part (remove the data URL prefix)
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Extract UI elements from analysis text
 */
const extractElements = (text: string): string[] => {
  const commonElements = [
    'Button', 'Navigation', 'Header', 'Footer', 'Form', 'Input',
    'Image', 'Product', 'Gallery', 'Card', 'Search', 'Menu',
    'Carousel', 'List', 'Tab', 'Icon', 'Modal', 'Dropdown'
  ];
  
  return commonElements.filter(element => 
    text.toLowerCase().includes(element.toLowerCase())
  );
};

/**
 * Determine layout type from analysis text
 */
const determineLayoutType = (text: string): string => {
  if (text.toLowerCase().includes('e-commerce') || text.toLowerCase().includes('product')) {
    return 'E-commerce Product Detail Layout';
  }
  if (text.toLowerCase().includes('dashboard')) {
    return 'Dashboard Layout';
  }
  if (text.toLowerCase().includes('landing')) {
    return 'Landing Page Layout';
  }
  if (text.toLowerCase().includes('blog')) {
    return 'Blog Layout';
  }
  return 'General Purpose Layout';
};

/**
 * Extract sections from analysis text
 */
const extractSections = (text: string): string[] => {
  const sections = [];
  
  if (text.toLowerCase().includes('header')) sections.push('Header');
  if (text.toLowerCase().includes('navigation') || text.toLowerCase().includes('nav')) sections.push('Navigation');
  if (text.toLowerCase().includes('footer')) sections.push('Footer');
  if (text.toLowerCase().includes('sidebar')) sections.push('Sidebar');
  if (text.toLowerCase().includes('main')) sections.push('Main Content');
  if (text.toLowerCase().includes('hero')) sections.push('Hero Section');
  if (text.toLowerCase().includes('product') && text.toLowerCase().includes('list')) sections.push('Product Listing');
  if (text.toLowerCase().includes('product') && text.toLowerCase().includes('detail')) sections.push('Product Details');
  if (text.toLowerCase().includes('gallery')) sections.push('Image Gallery');
  
  return sections;
};

/**
 * Extract color scheme from analysis text
 */
const extractColors = (text: string): string[] => {
  const defaultColors = ['#000000', '#ffffff', '#f3f4f6', '#1f2937'];
  
  // Look for color mentions in the text
  const colorMatches = text.match(/(#[0-9a-f]{3,6})|(?:rgb\(\d+,\s*\d+,\s*\d+\))/gi);
  if (colorMatches && colorMatches.length > 0) {
    return Array.from(new Set(colorMatches));
  }
  
  // Look for color names
  const colorNames = ['black', 'white', 'gray', 'blue', 'red', 'green', 'yellow', 'purple', 'pink', 'orange'];
  const mentionedColors = colorNames.filter(color => text.toLowerCase().includes(color));
  
  if (mentionedColors.length > 0) {
    // Map color names to hex values (simplified)
    const colorMap: Record<string, string> = {
      black: '#000000',
      white: '#ffffff',
      gray: '#808080',
      blue: '#0000ff',
      red: '#ff0000',
      green: '#00ff00',
      yellow: '#ffff00',
      purple: '#800080',
      pink: '#ffc0cb',
      orange: '#ffa500'
    };
    
    return mentionedColors.map(color => colorMap[color] || defaultColors[0]);
  }
  
  return defaultColors;
};

/**
 * Extract structure information from analysis text
 */
const extractStructure = (text: string): string => {
  if (text.toLowerCase().includes('grid')) {
    return 'Grid-based layout';
  }
  if (text.toLowerCase().includes('column') || text.toLowerCase().includes('col')) {
    return 'Multi-column layout';
  }
  if (text.toLowerCase().includes('flex')) {
    return 'Flexbox-based layout';
  }
  return 'Standard layout with header, main content, and footer';
};

/**
 * Extract interaction elements from analysis text
 */
const extractInteractions = (text: string): string[] => {
  const interactions = [];
  
  if (text.toLowerCase().includes('button')) interactions.push('Button clicks');
  if (text.toLowerCase().includes('form')) interactions.push('Form submission');
  if (text.toLowerCase().includes('hover')) interactions.push('Hover effects');
  if (text.toLowerCase().includes('dropdown')) interactions.push('Dropdown selection');
  if (text.toLowerCase().includes('menu')) interactions.push('Menu navigation');
  if (text.toLowerCase().includes('carousel') || text.toLowerCase().includes('slider')) interactions.push('Carousel/slider navigation');
  if (text.toLowerCase().includes('modal')) interactions.push('Modal dialogs');
  if (text.toLowerCase().includes('tab')) interactions.push('Tab switching');
  
  return interactions;
}; 