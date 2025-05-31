
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
        description: error.message || "Error de autenticación con Microsoft",
        variant: "destructive",
      });
      setIsLoading(false);
    } else {
      // La redirección se manejará automáticamente por el useEffect
      toast({
        title: "Inicio de sesión exitoso",
        description: "Bienvenido a Super Sami",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 bg-skandia-green p-2 overflow-hidden">
            <img 
              src="https://www.skandia.com.mx/mercadeo/2021/campana/Sami/Mail/Sami/Thinking2.gif" 
              alt="Sami Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Super Sami
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Inicia sesión con tu cuenta corporativa de Microsoft
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Autenticación Corporativa</CardTitle>
            <CardDescription>
              Usa tu cuenta de Microsoft para acceder a Super Sami
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleAzureSignIn} 
              className="w-full bg-[#0078d4] hover:bg-[#106ebe] text-white"
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
                  Iniciar Sesión con Microsoft
                </>
              )}
            </Button>
            
            <div className="text-xs text-center text-gray-500 mt-4">
              Al iniciar sesión, aceptas el uso de tu cuenta corporativa para acceder a Super Sami
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
