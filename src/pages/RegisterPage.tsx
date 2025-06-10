
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SignUp } from "@clerk/clerk-react";
import { toast } from "sonner";

const RegisterPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4 bg-muted/40">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
          <CardDescription className="text-center">
            Sign up to start converting wireframes to code
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignUp 
            routing="path" 
            path="/register" 
            signInUrl="/login"
            afterSignUpUrl="/workspace"
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
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RegisterPage;
