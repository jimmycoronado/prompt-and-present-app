
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { graphConfig } from '@/config/authConfig';

export const useUserPhoto = () => {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasAttempted, setHasAttempted] = useState(false);
  const { accessToken, user } = useAuth();

  const fetchUserPhoto = useCallback(async () => {
    console.log('🖼️ useUserPhoto: fetchUserPhoto called', {
      hasAccessToken: !!accessToken,
      hasUser: !!user,
      tokenPreview: accessToken ? accessToken.substring(0, 20) + '...' : 'null',
      hasAttempted
    });

    if (!accessToken || !user) {
      console.log('❌ useUserPhoto: No access token or user available');
      return;
    }

    if (hasAttempted) {
      console.log('⏭️ useUserPhoto: Already attempted to fetch photo, skipping');
      return;
    }

    setLoading(true);
    setHasAttempted(true);
    
    try {
      console.log('🚀 useUserPhoto: Fetching user photo from Microsoft Graph', graphConfig.graphPhotoEndpoint);
      
      const photoResponse = await fetch(graphConfig.graphPhotoEndpoint, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      console.log('📸 useUserPhoto: Photo response received', {
        status: photoResponse.status,
        statusText: photoResponse.statusText,
        headers: Object.fromEntries(photoResponse.headers.entries())
      });

      if (photoResponse.ok) {
        const photoBlob = await photoResponse.blob();
        console.log('📸 useUserPhoto: Photo blob received', {
          size: photoBlob.size,
          type: photoBlob.type
        });
        
        if (photoBlob.size > 0) {
          const photoObjectUrl = URL.createObjectURL(photoBlob);
          setPhotoUrl(photoObjectUrl);
          console.log('✅ useUserPhoto: Photo URL created successfully');
        } else {
          console.log('⚠️ useUserPhoto: Photo blob is empty');
          setPhotoUrl(null);
        }
      } else {
        console.log('❌ useUserPhoto: Photo request failed', {
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
  }, [accessToken, user, hasAttempted]);

  useEffect(() => {
    console.log('🔄 useUserPhoto: Effect triggered', {
      hasAccessToken: !!accessToken,
      hasUser: !!user,
      userEmail: user?.email,
      hasAttempted
    });

    if (accessToken && user && !hasAttempted) {
      console.log('✅ useUserPhoto: Conditions met, fetching photo');
      fetchUserPhoto();
    } else if (!accessToken || !user) {
      console.log('❌ useUserPhoto: No access token or user, resetting state');
      setPhotoUrl(null);
      setHasAttempted(false);
    }

    // Cleanup function to revoke object URL
    return () => {
      if (photoUrl) {
        console.log('🧹 useUserPhoto: Cleaning up photo URL');
        URL.revokeObjectURL(photoUrl);
      }
    };
  }, [accessToken, user, fetchUserPhoto]);

  const refetch = useCallback(() => {
    console.log('🔄 useUserPhoto: Manual refetch requested');
    setHasAttempted(false);
    setPhotoUrl(null);
    if (accessToken && user) {
      fetchUserPhoto();
    }
  }, [accessToken, user, fetchUserPhoto]);

  return { photoUrl, loading, refetch };
};
