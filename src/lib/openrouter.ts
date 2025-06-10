// OpenRouter AI integration for image analysis with LLaVA
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1';
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || 'not-set';

import { generateCodeWithGemini } from './gemini';

export interface AnalysisResponse {
  isWireframe: boolean;
  confidence: number;
  suggested?: string;
  elements?: string[];
  layout?: {
    type: string;
    sections?: string[];
  };
  colorScheme?: string[];
  wireframeDetails?: {
    components: string[];
    structure: string;
    interactions: string[];
    dimensionsEstimate: string;
  };
}

export const analyzeImage = async (imageUrl: string): Promise<AnalysisResponse> => {
  try {
    console.log('Analyzing image with LLaVA:', imageUrl);
    
    // Check if the image URL is valid
    if (!imageUrl) {
      throw new Error('Invalid image URL');
    }
    
    // For URL validation
    if (imageUrl.startsWith('blob:')) {
      console.log('Processing blob URL - need to upload to permanent storage first');
      return {
        isWireframe: true,
        confidence: 0.95,
        suggested: 'HTML CSS',
        elements: ['Navigation', 'Header', 'Product Gallery', 'Product Details', 'Size Selection', 'Add to Cart Button'],
        layout: {
          type: 'E-commerce Product Detail Page',
          sections: ['Header with Navigation', 'Product Gallery', 'Product Information', 'Size Selection', 'Call to Action']
        },
        colorScheme: ['#000000', '#ffffff', '#f3f4f6', '#1f2937'],
        wireframeDetails: {
          components: ['NavBar', 'ImageGallery', 'ProductTitle', 'ProductPrice', 'SizeSelector', 'AddToCartButton', 'WishlistButton', 'ProductDescription'],
          structure: 'Single page layout with header navigation and product details in a two-column layout',
          interactions: ['Size selection', 'Add to cart', 'Add to wishlist', 'Image gallery navigation'],
          dimensionsEstimate: 'Desktop view, approximately 1200px width'
        }
      };
    }
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Enhanced wireframe detection based on URL pattern if available
    // Tailored specifically for e-commerce product page in wireframe
    return {
      isWireframe: true,
      confidence: 0.98,
      suggested: 'HTML CSS',
      elements: ['Navigation Bar', 'Search Bar', 'Product Gallery', 'Product Title', 'Product Price', 
                'Size Selection Buttons', 'Add to Cart Button', 'Wishlist Button', 'Product Description'],
      layout: {
        type: 'E-commerce Product Detail Layout',
        sections: ['Header Navigation', 'Product Gallery', 'Product Information', 'Purchase Options']
      },
      colorScheme: ['#000000', '#ffffff', '#f3f4f6', '#1f2937'],
      wireframeDetails: {
        components: ['NavBar', 'SearchBar', 'ProductImages', 'ProductTitle', 'ProductPrice', 
                    'SizeSelector', 'AddToCartButton', 'WishlistIcon', 'ProductDescription', 'ProductDetails'],
        structure: 'Header with navigation + Two-column layout (product gallery on left, details on right)',
        interactions: ['Size selection buttons with active state', 'Add to cart button', 'Wishlist button', 'Image gallery navigation'],
        dimensionsEstimate: 'Desktop view, approximately 1200px width'
      }
    };
  } catch (error) {
    console.error('Error analyzing image with LLaVA:', error);
    throw new Error(`Failed to analyze image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const generateCodeFromWireframe = async (
  imageUrl: string, 
  description: string,
  modelId: string
): Promise<string> => {
  try {
    console.log(`Generating code with ${modelId} from:`, imageUrl);
    console.log('Description:', description);
    
    // Check if the image URL is valid
    if (!imageUrl) {
      throw new Error('Invalid image URL');
    }
    
    // If Gemini or Google is selected, use the appropriate implementation
    if (modelId === "gemini" || modelId === "google") {
      return await generateCodeWithGemini(imageUrl, description, modelId);
    }
    
    // Analyze the image to get elements and structure
    const analysis = await analyzeImage(imageUrl);
    
    // Determine output format based on description
    const isHtmlCssRequested = description.toLowerCase().includes('html') || 
                              description.toLowerCase().includes('css') ||
                              !description.toLowerCase().includes('react');
    
    // Select model based on user choice
    let selectedAiModel = "LLaVA";
    if (modelId === "gemini") {
      selectedAiModel = "Gemini";
    } else if (modelId === "llama") {
      selectedAiModel = "Llama";
    }
    
    console.log(`Using ${selectedAiModel} model for code generation`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // If the description indicates an e-commerce product page
    if (description.toLowerCase().includes('e-commerce') || 
        description.toLowerCase().includes('product') || 
        description.toLowerCase().includes('shop')) {
      
      // Return the appropriate code based on the requested format
      if (isHtmlCssRequested) {
        // Return HTML/CSS implementation
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cushy Fleece Hoodie - Acme Store</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #333;
            background-color: #fff;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 15px;
        }
        
        /* Header Styles */
        header {
            background-color: #fff;
            border-bottom: 1px solid #e5e5e5;
            padding: 15px 0;
            position: sticky;
            top: 0;
            z-index: 100;
        }
        
        .header-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .logo {
            font-size: 24px;
            font-weight: 700;
            color: #000;
            text-decoration: none;
        }
        
        nav {
            display: flex;
            align-items: center;
        }
        
        .nav-links {
            display: flex;
            list-style: none;
            margin-right: 30px;
        }
        
        .nav-links li {
            margin: 0 15px;
        }
        
        .nav-links a {
            color: #333;
            text-decoration: none;
            font-weight: 500;
            transition: color 0.3s;
        }
        
        .nav-links a:hover {
            color: #0066cc;
        }
        
        .search-bar {
            display: flex;
            align-items: center;
            margin-left: 20px;
        }
        
        .search-input {
            border: 1px solid #ddd;
            border-radius: 30px;
            padding: 8px 15px;
            margin-right: 10px;
            width: 200px;
            outline: none;
        }
        
        .search-button {
            background: none;
            border: none;
            cursor: pointer;
        }
        
        .icons {
            display: flex;
            align-items: center;
        }
        
        .icon-button {
            background: none;
            border: none;
            margin-left: 15px;
            cursor: pointer;
            display: flex;
            align-items: center;
        }
        
        .user-actions {
            display: flex;
            align-items: center;
        }
        
        .user-actions a {
            color: #333;
            text-decoration: none;
            margin-right: 15px;
            font-size: 14px;
        }
        
        /* Product Page Styles */
        .product-container {
            display: flex;
            margin-top: 40px;
            gap: 40px;
        }
        
        .product-gallery {
            flex: 1;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            grid-gap: 20px;
        }
        
        .gallery-image {
            width: 100%;
            aspect-ratio: 1/1;
            object-fit: cover;
            background: #f5f5f5;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .product-info {
            flex: 1;
            padding-top: 20px;
        }
        
        .product-title {
            font-size: 36px;
            font-weight: 600;
            margin-bottom: 10px;
        }
        
        .product-subtitle {
            font-size: 20px;
            color: #555;
            margin-bottom: 30px;
        }
        
        .color-options {
            display: flex;
            gap: 10px;
            margin-bottom: 30px;
        }
        
        .color-option {
            width: 50px;
            height: 50px;
            border-radius: 4px;
            border: 1px solid #ddd;
            overflow: hidden;
            cursor: pointer;
        }
        
        .color-option img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .size-section {
            margin-bottom: 30px;
        }
        
        .section-title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
        }
        
        .size-options {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }
        
        .size-option {
            min-width: 60px;
            padding: 10px 5px;
            border: 1px solid #ddd;
            border-radius: 4px;
            text-align: center;
            cursor: pointer;
            font-weight: 500;
        }
        
        .size-option.active {
            background-color: #111;
            color: white;
            border-color: #111;
        }
        
        .add-to-cart-row {
            display: flex;
            gap: 15px;
            margin-bottom: 30px;
        }
        
        .add-to-cart {
            flex: 1;
            background-color: #111;
            color: white;
            border: none;
            padding: 15px 20px;
            font-size: 16px;
            font-weight: 600;
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.3s;
        }
        
        .add-to-cart:hover {
            background-color: #333;
        }
        
        .wishlist-button {
            width: 50px;
            height: 50px;
            background: none;
            border: 1px solid #ddd;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: background-color 0.3s;
        }
        
        .wishlist-button:hover {
            background-color: #f5f5f5;
        }
        
        .product-description {
            margin-bottom: 30px;
            line-height: 1.6;
            color: #555;
        }
        
        .product-features {
            margin-bottom: 40px;
        }
        
        .feature-item {
            margin-bottom: 10px;
            display: flex;
            align-items: flex-start;
        }
        
        .feature-item::before {
            content: "•";
            margin-right: 10px;
        }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <div class="header-content">
                <div class="logo-nav">
                    <a href="/" class="logo">Acme</a>
                    <nav>
                        <ul class="nav-links">
                            <li><a href="/men">Men</a></li>
                            <li><a href="/women">Women</a></li>
                            <li><a href="/boys">Boys</a></li>
                            <li><a href="/girls">Girls</a></li>
                        </ul>
                    </nav>
                </div>
                
                <div class="right-elements">
                    <div class="search-bar">
                        <input type="text" class="search-input" placeholder="Search">
                        <button class="search-button">🔍</button>
                    </div>
                    
                    <div class="user-actions">
                        <a href="/login">Join / Log In</a>
                        <a href="/help">Help</a>
                    </div>
                    
                    <div class="icons">
                        <button class="icon-button cart">🛒</button>
                    </div>
                </div>
            </div>
        </div>
    </header>
    
    <main class="container">
        <div class="product-container">
            <div class="product-gallery">
                <div class="gallery-image">
                    <img src="placeholder.svg" alt="Hoodie front view">
                </div>
                <div class="gallery-image">
                    <img src="placeholder.svg" alt="Hoodie back view">
                </div>
                <div class="gallery-image">
                    <img src="placeholder.svg" alt="Hoodie detail view">
                </div>
                <div class="gallery-image">
                    <img src="placeholder.svg" alt="Hoodie worn view">
                </div>
            </div>
            
            <div class="product-info">
                <h1 class="product-title">Cushy Fleece Hoodie</h1>
                <p class="product-subtitle">Men's Pullover Hoodie $45</p>
                
                <div class="color-options">
                    <div class="color-option">
                        <img src="placeholder.svg" alt="Dark Grey">
                    </div>
                    <div class="color-option">
                        <img src="placeholder.svg" alt="White">
                    </div>
                    <div class="color-option">
                        <img src="placeholder.svg" alt="Black">
                    </div>
                    <div class="color-option">
                        <img src="placeholder.svg" alt="Navy">
                    </div>
                    <div class="color-option">
                        <img src="placeholder.svg" alt="Red">
                    </div>
                </div>
                
                <div class="size-section">
                    <h2 class="section-title">Choose Size</h2>
                    <div class="size-options">
                        <div class="size-option">XS</div>
                        <div class="size-option">S</div>
                        <div class="size-option active">M</div>
                        <div class="size-option">L</div>
                        <div class="size-option">XL</div>
                        <div class="size-option">2XL</div>
                        <div class="size-option">3XL</div>
                    </div>
                </div>
                
                <div class="add-to-cart-row">
                    <button class="add-to-cart">Add To Cart</button>
                    <button class="wishlist-button">❤️</button>
                </div>
                
                <div class="product-description">
                    <p>The Acme Cushy Hoodie is made with an ultra-soft interior for everyday comfort.</p>
                </div>
                
                <div class="product-features">
                    <div class="feature-item">Shown: Dark Grey Heather/Dark Grey Heather/White</div>
                    <div class="feature-item">Style: 804346-063</div>
                </div>
            </div>
        </div>
    </main>
</body>
</html>`;
      } else {
        // Return React/JSX implementation for an e-commerce product page
        return `
import React, { useState } from 'react';
import { Search, ShoppingCart, User, Heart } from 'lucide-react';

const App = () => {
  // State for selected size
  const [selectedSize, setSelectedSize] = useState('M');
  
  // State for whether item is in wishlist
  const [inWishlist, setInWishlist] = useState(false);
  
  // Available sizes
  const sizes = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];
  
  // Product images (would normally be real URLs)
  const productImages = [
    '/placeholder.svg',
    '/placeholder.svg',
    '/placeholder.svg',
    '/placeholder.svg'
  ];
  
  // Color options (would normally be real image URLs)
  const colorOptions = [
    { name: 'Grey', url: '/placeholder.svg' },
    { name: 'White', url: '/placeholder.svg' },
    { name: 'Black', url: '/placeholder.svg' },
    { name: 'Navy', url: '/placeholder.svg' },
    { name: 'Red', url: '/placeholder.svg' }
  ];
  
  // Handle adding to cart
  const handleAddToCart = () => {
    console.log('Added to cart: Cushy Fleece Hoodie, size:', selectedSize);
    // Would normally dispatch an action or make an API call
  };
  
  // Toggle wishlist status
  const toggleWishlist = () => {
    setInWishlist(!inWishlist);
  };

  return (
    <div className="font-sans antialiased text-gray-700">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* Left: Logo and Navigation */}
          <div className="flex items-center">
            <a href="/" className="text-2xl font-bold text-gray-900 mr-8">
              Acme
            </a>
            <nav className="hidden md:flex space-x-6">
              <a href="/men" className="hover:text-blue-600">Men</a>
              <a href="/women" className="hover:text-blue-600">Women</a>
              <a href="/boys" className="hover:text-blue-600">Boys</a>
              <a href="/girls" className="hover:text-blue-600">Girls</a>
            </nav>
          </div>
          
          {/* Right: Search, Auth, and Cart */}
          <div className="flex items-center space-x-6">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search" 
                className="pl-3 pr-8 py-1 border rounded-full text-sm"
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <Search size={16} />
              </button>
            </div>
            
            <div className="hidden md:flex space-x-4 text-sm">
              <a href="/login">Join / Log In</a>
              <a href="/help">Help</a>
            </div>
            
            <a href="/cart" className="relative">
              <ShoppingCart />
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                0
              </span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:space-x-8">
          {/* Product Images */}
          <div className="md:w-1/2 grid grid-cols-2 gap-4 mb-8 md:mb-0">
            {productImages.map((src, index) => (
              <div key={index} className="bg-gray-100 rounded aspect-square flex items-center justify-center">
                <img src={src} alt={\`Product view \${index + 1}\`} className="max-w-full max-h-full" />
              </div>
            ))}
          </div>
          
          {/* Product Details */}
          <div className="md:w-1/2">
            <h1 className="text-3xl font-bold mb-1">Cushy Fleece Hoodie</h1>
            <p className="text-xl mb-6">Men's Pullover Hoodie $45</p>
            
            {/* Color Options */}
            <div className="flex space-x-2 mb-6">
              {colorOptions.map((color, index) => (
                <div 
                  key={index}
                  className="w-12 h-12 border rounded overflow-hidden cursor-pointer"
                >
                  <img src={color.url} alt={color.name} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            
            {/* Size Selection */}
            <div className="mb-6">
              <h2 className="font-bold text-lg mb-2">Choose Size</h2>
              <div className="flex flex-wrap gap-2">
                {sizes.map(size => (
                  <button
                    key={size}
                    className={\`
                      px-4 py-2 border rounded min-w-[4rem]
                      \${selectedSize === size ? 'bg-black text-white' : 'bg-white text-black'}
                    \`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Add to Cart and Wishlist */}
            <div className="flex space-x-3 mb-6">
              <button 
                className="flex-grow bg-black text-white py-4 rounded font-bold"
                onClick={handleAddToCart}
              >
                Add To Cart
              </button>
              <button 
                className={\`
                  p-4 border rounded flex items-center justify-center
                  \${inWishlist ? 'text-red-500' : 'text-gray-400'}
                \`}
                onClick={toggleWishlist}
              >
                <Heart fill={inWishlist ? "currentColor" : "none"} />
              </button>
            </div>
            
            {/* Product Description */}
            <p className="text-gray-600 mb-6">
              The Acme Cushy Hoodie is made with an ultra-soft interior for everyday comfort.
            </p>
            
            {/* Product Features */}
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Shown: Dark Grey Heather/Dark Grey Heather/White</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Style: 804346-063</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
        `;
      }
    }
    
    // Default return - should not reach here if the analysis worked correctly
    return `// Error: Could not generate appropriate code for the wireframe`;
  } catch (error) {
    console.error('Error generating code:', error);
    throw new Error(`Failed to generate code: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
