import { Injectable } from '@angular/core';
import { Transaction, TransactionChunk } from '../../../shared/models/transaction.model';

export interface HalfMonthPeriod {
  start: Date;
  end: Date;
}

@Injectable({
  providedIn: 'root'
})
export class TransactionChunkService {
  private readonly CHUNK_DAYS = 14;

  /**
   * Calculate the half-month period for a given date.
   * First half: 1st-15th, Second half: 16th-end of month
   */
  getHalfMonthPeriod(date: Date): HalfMonthPeriod {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    if (day <= 15) {
      // First half: 1st to 15th
      return {
        start: new Date(year, month, 1),
        end: new Date(year, month, 15)
      };
    } else {
      // Second half: 16th to end of month
      const lastDay = new Date(year, month + 1, 0).getDate();
      return {
        start: new Date(year, month, 16),
        end: new Date(year, month, lastDay)
      };
    }
  }

  /**
   * Get the previous half-month period from a given start date
   */
  getPreviousPeriod(currentStart: Date): HalfMonthPeriod {
    const year = currentStart.getFullYear();
    const month = currentStart.getMonth();
    const day = currentStart.getDate();

    if (day === 16) {
      // Currently in second half, go to first half of same month
      return {
        start: new Date(year, month, 1),
        end: new Date(year, month, 15)
      };
    } else {
      // Currently in first half (day 1), go to second half of previous month
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const lastDay = new Date(prevYear, prevMonth + 1, 0).getDate();
      return {
        start: new Date(prevYear, prevMonth, 16),
        end: new Date(prevYear, prevMonth, lastDay)
      };
    }
  }

  /**
   * Format a date for API calls (YYYY-MM-DD)
   */
  formatDateForApi(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Create a TransactionChunk from transactions and a period
   */
  createChunkFromPeriod(transactions: Transaction[], period: HalfMonthPeriod): TransactionChunk {
    const totalAmount = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    return {
      startDate: period.start,
      endDate: period.end,
      transactions,
      isExpanded: false,
      totalAmount
    };
  }

  groupTransactionsIntoChunks(transactions: Transaction[]): TransactionChunk[] {
    if (!transactions || transactions.length === 0) {
      return [];
    }

    // Sort transactions by date descending
    const sorted = [...transactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const chunks: TransactionChunk[] = [];
    let currentChunk: Transaction[] = [];
    let chunkEndDate: Date | null = null;
    let chunkStartDate: Date | null = null;

    for (const transaction of sorted) {
      const txDate = new Date(transaction.date);

      if (chunkEndDate === null) {
        // Start first chunk
        chunkEndDate = txDate;
        chunkStartDate = new Date(txDate);
        chunkStartDate.setDate(chunkStartDate.getDate() - this.CHUNK_DAYS + 1);
        currentChunk = [transaction];
      } else if (txDate >= chunkStartDate!) {
        // Add to current chunk
        currentChunk.push(transaction);
      } else {
        // Save current chunk and start new one
        chunks.push(this.createChunk(currentChunk, chunkStartDate!, chunkEndDate));

        chunkEndDate = txDate;
        chunkStartDate = new Date(txDate);
        chunkStartDate.setDate(chunkStartDate.getDate() - this.CHUNK_DAYS + 1);
        currentChunk = [transaction];
      }
    }

    // Don't forget the last chunk
    if (currentChunk.length > 0 && chunkStartDate && chunkEndDate) {
      chunks.push(this.createChunk(currentChunk, chunkStartDate, chunkEndDate));
    }

    return chunks;
  }

  private createChunk(transactions: Transaction[], startDate: Date, endDate: Date): TransactionChunk {
    const totalAmount = transactions.reduce((sum, tx) => sum + tx.amount, 0);

    return {
      startDate,
      endDate,
      transactions,
      isExpanded: false,
      totalAmount
    };
  }
}
