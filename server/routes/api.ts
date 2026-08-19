import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { dbStatusInfo, connectDB } from '../config/db.js';
import { 
  userGoldBodPro, 
  depositGoldBodPro, 
  rechargeGoldBodPro, 
  withdrawalGoldBodPro, 
  investmentGoldBodPro, 
  transactionGoldBodPro, 
  planGoldBodPro, 
  systemReserveGoldBodPro 
} from '../models/schemas.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'GOLDBOD_PRO_SUPER_SECRET_KEY_2026';

// In-Memory Data Store with default seeds (works instantly in any container, backed by Mongoose when DB connected)
const MEMORY_DB = {
  users: [
    {
      id: 'usr_1',
      name: 'Alex Vance',
      email: 'investor@goldbod.pro',
      username: 'alexvance',
      passwordHash: bcrypt.hashSync('password123', 10),
      role: 'user',
      country: 'United States',
      phone: '+1 (555) 234-5678',
      balance: 1250.00,
      totalDeposited: 2000.00,
      totalWithdrawn: 750.00,
      activeInvestment: 1000.00,
      todaysProfit: 45.50,
      totalProfit: 380.00,
      referralIncome: 125.00,
      pendingWithdrawals: 0.00,
      hashPower: 450, // TH/s
      referralCode: 'GBP-ALEX88',
      referredBy: null,
      firstDepositRewardGiven: false,
      kycDocType: 'Passport',
      kycDocUrl: '',
      kycStatus: 'verified' as 'verified' | 'pending' | 'unverified',
      createdAt: new Date().toISOString()
    },
    {
      id: 'usr_admin',
      name: 'GoldBod Admin',
      email: 'admin@goldbod.com',
      username: 'admin',
      passwordHash: bcrypt.hashSync('admin12345@', 10),
      role: 'admin',
      country: 'United Kingdom',
      phone: '+44 20 7946 0912',
      balance: 50000.00,
      totalDeposited: 100000.00,
      totalWithdrawn: 50000.00,
      activeInvestment: 25000.00,
      todaysProfit: 1250.00,
      totalProfit: 18500.00,
      referralIncome: 3400.00,
      pendingWithdrawals: 0.00,
      hashPower: 2500,
      referralCode: 'GBP-ADMIN01',
      referredBy: null,
      firstDepositRewardGiven: false,
      kycDocType: 'National ID',
      kycDocUrl: '',
      kycStatus: 'verified' as 'verified' | 'pending' | 'unverified',
      createdAt: new Date().toISOString()
    },
    {
      id: 'usr_admin_pro',
      name: 'GoldBod Admin',
      email: 'admin@goldbod.pro',
      username: 'adminpro',
      passwordHash: bcrypt.hashSync('admin12345@', 10),
      role: 'admin',
      country: 'United Kingdom',
      phone: '+44 20 7946 0912',
      balance: 50000.00,
      totalDeposited: 100000.00,
      totalWithdrawn: 50000.00,
      activeInvestment: 25000.00,
      todaysProfit: 1250.00,
      totalProfit: 18500.00,
      referralIncome: 3400.00,
      pendingWithdrawals: 0.00,
      hashPower: 2500,
      referralCode: 'GBP-ADMIN02',
      referredBy: null,
      firstDepositRewardGiven: false,
      kycDocType: 'National ID',
      kycDocUrl: '',
      kycStatus: 'verified' as 'verified' | 'pending' | 'unverified',
      createdAt: new Date().toISOString()
    }
  ],
  plans: [
    {
      id: 'plan_1',
      name: 'Starter Plan',
      badge: '24H Fast ROI',
      minAmount: 50,
      maxAmount: 1000,
      profitPercent: 5,
      durationDays: 1, // 24 Hours
      capitalReturn: true,
      active: true
    },
    {
      id: 'plan_2',
      name: 'Silver Plan',
      badge: 'Most Popular',
      minAmount: 400,
      maxAmount: 10000,
      profitPercent: 12,
      durationDays: 3,
      capitalReturn: true,
      active: true
    },
    {
      id: 'plan_3',
      name: 'Gold Plan',
      badge: 'High Yield',
      minAmount: 1000,
      maxAmount: 50000,
      profitPercent: 15,
      durationDays: 5,
      capitalReturn: true,
      active: true
    },
    {
      id: 'plan_4',
      name: 'Diamond Plan',
      badge: 'VIP Elite',
      minAmount: 1700,
      maxAmount: 1000000,
      profitPercent: 20,
      durationDays: 7,
      capitalReturn: true,
      active: true
    }
  ],
  activeInvestments: [
    {
      id: 'inv_101',
      userId: 'usr_1',
      planName: 'Gold Plan',
      amount: 1000.00,
      profitPercent: 15,
      durationDays: 5,
      dailyReturn: 30.00,
      totalReturn: 1150.00,
      startDate: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
      endDate: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
      status: 'active'
    }
  ],
  deposits: [
    {
      id: 'dep_1',
      userId: 'usr_1',
      userName: 'Alex Vance',
      userEmail: 'investor@goldbod.pro',
      amount: 500,
      gateway: 'USDT TRC20',
      txHash: '0x8a7f92b41c63de09852f11a842c',
      proofUrl: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&w=400&q=80',
      status: 'approved',
      createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'dep_2',
      userId: 'usr_1',
      userName: 'Alex Vance',
      userEmail: 'investor@goldbod.pro',
      amount: 1000,
      gateway: 'BTC',
      txHash: '1a8f9210c44bb192f1a92e1045',
      proofUrl: '',
      status: 'approved',
      createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'dep_3',
      userId: 'usr_1',
      userName: 'Alex Vance',
      userEmail: 'investor@goldbod.pro',
      amount: 750,
      gateway: 'USDT TRC20',
      txHash: '0x992fa84b12c89012e4f5',
      proofUrl: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&w=400&q=80',
      status: 'pending',
      createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
    }
  ],
  withdrawals: [
    {
      id: 'wd_1',
      userId: 'usr_1',
      userName: 'Alex Vance',
      userEmail: 'investor@goldbod.pro',
      amount: 150,
      gateway: 'USDT TRC20',
      walletAddress: 'TX9K4fJ2b1g8pQ3L9m1vZ8W7x6y5z4a3b2',
      status: 'approved',
      createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString()
    }
  ],
  transactions: [
    {
      id: 'tx_101',
      userId: 'usr_1',
      type: 'Deposit',
      amount: 1000.00,
      currency: 'BTC',
      description: 'Approved BTC Deposit',
      status: 'Completed',
      createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'tx_102',
      userId: 'usr_1',
      type: 'Plan Investment',
      amount: 1000.00,
      currency: 'USDT',
      description: 'Subscribed to Gold Plan',
      status: 'Completed',
      createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'tx_103',
      userId: 'usr_1',
      type: 'Mining Yield',
      amount: 45.50,
      currency: 'USDT',
      description: 'Daily Cloud Mining Return (450 TH/s)',
      status: 'Completed',
      createdAt: new Date().toISOString()
    }
  ],
  wallets: {
    USDT_TRC20: { 
      address: 'TMmpdCUFH9xJ5efivRdyAw8MBVGqdsJmpX',
      notice: 'Deposits via smart contracts are not supported with the exception of ETH via ERC20, Arbitrum & Optimism network or BNB via BSC network.',
      qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=TMmpdCUFH9xJ5efivRdyAw8MBVGqdsJmpX'
    },
    BTC: { 
      address: '15512yaegwoVpZ2mjnsZ8mmVdhMnbcYybZ',
      notice: 'Binance supports deposits from all BTC addresses (starting with "1", "3", "bc1p" and "bc1q")',
      qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=15512yaegwoVpZ2mjnsZ8mmVdhMnbcYybZ'
    },
    ETH: { 
      address: '0x450306b9721d2cc03a70f3c6aa9b7a61b0137b44',
      notice: 'Please do not send validator rewards to your Binance deposit address, as they will not be credited and funds may be lost.',
      qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=0x450306b9721d2cc03a70f3c6aa9b7a61b0137b44'
    }
  },
  blogs: [
    {
      id: 'b_1',
      title: 'Bitcoin Hits New Milestone as Institutional Cloud Mining Surges',
      category: 'Market Trends',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
      summary: 'Institutional adoption and updated ASIC efficiency spark massive yields in automated cryptocurrency cloud mining.',
      content: 'Cryptocurrency investment continues to reach unprecedented adoption globally. With GoldBod Pro high-performance cloud mining clusters in Iceland and Nordics, investors enjoy guaranteed uptime and automated profit payout routines.',
      author: 'Chief Market Analyst',
      createdAt: '2026-07-28'
    },
    {
      id: 'b_2',
      title: 'Why Multi-Layer Encryption Protects Your Crypto Holdings in 2026',
      category: 'Security',
      image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=800&q=80',
      summary: 'An inside look at GoldBod Pro cold storage architecture, HSM protection, and multi-signature authorization.',
      content: 'At GoldBod Pro, security is non-negotiable. Over 98% of user digital assets are isolated in air-gapped multisig cold wallets with automated 24/7 AI threat prevention.',
      author: 'Security Operations',
      createdAt: '2026-07-25'
    }
  ],
  faqs: [
    { id: 'f_1', question: 'What is GoldBod Pro?', answer: 'GoldBod Pro is a secure cryptocurrency investment and high-tech cloud mining platform that provides users automated returns with zero hardware setup requirements.', category: 'General' },
    { id: 'f_2', question: 'How quickly do I receive profits?', answer: 'Profits are credited directly to your account balance based on your plan terms (daily or at plan maturity).', category: 'Investment' },
    { id: 'f_3', question: 'What is the minimum deposit amount?', answer: 'The minimum investment deposit is 50 USDT on our Starter Plan.', category: 'Deposits' },
    { id: 'f_4', question: 'Are withdrawals instant?', answer: 'Yes! Automated instant withdrawal requests are processed within 5 to 15 minutes of submission.', category: 'Withdrawals' },
    { id: 'f_5', question: 'How does the 10% auto referral reward work?', answer: 'When you refer a new investor, you automatically earn a 10% referral bonus directly into your balance as soon as they make their first deposit!', category: 'Affiliate' },
    { id: 'f_6', question: 'Is my principal capital returned after the investment period?', answer: 'Yes, all GoldBod Pro investment plans return 100% of your initial capital upon plan completion.', category: 'Investment' },
    { id: 'f_7', question: 'Which payment currencies are supported?', answer: 'We accept Bitcoin (BTC), Ethereum (ETH), and USDT (TRC20, BEP20, ERC20).', category: 'Deposits' },
    { id: 'f_8', question: 'Do I need technical knowledge to start cloud mining?', answer: 'No technical knowledge required. Simply select your hash rate or investment plan, and our automated mining servers take care of everything.', category: 'Mining' },
    { id: 'f_9', question: 'Are there any hidden deposit or withdrawal fees?', answer: 'GoldBod Pro charges 0% deposit fees. Standard network miner gas fees apply to withdrawals.', category: 'Fees' },
    { id: 'f_10', question: 'Is KYC required to deposit or withdraw?', answer: 'No KYC required! You can deposit, invest, and withdraw funds seamlessly without friction.', category: 'Account' }
  ],
  testimonials: [
    { id: 't_1', name: 'Marcus Sterling', country: 'Germany 🇩🇪', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', rating: 5, review: 'GoldBod Pro has been a game-changer for my portfolio. I started with $1,000 on the Gold Plan and received $1,150 in just 5 days! Instant withdrawals every time.' },
    { id: 't_2', name: 'Sophia Chen', country: 'Singapore 🇸🇬', photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80', rating: 5, review: 'The cloud mining Hash Rate monitor is transparent and steady. Plus, the 3-level referral bonuses brought me an extra $1,200 this month.' },
    { id: 't_3', name: 'Elena Rostova', country: 'Spain 🇪🇸', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', rating: 5, review: 'Outstanding 24/7 customer support and ultra-slick dark gold UI. Highly recommend GoldBod Pro to anyone seeking automated crypto passive income.' }
  ],
  supportTickets: [
    {
      id: 'st_1',
      userId: 'usr_1',
      userName: 'Alex Vance',
      subject: 'Inquiry regarding USDT BEP20 deposit confirmation',
      category: 'Deposit',
      priority: 'Medium',
      status: 'Open',
      messages: [
        { sender: 'user', message: 'Hello! I submitted a deposit via USDT TRC20, wanted to check if it was credited.', date: new Date().toISOString() }
      ],
      createdAt: new Date().toISOString()
    }
  ],
  liveTransactionsList: [
    { type: 'Deposit', username: 'crypto_king99', country: '🇺🇸 US', amount: 2500, currency: 'USDT', gateway: 'USDT TRC20', time: '1 min ago' },
    { type: 'Withdrawal', username: 'satoshi_investor', country: '🇬🇧 UK', amount: 850, currency: 'BTC', gateway: 'Bitcoin', time: '3 mins ago' },
    { type: 'Deposit', username: 'berlin_trader', country: '🇩🇪 DE', amount: 1200, currency: 'ETH', gateway: 'Ethereum', time: '5 mins ago' },
    { type: 'Withdrawal', username: 'momo_pro', country: '🇬🇭 GH', amount: 400, currency: 'USD', gateway: 'Mobile Money', time: '8 mins ago' },
    { type: 'Deposit', username: 'tokyo_whale', country: '🇯🇵 JP', amount: 5000, currency: 'USDT', gateway: 'USDT BEP20', time: '12 mins ago' },
    { type: 'Withdrawal', username: 'paris_gold', country: '🇫🇷 FR', amount: 1750, currency: 'USDT', gateway: 'USDT TRC20', time: '15 mins ago' }
  ]
};

// Middleware Auth Helper
interface AuthRequest extends Request {
  user?: any;
}

const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin privileges required' });
  }
  next();
};

// System Health & Database Status
router.get('/system/status', async (req: Request, res: Response) => {
  const dbState = mongoose.connection.readyState;
  const stateNames: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  let userCount = 0;
  let collectionsList: string[] = [];

  if (dbState === 1) {
    try {
      userCount = await (userGoldBodPro as any).countDocuments();
      if (mongoose.connection.db) {
        const cols = await mongoose.connection.db.listCollections().toArray();
        collectionsList = cols.map(c => c.name);
      }
    } catch (e) {}
  }

  return res.json({
    status: 'ok',
    database: {
      connected: dbState === 1,
      state: stateNames[dbState] || 'unknown',
      dbName: mongoose.connection.name || dbStatusInfo.targetDb || 'NextPlatform',
      host: mongoose.connection.host || dbStatusInfo.host || 'MongoDB Atlas',
      collections: collectionsList,
      registeredUsersInMongo: userCount,
      diagnostics: {
        uriConfigured: dbStatusInfo.uriFound,
        maskedUri: dbStatusInfo.maskedUri,
        lastError: dbStatusInfo.lastError,
        lastAttemptAt: dbStatusInfo.lastAttemptAt
      }
    },
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Force Database Reconnect Endpoint
router.post('/system/reconnect-db', async (req: Request, res: Response) => {
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
    const success = await connectDB();
    const userCount = success ? await (userGoldBodPro as any).countDocuments() : 0;
    return res.json({
      success,
      connected: mongoose.connection.readyState === 1,
      dbName: mongoose.connection.name || 'NextPlatform',
      registeredUsersInMongo: userCount,
      error: dbStatusInfo.lastError
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Reconnect failed' });
  }
});

// --- AUTH ROUTES ---
router.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const { name, email, username, password, country, phone, referralCode } = req.body;
    
    if (!email || !username || !password) {
      return res.status(400).json({ error: 'Name, Email, Username, and Password are required.' });
    }

    const lowerEmail = email.toLowerCase().trim();
    const lowerUsername = username.toLowerCase().trim();
    const passwordHash = bcrypt.hashSync(password, 10);
    const generatedRefCode = 'GBP-' + lowerUsername.toUpperCase().slice(0, 6) + Math.floor(10 + Math.random() * 90);

    // Check MongoDB if connected (authoritative source of truth)
    if (mongoose.connection.readyState === 1) {
      try {
        const existingInMongo = await (userGoldBodPro as any).findOne({
          $or: [{ email: lowerEmail }, { username: lowerUsername }]
        });
        if (existingInMongo) {
          // If password matches existing record, log the user in immediately
          let isMatch = false;
          if (existingInMongo.passwordHash) {
            try {
              isMatch = bcrypt.compareSync(password, existingInMongo.passwordHash);
            } catch (e) {
              isMatch = false;
            }
          }
          if (!isMatch && (existingInMongo.password === password || existingInMongo.passwordHash === password)) {
            isMatch = true;
          }

          if (isMatch) {
            const token = jwt.sign({ 
              id: existingInMongo._id.toString(), 
              email: existingInMongo.email, 
              role: existingInMongo.role || 'user', 
              username: existingInMongo.username 
            }, JWT_SECRET, { expiresIn: '7d' });

            const safeUser = {
              id: existingInMongo._id.toString(),
              name: existingInMongo.name || existingInMongo.username,
              email: existingInMongo.email,
              username: existingInMongo.username,
              role: existingInMongo.role || 'user',
              balance: existingInMongo.balance || 0,
              totalDeposited: existingInMongo.totalDeposited || 0,
              totalWithdrawn: existingInMongo.totalWithdrawn || 0,
              activeInvestment: existingInMongo.activeInvestment || 0,
              todaysProfit: existingInMongo.todaysProfit || 0,
              totalProfit: existingInMongo.totalProfit || 0,
              referralIncome: existingInMongo.referralIncome || 0,
              pendingWithdrawals: existingInMongo.pendingWithdrawals || 0,
              hashPower: existingInMongo.hashPower || 50,
              referralCode: existingInMongo.referralCode || generatedRefCode,
              kycStatus: existingInMongo.kycStatus || 'unverified'
            };

            return res.json({ token, user: safeUser, message: 'Account recognized. Logged in successfully!' });
          }

          return res.status(400).json({ error: 'An account with this email or username already exists. Please log in with your password or use a different email.' });
        }
      } catch (checkErr) {
        console.warn('MongoDB existing user check note:', checkErr);
      }
    } else {
      // If MongoDB is offline, check Memory DB. If exists, update credentials & log in seamlessly so user is never locked out
      const existing = MEMORY_DB.users.find(u => u.email.toLowerCase() === lowerEmail || u.username.toLowerCase() === lowerUsername);
      if (existing) {
        existing.passwordHash = bcrypt.hashSync(password, 10);
        existing.name = name || username;
        const token = jwt.sign({ id: existing.id, email: existing.email, role: existing.role, username: existing.username }, JWT_SECRET, { expiresIn: '7d' });
        const { passwordHash: _, ...safeUser } = existing;
        return res.json({ token, user: safeUser, message: 'Account updated and logged in successfully!' });
      }
    }

    let mongoUserDoc: any = null;
    if (mongoose.connection.readyState === 1) {
      try {
        mongoUserDoc = await (userGoldBodPro as any).create({
          name: name || username,
          email: lowerEmail,
          username: lowerUsername,
          passwordHash,
          password: password, // For compatibility if schema expects password
          role: 'user',
          country: country || 'United States',
          phone: phone || '',
          balance: 5.00, // $5 Welcome signup bonus
          totalDeposited: 0.00,
          totalWithdrawn: 0.00,
          activeInvestment: 0.00,
          todaysProfit: 0.00,
          totalProfit: 0.00,
          referralIncome: 0.00,
          pendingWithdrawals: 0.00,
          hashPower: 50,
          firstDepositRewardGiven: false,
          kycStatus: 'unverified',
          kycDocType: '',
          kycDocUrl: '',
          referralCode: generatedRefCode,
          referredBy: referralCode || null,
          createdAt: new Date()
        });
        console.log('✅ Registered user successfully saved to MongoDB:', mongoUserDoc._id);
      } catch (dbErr: any) {
        console.error('⚠️ MongoDB user registration save note:', dbErr.message || dbErr);
        if (dbErr.code === 11000) {
          return res.status(400).json({ error: 'An account with this email or username already exists in database.' });
        }
      }
    }

    const userId = mongoUserDoc ? mongoUserDoc._id.toString() : 'usr_' + Date.now();

    const newUser = {
      id: userId,
      name: name || username,
      email: lowerEmail,
      username: lowerUsername,
      passwordHash,
      role: 'user' as 'user' | 'admin',
      country: country || 'United States',
      phone: phone || '',
      balance: 5.00, // $5 Welcome signup bonus
      totalDeposited: 0.00,
      totalWithdrawn: 0.00,
      activeInvestment: 0.00,
      todaysProfit: 0.00,
      totalProfit: 0.00,
      referralIncome: 0.00,
      pendingWithdrawals: 0.00,
      hashPower: 50, // 50 TH/s bonus hash
      firstDepositRewardGiven: false,
      kycStatus: 'unverified' as 'verified' | 'pending' | 'unverified',
      kycDocType: '',
      kycDocUrl: '',
      referralCode: generatedRefCode,
      referredBy: referralCode || null,
      createdAt: new Date().toISOString()
    };

    MEMORY_DB.users.push(newUser);

    const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role, username: newUser.username }, JWT_SECRET, { expiresIn: '7d' });

    const { passwordHash: _, ...safeUser } = newUser;
    return res.json({ token, user: safeUser, message: 'Registration successful! $5 welcome bonus credited.' });
  } catch (err: any) {
    console.error('Error in /auth/register:', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
});

router.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { emailOrUsername, password } = req.body;
    if (!emailOrUsername || !password) {
      return res.status(400).json({ error: 'Email/username and password are required.' });
    }

    const lowerInput = emailOrUsername.toLowerCase().trim();

    let user: any = null;

    if (mongoose.connection.readyState === 1) {
      try {
        const dbDoc: any = await (userGoldBodPro as any).findOne({
          $or: [{ email: lowerInput }, { username: lowerInput }]
        });

        if (dbDoc) {
          user = {
            id: dbDoc._id.toString(),
            name: dbDoc.name,
            email: dbDoc.email,
            username: dbDoc.username,
            passwordHash: dbDoc.passwordHash,
            password: dbDoc.password,
            role: dbDoc.role as 'user' | 'admin',
            country: dbDoc.country || 'United States',
            phone: dbDoc.phone || '',
            balance: dbDoc.balance || 0,
            totalDeposited: dbDoc.totalDeposited || 0,
            totalWithdrawn: dbDoc.totalWithdrawn || 0,
            activeInvestment: dbDoc.activeInvestment || 0,
            todaysProfit: dbDoc.todaysProfit || 0,
            totalProfit: dbDoc.totalProfit || 0,
            referralIncome: dbDoc.referralIncome || 0,
            pendingWithdrawals: dbDoc.pendingWithdrawals || 0,
            hashPower: dbDoc.hashPower || 50,
            firstDepositRewardGiven: dbDoc.firstDepositRewardGiven || false,
            kycStatus: dbDoc.kycStatus || 'unverified',
            kycDocType: dbDoc.kycDocType || '',
            kycDocUrl: dbDoc.kycDocUrl || '',
            referralCode: dbDoc.referralCode,
            referredBy: dbDoc.referredBy || null,
            createdAt: dbDoc.createdAt ? new Date(dbDoc.createdAt).toISOString() : new Date().toISOString()
          };
          // Keep in-memory cache aligned with latest MongoDB document
          const memIdx = MEMORY_DB.users.findIndex(u => u.id === user.id || u.email.toLowerCase() === lowerInput || u.username.toLowerCase() === lowerInput);
          if (memIdx >= 0) {
            MEMORY_DB.users[memIdx] = user;
          } else {
            MEMORY_DB.users.push(user);
          }
        }
      } catch (dbErr) {
        console.warn('MongoDB login lookup error:', dbErr);
      }
    }

    if (!user) {
      user = MEMORY_DB.users.find(u => u.email.toLowerCase() === lowerInput || u.username.toLowerCase() === lowerInput);
    }

    if (!user) {
      return res.status(400).json({ error: 'Invalid email/username or password.' });
    }

    let isMatch = false;
    if (user.passwordHash) {
      try {
        isMatch = bcrypt.compareSync(password, user.passwordHash);
      } catch (e) {
        isMatch = false;
      }
    }
    // Fallback if password was saved in plain text
    if (!isMatch && ((user as any).password === password || user.passwordHash === password)) {
      isMatch = true;
    }

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email/username or password.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, username: user.username }, JWT_SECRET, { expiresIn: '7d' });

    const { passwordHash: _, ...safeUser } = user;
    return res.json({ token, user: safeUser, message: 'Login successful!' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Server error' });
  }
});

