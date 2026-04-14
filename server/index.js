const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const BLACKLISTED_SSN = ['000-00-0000', '666-00-0000', '999-99-9999'];

// Seeded applications database
let applications = [
  {
    id: 'APP-2026-8492',
    applicant: {
      firstName: 'Samantha',
      lastName: 'Vance',
      email: 'samantha.vance@techcorp.io',
      phone: '(555) 342-9102',
      ssn: '123-45-6789',
      dateOfBirth: '1990-04-12',
      address: { street: '742 Evergreen Terrace', city: 'Seattle', state: 'WA', zipCode: '98101' }
    },
    loanType: 'MORTGAGE',
    propertyValue: 650000,
    loanAmount: 520000,
    downPayment: 130000,
    loanTermYears: 30,
    employmentHistory: [
      { employerName: 'CloudScale Systems', jobTitle: 'Principal Cloud Architect', yearsEmployed: 6, monthlyGrossIncome: 14500 }
    ],
    liabilities: [
      { liabilityType: 'Auto Loan (Tesla Model Y)', monthlyPayment: 620, remainingBalance: 24000 },
      { liabilityType: 'Student Loan', monthlyPayment: 380, remainingBalance: 18500 }
    ],
    creditScoreTier: 'EXCELLENT',
    calculatedEMI: 3410,
    status: 'APPROVED',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    decision: {
      status: 'APPROVED',
      reviewedBy: 'Staff Officer: Sarah Jenkins (Senior Underwriter, Badge: NXS-9842)',
      reviewedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Strong credit history, verified W-2, low DTI (6.9%). Approved at prime interest rate.',
      approvedAmount: 520000,
      approvedRate: 6.85
    }
  },
  {
    id: 'APP-2026-3104',
    applicant: {
      firstName: 'David',
      lastName: 'Sterling',
      email: 'david.sterling@email.com',
      phone: '(555) 782-1928',
      ssn: '234-56-7890',
      dateOfBirth: '1985-09-23',
      address: { street: '120 Market St', city: 'Austin', state: 'TX', zipCode: '78701' }
    },
    loanType: 'COMMERCIAL',
    propertyValue: 900000,
    loanAmount: 700000,
    downPayment: 200000,
    loanTermYears: 20,
    employmentHistory: [
      { employerName: 'Sterling Logistics LLC', jobTitle: 'Managing Partner', yearsEmployed: 8, monthlyGrossIncome: 18000 }
    ],
    liabilities: [
      { liabilityType: 'Commercial Lease', monthlyPayment: 4200, remainingBalance: 120000 }
    ],
    creditScoreTier: 'GOOD',
    calculatedEMI: 5740,
    status: 'PENDING',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'APP-2026-9051',
    applicant: {
      firstName: 'Elena',
      lastName: 'Rostova',
      email: 'elena.rostova@designworks.com',
      phone: '(555) 912-3401',
      ssn: '345-67-8901',
      dateOfBirth: '1995-11-04',
      address: { street: '450 Pine Valley Rd', city: 'Denver', state: 'CO', zipCode: '80202' }
    },
    loanType: 'AUTO',
    propertyValue: 45000,
    loanAmount: 38000,
    downPayment: 7000,
    loanTermYears: 5,
    employmentHistory: [
      { employerName: 'Freelance Studio', jobTitle: 'UX Designer', yearsEmployed: 1, monthlyGrossIncome: 3500 }
    ],
    liabilities: [
      { liabilityType: 'Credit Card Balances', monthlyPayment: 1900, remainingBalance: 22000 }
    ],
    creditScoreTier: 'POOR',
    calculatedEMI: 725,
    status: 'REJECTED',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    rejectionDate: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString(),
    decision: {
      status: 'REJECTED',
      reviewedBy: 'Staff Officer: Sarah Jenkins (Senior Underwriter, Badge: NXS-9842)',
      reviewedAt: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'High DTI ratio (>54%) with revolving credit card debt exceeding income threshold. 90-day cooling applied.'
    }
  },
  {
    id: 'APP-2026-4719',
    applicant: {
      firstName: 'Marcus',
      lastName: 'Chen',
      email: 'marcus.chen@biomed.org',
      phone: '(555) 431-8921',
      ssn: '456-78-9012',
      dateOfBirth: '1988-02-18',
      address: { street: '890 Bayview Blvd', city: 'San Francisco', state: 'CA', zipCode: '94107' }
    },
    loanType: 'PERSONAL',
    propertyValue: 60000,
    loanAmount: 45000,
    downPayment: 15000,
    loanTermYears: 3,
    employmentHistory: [
      { employerName: 'Genomics Bio Labs', jobTitle: 'Research Scientist', yearsEmployed: 3, monthlyGrossIncome: 8800 }
    ],
    liabilities: [],
    creditScoreTier: 'GOOD',
    calculatedEMI: 1435,
    status: 'ON_HOLD',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    decision: {
      status: 'ON_HOLD',
      reviewedBy: 'Staff Officer: Mark Robinson (Managing Director, Badge: NXS-1002)',
      reviewedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Please submit 2 recent pay stubs and 2025 W-2 tax document before final underwriting.'
    }
  }
];

