
export interface BannerData {
  id: string;
  type: 'commission' | 'birthday' | 'risk' | 'opportunity' | 'performance' | 'task';
  title: string;
  message: string;
  value?: string | number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionText?: string;
  actionUrl?: string;
  icon?: string;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo';
  expiresAt?: Date;
}

export interface UserBannerConfig {
  userId: string;
  enabled: boolean;
  rotationInterval: number; // seconds
  maxBanners: number;
  bannerTypes: BannerData['type'][];
}
