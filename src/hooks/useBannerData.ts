
import { useState, useEffect } from 'react';
import { BannerData } from '../types/banner';
import { useAuth } from '../contexts/AuthContext';

// Mock data generator - esto se conectaría a tu API real
const generateMockBanners = (userEmail: string): BannerData[] => {
  const userName = userEmail.split('@')[0];
  
  return [
    {
      id: '1',
      type: 'commission',
      title: 'Comisiones del Mes',
      message: `¡Excelente trabajo ${userName}! Has generado`,
      value: '$85,340 MXN',
      priority: 'high',
      actionText: 'Ver detalle',
      icon: 'TrendingUp',
      color: 'green'
    },
    {
      id: '2',
      type: 'birthday',
      title: 'Cumpleaños Hoy',
      message: 'Tienes 8 clientes cumpliendo años. ¡Oportunidad perfecta para contactar!',
      priority: 'medium',
      actionText: 'Ver lista',
      icon: 'Calendar',
      color: 'blue'
    },
    {
      id: '3',
      type: 'risk',
      title: 'Clientes en Riesgo',
      message: '3 clientes no han sido contactados en 30+ días',
      priority: 'urgent',
      actionText: 'Revisar',
      icon: 'AlertTriangle',
      color: 'red'
    },
    {
      id: '4',
      type: 'opportunity',
      title: 'Nuevas Oportunidades',
      message: '12 prospectos calificados esperan seguimiento',
      priority: 'high',
      actionText: 'Ver prospectos',
      icon: 'Target',
      color: 'purple'
    },
    {
      id: '5',
      type: 'performance',
      title: 'Meta del Mes',
      message: 'Estás al 78% de tu meta mensual',
      value: '22 días restantes',
      priority: 'medium',
      actionText: 'Ver progreso',
      icon: 'BarChart3',
      color: 'indigo'
    },
    {
      id: '6',
      type: 'task',
      title: 'Tareas Pendientes',
      message: 'Tienes 5 tareas importantes para hoy',
      priority: 'medium',
      actionText: 'Ver tareas',
      icon: 'CheckSquare',
      color: 'yellow'
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
      // Simular carga de datos
      setTimeout(() => {
        const mockBanners = generateMockBanners(user.email);
        setBanners(mockBanners);
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
