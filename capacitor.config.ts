import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lifesync.app',
  appName: 'LifeSync',
  webDir: 'dist',
  android: {
    path: 'android',
  },
};

export default config;
