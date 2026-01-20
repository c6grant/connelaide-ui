export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  account_id: string;
  merchant_name?: string;
  pending: boolean;
}

export interface TransactionChunk {
  startDate: Date;
  endDate: Date;
  transactions: Transaction[];
  isExpanded: boolean;
  totalAmount: number;
}
