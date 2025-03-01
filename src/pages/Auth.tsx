
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AuthLayout from '@/components/auth/AuthLayout';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';

const Auth = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <AuthLayout>
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
    </AuthLayout>
  );
};

export default Auth;
