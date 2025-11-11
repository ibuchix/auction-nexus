
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  // Removed signup state - admin only system
  
  const { signIn, signOut, user, isAdmin, isLoading: authLoading, adminCheckError, retryAdminCheck, refreshSession } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showAccessError, setShowAccessError] = useState(false);

  // Handle redirect when user is authenticated AND admin check is complete
  useEffect(() => {
    if (user && !authLoading) {
      if (isAdmin) {
        navigate("/", { replace: true });
      } else if (adminCheckError) {
        // Admin check failed - show error instead of auto-signout
        setShowAccessError(true);
        toast({
          title: "Admin Verification Failed",
          description: adminCheckError,
          variant: "destructive",
          duration: 7000,
        });
      } else {
        // User is authenticated but not admin (and no error)
        setShowAccessError(true);
        toast({
          title: "Access Denied",
          description: "This is an admin-only interface. Only authorized administrators can access this system.",
          variant: "destructive",
          duration: 5000,
        });
      }
    }
  }, [user, isAdmin, authLoading, adminCheckError, navigate]);

  const handleRetryAdminCheck = async () => {
    setShowAccessError(false);
    await retryAdminCheck();
  };

  const handleRefreshSession = async () => {
    setShowAccessError(false);
    await refreshSession();
  };

  const handleSignOut = async () => {
    setShowAccessError(false);
    await signOut();
  };

  // Show loading while checking auth state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="space-y-4 text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show access error with retry option if user is authenticated but not verified as admin
  if (user && showAccessError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-destructive">Access Verification Issue</CardTitle>
            <CardDescription>
              {adminCheckError 
                ? "Failed to verify admin privileges. This could be a temporary network issue."
                : "You are not authorized to access this admin interface."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {adminCheckError && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm text-destructive font-medium">Error Details:</p>
                <p className="text-sm text-muted-foreground mt-1">{adminCheckError}</p>
              </div>
            )}
            <div className="flex flex-col gap-2">
              {adminCheckError && (
                <>
                  <Button onClick={handleRefreshSession} className="w-full">
                    Refresh Session
                  </Button>
                  <Button onClick={handleRetryAdminCheck} variant="outline" className="w-full">
                    Retry Admin Verification
                  </Button>
                </>
              )}
              <Button onClick={handleSignOut} variant="outline" className="w-full">
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Don't render the form if user is already authenticated (and admin check is still loading)
  if (user) {
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await signIn(loginEmail, loginPassword);

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast({
            title: "Login Failed",
            description: "Invalid email or password. Please try again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Login Failed",
            description: error.message,
            variant: "destructive",
          });
        }
        return;
      }

      if (data?.user) {
        // We'll check admin status in the useEffect above
        // For now, just show a loading state while we verify admin access
        toast({
          title: "Verifying Access",
          description: "Checking admin privileges...",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Removed signup handler - admin only system

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Admin Portal</CardTitle>
          <CardDescription>
            This is an admin-only interface. Only authorized administrators can access this system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full">
            {/* Removed signup tab - admin only system */}
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Admin Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="admin@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Admin Sign In
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
