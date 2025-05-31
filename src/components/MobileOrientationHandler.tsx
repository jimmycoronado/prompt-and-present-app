
import { useEffect } from 'react';

export const MobileOrientationHandler: React.FC = () => {
  useEffect(() => {
    // Prevent zoom on double tap
    let lastTouchEnd = 0;
    const handleTouchEnd = (e: TouchEvent) => {
      const now = new Date().getTime();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };

    // Handle orientation change
    const handleOrientationChange = () => {
      console.log('Orientation changed, preventing page reload');
      // Force a small delay to prevent issues
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 100);
    };

    // Add event listeners
    document.addEventListener('touchend', handleTouchEnd, false);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    // Cleanup
    return () => {
      document.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return null;
};
