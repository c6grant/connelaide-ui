export interface ProjectedExpense {
  id: number;
  name: string;
  amount: number;
  date: string;
  connelaide_category_id?: number | null;
  connelaide_category?: string | null;
  note?: string;
  is_struck_out: boolean;
  merged_transaction_id?: number | null;
  recurring_expense_id?: number | null;
  created_at: string;
  updated_at?: string;
}

export interface ProjectedExpenseCreate {
  name: string;
  amount: number;
  date: string;
  connelaide_category_id?: number;
  note?: string;
}

export interface ProjectedExpenseUpdate {
  name?: string;
  amount?: number;
  date?: string;
  connelaide_category_id?: number | null;
  note?: string;
  is_struck_out?: boolean;
  merged_transaction_id?: number | null;
}
