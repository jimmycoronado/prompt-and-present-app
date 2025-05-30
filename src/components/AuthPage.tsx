
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const AuthPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithAzure, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleAzureSignIn = async () => {
    setIsLoading(true);

    const { error } = await signInWithAzure();

    if (error) {
      toast({
        title: "Error al iniciar sesión",
        description: error.message,
        variant: "destructive",
      });
      setIsLoading(false);
    }
    // No necesitamos setIsLoading(false) aquí porque será redirigido
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-blue-600 rounded-full mb-4">
            <MessageSquare className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            AI Assistant
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Inicia sesión con tu cuenta corporativa
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Autenticación Corporativa</CardTitle>
            <CardDescription>
              Inicia sesión usando Azure Entra ID
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleAzureSignIn} 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Redirigiendo..." : "Iniciar Sesión con Microsoft"}
            </Button>
            
            <div className="text-xs text-center text-gray-500 mt-4">
              Al iniciar sesión, aceptas el uso de tu cuenta corporativa para acceder al AI Assistant
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
