import { useState, useEffect } from 'react';

interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  userAgent: string;
  hasCamera: boolean;
  supportsSMS: boolean;
}

export function useDeviceDetection(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    userAgent: '',
    hasCamera: false,
    supportsSMS: false,
  });

  useEffect(() => {
    const detectDevice = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      
      // Mobile detection
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      
      // Tablet detection (more specific)
      const isTablet = /iPad|Android(?=.*Tablet)|Tablet/i.test(userAgent);
      
      // Desktop is default if not mobile
      const isDesktop = !isMobile;

      // Check for camera availability
      const hasCamera = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

      // SMS support detection (generally only available on mobile devices with native apps)
      // For web apps, we'll consider SMS available only on mobile
      const supportsSMS = isMobile && 'navigator' in window;

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        userAgent,
        hasCamera,
        supportsSMS,
      });
    };

    detectDevice();
    
    // Re-detect on window resize (for responsive testing)
    window.addEventListener('resize', detectDevice);
    
    return () => {
      window.removeEventListener('resize', detectDevice);
    };
  }, []);

  return deviceInfo;
}

// Utility function to check if platform-specific features should be available
export function isPlatformFeatureAvailable(feature: 'camera' | 'sms', deviceInfo: DeviceInfo): boolean {
  switch (feature) {
    case 'camera':
      return deviceInfo.isMobile && deviceInfo.hasCamera;
    case 'sms':
      return deviceInfo.isMobile && deviceInfo.supportsSMS;
    default:
      return false;
  }
}