router.get('/auth/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  let user = MEMORY_DB.users.find(u => u.id === req.user.id);

  if (!user && mongoose.connection.readyState === 1) {
    try {
      const dbDoc: any = await (userGoldBodPro as any).findById(req.user.id);
      if (dbDoc) {
        user = {
          id: dbDoc._id.toString(),
          name: dbDoc.name,
          email: dbDoc.email,
          username: dbDoc.username,
          passwordHash: dbDoc.passwordHash,
          role: dbDoc.role as 'user' | 'admin',
          country: dbDoc.country || 'United States',
          phone: dbDoc.phone || '',
          balance: dbDoc.balance || 0,
          totalDeposited: dbDoc.totalDeposited || 0,
          totalWithdrawn: dbDoc.totalWithdrawn || 0,
          activeInvestment: dbDoc.activeInvestment || 0,
          todaysProfit: dbDoc.todaysProfit || 0,
          totalProfit: dbDoc.totalProfit || 0,
          referralIncome: dbDoc.referralIncome || 0,
          pendingWithdrawals: dbDoc.pendingWithdrawals || 0,
          hashPower: dbDoc.hashPower || 50,
          firstDepositRewardGiven: dbDoc.firstDepositRewardGiven || false,
          kycStatus: dbDoc.kycStatus || 'unverified',
          kycDocType: dbDoc.kycDocType || '',
          kycDocUrl: dbDoc.kycDocUrl || '',
          referralCode: dbDoc.referralCode,
          referredBy: dbDoc.referredBy || null,
          createdAt: dbDoc.createdAt ? new Date(dbDoc.createdAt).toISOString() : new Date().toISOString()
        };
        MEMORY_DB.users.push(user);
      }
    } catch (e) {
      console.warn('MongoDB fetch user err:', e);
    }
  }

  if (!user) return res.status(404).json({ error: 'User not found' });
  const { passwordHash: _, ...safeUser } = user;
  return res.json({ user: safeUser });
});

