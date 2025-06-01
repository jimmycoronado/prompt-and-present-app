
import { useState, useEffect } from 'react';
import { BannerData, ApiBannerResponse } from '../types/banner';
import { useAuth } from '../contexts/AuthContext';

// Helper function to determine text color based on background color
const getTextColor = (hexColor: string): string => {
  // Remove # if present
  const hex = hexColor.replace('#', '');
  
  // Parse RGB values
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return white for dark backgrounds, dark for light backgrounds
  return luminance > 0.5 ? '#1f2937' : '#ffffff';
};

// Transform API response to internal format
const transformApiBanner = (apiBanner: ApiBannerResponse): BannerData => ({
  id: apiBanner.Id.toString(),
  messageOrder: apiBanner.MessageOrder,
  title: apiBanner.Title,
  message: apiBanner.MessageText,
  iconUrl: apiBanner.IconLink || undefined,
  buttonText: apiBanner.ButtonText,
  automaticReply: apiBanner.AutomaticReply,
  backgroundColor: apiBanner.HEXBubbleColor,
  textColor: getTextColor(apiBanner.HEXBubbleColor)
});

// Mock data generator - esto se reemplazará con la llamada real al API
const generateMockBanners = (userEmail: string): ApiBannerResponse[] => {
  return [
    {
      Id: 1,
      CutOffDate: "2025-05-31T00:00:00.000Z",
      Email: userEmail,
      MessageOrder: 1,
      Title: "Comisiones del Mes",
      MessageText: "¡Excelente trabajo! Has generado $85,340 MXN",
      IconLink: "https://cdn-icons-png.flaticon.com/512/2921/2921222.png",
      ButtonText: "Ver detalle",
      AutomaticReply: "Hola DALI, muéstrame el detalle de mis comisiones del mes actual",
      HEXBubbleColor: "#10B981"
    },
    {
      Id: 2,
      CutOffDate: "2025-05-31T00:00:00.000Z",
      Email: userEmail,
      MessageOrder: 2,
      Title: "Cumpleaños Hoy",
      MessageText: "Tienes 8 clientes cumpliendo años. ¡Oportunidad perfecta para contactar!",
      IconLink: "https://cdn-icons-png.flaticon.com/512/3176/3176366.png",
      ButtonText: "Ver lista",
      AutomaticReply: "Hola DALI, muéstrame la lista de clientes que cumplen años hoy",
      HEXBubbleColor: "#3B82F6"
    },
    {
      Id: 3,
      CutOffDate: "2025-05-31T00:00:00.000Z",
      Email: userEmail,
      MessageOrder: 3,
      Title: "Clientes en Riesgo",
      MessageText: "3 clientes no han sido contactados en 30+ días",
      IconLink: "https://cdn-icons-png.flaticon.com/512/564/564619.png",
      ButtonText: "Revisar",
      AutomaticReply: "Hola DALI, muéstrame los clientes que están en riesgo por falta de contacto",
      HEXBubbleColor: "#EF4444"
    }
  ];
};

export const useBannerData = () => {
  const { user } = useAuth();
  const [banners, setBanners] = useState<BannerData[]>([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // Simular carga de datos - aquí se hará la llamada real al API
      setTimeout(() => {
        const mockApiResponse = generateMockBanners(user.email);
        // Ordenar por MessageOrder y transformar
        const sortedBanners = mockApiResponse
          .sort((a, b) => a.MessageOrder - b.MessageOrder)
          .map(transformApiBanner);
        
        setBanners(sortedBanners);
        setIsLoading(false);
      }, 1000);
    }
  }, [user]);

  // Rotación automática de banners cada 8 segundos
  useEffect(() => {
    if (banners.length === 0) return;

    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [banners.length]);

  const goToNext = () => {
    setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
  };

  const goToPrevious = () => {
    setCurrentBannerIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToBanner = (index: number) => {
    setCurrentBannerIndex(index);
  };

  const currentBanner = banners[currentBannerIndex];

  return {
    banners,
    currentBanner,
    currentBannerIndex,
    isLoading,
    goToNext,
    goToPrevious,
    goToBanner,
    totalBanners: banners.length
  };
};
