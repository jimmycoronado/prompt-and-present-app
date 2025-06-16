
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { graphConfig } from '@/config/authConfig';

export const useUserPhoto = () => {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { accessToken, user } = useAuth();

  const fetchUserPhoto = async () => {
    console.log('🖼️ useUserPhoto: fetchUserPhoto called', {
      hasAccessToken: !!accessToken,
      hasUser: !!user,
      tokenPreview: accessToken ? accessToken.substring(0, 20) + '...' : 'null'
    });

    if (!accessToken || !user) {
      console.log('❌ useUserPhoto: No access token or user available');
      return;
    }

    setLoading(true);
    try {
      console.log('🚀 useUserPhoto: Fetching user photo from Microsoft Graph', graphConfig.graphPhotoEndpoint);
      
      // Fetch photo from Microsoft Graph
      const photoResponse = await fetch(graphConfig.graphPhotoEndpoint, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      console.log('📸 useUserPhoto: Photo response status:', photoResponse.status);

      if (photoResponse.ok) {
        const photoBlob = await photoResponse.blob();
        console.log('📸 useUserPhoto: Photo blob size:', photoBlob.size);
        const photoObjectUrl = URL.createObjectURL(photoBlob);
        setPhotoUrl(photoObjectUrl);
        console.log('✅ useUserPhoto: Photo fetched successfully', photoObjectUrl);
      } else {
        console.log('❌ useUserPhoto: No photo available or error occurred', {
          status: photoResponse.status,
          statusText: photoResponse.statusText
        });
        
        // Try to get response text for more details
        try {
          const errorText = await photoResponse.text();
          console.log('❌ useUserPhoto: Error response body:', errorText);
        } catch (e) {
          console.log('❌ useUserPhoto: Could not read error response');
        }
        
        setPhotoUrl(null);
      }
    } catch (error) {
      console.log('💥 useUserPhoto: Error fetching user photo:', error);
      setPhotoUrl(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔄 useUserPhoto: useEffect triggered', {
      hasAccessToken: !!accessToken,
      hasUser: !!user,
      userEmail: user?.email
    });

    if (accessToken && user) {
      console.log('✅ useUserPhoto: Access token and user available, fetching photo');
      fetchUserPhoto();
    } else {
      console.log('❌ useUserPhoto: No access token or user, clearing photo');
      setPhotoUrl(null);
    }

    // Cleanup function to revoke object URL
    return () => {
      if (photoUrl) {
        console.log('🧹 useUserPhoto: Cleaning up photo URL');
        URL.revokeObjectURL(photoUrl);
      }
    };
  }, [accessToken, user]);

  useEffect(() => {
    console.log('🖼️ useUserPhoto: photoUrl state changed:', photoUrl ? 'Has photo URL' : 'No photo URL');
  }, [photoUrl]);

  return { photoUrl, loading, refetch: fetchUserPhoto };
};
