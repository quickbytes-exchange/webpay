export interface Config {
  testMode?: boolean;
  appUrl?: string;    // For the payment window - overrides testMode if set
  apiUrl?: string;     // For API calls - overrides testMode if set
  popupWidth?: number;
  popupHeight?: number;
  popupFeatures?: string;
}

export const DEFAULT_CONFIG: Required<Pick<Config, 'testMode' | 'popupWidth' | 'popupHeight' | 'popupFeatures'>> = {
  testMode: false,
  popupWidth: 600,
  popupHeight: 800,
  popupFeatures: 'resizable=yes,scrollbars=yes,status=yes'
};

export function getEnvironmentUrls(config: Pick<Config, 'testMode' | 'appUrl' | 'apiUrl'>) {
  const isTestMode = config.testMode;

  return {
    appUrl: config.appUrl || (isTestMode ?
      'https://test.pay.quickbytes.exchange' :
      'https://pay.quickbytes.exchange'),
    apiUrl: config.apiUrl || (isTestMode ?
      'https://test.api.quickbytes.exchange' :
      'https://api.quickbytes.exchange')
  };
}