// --- PUBLIC SITE DATA API ---
// Platform benchmark start date set to Aug 2, 2026 (so on Aug 4, 2026 it is 2 days, auto-incrementing +1 every 24h)
const PLATFORM_LAUNCH_TIMESTAMP = new Date('2026-08-02T00:00:00Z').getTime();

router.get('/stats/overview', (req: Request, res: Response) => {
  const now = Date.now();
  const elapsedDays = Math.max(2, Math.floor((now - PLATFORM_LAUNCH_TIMESTAMP) / (1000 * 60 * 60 * 24)));
  
  // Calculate ticks since platform launch anchor
  const fourSecondTicks = Math.floor((now - PLATFORM_LAUNCH_TIMESTAMP) / 4000);
  
  // Calculate 5-minute ticks (300,000 ms) for active miners (+15 miners every 5 minutes)
  const fiveMinuteTicks = Math.floor((now - PLATFORM_LAUNCH_TIMESTAMP) / (1000 * 60 * 5));
  const minerBonus = fiveMinuteTicks * 15;

  const tickerDepositsBonus = fourSecondTicks * 1850;
  const tickerWithdrawalsBonus = fourSecondTicks * 920;

  const approvedDepositsTotal = MEMORY_DB.deposits
    .filter(d => d.status === 'approved')
    .reduce((sum, d) => sum + Number(d.amount), 0);
  
  const approvedWithdrawalsTotal = MEMORY_DB.withdrawals
    .filter(w => w.status === 'approved')
    .reduce((sum, w) => sum + Number(w.amount), 0);

  const realUserCount = MEMORY_DB.users.length;

  // Company system money reserve: starts at $876,834,764 and automatically credits +$9,500 every 24 hours (elapsed day)
  const baseCompanyMoney = 876834764;
  const companyMoney = baseCompanyMoney + (elapsedDays * 9500);

  // Baseline 36,886 + real user registrations + 15 additional miners every 5 minutes
  const totalActiveMiners = 36886 + realUserCount + minerBonus;
  const totalPayouts = 142850800.00 + approvedWithdrawalsTotal + tickerWithdrawalsBonus;

  return res.json({
    runningDays: elapsedDays,
    launchDate: 'Aug 2, 2026',
    yearsOfOperation: 'Aug 2, 2026',
    totalActiveMiners: totalActiveMiners,
    totalPayouts: totalPayouts,
    totalDeposited: 284520450.00 + approvedDepositsTotal + tickerDepositsBonus,
    totalWithdrawn: totalPayouts,
    activeInvestors: totalActiveMiners,
    onlineUsers: 420 + Math.floor(Math.random() * 16 - 8),
    companyMoney: companyMoney,
    hashRateTotal: '850,000 TH/s',
    liveTransactions: MEMORY_DB.liveTransactionsList
  });
});

