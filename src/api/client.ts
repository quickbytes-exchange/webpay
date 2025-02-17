import { PaymentResponse } from '../types/payment';

interface APIConfig {
  apiUrl: string;
}

export class QuickBytesAPI {
  private readonly apiUrl: string;

  constructor(config: APIConfig) {
    if (!config.apiUrl) {
      throw new Error('apiUrl is required for QuickBytesAPI');
    }

    this.apiUrl = config.apiUrl,
      console.debug('Initialized QuickBytesAPI');
  }

  /**
   * Fetches and verifies transaction details
   * @param txn_id Transaction ID to verify
   * @returns Promise resolving to transaction details
   */
  public async verifyTransaction(txn_id: string): Promise<PaymentResponse | null> {
    if (!txn_id) {
      throw new Error('Transaction ID is required');
    }

    try {
      const response = await fetch(`${this.apiUrl}/v1/transaction/${txn_id}`);

      if (!response.ok) {
        if (response.status === 404) {
          console.debug('Transaction not found', { txn_id });
          return null;
        }
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.debug('Transaction verified', data);
      return data;
    } catch (error) {
      console.debug('Transaction verification failed', { txn_id, error });
      throw error;
    }
  }
}
