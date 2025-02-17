import { QuickBytesPayment } from '../webpay';
import { PaymentResponse } from '../types/payment';
import { Config } from '../types/config';

interface ButtonAttributes {
  cents: number;
  'payment-address': string;
  'payee-name'?: string;
  'item-name'?: string;
  size?: 'small' | 'default' | 'large';
  theme?: 'default' | 'dark' | 'light';
  disabled?: boolean;
  testmode?: boolean;
  // For development/custom environments only
  'app-url'?: string;
  'api-url'?: string;
}

// Define custom events for TypeScript
interface PaymentSuccessEvent extends CustomEvent<PaymentResponse> { }
interface PaymentErrorEvent extends CustomEvent<Error> { }
interface PaymentClosedEvent extends CustomEvent<void> { }

// Declare the events on the element
declare global {
  interface HTMLElementEventMap {
    'quickbytes-success': PaymentSuccessEvent;
    'quickbytes-error': PaymentErrorEvent;
    'quickbytes-closed': PaymentClosedEvent;
  }
}

class QuickBytesPayButton extends HTMLElement {
  private payment: QuickBytesPayment | null = null;

  static get observedAttributes(): Array<keyof ButtonAttributes> {
    return ['app-url', 'api-url', 'cents', 'payment-address', 'payee-name', 'item-name', 'size', 'theme', 'disabled'];
  }

  private initializePayment(): void {
    const appUrl = this.getAttribute('app-url');
    const apiUrl = this.getAttribute('api-url');

    const config: Config = {
      testMode: this.hasAttribute('testmode')
    };

    if (appUrl) config.appUrl = appUrl;
    if (apiUrl) config.apiUrl = apiUrl;

    // Clean up existing instance if it exists
    if (this.payment) {
      this.payment.destroy();
    }

    // Create new instance with updated URLs
    this.payment = new QuickBytesPayment(config);
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    try {
      this.initializePayment();
      this.render();
    } catch (error) {
      console.error('Failed to initialize QuickBytes payment button:', error);
      this.dispatchPaymentError(error instanceof Error ? error : new Error('Initialization failed'));
    }
  }

  disconnectedCallback(): void {
    if (this.payment) {
      this.payment.destroy();
      this.payment = null;
    }
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (name === 'app-url' && oldValue !== null && oldValue !== newValue) {
      this.initializePayment();
    }
    this.render();
  }
  private formatPrice(cents: number): string {
    return `$${(cents / 100).toFixed(2)}`;
  }

  private dispatchPaymentSuccess(response: PaymentResponse): void {
    const event: PaymentSuccessEvent = new CustomEvent('quickbytes-success', {
      bubbles: true,
      composed: true,
      detail: response
    });
    this.dispatchEvent(event);
  }

  private dispatchPaymentError(error: Error): void {
    const event: PaymentErrorEvent = new CustomEvent('quickbytes-error', {
      bubbles: true,
      composed: true,
      detail: error
    });
    this.dispatchEvent(event);
  }

  private dispatchPaymentClosed(): void {
    const event: PaymentClosedEvent = new CustomEvent('quickbytes-closed', {
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
  }

  private async handlePaymentError(txn_id: string, error: Error): Promise<void> {
    if (!this.payment) {
      this.dispatchPaymentError(new Error('Payment service not initialized'));
      return;
    }

    try {
      const verificationResponse = await this.payment.verifyTransaction(txn_id);
      if (verificationResponse) {
        this.dispatchPaymentSuccess(verificationResponse);
        return;
      }
    } catch (verifyError) {
      console.warn('Transaction verification failed:', verifyError);
    }

    this.dispatchPaymentError(error);
  }

  private handleClick = async (): Promise<void> => {
    if (!this.payment) {
      this.dispatchPaymentError(new Error('Payment service not initialized'));
      return;
    }

    const cents = parseInt(this.getAttribute('cents') || '0', 10);
    const paymentAddress = this.getAttribute('payment-address');
    const payeeName = this.getAttribute('payee-name') || '';
    const itemName = this.getAttribute('item-name') || '';

    if (!paymentAddress) {
      this.dispatchPaymentError(new Error('Payment address is required'));
      return;
    }

    try {
      const txn_id = this.payment.createPayment({
        cents,
        payment_address: paymentAddress,
        payee_name: payeeName,
        item_name: itemName,
        onSuccess: (data: PaymentResponse) => {
          this.dispatchPaymentSuccess(data);
        },
        onError: (error: Error) => {
          this.handlePaymentError(txn_id, error);
        },
        onClose: () => {
          this.dispatchPaymentClosed();
        }
      });
    } catch (error) {
      this.dispatchPaymentError(error as Error);
    }
  };

  private render(): void {
    if (!this.shadowRoot) return;

    const cents = parseInt(this.getAttribute('cents') || '0', 10);
    const size = this.getAttribute('size') || 'default';
    const theme = this.getAttribute('theme') || 'default';
    const disabled = this.hasAttribute('disabled');

    this.shadowRoot.innerHTML = `
      <style>
        .quickbytes-button {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          background-color: #FFB804;
          color: #000000;
          border: none;
          border-radius: 4px;
          padding: 8px 20px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 35px;
          text-decoration: none;
          transition: background-color 0.2s ease;
          position: relative;
          min-width: 150px;
        }

        .quickbytes-button:hover {
          background-color: #E5A604;
        }

        .quickbytes-button:active {
          background-color: #CC9504;
        }

        .quickbytes-button:disabled {
          background-color: #FFE4A3;
          cursor: not-allowed;
        }

        .quickbytes-button__logo {
          height: 30px;
          margin-right: 8px;
        }

        .quickbytes-button__text {
          white-space: nowrap;
        }

        /* Size variants */
        .quickbytes-button--small {
          padding: 8px 16px;
          font-size: 14px;
          min-height: 32px;
          min-width: 160px;
        }

        .quickbytes-button--large {
          padding: 12px 32px;
          font-size: 18px;
          min-height: 48px;
          min-width: 240px;
        }

        /* Color variants */
        .quickbytes-button--dark {
          background-color: #2D3748;
          color: #FFFFFF;
        }

        .quickbytes-button--dark:hover {
          background-color: #1A202C;
        }

        .quickbytes-button--dark:active {
          background-color: #171923;
        }

        .quickbytes-button--light {
          background-color: #FFFFFF;
          color: #000000;
          border: 1px solid #E2E8F0;
        }

        .quickbytes-button--light:hover {
          background-color: #F7FAFC;
        }

        .quickbytes-button--light:active {
          background-color: #EDF2F7;
        }
      </style>
      <button 
        class="quickbytes-button quickbytes-button--${size} quickbytes-button--${theme}"
        ${disabled ? 'disabled' : ''}>
        <img src="${this.getLogoUrl()}" alt="QuickBytes" class="quickbytes-button__logo">
        <span class="quickbytes-button__text">Pay ${this.formatPrice(cents)}</span>
      </button>
    `;

    this.shadowRoot.querySelector('button')?.addEventListener('click', this.handleClick);
  }

  private getLogoUrl(): string {
    return "https://quickbytes.exchange/images/quickbytes-button-logo.png";
  }
}

// Register the custom element
if (!customElements.get('quickbytes-pay-button')) {
  customElements.define('quickbytes-pay-button', QuickBytesPayButton);
}

export default QuickBytesPayButton;