// Benchmark interest rates
app.get('/api/rates', (req, res) => {
  res.json({
    MORTGAGE: 6.85,
    AUTO: 5.45,
    PERSONAL: 9.20,
    COMMERCIAL: 7.75
  });
});

// SSN validation
app.post('/api/verify-ssn', (req, res) => {
  const { ssn } = req.body;
  setTimeout(() => {
    if (BLACKLISTED_SSN.includes(ssn)) {
      return res.status(400).json({ valid: false, message: 'Tax ID / SSN is restricted or ineligible.' });
    }
    return res.json({ valid: true, riskScore: 'TIER_A' });
  }, 300);
});

// Eligibility Check (Pending Application Lock + 3-Month Cooling Lock)
app.get('/api/eligibility-check/:ssn', (req, res) => {
  const ssn = req.params.ssn;

  const activePendingApp = applications.find(a => 
    a.applicant.ssn === ssn && 
    (a.status === 'PENDING' || a.status === 'ON_HOLD')
  );

  if (activePendingApp) {
    return res.json({
      eligible: false,
      reason: 'ACTIVE_APPLICATION_PENDING',
      message: `You currently have an active application (${activePendingApp.id}) with status ${activePendingApp.status}. Under Nexis Capital policy, you cannot submit a new application until your pending application is resolved.`,
      activeApplicationId: activePendingApp.id,
      status: activePendingApp.status
    });
  }

  const recentRejection = applications.find(a => 
    a.applicant.ssn === ssn && 
    a.status === 'REJECTED' && 
    a.rejectionDate
  );

  if (recentRejection) {
    const rejectionTime = new Date(recentRejection.rejectionDate).getTime();
    const coolOffDays = 90;
    const coolOffMillis = coolOffDays * 24 * 60 * 60 * 1000;
    const eligibleTime = rejectionTime + coolOffMillis;
    const now = Date.now();

    if (now < eligibleTime) {
      const daysRemaining = Math.ceil((eligibleTime - now) / (24 * 60 * 60 * 1000));
      return res.json({
        eligible: false,
        reason: 'COOLING_PERIOD_ACTIVE',
        message: `Your previous application (${recentRejection.id}) was rejected on ${new Date(recentRejection.rejectionDate).toLocaleDateString()}. Nexis Capital policy requires a 3-month (90-day) cooling period. You may re-apply in ${daysRemaining} days.`,
        daysRemaining,
        eligibleDate: new Date(eligibleTime).toISOString(),
        previousApplicationId: recentRejection.id
      });
    }
  }

  res.json({ eligible: true, message: 'Eligible to apply for a new loan.' });
});

