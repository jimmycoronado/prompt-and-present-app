
import { useCallback } from 'react';

interface UseBannerActionProps {
  onSendMessage?: (message: string) => void;
}

export const useBannerAction = ({ onSendMessage }: UseBannerActionProps = {}) => {
  const handleBannerClick = useCallback((automaticReply: string) => {
    console.log('Banner action triggered:', automaticReply);
    if (onSendMessage) {
      onSendMessage(automaticReply);
    }
  }, [onSendMessage]);

  return { handleBannerClick };
};