router.get('/plans', (req: Request, res: Response) => {
  return res.json(MEMORY_DB.plans);
});

router.get('/market/ticker', async (req: Request, res: Response) => {
  try {
    const response = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbols=["BTCUSDT","ETHUSDT","BNBUSDT","SOLUSDT"]', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(2500)
    });
    if (response.ok) {
      const data: any = await response.json();
      const formatted = data.map((item: any) => {
        let symbol = item.symbol.replace('USDT', '');
        return {
          symbol: symbol,
          name: symbol === 'BTC' ? 'Bitcoin' : symbol === 'ETH' ? 'Ethereum' : symbol === 'BNB' ? 'BNB Chain' : symbol === 'SOL' ? 'Solana' : symbol,
          price: parseFloat(item.lastPrice),
          change24h: parseFloat(item.priceChangePercent),
          high24h: parseFloat(item.highPrice),
          low24h: parseFloat(item.lowPrice),
          volume24h: parseFloat(item.quoteVolume)
        };
      });
      // Always include USDT stablecoin
      formatted.push({
        symbol: 'USDT',
        name: 'Tether USD',
        price: 1.0001,
        change24h: 0.01,
        high24h: 1.0005,
        low24h: 0.9998,
        volume24h: 48500200100
      });
      return res.json({ success: true, timestamp: Date.now(), tickers: formatted });
    }
  } catch (err) {
    // Fallback on network timeout
  }

  // Realistic market fallback data with slight micro-fluctuations
  const jitterBtc = (Math.random() - 0.48) * 15;
  const jitterEth = (Math.random() - 0.48) * 2;
  return res.json({
    success: true,
    timestamp: Date.now(),
    tickers: [
      { symbol: 'BTC', name: 'Bitcoin', price: 67450.20 + jitterBtc, change24h: 2.84, high24h: 68100.00, low24h: 65200.00, volume24h: 28400500100 },
      { symbol: 'ETH', name: 'Ethereum', price: 3520.80 + jitterEth, change24h: 1.92, high24h: 3580.00, low24h: 3410.00, volume24h: 14200800300 },
      { symbol: 'USDT', name: 'Tether USD', price: 1.0001, change24h: 0.01, high24h: 1.0005, low24h: 0.9998, volume24h: 48500200100 },
      { symbol: 'BNB', name: 'BNB Chain', price: 585.40 + (Math.random() - 0.48), change24h: 3.15, high24h: 592.00, low24h: 565.00, volume24h: 3200100200 },
      { symbol: 'SOL', name: 'Solana', price: 154.60 + (Math.random() - 0.48), change24h: 4.80, high24h: 158.00, low24h: 146.00, volume24h: 4100500100 }
    ]
  });
});

router.get('/blogs', (req: Request, res: Response) => {
  return res.json(MEMORY_DB.blogs);
});

router.get('/faqs', (req: Request, res: Response) => {
  return res.json(MEMORY_DB.faqs);
});

router.get('/testimonials', (req: Request, res: Response) => {
  return res.json(MEMORY_DB.testimonials);
});

router.get('/wallets', (req: Request, res: Response) => {
  return res.json(MEMORY_DB.wallets);
});

const hasApprovedFirstDeposit = (userId: string) =>
  MEMORY_DB.deposits.some(d => d.userId === userId && d.status === 'approved');

// Helper: Auto 10% Referral Bonus on First Deposit
const triggerFirstDepositReferralReward = (deposit: any) => {
  const user = MEMORY_DB.users.find(u => u.id === deposit.userId);
  if (!user || user.firstDepositRewardGiven || !user.referredBy) return;

  const approvedCount = MEMORY_DB.deposits.filter(d => d.userId === user.id && d.status === 'approved').length;
  if (approvedCount >= 1) {
    user.firstDepositRewardGiven = true;
    const referrer = MEMORY_DB.users.find(u => 
      u.referralCode === user.referredBy || 
      u.username === user.referredBy || 
      u.id === user.referredBy
    );

    if (referrer) {
      const rewardAmount = Number(deposit.amount) * 0.10; // 10% auto referral reward
      referrer.balance += rewardAmount;
      referrer.referralIncome += rewardAmount;

      MEMORY_DB.transactions.unshift({
        id: 'tx_' + Date.now(),
        userId: referrer.id,
        type: '10% First Deposit Referral Reward',
        amount: rewardAmount,
        currency: 'USDT',
        description: `Auto 10% referral reward ($${rewardAmount.toFixed(2)}) from ${user.username}'s first deposit ($${deposit.amount})`,
        status: 'Completed',
        createdAt: new Date().toISOString()
      });
    }
  }
};

// Settle matured investment contracts and automatically credit capital + profit to user balance
async function settleMaturedInvestments(userId: string) {
  const user = MEMORY_DB.users.find(u => u.id === userId);
  if (!user) return [];

  const now = Date.now();
  const settledContracts: any[] = [];

  // 1. Check and settle directly in MongoDB if connected
  if (mongoose.connection.readyState === 1) {
    try {
      const userQuery = mongoose.Types.ObjectId.isValid(userId)
        ? { $or: [{ userId }, { userId: new mongoose.Types.ObjectId(userId) }] }
        : { userId };
      
      const dbInvs: any[] = await (investmentGoldBodPro as any).find(userQuery);
      
      for (const dInv of dbInvs) {
        if (dInv.status === 'active') {
          const startMs = dInv.startDate ? new Date(dInv.startDate).getTime() : now;
          const durDays = Number(dInv.durationDays) || 1;
          const endMs = dInv.endDate ? new Date(dInv.endDate).getTime() : (startMs + durDays * 24 * 3600 * 1000);
          
          if (now >= endMs) {
            const principal = Number(dInv.amount) || 0;
            const profitRate = Number(dInv.profitPercent) || 5;
            const profit = Number(dInv.dailyROI ? (Number(dInv.dailyROI) * durDays) : (principal * (profitRate / 100)));
            const totalReturn = Number(dInv.totalReturn) || (principal + profit);

            // Update in MongoDB
            await (investmentGoldBodPro as any).findByIdAndUpdate(dInv._id, {
              status: 'completed',
              completedAt: new Date(),
              totalEarned: totalReturn,
              endDate: new Date(endMs)
            }).catch(() => {});

            // Update user in MongoDB
            await (userGoldBodPro as any).findByIdAndUpdate(userId, {
              $inc: { balance: totalReturn, totalProfit: profit, todaysProfit: profit },
              $set: { activeInvestment: 0 }
            }).catch(() => {});

            // Record transaction in MongoDB
            const desc = `Contract Matured: ${dInv.planName} ($${principal.toFixed(2)} principal + $${profit.toFixed(2)} profit) credited to Available Balance`;
            await (transactionGoldBodPro as any).create({
              userId,
              type: 'mining_payout',
              amount: totalReturn,
              description: desc,
              status: 'completed',
              createdAt: new Date()
            }).catch(() => {});

            // Sync in memory user and investment
            user.balance += totalReturn;
            user.totalProfit += profit;
            user.todaysProfit += profit;

            const memInv = MEMORY_DB.activeInvestments.find(i => i.id === dInv._id.toString());
            if (memInv) {
              memInv.status = 'completed';
              memInv.startDate = new Date(startMs).toISOString();
              memInv.endDate = new Date(endMs).toISOString();
              (memInv as any).completedAt = new Date().toISOString();
            } else {
              MEMORY_DB.activeInvestments.unshift({
                id: dInv._id.toString(),
                userId: user.id,
                planName: dInv.planName,
                amount: principal,
                profitPercent: profitRate,
                durationDays: durDays,
                dailyReturn: Number(dInv.dailyROI) || (profit / durDays),
                totalReturn,
                startDate: new Date(startMs).toISOString(),
                endDate: new Date(endMs).toISOString(),
                status: 'completed'
              });
            }

            const payoutTx = {
              id: 'tx_payout_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
              userId: user.id,
              type: 'Plan Capital & Profit Payout',
              amount: totalReturn,
              currency: 'USDT',
              description: desc,
              status: 'Completed',
              createdAt: new Date().toISOString()
            };
            MEMORY_DB.transactions.unshift(payoutTx);
            settledContracts.push(dInv);
          }
        }
      }
    } catch (dbErr) {
      console.error('Error settling MongoDB investments:', dbErr);
    }
  }

  // 2. Settle in MEMORY_DB
  for (const inv of MEMORY_DB.activeInvestments) {
    if (inv.userId === userId && inv.status === 'active') {
      const startMs = inv.startDate ? new Date(inv.startDate).getTime() : now;
      const durDays = Number(inv.durationDays) || 1;
      const endMs = inv.endDate ? new Date(inv.endDate).getTime() : (startMs + durDays * 24 * 3600 * 1000);

      inv.startDate = new Date(startMs).toISOString();
      inv.endDate = new Date(endMs).toISOString();

      if (now >= endMs) {
        inv.status = 'completed';
        (inv as any).completedAt = new Date().toISOString();
        (inv as any).payoutClaimed = true;

        const principal = Number(inv.amount) || 0;
        const profitRate = Number(inv.profitPercent) || 5;
        const profit = Number(inv.dailyReturn ? (Number(inv.dailyReturn) * durDays) : (principal * (profitRate / 100)));
        const totalReturn = Number(inv.totalReturn) || (principal + profit);

        user.balance += totalReturn;
        user.totalProfit += profit;
        user.todaysProfit += profit;

        const payoutTx = {
          id: 'tx_payout_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
          userId: user.id,
          type: 'Plan Capital & Profit Payout',
          amount: totalReturn,
          currency: 'USDT',
          description: `Contract Matured: ${inv.planName} ($${principal.toFixed(2)} principal + $${profit.toFixed(2)} profit) credited to Available Balance`,
          status: 'Completed',
          createdAt: new Date().toISOString()
        };
        MEMORY_DB.transactions.unshift(payoutTx);
        settledContracts.push(inv);
      }
    }
  }

  // Recalculate user active investment based on active contracts
  user.activeInvestment = MEMORY_DB.activeInvestments
    .filter(i => i.userId === userId && i.status === 'active')
    .reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

  return settledContracts;
}

