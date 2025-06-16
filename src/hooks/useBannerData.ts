
import { useState, useEffect } from 'react';
import { BannerData, ApiBannerResponse } from '../types/banner';
import { useAuth } from '../contexts/AuthContext';
import { azureConversationService } from '../services/azureConversationService';

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

export const useBannerData = () => {
  const { user } = useAuth();
  const [banners, setBanners] = useState<BannerData[]>([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch banners from Azure API whenever user changes
  useEffect(() => {
    const fetchBanners = async () => {
      if (!user?.email) {
        setIsLoading(false);
        setBanners([]);
        return;
      }

      console.log('🎌 useBannerData: Fetching banners for user:', user.email);
      setIsLoading(true);

      try {
        const apiResponse = await azureConversationService.getUserBanners(user.email);
        console.log('🎌 useBannerData: Received banners from API:', apiResponse);
        
        // Sort by MessageOrder and transform
        const sortedBanners = apiResponse
          .sort((a, b) => a.MessageOrder - b.MessageOrder)
          .map(transformApiBanner);
        
        console.log('🎌 useBannerData: Transformed and sorted banners:', sortedBanners);
        setBanners(sortedBanners);
        setCurrentBannerIndex(0); // Reset to first banner when new data arrives
      } catch (error) {
        console.log('🎌 useBannerData: Error fetching banners (silently handled):', error);
        setBanners([]); // Set empty array on error - no user notification needed
      } finally {
        setIsLoading(false);
      }
    };

    fetchBanners();
  }, [user?.email]); // Depend on user email to refetch when user changes

  // Rotación automática de banners cada 8 segundos
  useEffect(() => {
    if (banners.length <= 1) return; // No need to rotate if 0 or 1 banner

    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [banners.length]);

  const goToNext = () => {
    if (banners.length > 1) {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }
  };

  const goToPrevious = () => {
    if (banners.length > 1) {
      setCurrentBannerIndex((prev) => (prev - 1 + banners.length) % banners.length);
    }
  };

  const goToBanner = (index: number) => {
    if (index >= 0 && index < banners.length) {
      setCurrentBannerIndex(index);
    }
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
