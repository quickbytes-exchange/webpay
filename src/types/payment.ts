export interface PaymentParams {
  cents: number;
  payment_address: string;
  payee_name?: string;
  item_name?: string;
  verify?: boolean;
}

export interface PaymentParams {
  cents: number;
  payment_address: string;
  payee_name?: string;
  item_name?: string;
}

export interface PaymentCallbacks {
  onSuccess?: (data: PaymentResponse) => void;
  onError?: (error: Error) => void;
  onClose?: () => void;
}

export interface PaymentResponse {
  txn_id: string;
  payer: string;
  payee: string;
  charge_amount: number;
  charge_unit: string;
  payment_amount: number;
  payment_unit: string;
  algo_group_id: string;
  algo_txn_id: string;
  ts_init: string;
}

export interface PaymentWindowState extends PaymentCallbacks {
  window: Window | null;
  isComplete?: boolean;  // Track if payment is complete
}