// --- USER DASHBOARD ENDPOINTS ---
router.get('/user/dashboard', authenticateToken, async (req: AuthRequest, res: Response) => {
  let user = MEMORY_DB.users.find(u => u.id === req.user.id);

  if (!user && mongoose.connection.readyState === 1) {
    try {
      const dbDoc: any = await (userGoldBodPro as any).findById(req.user.id);
      if (dbDoc) {
        user = {
          id: dbDoc._id.toString(),
          name: dbDoc.name,
          email: dbDoc.email,
          username: dbDoc.username,
          passwordHash: dbDoc.passwordHash || dbDoc.password,
          role: dbDoc.role as 'user' | 'admin',
          country: dbDoc.country || 'United States',
          phone: dbDoc.phone || '',
          balance: dbDoc.balance || 0,
          totalDeposited: dbDoc.totalDeposited || 0,
          totalWithdrawn: dbDoc.totalWithdrawn || 0,
          activeInvestment: 0,
          todaysProfit: 0,
          totalProfit: 0,
          referralIncome: 0,
          pendingWithdrawals: dbDoc.pendingWithdrawals || 0,
          hashPower: 50,
          firstDepositRewardGiven: false,
          kycStatus: dbDoc.kycStatus || 'verified',
          kycDocType: '',
          kycDocUrl: '',
          referralCode: dbDoc.referralCode,
          referredBy: dbDoc.referredBy || null,
          createdAt: dbDoc.createdAt ? new Date(dbDoc.createdAt).toISOString() : new Date().toISOString()
        };
        MEMORY_DB.users.push(user);
      }
    } catch (e) {}
  }

  // Sync latest user balance and info from MongoDB if connected
  if (user && mongoose.connection.readyState === 1) {
    try {
      const dbDoc: any = await (userGoldBodPro as any).findById(user.id);
      if (dbDoc) {
        user.balance = dbDoc.balance ?? user.balance;
        user.totalDeposited = dbDoc.totalDeposited ?? user.totalDeposited;
        user.totalWithdrawn = dbDoc.totalWithdrawn ?? user.totalWithdrawn;
        user.pendingWithdrawals = dbDoc.pendingWithdrawals ?? user.pendingWithdrawals;
      }
    } catch (e) {}
  }

  if (!user) return res.status(404).json({ error: 'User not found' });

  // Sync user active investments from MongoDB if connected
  if (mongoose.connection.readyState === 1) {
    try {
      const userQuery = mongoose.Types.ObjectId.isValid(user.id)
        ? { $or: [{ userId: user.id }, { userId: new mongoose.Types.ObjectId(user.id) }] }
        : { userId: user.id };

      const dbInvs: any[] = await (investmentGoldBodPro as any).find(userQuery);
      for (const dInv of dbInvs) {
        const invId = dInv._id.toString();
        const existingInv = MEMORY_DB.activeInvestments.find(i => i.id === invId);
        const matchingPlan = MEMORY_DB.plans.find(p => p.id === dInv.planId || p.name === dInv.planName) || MEMORY_DB.plans[0];
        const durDays = Number(dInv.durationDays) || matchingPlan.durationDays || 1;
        const startIso = dInv.startDate ? new Date(dInv.startDate).toISOString() : new Date().toISOString();
        const startMs = new Date(startIso).getTime();
        const endIso = dInv.endDate ? new Date(dInv.endDate).toISOString() : new Date(startMs + durDays * 24 * 3600 * 1000).toISOString();
        const profitRate = Number(dInv.profitPercent) || matchingPlan.profitPercent;
        const totalRet = Number(dInv.totalReturn) || (Number(dInv.amount) + (Number(dInv.amount) * (profitRate / 100)));

        if (!existingInv) {
          MEMORY_DB.activeInvestments.unshift({
            id: invId,
            userId: user.id,
            planName: dInv.planName || matchingPlan.name,
            amount: Number(dInv.amount),
            profitPercent: profitRate,
            durationDays: durDays,
            dailyReturn: Number(dInv.dailyROI) || ((Number(dInv.amount) * (profitRate / 100)) / durDays),
            totalReturn: totalRet,
            startDate: startIso,
            endDate: endIso,
            status: dInv.status || 'active'
          });
        } else {
          // Synchronize exact database dates, status and amounts
          existingInv.startDate = startIso;
          existingInv.endDate = endIso;
          existingInv.status = dInv.status || existingInv.status;
          existingInv.amount = Number(dInv.amount);
          existingInv.profitPercent = profitRate;
          existingInv.durationDays = durDays;
          existingInv.totalReturn = totalRet;
        }
      }
    } catch (e) {}
  }

  // Settle any matured contracts automatically
  await settleMaturedInvestments(user.id);

  const userInvestments = MEMORY_DB.activeInvestments.filter(i => i.userId === user.id);
  const userDeposits = MEMORY_DB.deposits.filter(d => d.userId === user.id);
  const userWithdrawals = MEMORY_DB.withdrawals.filter(w => w.userId === user.id);
  const userTxs = MEMORY_DB.transactions.filter(t => t.userId === user.id);

  const userReferrals = MEMORY_DB.users
    .filter(u => u.referredBy === user.referralCode || u.referredBy === user.username || u.referredBy === user.id)
    .filter(u => hasApprovedFirstDeposit(u.id))
    .map(u => {
      const firstDep = MEMORY_DB.deposits.find(d => d.userId === u.id && d.status === 'approved');
      const commission = firstDep ? Number(firstDep.amount) * 0.10 : 0;
      return {
        id: u.id,
        username: u.username,
        level: 1,
        joinedAt: u.createdAt,
        commission
      };
    });

  const { passwordHash, ...safeUser } = user;

  return res.json({
    user: safeUser,
    plans: MEMORY_DB.plans,
    activeInvestments: userInvestments,
    deposits: userDeposits,
    withdrawals: userWithdrawals,
    transactions: userTxs,
    referrals: userReferrals,
    wallets: MEMORY_DB.wallets
  });
});

