
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/context/ClerkAuthContext";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import CodePreview from "@/components/CodePreview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Eye, MoreVertical, Edit, Trash, AlertTriangle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Template {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
  aiModel: string;
  aiLogo: string;
  description?: string;
  code?: string;
  createdAt?: number;
  isUserCreated?: boolean;
}

// Start with an empty templates array - user created templates will be loaded from localStorage
const templates: Template[] = [];

const categories = ["All", "Authentication", "E-commerce", "Data", "Dashboard", "Profile", "User Created"];

const DesignPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [userTemplates, setUserTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isCodeDialogOpen, setIsCodeDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null);
  const [activeTab, setActiveTab] = useState<string>("code");
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Load user templates from localStorage
  useEffect(() => {
    const storedTemplates = localStorage.getItem('userCreatedTemplates');
    if (storedTemplates) {
      try {
        const parsedTemplates = JSON.parse(storedTemplates);
        setUserTemplates(parsedTemplates);
      } catch (error) {
        console.error('Error parsing stored templates:', error);
        toast.error('Failed to load your saved templates');
      }
    }
  }, []);

  // Combine the predefined templates with user-created ones
  const allTemplates = [...templates, ...userTemplates];
  
  // Filter templates based on selected category
  const filteredTemplates = selectedCategory === "All" 
    ? allTemplates
    : selectedCategory === "User Created"
    ? allTemplates.filter(template => template.isUserCreated)
    : allTemplates.filter(template => template.category === selectedCategory);
    
  // Handle deleting a template
  const handleDeleteTemplate = (templateId: string) => {
    // Find the template to delete
    const templateToDelete = allTemplates.find(t => t.id === templateId);
    
    if (!templateToDelete) {
      toast.error("Template not found");
      return;
    }
    
    // Only allow deleting user-created templates
    if (!templateToDelete.isUserCreated) {
      toast.error("Cannot delete built-in templates");
      return;
    }
    
    // Set the template to delete and open confirmation dialog
    setTemplateToDelete(templateToDelete);
    setIsDeleteDialogOpen(true);
  };
  
  // Confirm deletion of a template
  const confirmDeleteTemplate = () => {
    if (!templateToDelete) return;
    
    try {
      // Filter out the template to delete
      const updatedTemplates = userTemplates.filter(t => t.id !== templateToDelete.id);
      
      // Update state
      setUserTemplates(updatedTemplates);
      
      // Save to localStorage
      localStorage.setItem('userCreatedTemplates', JSON.stringify(updatedTemplates));
      
      toast.success("Template deleted successfully");
      setIsDeleteDialogOpen(false);
      setTemplateToDelete(null);
    } catch (error) {
      console.error("Error deleting template:", error);
      toast.error("Failed to delete template");
    }
  };
  
  // Handle editing a template
  const handleEditTemplate = (templateId: string) => {
    // Find the template to edit
    const templateToEdit = allTemplates.find(t => t.id === templateId);
    
    if (!templateToEdit) {
      toast.error("Template not found");
      return;
    }
    
    // Only allow editing user-created templates
    if (!templateToEdit.isUserCreated) {
      toast.error("Cannot edit built-in templates");
      return;
    }
    
    // Navigate to editor with the template code
    navigate("/editor", { 
      state: { 
        generatedCode: templateToEdit.code, 
        language: 'html',
        templateId: templateToEdit.id,
        templateTitle: templateToEdit.title
      } 
    });
  };

  const handleViewCode = (templateId: string) => {
    if (!user) {
      toast.error("Please log in to view code");
      navigate("/login");
      return;
    }

    // Find the template
    const template = allTemplates.find(t => t.id === templateId);
    
    if (!template) {
      toast.error("Template not found");
      return;
    }
    
    if (!template.code) {
      toast.error("No code available for this template");
      return;
    }
    
    // Set the selected template and open dialog
    setSelectedTemplate(template);
    setIsCodeDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-8 text-center text-[#6366F1]">Wireframe & Codes</h1>
        
        {userTemplates.length === 0 && (
          <div className="text-center mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-600">Your converted wireframes will appear here.</p>
            <p className="text-gray-500 text-sm mt-1">Go to Workspace tab to convert wireframes to code.</p>
          </div>
        )}
        
        {/* Category selector */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === category
                  ? "bg-[#6366F1] text-white shadow-md"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        
        {/* Templates grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map(template => (
            <Card key={template.id} className="overflow-hidden hover:shadow-md transition-shadow animate-fade-in bg-white">
              <div className="aspect-w-16 aspect-h-9 relative">
                <img
                  src={template.imageUrl}
                  alt={template.title}
                  className="object-cover w-full h-48"
                />
                {template.isUserCreated && (
                  <div className="absolute top-2 right-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 bg-white/90 hover:bg-white rounded-full">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditTemplate(template.id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Edit Code</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteTemplate(template.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-800">{template.title}</h3>
                  <div className="flex items-center space-x-2">
                    <img 
                      src={template.aiLogo} 
                      alt={template.aiModel} 
                      className="w-5 h-5" 
                    />
                    <span className="text-sm text-gray-600">{template.aiModel}</span>
                  </div>
                </div>
                
                {template.description && (
                  <p className="text-sm text-gray-500 mt-2">{template.description}</p>
                )}
                
                <button
                  onClick={() => handleViewCode(template.id)}
                  className="mt-4 w-full flex items-center justify-center px-4 py-2 bg-[#6366F1] text-white text-sm rounded-md hover:bg-indigo-700 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <polyline points="16 18 22 12 16 6"></polyline>
                    <polyline points="8 6 2 12 8 18"></polyline>
                  </svg>
                  View Code
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Code View Dialog */}
      <Dialog open={isCodeDialogOpen} onOpenChange={setIsCodeDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedTemplate?.title}</DialogTitle>
          </DialogHeader>
          
          {selectedTemplate?.code && (
            <div className="mt-4">
              <Tabs defaultValue="code" value={activeTab} onValueChange={setActiveTab}>
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
                
                <TabsContent value="code" className="mt-4">
                  <div className="bg-black text-gray-100 p-4 rounded-md overflow-x-auto max-h-[500px] overflow-y-auto">
                    <pre className="text-sm"><code>{selectedTemplate?.code}</code></pre>
                  </div>
                </TabsContent>
                
                <TabsContent value="preview" className="mt-4">
                  <div className="bg-white border border-gray-200 rounded-md h-[500px]">
                    <CodePreview 
                      code={selectedTemplate?.code} 
                      height="500px" 
                    />
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="mt-4 flex justify-end">
                <Button 
                  variant="outline" 
                  className="mr-2"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedTemplate?.code || '');
                    toast.success("Code copied to clipboard");
                  }}
                >
                  Copy Code
                </Button>
                
                <Button 
                  onClick={() => {
                    setIsCodeDialogOpen(false);
                    navigate("/editor", { 
                      state: { generatedCode: selectedTemplate?.code, language: 'html' } 
                    });
                  }}
                  className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white"
                >
                  Open in Editor
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle size={18} />
              Confirm Deletion
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-gray-700">Are you sure you want to delete <span className="font-semibold">{templateToDelete?.title}</span>?</p>
            <p className="text-gray-500 text-sm mt-2">This action cannot be undone.</p>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmDeleteTemplate}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DesignPage;
