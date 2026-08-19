import mongoose, { Schema, Document } from 'mongoose';

// 1. User Model Schema (userGoldBodPro)
export interface IUserGoldBodPro extends Document {
  name: string;
  email: string;
  username: string;
  passwordHash?: string;
  password?: string;
  role: 'user' | 'admin';
  country?: string;
  phone?: string;
  balance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  activeInvestment: number;
  todaysProfit: number;
  totalProfit: number;
  referralIncome: number;
  pendingWithdrawals: number;
  hashPower: number;
  firstDepositRewardGiven: boolean;
  kycStatus: 'verified' | 'pending' | 'unverified';
  kycDocType?: string;
  kycDocUrl?: string;
  referralCode: string;
  referredBy?: string;
  createdAt: Date;
}

const userGoldBodProSchema = new Schema<IUserGoldBodPro>({
  name: { type: String },
  email: { type: String, required: true },
  username: { type: String },
  passwordHash: { type: String },
  password: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  country: { type: String, default: 'United States' },
  phone: { type: String, default: '' },
  balance: { type: Number, default: 0 },
  totalDeposited: { type: Number, default: 0 },
  totalWithdrawn: { type: Number, default: 0 },
  activeInvestment: { type: Number, default: 0 },
  todaysProfit: { type: Number, default: 0 },
  totalProfit: { type: Number, default: 0 },
  referralIncome: { type: Number, default: 0 },
  pendingWithdrawals: { type: Number, default: 0 },
  hashPower: { type: Number, default: 50 },
  firstDepositRewardGiven: { type: Boolean, default: false },
  kycStatus: { type: String, enum: ['verified', 'pending', 'unverified'], default: 'unverified' },
  kycDocType: { type: String, default: '' },
  kycDocUrl: { type: String, default: '' },
  referralCode: { type: String },
  referredBy: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
}, { strict: false });

export const userGoldBodPro = mongoose.models.userGoldBodPro || 
  mongoose.model<IUserGoldBodPro>('userGoldBodPro', userGoldBodProSchema, 'users');


// 2. Deposit / Recharge Model Schema (depositGoldBodPro & rechargeGoldBodPro)
export interface IDepositGoldBodPro extends Document {
  userId: any;
  gateway: string;
  amount: number;
  walletAddress: string;
  txHash?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

const depositGoldBodProSchema = new Schema<IDepositGoldBodPro>({
  userId: { type: Schema.Types.Mixed, required: true },
  gateway: { type: String, required: true },
  amount: { type: Number, required: true },
  walletAddress: { type: String, required: true },
  txHash: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
}, { strict: false });

export const depositGoldBodPro = mongoose.models.depositGoldBodPro || 
  mongoose.model<IDepositGoldBodPro>('depositGoldBodPro', depositGoldBodProSchema, 'deposits');

export const rechargeGoldBodPro = mongoose.models.rechargeGoldBodPro || 
  mongoose.model<IDepositGoldBodPro>('rechargeGoldBodPro', depositGoldBodProSchema, 'deposits');


// 3. Withdrawal Model Schema (withdrawalGoldBodPro)
export interface IWithdrawalGoldBodPro extends Document {
  userId: any;
  gateway: string;
  amount: number;
  walletAddress: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

const withdrawalGoldBodProSchema = new Schema<IWithdrawalGoldBodPro>({
  userId: { type: Schema.Types.Mixed, required: true },
  gateway: { type: String, required: true },
  amount: { type: Number, required: true },
  walletAddress: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
}, { strict: false });

export const withdrawalGoldBodPro = mongoose.models.withdrawalGoldBodPro || 
  mongoose.model<IWithdrawalGoldBodPro>('withdrawalGoldBodPro', withdrawalGoldBodProSchema, 'withdrawals');


// 4. Investment Mining Model Schema (investmentGoldBodPro)
export interface IInvestmentGoldBodPro extends Document {
  userId: any;
  planId: string;
  planName: string;
  amount: number;
  profitPercent?: number;
  dailyROI: number;
  durationDays: number;
  totalReturn?: number;
  totalEarned: number;
  status: 'active' | 'completed';
  startDate: Date;
  endDate?: Date;
  completedAt?: Date;
}

const investmentGoldBodProSchema = new Schema<IInvestmentGoldBodPro>({
  userId: { type: Schema.Types.Mixed, required: true },
  planId: { type: String, required: true },
  planName: { type: String, required: true },
  amount: { type: Number, required: true },
  profitPercent: { type: Number, default: 5 },
  dailyROI: { type: Number, required: true },
  durationDays: { type: Number, required: true },
  totalReturn: { type: Number, default: 0 },
  totalEarned: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'completed'], default: 'active' },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  completedAt: { type: Date }
}, { strict: false });

export const investmentGoldBodPro = mongoose.models.investmentGoldBodPro || 
  mongoose.model<IInvestmentGoldBodPro>('investmentGoldBodPro', investmentGoldBodProSchema, 'investments');


// 5. Transaction Log Model Schema (transactionGoldBodPro)
export interface ITransactionGoldBodPro extends Document {
  userId: string;
  type: 'deposit' | 'withdrawal' | 'investment' | 'mining_payout' | 'referral';
  amount: number;
  description: string;
  status: 'completed' | 'pending' | 'failed';
  createdAt: Date;
}

const transactionGoldBodProSchema = new Schema<ITransactionGoldBodPro>({
  userId: { type: String, required: true },
  type: { type: String, required: true },
  amount: { type: Number, required: true },
  description: { type: String, default: '' },
  status: { type: String, default: 'completed' },
  createdAt: { type: Date, default: Date.now }
});

export const transactionGoldBodPro = mongoose.models.transactionGoldBodPro || 
  mongoose.model<ITransactionGoldBodPro>('transactionGoldBodPro', transactionGoldBodProSchema, 'transactions');


// 6. Plan Configuration Model Schema (planGoldBodPro)
export interface IPlanGoldBodPro extends Document {
  id: string;
  name: string;
  dailyPercentage: number;
  minAmount: number;
  maxAmount: number;
  durationDays: number;
  tag: string;
}

const planGoldBodProSchema = new Schema<IPlanGoldBodPro>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  dailyPercentage: { type: Number, required: true },
  minAmount: { type: Number, required: true },
  maxAmount: { type: Number, required: true },
  durationDays: { type: Number, required: true },
  tag: { type: String, default: '' }
});

export const planGoldBodPro = mongoose.models.planGoldBodPro || 
  mongoose.model<IPlanGoldBodPro>('planGoldBodPro', planGoldBodProSchema, 'plans');


// 7. System Treasury & Live Financial Reserve Model Schema (systemReserveGoldBodPro)
export interface ISystemReserveGoldBodPro extends Document {
  companyMoney: number;
  totalDeposited: number;
  totalWithdrawn: number;
  activeInvestors: number;
  lastUpdated: Date;
}

const systemReserveGoldBodProSchema = new Schema<ISystemReserveGoldBodPro>({
  companyMoney: { type: Number, default: 876834764 },
  totalDeposited: { type: Number, default: 284520450 },
  totalWithdrawn: { type: Number, default: 142850800 },
  activeInvestors: { type: Number, default: 28450 },
  lastUpdated: { type: Date, default: Date.now }
});

export const systemReserveGoldBodPro = mongoose.models.systemReserveGoldBodPro || 
  mongoose.model<ISystemReserveGoldBodPro>('systemReserveGoldBodPro', systemReserveGoldBodProSchema, 'system_reserves');