router.post('/user/deposit', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { amount, gateway, txHash, proofUrl } = req.body;
  let user = MEMORY_DB.users.find(u => u.id === req.user.id);

  if (!user && mongoose.connection.readyState === 1) {
    try {
      const dbDoc: any = await (userGoldBodPro as any).findById(req.user.id);
      if (dbDoc) {
        user = {
          id: dbDoc._id.toString(),
          name: dbDoc.name,
          email: dbDoc.email,
          username: dbDoc.username,
          passwordHash: dbDoc.passwordHash,
          role: dbDoc.role as 'user' | 'admin',
          country: dbDoc.country || 'United States',
          phone: dbDoc.phone || '',
          balance: dbDoc.balance || 0,
          totalDeposited: dbDoc.totalDeposited || 0,
          totalWithdrawn: dbDoc.totalWithdrawn || 0,
          activeInvestment: 0,
          todaysProfit: 0,
          totalProfit: 0,
          referralIncome: 0,
          pendingWithdrawals: dbDoc.pendingWithdrawals || 0,
          hashPower: 50,
          firstDepositRewardGiven: false,
          kycStatus: dbDoc.kycStatus || 'verified',
          kycDocType: '',
          kycDocUrl: '',
          referralCode: dbDoc.referralCode,
          referredBy: dbDoc.referredBy || null,
          createdAt: dbDoc.createdAt ? new Date(dbDoc.createdAt).toISOString() : new Date().toISOString()
        };
        MEMORY_DB.users.push(user);
      }
    } catch (e) {}
  }

  if (!user) return res.status(404).json({ error: 'User not found' });
  if (!amount || amount <= 0) return res.status(400).json({ error: 'Valid deposit amount required.' });

  let mongoDepDoc: any = null;
  if (mongoose.connection.readyState === 1) {
    try {
      mongoDepDoc = await (depositGoldBodPro as any).create({
        userId: user.id,
        gateway: gateway || 'USDT TRC20',
        amount: Number(amount),
        walletAddress: gateway || 'USDT TRC20',
        txHash: txHash || '',
        status: 'pending',
        createdAt: new Date()
      });
      await (rechargeGoldBodPro as any).create({
        userId: user.id,
        gateway: gateway || 'USDT TRC20',
        amount: Number(amount),
        walletAddress: gateway || 'USDT TRC20',
        txHash: txHash || '',
        status: 'pending',
        createdAt: new Date()
      }).catch(() => {});
    } catch (dbErr) {
      console.error('MongoDB deposit save error:', dbErr);
    }
  }

  const depositId = mongoDepDoc ? mongoDepDoc._id.toString() : 'dep_' + Date.now();

  const newDeposit = {
    id: depositId,
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    amount: Number(amount),
    gateway: gateway || 'USDT TRC20',
    txHash: txHash || '0x' + Math.random().toString(36).substring(2, 15),
    proofUrl: proofUrl || '',
    status: 'pending' as 'pending' | 'approved' | 'rejected',
    createdAt: new Date().toISOString()
  };

  const existingIdx = MEMORY_DB.deposits.findIndex(d => d.id === newDeposit.id);
  if (existingIdx >= 0) {
    MEMORY_DB.deposits[existingIdx] = newDeposit;
  } else {
    MEMORY_DB.deposits.unshift(newDeposit);
  }

  MEMORY_DB.transactions.unshift({
    id: 'tx_' + Date.now(),
    userId: user.id,
    type: 'Deposit Pending',
    amount: Number(amount),
    currency: 'USDT',
    description: `Deposit request via ${gateway || 'USDT TRC20'} ($${amount}) awaiting admin approval`,
    status: 'Pending',
    createdAt: new Date().toISOString()
  });

  return res.json({ 
    message: `Deposit request for $${amount} submitted successfully! Status is currently pending admin verification.`, 
    deposit: newDeposit
  });
});

router.post('/user/withdraw', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { amount, gateway, walletAddress } = req.body;
  const user = MEMORY_DB.users.find(u => u.id === req.user.id);

  if (!user) return res.status(404).json({ error: 'User not found' });
  if (!amount || amount <= 0) return res.status(400).json({ error: 'Valid withdrawal amount required.' });

  // Check if user has made at least 1 approved deposit
  const approvedDeposits = MEMORY_DB.deposits.filter(d => d.userId === user.id && d.status === 'approved');
  if (approvedDeposits.length === 0) {
    return res.status(400).json({ 
      error: 'Withdrawal locked: You must complete your first deposit before you can withdraw your funds or welcome bonus.' 
    });
  }

  if (amount > user.balance) return res.status(400).json({ error: 'Insufficient balance for withdrawal.' });
  if (!walletAddress) return res.status(400).json({ error: 'Destination wallet address required.' });

  // Deduct user balance and place in pendingWithdrawals
  user.balance -= Number(amount);
  user.pendingWithdrawals += Number(amount);

  let mongoWdDoc: any = null;
  if (mongoose.connection.readyState === 1) {
    try {
      mongoWdDoc = await (withdrawalGoldBodPro as any).create({
        userId: user.id,
        gateway: gateway || 'USDT TRC20',
        amount: Number(amount),
        walletAddress,
        status: 'pending',
        createdAt: new Date()
      });
      await (userGoldBodPro as any).findByIdAndUpdate(user.id, {
        balance: user.balance,
        pendingWithdrawals: user.pendingWithdrawals
      }).catch(() => {});
    } catch (dbErr) {
      console.error('MongoDB withdrawal save error:', dbErr);
    }
  }

  const withdrawalId = mongoWdDoc ? mongoWdDoc._id.toString() : 'wd_' + Date.now();

  const newWd = {
    id: withdrawalId,
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    amount: Number(amount),
    gateway: gateway || 'USDT TRC20',
    walletAddress,
    status: 'pending' as 'pending' | 'approved' | 'rejected',
    createdAt: new Date().toISOString()
  };

  MEMORY_DB.withdrawals.unshift(newWd);

  MEMORY_DB.transactions.unshift({
    id: 'tx_' + Date.now(),
    userId: user.id,
    type: 'Withdrawal Request',
    amount: Number(amount),
    currency: 'USDT',
    description: `Withdrawal request to ${walletAddress}`,
    status: 'Pending',
    createdAt: new Date().toISOString()
  });

  return res.json({ message: 'Withdrawal request submitted! Funds held in pending status.', withdrawal: newWd, newBalance: user.balance });
});

router.post('/user/invest', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { planId, amount } = req.body;
  let user = MEMORY_DB.users.find(u => u.id === req.user.id);

  if (!user && mongoose.connection.readyState === 1) {
    try {
      const dbU: any = await (userGoldBodPro as any).findById(req.user.id);
      if (dbU) {
        user = {
          id: dbU._id.toString(),
          name: dbU.name,
          email: dbU.email,
          username: dbU.username,
          passwordHash: dbU.passwordHash,
          role: dbU.role as 'user' | 'admin',
          country: dbU.country || 'United States',
          phone: dbU.phone || '',
          balance: dbU.balance || 0,
          totalDeposited: dbU.totalDeposited || 0,
          totalWithdrawn: dbU.totalWithdrawn || 0,
          activeInvestment: 0,
          todaysProfit: 0,
          totalProfit: 0,
          referralIncome: 0,
          pendingWithdrawals: dbU.pendingWithdrawals || 0,
          hashPower: 50,
          firstDepositRewardGiven: false,
          kycStatus: dbU.kycStatus || 'verified',
          kycDocType: '',
          kycDocUrl: '',
          referralCode: dbU.referralCode,
          referredBy: dbU.referredBy || null,
          createdAt: dbU.createdAt ? new Date(dbU.createdAt).toISOString() : new Date().toISOString()
        };
        MEMORY_DB.users.push(user);
      }
    } catch (e) {}
  }

  const plan = MEMORY_DB.plans.find(p => p.id === planId);
  const numAmount = Number(amount);

  if (!user) return res.status(404).json({ error: 'User not found.' });
  if (!plan) return res.status(404).json({ error: 'Investment plan not found.' });
  if (isNaN(numAmount) || numAmount < plan.minAmount || numAmount > plan.maxAmount) {
    return res.status(400).json({ error: `Amount must be between $${plan.minAmount} and $${plan.maxAmount} for ${plan.name}.` });
  }
  if (numAmount > user.balance) {
    return res.status(400).json({ error: `Insufficient balance ($${user.balance.toFixed(2)} available). Please deposit funds first.` });
  }

  // Deduct balance and update active investment
  user.balance -= numAmount;
  user.activeInvestment += numAmount;

  const totalReturn = numAmount + (numAmount * (plan.profitPercent / 100));
  const dailyReturn = (numAmount * (plan.profitPercent / 100)) / plan.durationDays;
  const startDate = new Date();
  const endDate = new Date(startDate.getTime() + plan.durationDays * 24 * 3600 * 1000);

  let mongoInvDoc: any = null;
  if (mongoose.connection.readyState === 1) {
    try {
      mongoInvDoc = await (investmentGoldBodPro as any).create({
        userId: user.id,
        planId: plan.id,
        planName: plan.name,
        amount: Number(amount),
        profitPercent: plan.profitPercent,
        dailyROI: dailyReturn,
        durationDays: plan.durationDays,
        totalReturn,
        totalEarned: 0,
        status: 'active',
        startDate,
        endDate
      });
      await (userGoldBodPro as any).findByIdAndUpdate(user.id, {
        balance: user.balance,
        activeInvestment: user.activeInvestment
      }).catch(() => {});
    } catch (dbErr) {
      console.error('MongoDB investment save error:', dbErr);
    }
  }

  const invId = mongoInvDoc ? mongoInvDoc._id.toString() : 'inv_' + Date.now();

  const newInv = {
    id: invId,
    userId: user.id,
    planName: plan.name,
    amount: Number(amount),
    profitPercent: plan.profitPercent,
    durationDays: plan.durationDays,
    dailyReturn,
    totalReturn,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    status: 'active'
  };

  MEMORY_DB.activeInvestments.unshift(newInv);

  MEMORY_DB.transactions.unshift({
    id: 'tx_' + Date.now(),
    userId: user.id,
    type: 'Plan Investment',
    amount: Number(amount),
    currency: 'USDT',
    description: `Activated ${plan.name} ($${amount})`,
    status: 'Completed',
    createdAt: new Date().toISOString()
  });

  return res.json({ message: `Successfully invested $${amount} in ${plan.name}! Contract is now active and yielding daily returns.`, investment: newInv, newBalance: user.balance });
});

router.post('/user/claim-investment/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const user = MEMORY_DB.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const inv = MEMORY_DB.activeInvestments.find(i => i.id === id && i.userId === user.id);
  if (!inv) return res.status(404).json({ error: 'Contract not found' });

  const startMs = inv.startDate ? new Date(inv.startDate).getTime() : Date.now();
  const durDays = Number(inv.durationDays) || 1;
  const endMs = inv.endDate ? new Date(inv.endDate).getTime() : (startMs + durDays * 24 * 3600 * 1000);

  if (Date.now() < endMs && inv.status === 'active') {
    const remainingMs = endMs - Date.now();
    const hoursLeft = Math.ceil(remainingMs / (1000 * 3600));
    return res.status(400).json({ error: `Contract is still actively yielding. Matures in approximately ${hoursLeft} hours.` });
  }

  await settleMaturedInvestments(user.id);

  return res.json({
    message: `Payout successfully claimed! ${inv.planName} principal & profit return credited to your available balance.`,
    newBalance: user.balance,
    activeInvestments: MEMORY_DB.activeInvestments.filter(i => i.userId === user.id)
  });
});

