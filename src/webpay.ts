import { Config, DEFAULT_CONFIG, getEnvironmentUrls } from './types/config';
import { PaymentParams, PaymentCallbacks, PaymentWindowState } from './types/payment';
import { validatePaymentParams } from './utils/validation';
import { getPopupFeatures } from './utils/window';
import { QuickBytesAPI } from './api/client';


export class QuickBytesPayment {
  private readonly config: Required<Omit<Config, 'appUrl' | 'apiUrl'>> & {
    appUrl: string;
    apiUrl: string;
  };
  private readonly activePayments: Map<string, PaymentWindowState>;
  private readonly boundMessageHandler: (event: MessageEvent) => void;
  public readonly api: QuickBytesAPI;

  constructor(config: Config = {}) {
    const { appUrl, apiUrl } = getEnvironmentUrls(config);

    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      appUrl,
      apiUrl
    };

    this.activePayments = new Map();
    this.boundMessageHandler = this.handleMessage.bind(this);
    window.addEventListener('message', this.boundMessageHandler);

    this.api = new QuickBytesAPI({
      apiUrl: this.config.apiUrl,
    });

    console.debug('QuickBytes Payment initialized:', {
      appUrl: this.config.appUrl,
      apiUrl: this.config.apiUrl,
      testMode: config.testMode
    });
  }



  /**
   * Creates a payment request for content
   * @param params Payment parameters and callbacks
   * @returns Transaction ID for the payment
   */
  public createPayment(params: PaymentParams & PaymentCallbacks): string {
    if (!validatePaymentParams(params)) {
      throw new Error('Invalid payment parameters');
    }

    const txn_id = this.generateTransactionId();
    const queryParams = new URLSearchParams({
      txn_id,
      cents: params.cents.toString(),
      payment_address: params.payment_address,
      ...(params.payee_name && { payee_name: params.payee_name }),
      ...(params.item_name && { item_name: params.item_name })
    });

    const paymentUrl = `${this.config.appUrl}?${queryParams}`;

    // Store callbacks for this transaction
    this.activePayments.set(txn_id, {
      onSuccess: params.onSuccess,
      onError: params.onError,
      onClose: params.onClose,
      window: null
    });

    // Open payment window
    const payWindow = window.open(
      paymentUrl,
      `QuickBytes_${txn_id}`,
      getPopupFeatures(this.config)
    );

    if (!payWindow) {
      this.handleError(txn_id, new Error('Popup blocked by browser'));
      return txn_id;
    }

    const payment = this.activePayments.get(txn_id);
    if (payment) {
      payment.window = payWindow;
    }

    // Set up window close monitoring
    this.monitorWindowClose(txn_id, payWindow);

    console.debug('Payment initiated', { txn_id, params });
    return txn_id;
  }

  /**
   * Verifies transaction details using the API client
   * @param txn_id Transaction ID to verify
   * @returns Promise resolving to transaction details
   */
  public verifyTransaction(txn_id: string) {
    return this.api.verifyTransaction(txn_id);
  }

  /**
   * Cleans up event listeners and active payments
   */
  public destroy(): void {
    window.removeEventListener('message', this.boundMessageHandler);
    this.activePayments.clear();
  }

  private generateTransactionId(): string {
    return crypto.randomUUID();
  }

  private handleMessage(event: MessageEvent): void {
    if (new URL(this.config.appUrl).origin !== event.origin) {
      console.debug('Message received from unauthorized origin:', event.origin);
      return;
    }

    const data = event.data;
    if (!data?.txn_id || !data.transaction || !data?.type || data.type !== 'payment_complete') {
      return;
    }

    const transaction = data.transaction;

    const payment = this.activePayments.get(data.txn_id);
    if (!payment) return;

    if (data.status === 'success' && payment.onSuccess) {
      payment.onSuccess(transaction);
      payment.isComplete = true;
    } else if (data.status === 'error' && payment.onError) {
      payment.onError(new Error('Payment failed'));
    }

    console.debug('Payment message received', data);
  }

  private async monitorWindowClose(txn_id: string, payWindow: Window): Promise<void> {
    const pollInterval = setInterval(async () => {
      if (payWindow.closed) {
        clearInterval(pollInterval);
        const payment = this.activePayments.get(txn_id);

        // window was closed without finishing payment
        if (payment && !payment.isComplete) {
          try {
            // Check with server for transaction status
            const verificationResponse = await this.api.verifyTransaction(txn_id);

            if (verificationResponse) {
              // Transaction was successful
              if (payment.onSuccess) {
                payment.onSuccess(verificationResponse);
              }
              console.debug('Transaction verified after window close', { txn_id, verificationResponse });
            } else if (payment.onClose) {
              // No successful transaction found
              console.debug('Transaction not found after window close', { txn_id });
              payment.onClose();
            }
          } catch (error) {
            console.debug('Transaction verification failed after window close', { txn_id, error });
            if (payment.onClose) {
              payment.onClose();
            }
          } finally {
            this.activePayments.delete(txn_id);
          }
        }

        console.debug('Payment window closed', { txn_id });
      }
    }, 1000);
  }

  private handleError(txn_id: string, error: Error): void {
    const payment = this.activePayments.get(txn_id);
    if (payment?.onError) {
      payment.onError(error);
    }
    this.activePayments.delete(txn_id);
    console.debug('Payment error', { txn_id, error });
  }

}
