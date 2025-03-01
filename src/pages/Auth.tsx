
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AuthLayout from '@/components/auth/AuthLayout';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';

const Auth = () => {
  const { user, devModeEnabled, toggleDevMode } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  if (user || devModeEnabled) {
    return <Navigate to="/" replace />;
  }

  return (
    <AuthLayout>
      <div className="w-full space-y-6">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'signup')} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
            <TabsTrigger value="signup">Registrarse</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <LoginForm />
          </TabsContent>
          
          <TabsContent value="signup">
            <SignupForm />
          </TabsContent>
        </Tabs>
        
        <div className="pt-2 border-t border-border">
          <Button 
            onClick={toggleDevMode}
            variant="outline" 
            size="sm"
            className="w-full mt-4 text-muted-foreground border-dashed flex items-center gap-2 justify-center"
          >
            <Shield size={14} />
            Modo Desarrollo (Bypass Auth)
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Auth;
