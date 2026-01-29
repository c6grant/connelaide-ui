export interface RecurringExpense {
  id: number;
  name: string;
  amount: number;
  frequency: 'monthly' | 'yearly';
  day_of_month: number;
  month_of_year?: number | null;
  start_date: string;
  end_date?: string | null;
  connelaide_category_id?: number | null;
  connelaide_category?: string | null;
  note?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface RecurringExpenseCreate {
  name: string;
  amount: number;
  frequency: 'monthly' | 'yearly';
  day_of_month: number;
  month_of_year?: number;
  start_date: string;
  end_date?: string;
  connelaide_category_id?: number;
  note?: string;
}

export interface RecurringExpenseUpdate {
  name?: string;
  amount?: number;
  frequency?: 'monthly' | 'yearly';
  day_of_month?: number;
  month_of_year?: number | null;
  start_date?: string;
  end_date?: string | null;
  connelaide_category_id?: number | null;
  note?: string;
  is_active?: boolean;
}
