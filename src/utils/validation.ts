import { PaymentParams } from "../types/payment";


export function validatePaymentParams(params: PaymentParams): boolean {
  if (!params) return false;

  // Required parameters
  if (!params.cents || !params.payment_address) return false;

  // Validate cents is a positive number
  if (typeof params.cents !== 'number' || params.cents <= 0) return false;

  // Validate Algorand address format (basic check)
  if (!/^[A-Z2-7]{58}$/.test(params.payment_address)) return false;

  return true;
}
