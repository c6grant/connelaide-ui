export interface PayPeriod {
  id: number;
  start_date: string;
  end_date: string;
  checking_budget: number | null;
  created_at: string;
  updated_at?: string;
}

export interface PayPeriodCreate {
  start_date: string;
  end_date: string;
  checking_budget?: number | null;
}

export interface PayPeriodUpdate {
  start_date?: string;
  end_date?: string;
  checking_budget?: number | null;
}
