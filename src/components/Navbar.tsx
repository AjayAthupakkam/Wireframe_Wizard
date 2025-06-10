import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, UserButton, SignInButton, SignUpButton } from "@clerk/clerk-react";
import { useState } from "react";
import { User, LogIn, Code } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="w-full bg-background border-b border-border py-4 px-6 shadow-sm">
      <div className="container max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div>
            <h1 className="text-xl font-bold text-foreground">
              <span className="text-[#6366F1]">W</span>/C
            </h1>
          </div>
        </Link>
        
        <div className="hidden md:flex items-center space-x-6">
          <Link
            to="/workspace"
            className={`text-sm font-medium hover:text-[#6366F1] transition-colors ${
              location.pathname === "/workspace" ? "text-[#6366F1]" : "text-foreground"
            }`}
          >
            Workspace
          </Link>
          <Link
            to="/design"
            className={`text-sm font-medium hover:text-[#6366F1] transition-colors ${
              location.pathname === "/design" ? "text-[#6366F1]" : "text-foreground"
            }`}
          >
            Design
          </Link>
          <Link
            to="/editor"
            className={`text-sm font-medium hover:text-[#6366F1] transition-colors ${
              location.pathname === "/editor" ? "text-[#6366F1]" : "text-foreground"
            }`}
          >
            <span className="flex items-center gap-1">
              <Code size={16} />
              Editor
            </span>
          </Link>
          
          <SignedIn>
            <div className="flex items-center space-x-4">
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>
          <SignedOut>
            <div className="flex items-center space-x-2">
              <SignInButton mode="modal">
                <Button variant="outline" size="sm">
                  <LogIn size={16} className="mr-1" />
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button variant="default" size="sm" className="gradient-button text-white">
                  Sign Up
                </Button>
              </SignUpButton>
            </div>
          </SignedOut>
        </div>
        
        <button
          className="md:hidden text-foreground focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute z-10 bg-card w-full left-0 border-b border-border shadow-lg animate-slide-down">
          <div className="px-6 py-4">
            <div className="flex flex-col space-y-4">
              <Link
                to="/workspace"
                className={`text-sm font-medium hover:text-[#6366F1] transition-colors ${
                  location.pathname === "/workspace" ? "text-[#6366F1]" : "text-card-foreground"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Workspace
              </Link>
              <Link
                to="/design"
                className={`text-sm font-medium hover:text-[#6366F1] transition-colors ${
                  location.pathname === "/design" ? "text-[#6366F1]" : "text-card-foreground"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Design
              </Link>
              <Link
                to="/editor"
                className={`text-sm font-medium hover:text-[#6366F1] transition-colors ${
                  location.pathname === "/editor" ? "text-[#6366F1]" : "text-card-foreground"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="flex items-center gap-1">
                  <Code size={16} />
                  Editor
                </span>
              </Link>
              
              <SignedIn>
                <div className="flex flex-col space-y-2 items-start">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsMenuOpen(false);
                      // navigate('/profile'); // If you have a dedicated profile page
                    }}
                    className="w-full text-left justify-start"
                  >
                    Profile (via UserButton above)
                  </Button>
                  <UserButton afterSignOutUrl="/" showName={true} />
                </div>
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setIsMenuOpen(false)}
                    className="gradient-button text-white w-full"
                  >
                    <LogIn size={16} className="mr-1" />
                    Sign In
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full"
                  >
                    Sign Up
                  </Button>
                </SignUpButton>
              </SignedOut>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