// Admin Metrics
app.get('/api/admin/metrics', (req, res) => {
  const totalApplications = applications.length;
  const pendingCount = applications.filter(a => a.status === 'PENDING').length;
  const approvedCount = applications.filter(a => a.status === 'APPROVED').length;
  const rejectedCount = applications.filter(a => a.status === 'REJECTED').length;
  const onHoldCount = applications.filter(a => a.status === 'ON_HOLD').length;

  const totalVolume = applications.reduce((sum, a) => sum + (Number(a.loanAmount) || 0), 0);
  const approvedVolume = applications
    .filter(a => a.status === 'APPROVED')
    .reduce((sum, a) => sum + (Number(a.decision?.approvedAmount || a.loanAmount) || 0), 0);

  res.json({
    totalApplications,
    pendingCount,
    approvedCount,
    rejectedCount,
    onHoldCount,
    totalVolume,
    approvedVolume
  });
});

// Get all applications
app.get('/api/applications', (req, res) => {
  const { status, loanType, search } = req.query;
  let results = [...applications];

  if (status && status !== 'ALL') {
    results = results.filter(a => a.status === status);
  }

  if (loanType && loanType !== 'ALL') {
    results = results.filter(a => a.loanType === loanType);
  }

  if (search) {
    const q = search.toLowerCase();
    results = results.filter(a => 
      a.id.toLowerCase().includes(q) ||
      a.applicant.firstName.toLowerCase().includes(q) ||
      a.applicant.lastName.toLowerCase().includes(q) ||
      a.applicant.email.toLowerCase().includes(q) ||
      a.applicant.ssn.includes(q)
    );
  }

  results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(results);
});

// Get single application
app.get('/api/applications/:id', (req, res) => {
  const item = applications.find(a => a.id.toUpperCase() === req.params.id.toUpperCase());
  if (!item) return res.status(404).json({ error: 'Application reference not found' });
  res.json(item);
});

// Submit new application
app.post('/api/applications', (req, res) => {
  const appData = req.body;
  const ssn = appData.applicant?.ssn;

  if (ssn) {
    const activeApp = applications.find(a => 
      a.applicant.ssn === ssn && 
      (a.status === 'PENDING' || a.status === 'ON_HOLD')
    );
    if (activeApp) {
      return res.status(400).json({
        error: 'ACTIVE_APPLICATION_PENDING',
        message: `Applicant already has an active application (${activeApp.id}) in ${activeApp.status} status. New submissions are prohibited until resolved.`
      });
    }

    const recentRejection = applications.find(a => 
      a.applicant.ssn === ssn && 
      a.status === 'REJECTED' && 
      a.rejectionDate
    );
    if (recentRejection) {
      const rejectionTime = new Date(recentRejection.rejectionDate).getTime();
      const coolOffMillis = 90 * 24 * 60 * 60 * 1000;
      if (Date.now() < rejectionTime + coolOffMillis) {
        return res.status(403).json({
          error: 'COOLING_PERIOD_ACTIVE',
          message: 'Application rejected due to active 3-month cooling policy on this Tax ID.'
        });
      }
    }
  }

  const newApp = {
    ...appData,
    id: `APP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    status: 'PENDING',
    createdAt: new Date().toISOString()
  };

  applications.unshift(newApp);
  setTimeout(() => res.status(201).json(newApp), 400);
});

// Admin Decision Endpoint
app.patch('/api/applications/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, reviewedBy, notes, approvedAmount, approvedRate } = req.body;

  const appIndex = applications.findIndex(a => a.id.toUpperCase() === id.toUpperCase());
  if (appIndex === -1) {
    return res.status(404).json({ error: 'Application not found' });
  }

  const targetApp = applications[appIndex];
  targetApp.status = status;
  targetApp.decision = {
    status,
    reviewedBy: reviewedBy || 'Nexis Capital Underwriting Desk',
    reviewedAt: new Date().toISOString(),
    notes: notes || `Status marked as ${status}`,
    approvedAmount: approvedAmount || targetApp.loanAmount,
    approvedRate: approvedRate || 6.85
  };

  if (status === 'REJECTED') {
    targetApp.rejectionDate = new Date().toISOString();
  }

  res.json(targetApp);
});

app.listen(PORT, () => console.log(`🚀 Nexis Capital Loan API & Underwriter Server running on http://localhost:${PORT}`));
