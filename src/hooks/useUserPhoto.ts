
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { graphConfig } from '@/config/authConfig';

export const useUserPhoto = () => {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { accessToken, user } = useAuth();

  const fetchUserPhoto = async () => {
    if (!accessToken || !user) {
      console.log('useUserPhoto: No access token or user available');
      return;
    }

    setLoading(true);
    try {
      console.log('useUserPhoto: Fetching user photo from Microsoft Graph');
      
      // Fetch photo from Microsoft Graph
      const photoResponse = await fetch(graphConfig.graphPhotoEndpoint, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (photoResponse.ok) {
        const photoBlob = await photoResponse.blob();
        const photoObjectUrl = URL.createObjectURL(photoBlob);
        setPhotoUrl(photoObjectUrl);
        console.log('useUserPhoto: Photo fetched successfully');
      } else {
        console.log('useUserPhoto: No photo available or error occurred', photoResponse.status);
        setPhotoUrl(null);
      }
    } catch (error) {
      console.log('useUserPhoto: Error fetching user photo:', error);
      setPhotoUrl(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken && user) {
      console.log('useUserPhoto: Access token and user available, fetching photo');
      fetchUserPhoto();
    } else {
      console.log('useUserPhoto: No access token or user, clearing photo');
      setPhotoUrl(null);
    }

    // Cleanup function to revoke object URL
    return () => {
      if (photoUrl) {
        URL.revokeObjectURL(photoUrl);
      }
    };
  }, [accessToken, user]);

  return { photoUrl, loading, refetch: fetchUserPhoto };
};
