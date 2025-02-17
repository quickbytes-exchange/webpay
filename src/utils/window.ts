import { Config } from "../types/config";

export interface PopupFeatures {
  width: number;
  height: number;
  left: number;
  top: number;
  features: string;
}

export function getPopupFeatures(config: Required<Pick<Config, 'popupWidth' | 'popupHeight' | 'popupFeatures'>>): string {
  const left = (window.screen.width - config.popupWidth) / 2;
  const top = (window.screen.height - config.popupHeight) / 2;
  return `width=${config.popupWidth},height=${config.popupHeight},left=${left},top=${top},${config.popupFeatures}`;
}
