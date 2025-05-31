import { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { graphConfig, loginRequest } from '@/config/authConfig';

export const useUserPhoto = () => {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { instance, accounts } = useMsal();

  const fetchUserPhoto = async () => {
    if (!accounts || accounts.length === 0) return;

    setLoading(true);
    try {
      // Get access token
      const response = await instance.acquireTokenSilent({
        ...loginRequest,
        account: accounts[0],
      });

      // Fetch photo from Microsoft Graph
      const photoResponse = await fetch(graphConfig.graphPhotoEndpoint, {
        headers: {
          'Authorization': `Bearer ${response.accessToken}`,
        },
      });

      if (photoResponse.ok) {
        const photoBlob = await photoResponse.blob();
        const photoObjectUrl = URL.createObjectURL(photoBlob);
        setPhotoUrl(photoObjectUrl);
      }
    } catch (error) {
      console.log('Error fetching user photo:', error);
      // No photo available or error occurred, keep photoUrl as null
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accounts && accounts.length > 0) {
      fetchUserPhoto();
    }

    // Cleanup function to revoke object URL
    return () => {
      if (photoUrl) {
        URL.revokeObjectURL(photoUrl);
      }
    };
  }, [accounts]);

  return { photoUrl, loading, refetch: fetchUserPhoto };
};
