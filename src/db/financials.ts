import { db } from './index.ts';
import { financialTransactions } from './schema.ts';
import { desc } from 'drizzle-orm';

export async function getCreatorFinancialSummary() {
  try {
    const transactions = await db
      .select()
      .from(financialTransactions)
      .orderBy(desc(financialTransactions.createdAt));

    let totalGross = 0;
    let totalTutorDisbursed = 0;
    let totalCreatorPlatformFees = 0;
    let totalTaxWithheld = 0;

    transactions.forEach((tx) => {
      totalGross += tx.grossAmount;
      totalTutorDisbursed += tx.tutorShare;
      totalCreatorPlatformFees += tx.creatorPlatformFee;
      totalTaxWithheld += tx.taxWithheld;
    });

    return {
      designatedBankAccount: '3205303331 (Centenary Bank)',
      accountHolder: 'High School Tutoring Hub Directorate / Creator',
      currency: 'UGX',
      totalGrossRevenue: totalGross,
      totalTutorDisbursements: totalTutorDisbursed,
      totalCreatorNetEarnings: totalCreatorPlatformFees,
      totalTaxWithheld: totalTaxWithheld,
      taxFilingStatus: 'Uganda Revenue Authority (URA) WHT Compliant (5%)',
      recentTransactions: transactions,
    };
  } catch (error) {
    console.error('Database query failed in getCreatorFinancialSummary:', error);
    throw new Error('Failed to load creator financial reporting suite', { cause: error });
  }
}
