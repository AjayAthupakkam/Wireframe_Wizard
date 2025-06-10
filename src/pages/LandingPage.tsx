
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-[#444] via-background to-background opacity-20 z-0"></div>
        <div className="relative z-10 container max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 animate-fade-in">
            <span className="gradient-text">Convert Wireframe</span> <br />
            <span className="text-foreground">To Code</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl animate-slide-up">
            Revolutionize your content creation with our AI-powered app, delivering engaging and high-quality apps in seconds.
          </p>
          <Button 
            onClick={() => navigate('/workspace')}
            className="gradient-button text-white px-8 py-6 rounded-xl text-lg font-medium shadow-lg hover-scale animate-fade-in"
          >
            Get Started
          </Button>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mt-24">
            <div className="flex flex-col items-center">
              <h2 className="text-3xl font-bold text-foreground mb-4">Wireframe</h2>
              <div className="relative h-64 w-full bg-card rounded-lg shadow-md p-4 border border-border overflow-hidden hover-scale">
                <img 
                  src="/public/wireframe-uploads/85ceaac1-0aa4-4cb5-9f40-a4058e1a0259.png" 
                  alt="Wireframe example" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            <div className="flex flex-col items-center">
              <h2 className="text-3xl font-bold text-foreground mb-4">React/ HTML CSS Code</h2>
              <div className="relative h-64 w-full bg-card rounded-lg shadow-md p-4 border border-border overflow-hidden hover-scale">
                <img 
                  src="/public/wireframe-uploads/5c0442a7-e142-4917-8bbc-1429db7b2f87.png" 
                  alt="Generated code example" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-muted">
        <div className="container max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            <span className="gradient-text">Powerful Features</span>
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow card-hover">
              <div className="h-12 w-12 bg-[#6366F1]/10 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#6366F1]">
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <path d="M9 15V9l7 3-7 3Z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-card-foreground">AI-Powered Code Generation</h3>
              <p className="text-muted-foreground">Turn your wireframes into functional code using three powerful AI models.</p>
            </div>
            
            <div className="bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow card-hover">
              <div className="h-12 w-12 bg-[#6366F1]/10 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#6366F1]">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                  <path d="M12 18v-6" />
                  <path d="M8 18v-1" />
                  <path d="M16 18v-3" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-card-foreground">Template Library</h3>
              <p className="text-muted-foreground">Access a variety of pre-designed templates to jumpstart your projects.</p>
            </div>
            
            <div className="bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow card-hover">
              <div className="h-12 w-12 bg-[#6366F1]/10 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#6366F1]">
                  <path d="M12 2H2v10h10V2Z" />
                  <path d="M17 17h5v5h-5v-5Z" />
                  <path d="M22 12h-5V7h5v5Z" />
                  <path d="M7 12v5h5v-5H7Z" />
                  <path d="M2 17v5h5v-5H2Z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-card-foreground">Responsive Designs</h3>
              <p className="text-muted-foreground">All generated code is responsive and works on all screen sizes.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
