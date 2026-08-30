declare module "@paystack/inline-js" {
  export interface PaystackSuccessResponse {
    id?: number;
    reference: string;
    message: string;
  }

  export interface PaystackErrorResponse {
    message: string;
  }

  export interface ResumeTransactionCallbacks {
    onSuccess?: (transaction: PaystackSuccessResponse) => void;
    onCancel?: () => void;
    onError?: (error: PaystackErrorResponse) => void;
    onLoad?: (data: {
      id: number;
      customer: unknown;
      accessCode: string;
    }) => void;
  }

  export default class PaystackPop {
    constructor();
    resumeTransaction(
      accessCode: string,
      callbacks?: ResumeTransactionCallbacks,
    ): unknown;
    newTransaction(
      options: Record<string, unknown> & ResumeTransactionCallbacks,
    ): unknown;
  }
}
