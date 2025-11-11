import React from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface LoginButtonProps {
  isMobile?: boolean;
}

export const LoginButton: React.FC<LoginButtonProps> = ({ isMobile = false }) => {
  const { login } = useAuth();

  const googleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      // Pass the access token to our AuthContext's login function
      login(tokenResponse.access_token);
    },
    onError: () => {
      console.error("Login Failed");
    },
  });

  if (isMobile) {
    return (
      <Button variant="outline" className="flex-1" onClick={() => googleLogin()}>
        <User className="h-5 w-5 mr-2" />
        Sign in with Google
      </Button>
    );
  }

  return (
    <Button variant="ghost" size="icon" onClick={() => googleLogin()}>
      <User className="h-5 w-5" />
    </Button>
  );
};