router.post('/user/settle-investments', authenticateToken, async (req: AuthRequest, res: Response) => {
  const user = MEMORY_DB.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const settled = await settleMaturedInvestments(user.id);

  return res.json({
    message: settled.length > 0 
      ? `Settled ${settled.length} matured contract(s) and credited payouts to your balance!`
      : 'All contracts are currently up to date.',
    settledCount: settled.length,
    newBalance: user.balance,
    activeInvestments: MEMORY_DB.activeInvestments.filter(i => i.userId === user.id)
  });
});

router.post('/user/buy-hashrate', authenticateToken, (req: AuthRequest, res: Response) => {
  const { hashPower, cost } = req.body;
  const user = MEMORY_DB.users.find(u => u.id === req.user.id);

  if (cost > user.balance) return res.status(400).json({ error: 'Insufficient balance to purchase Hash Power.' });

  user.balance -= Number(cost);
  user.hashPower += Number(hashPower);
  user.todaysProfit += Number(hashPower) * 0.10;

  MEMORY_DB.transactions.unshift({
    id: 'tx_' + Date.now(),
    userId: user.id,
    type: 'Cloud Mining Purchase',
    amount: Number(cost),
    currency: 'USDT',
    description: `Purchased +${hashPower} TH/s Mining Rig Upgrade`,
    status: 'Completed',
    createdAt: new Date().toISOString()
  });

  return res.json({ message: `Successfully added +${hashPower} TH/s Hash Power!`, newHashPower: user.hashPower, newBalance: user.balance });
});

router.post('/user/kyc', authenticateToken, (req: AuthRequest, res: Response) => {
  const { docType, docUrl } = req.body;
  const user = MEMORY_DB.users.find(u => u.id === req.user.id);

  if (user) {
    user.kycDocType = docType || 'Passport';
    user.kycDocUrl = docUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80';
    user.kycStatus = 'pending';
  }

  return res.json({ message: 'KYC documents submitted for approval.', kycStatus: 'pending' });
});

router.post('/user/support', authenticateToken, (req: AuthRequest, res: Response) => {
  const { subject, category, priority, message } = req.body;
  const user = MEMORY_DB.users.find(u => u.id === req.user.id);

  const ticket = {
    id: 'st_' + Date.now(),
    userId: user.id,
    userName: user.name,
    subject: subject || 'General Inquiry',
    category: category || 'General',
    priority: priority || 'Medium',
    status: 'Open',
    messages: [{ sender: 'user', message, date: new Date().toISOString() }],
    createdAt: new Date().toISOString()
  };

  MEMORY_DB.supportTickets.unshift(ticket);
  return res.json({ message: 'Support ticket opened successfully!', ticket });
});

// --- ADMIN PANEL API ENDPOINTS ---
router.get('/admin/overview', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  if (mongoose.connection.readyState === 1) {
    try {
      // 1. Sync users from MongoDB
      const dbUsers: any[] = await (userGoldBodPro as any).find({});
      for (const dbU of dbUsers) {
        const uid = dbU._id.toString();
        const existingU = MEMORY_DB.users.find(u => u.id === uid || u.email === dbU.email);
        if (!existingU) {
          MEMORY_DB.users.push({
            id: uid,
            name: dbU.name,
            email: dbU.email,
            username: dbU.username,
            passwordHash: dbU.passwordHash,
            role: dbU.role as 'user' | 'admin',
            country: dbU.country || 'United States',
            phone: dbU.phone || '',
            balance: dbU.balance || 0,
            totalDeposited: dbU.totalDeposited || 0,
            totalWithdrawn: dbU.totalWithdrawn || 0,
            activeInvestment: 0,
            todaysProfit: 0,
            totalProfit: 0,
            referralIncome: 0,
            pendingWithdrawals: dbU.pendingWithdrawals || 0,
            hashPower: 50,
            firstDepositRewardGiven: false,
            kycStatus: dbU.kycStatus || 'verified',
            kycDocType: '',
            kycDocUrl: '',
            referralCode: dbU.referralCode,
            referredBy: dbU.referredBy || null,
            createdAt: dbU.createdAt ? new Date(dbU.createdAt).toISOString() : new Date().toISOString()
          });
        } else {
          existingU.balance = dbU.balance ?? existingU.balance;
          existingU.totalDeposited = dbU.totalDeposited ?? existingU.totalDeposited;
          existingU.totalWithdrawn = dbU.totalWithdrawn ?? existingU.totalWithdrawn;
          existingU.pendingWithdrawals = dbU.pendingWithdrawals ?? existingU.pendingWithdrawals;
        }
      }

      // 2. Sync deposits and recharges from MongoDB
      const dbDeps: any[] = await (depositGoldBodPro as any).find({});
      const dbRecharges: any[] = await (rechargeGoldBodPro as any).find({});
      const combinedDbDeps = [...dbDeps, ...dbRecharges];

      for (const dDoc of combinedDbDeps) {
        const depId = dDoc._id.toString();
        const existingDep = MEMORY_DB.deposits.find(d => d.id === depId);
        const depUser = MEMORY_DB.users.find(u => u.id === dDoc.userId);
        if (!existingDep) {
          MEMORY_DB.deposits.unshift({
            id: depId,
            userId: dDoc.userId,
            userName: depUser ? depUser.name : 'Investor User',
            userEmail: depUser ? depUser.email : 'user@goldbod.com',
            amount: Number(dDoc.amount),
            gateway: dDoc.gateway || 'USDT TRC20',
            txHash: dDoc.txHash || '',
            proofUrl: '',
            status: dDoc.status || 'pending',
            createdAt: dDoc.createdAt ? new Date(dDoc.createdAt).toISOString() : new Date().toISOString()
          });
        } else {
          existingDep.status = dDoc.status || existingDep.status;
        }
      }

      // 3. Sync withdrawals from MongoDB
      const dbWds: any[] = await (withdrawalGoldBodPro as any).find({});
      for (const wDoc of dbWds) {
        const wdId = wDoc._id.toString();
        const existingWd = MEMORY_DB.withdrawals.find(w => w.id === wdId);
        const wdUser = MEMORY_DB.users.find(u => u.id === wDoc.userId);
        if (!existingWd) {
          MEMORY_DB.withdrawals.unshift({
            id: wdId,
            userId: wDoc.userId,
            userName: wdUser ? wdUser.name : 'Investor User',
            userEmail: wdUser ? wdUser.email : 'user@goldbod.com',
            amount: Number(wDoc.amount),
            gateway: wDoc.gateway || 'USDT TRC20',
            walletAddress: wDoc.walletAddress || '',
            status: wDoc.status || 'pending',
            createdAt: wDoc.createdAt ? new Date(wDoc.createdAt).toISOString() : new Date().toISOString()
          });
        } else {
          existingWd.status = wDoc.status || existingWd.status;
        }
      }
    } catch (err) {
      console.warn('MongoDB sync error in admin overview:', err);
    }
  }

  const totalUsers = MEMORY_DB.users.length;
  const pendingDeposits = MEMORY_DB.deposits.filter(d => d.status === 'pending');
  const pendingWithdrawals = MEMORY_DB.withdrawals.filter(w => w.status === 'pending');
  const totalDeposited = MEMORY_DB.deposits.filter(d => d.status === 'approved').reduce((acc, curr) => acc + curr.amount, 0);
  const totalWithdrawn = MEMORY_DB.withdrawals.filter(w => w.status === 'approved').reduce((acc, curr) => acc + curr.amount, 0);

  const safeUsers = MEMORY_DB.users.map(({ passwordHash, ...u }) => u);

  return res.json({
    totalUsers,
    pendingDepositsCount: pendingDeposits.length,
    pendingWithdrawalsCount: pendingWithdrawals.length,
    totalDeposited,
    totalWithdrawn,
    deposits: MEMORY_DB.deposits,
    withdrawals: MEMORY_DB.withdrawals,
    pendingDeposits,
    pendingWithdrawals,
    users: safeUsers,
    allUsers: safeUsers,
    plans: MEMORY_DB.plans,
    wallets: MEMORY_DB.wallets,
    blogs: MEMORY_DB.blogs,
    faqs: MEMORY_DB.faqs,
    supportTickets: MEMORY_DB.supportTickets
  });
});

