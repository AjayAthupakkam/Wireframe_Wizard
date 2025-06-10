
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SignIn } from "@clerk/clerk-react";
import { toast } from "sonner";

const LoginPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4 bg-muted/40">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignIn 
            routing="path" 
            path="/login" 
            signUpUrl="/register"
            afterSignInUrl="/workspace"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none p-0 border-0",
                formButtonPrimary: "bg-primary hover:bg-primary/90"
              }
            }}
          />
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;
