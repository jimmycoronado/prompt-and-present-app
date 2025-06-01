
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const AuthPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithAzure, user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (!loading && user) {
      console.log('User authenticated, redirecting to home:', user);
      navigate('/', { replace: true });
    }
  }, [user, loading, navigate]);

  const handleAzureSignIn = async () => {
    setIsLoading(true);
    console.log('Starting Azure sign in...');

    try {
      const { error } = await signInWithAzure();

      if (error) {
        console.error('Sign in error:', error);
        toast({
          title: "Error al iniciar sesión",
          description: error.message || "Error de autenticación con Microsoft",
          variant: "destructive",
        });
        setIsLoading(false);
      } else {
        console.log('Sign in successful');
        toast({
          title: "Inicio de sesión exitoso",
          description: "Te damos la bienvenida a Dali AI",
        });
        // La redirección se manejará automáticamente por el useEffect
        // pero agregamos un timeout como respaldo
        setTimeout(() => {
          if (user) {
            navigate('/', { replace: true });
          }
          setIsLoading(false);
        }, 1000);
      }
    } catch (error) {
      console.error('Unexpected error during sign in:', error);
      setIsLoading(false);
      toast({
        title: "Error inesperado",
        description: "Ocurrió un error inesperado durante el inicio de sesión",
        variant: "destructive",
      });
    }
  };

  // Mostrar loading si se está verificando la autenticación
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 bg-skandia-green p-2 overflow-hidden">
            <img 
              src="https://aistudiojarvis0534199251.blob.core.windows.net/skandia-icons/DaliLogo.jpg" 
              alt="Dali AI Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <p className="text-gray-600 dark:text-gray-400">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 bg-skandia-green p-2 overflow-hidden">
            <img 
              src="https://aistudiojarvis0534199251.blob.core.windows.net/skandia-icons/DaliLogo.jpg" 
              alt="Dali AI Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dali AI
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Inicia sesión con tu correo Skandia
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Autenticación Corporativa</CardTitle>
            <CardDescription>
              Usa tu correo Skandia para acceder a Dali AI
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleAzureSignIn} 
              className="w-full bg-[#00C83C] hover:bg-[#009E2F] text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Iniciando sesión...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 23 23" fill="currentColor">
                    <path d="M11.03 0H0v11.03h11.03V0z" fill="#f25022"/>
                    <path d="M23 0H11.97v11.03H23V0z" fill="#7fba00"/>
                    <path d="M11.03 11.97H0V23h11.03V11.97z" fill="#00a4ef"/>
                    <path d="M23 11.97H11.97V23H23V11.97z" fill="#ffb900"/>
                  </svg>
                  Inicia Sesión con tu correo Skandia
                </>
              )}
            </Button>
            
            <div className="text-xs text-center text-gray-500 mt-4">
              Al iniciar sesión, aceptas el uso de tu cuenta Skandia para acceder a Dali AI
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