router.post('/admin/deposits/action', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  const { depositId, action } = req.body; // action: 'approve' or 'reject'
  let deposit = MEMORY_DB.deposits.find(d => d.id === depositId);

  if (!deposit && mongoose.connection.readyState === 1) {
    try {
      const dbDep: any = await (depositGoldBodPro as any).findById(depositId) || await (rechargeGoldBodPro as any).findById(depositId);
      if (dbDep) {
        const depUser = MEMORY_DB.users.find(u => u.id === dbDep.userId);
        deposit = {
          id: dbDep._id.toString(),
          userId: dbDep.userId,
          userName: depUser ? depUser.name : 'Investor User',
          userEmail: depUser ? depUser.email : 'user@goldbod.com',
          amount: Number(dbDep.amount),
          gateway: dbDep.gateway || 'USDT TRC20',
          txHash: dbDep.txHash || '',
          proofUrl: '',
          status: dbDep.status || 'pending',
          createdAt: dbDep.createdAt ? new Date(dbDep.createdAt).toISOString() : new Date().toISOString()
        };
        MEMORY_DB.deposits.unshift(deposit);
      }
    } catch (e) {}
  }

  if (!deposit) return res.status(404).json({ error: 'Deposit record not found.' });

  const newStatus = action === 'approve' ? 'approved' : 'rejected';
  deposit.status = newStatus;

  // Sync status to MongoDB models if connected
  if (mongoose.connection.readyState === 1) {
    try {
      if (mongoose.Types.ObjectId.isValid(deposit.id)) {
        await (depositGoldBodPro as any).findByIdAndUpdate(deposit.id, { status: newStatus });
        await (rechargeGoldBodPro as any).findByIdAndUpdate(deposit.id, { status: newStatus }).catch(() => {});
      } else {
        await (depositGoldBodPro as any).updateMany({ userId: deposit.userId, amount: deposit.amount, status: 'pending' }, { status: newStatus });
        await (rechargeGoldBodPro as any).updateMany({ userId: deposit.userId, amount: deposit.amount, status: 'pending' }, { status: newStatus }).catch(() => {});
      }
    } catch (err) {
      console.warn('MongoDB deposit action status update error:', err);
    }
  }

  if (action === 'approve') {
    let user = MEMORY_DB.users.find(u => u.id === deposit.userId);
    if (!user && mongoose.connection.readyState === 1) {
      try {
        const dbU: any = await (userGoldBodPro as any).findById(deposit.userId);
        if (dbU) {
          user = {
            id: dbU._id.toString(),
            name: dbU.name,
            email: dbU.email,
            username: dbU.username,
            passwordHash: dbU.passwordHash,
            role: dbU.role as 'user' | 'admin',
            country: dbU.country || 'United States',
            phone: dbU.phone || '',
            balance: dbU.balance || 0,
            totalDeposited: dbU.totalDeposited || 0,
            totalWithdrawn: dbU.totalWithdrawn || 0,
            activeInvestment: 0,
            todaysProfit: 0,
            totalProfit: 0,
            referralIncome: 0,
            pendingWithdrawals: dbU.pendingWithdrawals || 0,
            hashPower: 50,
            firstDepositRewardGiven: false,
            kycStatus: dbU.kycStatus || 'verified',
            kycDocType: '',
            kycDocUrl: '',
            referralCode: dbU.referralCode,
            referredBy: dbU.referredBy || null,
            createdAt: dbU.createdAt ? new Date(dbU.createdAt).toISOString() : new Date().toISOString()
          };
          MEMORY_DB.users.push(user);
        }
      } catch (e) {}
    }

    if (user) {
      user.balance += deposit.amount;
      user.totalDeposited += deposit.amount;

      if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(user.id)) {
        try {
          await (userGoldBodPro as any).findByIdAndUpdate(user.id, {
            balance: user.balance,
            totalDeposited: user.totalDeposited
          });
        } catch (dbErr) {
          console.warn('MongoDB user balance update error:', dbErr);
        }
      }

      MEMORY_DB.transactions.unshift({
        id: 'tx_' + Date.now(),
        userId: user.id,
        type: 'Deposit Approved',
        amount: deposit.amount,
        currency: 'USDT',
        description: `Admin approved ${deposit.gateway} deposit of $${deposit.amount}`,
        status: 'Completed',
        createdAt: new Date().toISOString()
      });

      triggerFirstDepositReferralReward(deposit);
    }
  }

  return res.json({ message: `Deposit successfully ${action}d!`, deposit });
});

router.post('/admin/withdrawals/action', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  const { withdrawalId, action } = req.body;
  let wd = MEMORY_DB.withdrawals.find(w => w.id === withdrawalId);

  if (!wd && mongoose.connection.readyState === 1) {
    try {
      const dbWd: any = await (withdrawalGoldBodPro as any).findById(withdrawalId);
      if (dbWd) {
        const wdUser = MEMORY_DB.users.find(u => u.id === dbWd.userId);
        wd = {
          id: dbWd._id.toString(),
          userId: dbWd.userId,
          userName: wdUser ? wdUser.name : 'Investor User',
          userEmail: wdUser ? wdUser.email : 'user@goldbod.com',
          amount: Number(dbWd.amount),
          gateway: dbWd.gateway || 'USDT TRC20',
          walletAddress: dbWd.walletAddress || '',
          status: dbWd.status || 'pending',
          createdAt: dbWd.createdAt ? new Date(dbWd.createdAt).toISOString() : new Date().toISOString()
        };
        MEMORY_DB.withdrawals.unshift(wd);
      }
    } catch (e) {}
  }

  if (!wd) return res.status(404).json({ error: 'Withdrawal request not found.' });

  const newStatus = action === 'approve' ? 'approved' : 'rejected';
  wd.status = newStatus;

  if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(wd.id)) {
    try {
      await (withdrawalGoldBodPro as any).findByIdAndUpdate(wd.id, { status: newStatus });
    } catch (e) {}
  }

  const user = MEMORY_DB.users.find(u => u.id === wd.userId);

  if (action === 'approve') {
    if (user) {
      user.pendingWithdrawals = Math.max(0, user.pendingWithdrawals - wd.amount);
      user.totalWithdrawn += wd.amount;

      if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(user.id)) {
        await (userGoldBodPro as any).findByIdAndUpdate(user.id, {
          pendingWithdrawals: user.pendingWithdrawals,
          totalWithdrawn: user.totalWithdrawn
        }).catch(() => {});
      }

      MEMORY_DB.transactions.unshift({
        id: 'tx_' + Date.now(),
        userId: user.id,
        type: 'Withdrawal Approved',
        amount: wd.amount,
        currency: 'USDT',
        description: `Admin approved payout of $${wd.amount} to ${wd.walletAddress}`,
        status: 'Completed',
        createdAt: new Date().toISOString()
      });
    }
  } else {
    if (user) {
      user.balance += wd.amount; // Refund user balance
      user.pendingWithdrawals = Math.max(0, user.pendingWithdrawals - wd.amount);

      if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(user.id)) {
        await (userGoldBodPro as any).findByIdAndUpdate(user.id, {
          balance: user.balance,
          pendingWithdrawals: user.pendingWithdrawals
        }).catch(() => {});
      }
    }
  }

  return res.json({ message: `Withdrawal successfully ${action}d!`, withdrawal: wd });
});

router.post('/admin/users/update-balance', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  const { userId, newBalance } = req.body;
  let user = MEMORY_DB.users.find(u => u.id === userId);

  if (!user && mongoose.connection.readyState === 1) {
    try {
      const dbU: any = await (userGoldBodPro as any).findById(userId);
      if (dbU) {
        user = {
          id: dbU._id.toString(),
          name: dbU.name,
          email: dbU.email,
          username: dbU.username,
          passwordHash: dbU.passwordHash,
          role: dbU.role as 'user' | 'admin',
          country: dbU.country || 'United States',
          phone: dbU.phone || '',
          balance: dbU.balance || 0,
          totalDeposited: dbU.totalDeposited || 0,
          totalWithdrawn: dbU.totalWithdrawn || 0,
          activeInvestment: 0,
          todaysProfit: 0,
          totalProfit: 0,
          referralIncome: 0,
          pendingWithdrawals: dbU.pendingWithdrawals || 0,
          hashPower: 50,
          firstDepositRewardGiven: false,
          kycStatus: dbU.kycStatus || 'verified',
          kycDocType: '',
          kycDocUrl: '',
          referralCode: dbU.referralCode,
          referredBy: dbU.referredBy || null,
          createdAt: dbU.createdAt ? new Date(dbU.createdAt).toISOString() : new Date().toISOString()
        };
        MEMORY_DB.users.push(user);
      }
    } catch (e) {}
  }

  if (!user) return res.status(404).json({ error: 'User not found.' });

  user.balance = Number(newBalance);

  if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(user.id)) {
    try {
      await (userGoldBodPro as any).findByIdAndUpdate(user.id, { balance: user.balance });
    } catch (e) {}
  }

  return res.json({ message: `Updated ${user.username}'s balance to $${newBalance}`, user });
});

router.post('/admin/users/kyc-action', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const { userId, status } = req.body; // status: 'verified' or 'rejected'
  const user = MEMORY_DB.users.find(u => u.id === userId);

  if (!user) return res.status(404).json({ error: 'User not found.' });

  user.kycStatus = status as 'verified' | 'pending' | 'unverified';
  return res.json({ message: `User KYC set to ${status}.`, user });
});

router.post('/admin/wallets/update', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const { currency, address, qrCodeUrl } = req.body;
  if (!currency || !address) return res.status(400).json({ error: 'Currency and address required.' });

  MEMORY_DB.wallets[currency] = {
    address,
    qrCodeUrl: qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${address}`
  };

  return res.json({ message: `Updated wallet configuration for ${currency}`, wallets: MEMORY_DB.wallets });
});

router.post('/admin/plans/update', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const { planId, name, minAmount, maxAmount, profitPercent, durationDays } = req.body;
  const plan = MEMORY_DB.plans.find(p => p.id === planId);

  if (!plan) return res.status(404).json({ error: 'Plan not found.' });

  plan.name = name || plan.name;
  plan.minAmount = Number(minAmount);
  plan.maxAmount = Number(maxAmount);
  plan.profitPercent = Number(profitPercent);
  plan.durationDays = Number(durationDays);

  return res.json({ message: 'Plan updated successfully!', plan });
});

export default router;
