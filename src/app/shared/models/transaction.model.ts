export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  edited_amount?: number | null;
  category: string;
  account_id: string;
  account_name: string;
  merchant_name?: string;
  pending: boolean;
  connelaide_category?: string;
  note?: string;
  impacts_checking_balance?: string;
}

export interface TransactionChunk {
  startDate: Date;
  endDate: Date;
  transactions: Transaction[];
  isExpanded: boolean;
  totalAmount: number;
}

export interface RefreshStatus {
  last_refreshed_at: string | null;
}

export interface RefreshResponse {
  success: boolean;
  message: string;
  transactions_fetched?: number;
  last_refreshed_at?: string;
}
