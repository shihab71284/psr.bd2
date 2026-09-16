import { PgDialect } from "drizzle-orm/pg-core";
import { calculateIncomeTax, assessAuditRisk } from "@/lib/taxEngine";

const dialect = new PgDialect();

function getTableName(table: any): string {
  if (!table) return "";
  if (typeof table === "string") return table;
  for (const sym of Object.getOwnPropertySymbols(table)) {
    if (sym.toString().includes("Name") && typeof table[sym] === "string") {
      return table[sym];
    }
  }
  return table._?.name || table.name || "";
}

function snakeToCamel(s: string) {
  return s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function matchesCondition(condition: any, row: any): boolean {
  if (!condition) return true;
  try {
    const { sql: sqlStr, params } = dialect.sqlToQuery(condition);
    // Audit risk level filter
    if (sqlStr.includes("audit_risk_level") && sqlStr.includes("high")) {
      return row.auditRiskLevel === "high" || row.auditRiskLevel === "critical";
    }
    // Overdue upcoming deadlines filter
    if (sqlStr.includes("current_date") && sqlStr.includes("due_date")) {
      const isPast = new Date(row.dueDate) < new Date();
      if (params.length > 0) {
        return row.status === params[0] && isPast;
      }
      return isPast;
    }
    // Generic column = $1, $2 matches
    const eqMatches = [...sqlStr.matchAll(/"\w+"\."(\w+)" = \$(\d+)/g)];
    if (eqMatches.length > 0) {
      for (const m of eqMatches) {
        const col = m[1];
        const paramIdx = parseInt(m[2], 10) - 1;
        const targetVal = params[paramIdx];
        const camelCol = snakeToCamel(col);
        const rowVal = row[camelCol] !== undefined ? row[camelCol] : row[col];
        if (typeof targetVal === "string" && typeof rowVal === "string") {
          if (rowVal.toLowerCase() !== targetVal.toLowerCase()) return false;
        } else if (rowVal !== targetVal) {
          return false;
        }
      }
      return true;
    }
    return true;
  } catch {
    return true;
  }
}

// Initial Seed Data for Bangladesh Tax Compliance Platform
function getInitialSeedData() {
  const users = [
    {
      id: "u-demo-1",
      name: "ব্যারিস্টার এম. এ. রহমান",
      email: "demo@btcp.bd",
      // bcrypt hash for demo1234
      passwordHash: "$2b$10$Qhl6TS6tNdctvzb6vXpQgeC3iqTgJLXfBN4No4dclHBCKVl9dv.G6",
      role: "partner",
      createdAt: new Date("2024-01-01T00:00:00Z"),
    },
  ];

  const lawyers = [
    {
      id: 1,
      name: "ব্যারিস্টার এম. এ. রহমান",
      barId: "DH-BAR-2014-4291", // বার কাউন্সিলের নিবন্ধন নম্বর [৪২]
      tin: "184920482019",
      email: "demo@btcp.bd",
      phoneNumber: "+880 1711-223344",
      subscriptionStatus: "active", // active, trialling, expired
      createdAt: new Date("2024-01-01T00:00:00Z"),
    },
    {
      id: 2,
      name: "অ্যাডভোকেট শফিকুল ইসলাম (আইটিপি)",
      barId: "CTG-BAR-2018-1092",
      tin: "294810394812",
      email: "shafiq.tax@law.bd",
      phoneNumber: "+880 1819-556677",
      subscriptionStatus: "active",
      createdAt: new Date("2024-02-15T00:00:00Z"),
    },
    {
      id: 3,
      name: "অ্যাডভোকেট ফারহানা চৌধুরী (কর উপদেষ্টা)",
      barId: "SYL-BAR-2021-3321",
      tin: "394819283011",
      email: "farhana.advocate@tax.bd",
      phoneNumber: "+880 1912-334455",
      subscriptionStatus: "trialling",
      createdAt: new Date("2024-03-01T00:00:00Z"),
    },
    {
      id: 4,
      name: "অ্যাডভোকেট জহিরুল হক (আয়কর প্র্যাকটিশনার)",
      barId: "RAJ-BAR-2016-8821",
      tin: "482019384910",
      email: "zahir.law@bdmail.com",
      phoneNumber: "+880 1611-998877",
      subscriptionStatus: "expired",
      createdAt: new Date("2023-11-10T00:00:00Z"),
    },
  ];

  const clients = [
    {
      id: "c-001",
      lawyerId: 1,
      clientCode: "CID-00001",
      name: "রহিম ট্রেডার্স (স্বত্বাধিকারী: মো: আব্দুর রহিম)",
      taxpayerType: "individual",
      clientType: "individual",
      genderCategory: "general",
      gender: "male",
      isResident: true,
      taxpayerCategory: "general",
      location: "dhaka_ctg",
      tin: "749281048211",
      nid: "19852691234567890",
      bin: "001234567-0101",
      phone: "+880 1711-234567",
      email: "rahim.traders@gmail.com",
      address: "মতিঝিল বা/এ, ঢাকা-১০০০",
      businessType: "পাইকারি ও খুচরা বাণিজ্য",
      vatRegistered: true,
      status: "active",
      notes: "নিয়মিত অগ্রিম কর ও ভ্যাট দাখিল করেন। বার্ষিক লেনদেন ১.৫+ কোটি টাকা।",
      createdBy: "u-demo-1",
      createdAt: new Date("2024-02-10T10:00:00Z"),
      updatedAt: new Date("2024-02-10T10:00:00Z"),
    },
    {
      id: "c-002",
      lawyerId: 1,
      clientCode: "CID-00002",
      name: "ডা. নাসরিন আক্তার",
      taxpayerType: "individual",
      clientType: "individual",
      genderCategory: "female",
      gender: "female",
      isResident: true,
      taxpayerCategory: "female_senior",
      location: "dhaka_ctg",
      tin: "839102948123",
      nid: "19782695551234567",
      bin: null,
      phone: "+880 1819-876543",
      email: "dr.nasreen@medconsult.bd",
      address: "ধানমন্ডি আ/এ, রোড ৭/এ, ঢাকা-১২০৫",
      businessType: "চিকিৎসা সেবা ও ক্লিনিক্যাল পরামর্শ",
      vatRegistered: false,
      status: "active",
      notes: "সিনিয়র মেডিকেল কনসালট্যান্ট, সঞ্চয়পত্রের বিনিয়োগ ও গৃহসম্পত্তি আয় রয়েছে।",
      createdBy: "u-demo-1",
      createdAt: new Date("2024-03-05T11:30:00Z"),
      updatedAt: new Date("2024-03-05T11:30:00Z"),
    },
    {
      id: "c-003",
      lawyerId: 1,
      clientCode: "CID-00003",
      name: "প্রাইম লজিস্টিকস লিমিটেড",
      taxpayerType: "company",
      clientType: "company",
      genderCategory: "general",
      gender: null,
      isResident: true,
      taxpayerCategory: "general",
      location: "other_city_corp",
      tin: "552194827104",
      nid: null,
      bin: "009876543-0202",
      phone: "+880 1912-345678",
      email: "accounts@primelogistics.bd",
      address: "আগ্রাবাদ বা/এ, চট্টগ্রাম",
      businessType: "মালবাহী পরিবহন ও ফরোয়ার্ডিং",
      vatRegistered: true,
      status: "active",
      notes: "অডিট রিপোর্ট ও ভ্যাট রিটার্ন সম্পন্ন।",
      createdBy: "u-demo-1",
      createdAt: new Date("2024-04-12T09:15:00Z"),
      updatedAt: new Date("2024-04-12T09:15:00Z"),
    },
  ];

  const clientBankAccounts = [
    {
      id: 1,
      clientId: "c-001",
      bankName: "ডাচ্-বাংলা ব্যাংক পিএলসি", // ব্যাংকের নাম [২৮]
      branchName: "মতিঝিল কর্পোরেট শাখা", // শাখার নাম [২৮]
      accountNumber: "115.120.0094821", // হিসাব নম্বর [২৮]
      totalDeposit: "14500000.00", // আয়বর্ষে মোট জমা [২৮]
      closingBalance: "1250000.00", // শেষ তারিখের স্থিতি [২৮]
      interestEarned: "180000.00", // প্রাপ্ত সুদ/মুনাফা [২৮]
      tdsDeducted: "18000.00", // উৎসে কর কর্তন [২৮]
      createdAt: new Date("2024-02-12T10:00:00Z"),
    },
    {
      id: 2,
      clientId: "c-001",
      bankName: "ব্র্যাক ব্যাংক পিএলসি",
      branchName: "দিলকুশা বাণিজ্যিক শাখা",
      accountNumber: "15012048291001",
      totalDeposit: "8500000.00",
      closingBalance: "640000.00",
      interestEarned: "75000.00",
      tdsDeducted: "7500.00",
      createdAt: new Date("2024-02-12T10:00:00Z"),
    },
    {
      id: 3,
      clientId: "c-002",
      bankName: "স্ট্যান্ডার্ড চার্টার্ড ব্যাংক",
      branchName: "ধানমন্ডি শাখা",
      accountNumber: "01-8492019-01",
      totalDeposit: "3200000.00",
      closingBalance: "890000.00",
      interestEarned: "120000.00",
      tdsDeducted: "12000.00",
      createdAt: new Date("2024-03-06T10:00:00Z"),
    },
  ];

  const giftRecords = [
    {
      id: 1,
      donorClientId: "c-001",
      recipientName: "মোসাঃ ফাতেমা বেগম",
      relationship: "spouse", // 'spouse', 'parent', 'sibling' (অব্যাহতিপ্রাপ্ত) বা 'other' [১৬৩৯]
      giftDescription: "স্বর্ণালংকার ও পারিবারিক উপহার", // যেমন: 'স্বর্ণালংকার' [১৬৩৯]
      fairMarketValue: "850000.00", // ন্যায্য বাজার মূল্য [১৬৩৯]
      giftTaxPayable: "0.00", // প্রদেয় দানকর (কর অব্যাহতিপ্রাপ্ত)
      createdAt: new Date("2024-04-10T10:00:00Z"),
    },
    {
      id: 2,
      donorClientId: "c-002",
      recipientName: "ডা. তানভীর রহমান",
      relationship: "sibling",
      giftDescription: "পারিবারিক জমি দানপত্র",
      fairMarketValue: "1500000.00",
      giftTaxPayable: "0.00", // আপন ভাই/বোন অব্যাহতিপ্রাপ্ত
      createdAt: new Date("2024-05-15T11:00:00Z"),
    },
    {
      id: 3,
      donorClientId: "c-001",
      recipientName: "আবুল কাসেম (ব্যবসায়িক অংশীদার)",
      relationship: "other",
      giftDescription: "ব্যবসায়িক মোটরযান হস্তান্তর",
      fairMarketValue: "1200000.00",
      giftTaxPayable: "70000.00", // দানকর আইন ১৯৯০ অনুযায়ী প্রদেয় কর
      createdAt: new Date("2024-06-20T14:00:00Z"),
    },
  ];

  const documents = [
    {
      id: "doc-001",
      clientId: "c-001",
      category: "tin_certificate",
      title: "e-TIN সনদপত্র",
      notes: "১২ ডিজিটের সার্টিফাইড ই-টিআইএন কপি",
      status: "verified",
      expiryDate: null,
      uploadedAt: new Date("2024-02-11T12:00:00Z"),
    },
    {
      id: "doc-002",
      clientId: "c-001",
      category: "bank_statement",
      title: "ব্যাংক হিসাব বিবরণী (২০২৩-২৪ অর্থবছর)",
      notes: "সোনালী ব্যাংক প্রিন্সিপাল শাখা",
      status: "submitted",
      expiryDate: null,
      uploadedAt: new Date("2024-02-12T14:00:00Z"),
    },
    {
      id: "doc-003",
      clientId: "c-002",
      category: "tin_certificate",
      title: "e-TIN সনদপত্র (ডা. নাসরিন)",
      notes: "কর সার্কেল ১৫",
      status: "verified",
      expiryDate: null,
      uploadedAt: new Date("2024-03-06T10:00:00Z"),
    },
  ];

  // Calculation & audit risk for client 1 (Business individual - High Risk)
  const calc1 = calculateIncomeTax({
    category: "general",
    location: "dhaka_ctg",
    incomeSalary: 0,
    incomeBusiness: 1850000,
    incomeProperty: 360000,
    incomeCapitalGain: 0,
    incomeAgricultural: 0,
    incomeOther: 0,
    investmentAmount: 150000,
    totalAssets: 8500000,
    totalLiabilities: 1200000,
    tdsAmount: 45000,
    advanceTaxPaid: 60000,
    hasBusinessIncome: true,
  });

  const audit1 = assessAuditRisk({
    client: {
      tin: "749281048211",
      nid: "19852691234567890",
      clientType: "individual",
      vatRegistered: true,
    },
    taxReturn: {
      returnType: "IT-11",
      incomeSalary: 0,
      incomeBusiness: 1850000,
      incomeProperty: 360000,
      incomeCapitalGain: 0,
      incomeAgricultural: 0,
      incomeOther: 0,
      previousYearIncome: 1400000,
      investmentAmount: 150000,
      loanInterest: 0,
      totalAssets: 8500000,
      totalLiabilities: 1200000,
      tdsAmount: 45000,
      hasBusinessAudit: false,
    },
    documentCategories: ["tin_certificate", "bank_statement"],
  });

  // Calculation & audit risk for client 2 (Professional/Salary - Low Risk)
  const calc2 = calculateIncomeTax({
    category: "female_senior",
    location: "dhaka_ctg",
    incomeSalary: 1200000,
    incomeBusiness: 0,
    incomeProperty: 0,
    incomeCapitalGain: 0,
    incomeAgricultural: 0,
    incomeOther: 450000,
    investmentAmount: 250000,
    totalAssets: 14500000,
    totalLiabilities: 0,
    tdsAmount: 85000,
    advanceTaxPaid: 40000,
    hasBusinessIncome: false,
  });

  const audit2 = assessAuditRisk({
    client: {
      tin: "839102948123",
      nid: "19782695551234567",
      clientType: "individual",
      vatRegistered: false,
    },
    taxReturn: {
      returnType: "IT-11",
      incomeSalary: 1200000,
      incomeBusiness: 0,
      incomeProperty: 0,
      incomeCapitalGain: 0,
      incomeAgricultural: 0,
      incomeOther: 450000,
      previousYearIncome: 1550000,
      investmentAmount: 250000,
      loanInterest: 0,
      totalAssets: 14500000,
      totalLiabilities: 0,
      tdsAmount: 85000,
      hasBusinessAudit: true,
    },
    documentCategories: ["tin_certificate", "bank_statement", "salary_certificate"],
  });

  // Calculation & audit risk for client 1 (AY 2023-2024 - Prior Year - High Risk)
  const calc1Prior = calculateIncomeTax({
    category: "general",
    location: "dhaka_ctg",
    incomeSalary: 0,
    incomeBusiness: 1400000,
    incomeProperty: 300000,
    incomeCapitalGain: 0,
    incomeAgricultural: 0,
    incomeOther: 0,
    investmentAmount: 80000,
    totalAssets: 6200000,
    totalLiabilities: 1500000,
    tdsAmount: 25000,
    advanceTaxPaid: 30000,
    hasBusinessIncome: true,
  });

  const audit1Prior = assessAuditRisk({
    client: {
      tin: "749281048211",
      nid: null, // missing NID in prior year
      clientType: "individual",
      vatRegistered: true,
    },
    taxReturn: {
      returnType: "IT-11",
      incomeSalary: 0,
      incomeBusiness: 1400000,
      incomeProperty: 300000,
      incomeCapitalGain: 0,
      incomeAgricultural: 0,
      incomeOther: 0,
      previousYearIncome: 950000,
      investmentAmount: 80000,
      loanInterest: 0,
      totalAssets: 6200000,
      totalLiabilities: 1500000,
      tdsAmount: 25000,
      hasBusinessAudit: false,
    },
    documentCategories: ["tin_certificate"], // missing bank statement in prior year
  });

  // Calculation & audit risk for client 1 (AY 2025-2026 - Planned/Draft - Low Risk)
  const calc1Next = calculateIncomeTax({
    category: "general",
    location: "dhaka_ctg",
    incomeSalary: 0,
    incomeBusiness: 2200000,
    incomeProperty: 420000,
    incomeCapitalGain: 0,
    incomeAgricultural: 0,
    incomeOther: 0,
    investmentAmount: 300000,
    totalAssets: 10500000,
    totalLiabilities: 800000,
    tdsAmount: 70000,
    advanceTaxPaid: 95000,
    hasBusinessIncome: true,
  });

  const audit1Next = assessAuditRisk({
    client: {
      tin: "749281048211",
      nid: "19852691234567890",
      clientType: "individual",
      vatRegistered: true,
    },
    taxReturn: {
      returnType: "IT-11",
      incomeSalary: 0,
      incomeBusiness: 2200000,
      incomeProperty: 420000,
      incomeCapitalGain: 0,
      incomeAgricultural: 0,
      incomeOther: 0,
      previousYearIncome: 2210000,
      investmentAmount: 300000,
      loanInterest: 0,
      totalAssets: 10500000,
      totalLiabilities: 800000,
      tdsAmount: 70000,
      hasBusinessAudit: true, // Audit conducted
    },
    documentCategories: ["tin_certificate", "bank_statement", "audit_report", "vat_challan"],
  });

  // Calculation & audit risk for client 2 (AY 2023-2024 - Prior Year - Medium Risk)
  const calc2Prior = calculateIncomeTax({
    category: "female_senior",
    location: "dhaka_ctg",
    incomeSalary: 950000,
    incomeBusiness: 0,
    incomeProperty: 0,
    incomeCapitalGain: 0,
    incomeAgricultural: 0,
    incomeOther: 300000,
    investmentAmount: 100000,
    totalAssets: 11000000,
    totalLiabilities: 500000,
    tdsAmount: 45000,
    advanceTaxPaid: 20000,
    hasBusinessIncome: false,
  });

  const audit2Prior = assessAuditRisk({
    client: {
      tin: "839102948123",
      nid: null,
      clientType: "individual",
      vatRegistered: false,
    },
    taxReturn: {
      returnType: "IT-11",
      incomeSalary: 950000,
      incomeBusiness: 0,
      incomeProperty: 0,
      incomeCapitalGain: 0,
      incomeAgricultural: 0,
      incomeOther: 300000,
      previousYearIncome: 800000,
      investmentAmount: 100000,
      loanInterest: 0,
      totalAssets: 11000000,
      totalLiabilities: 500000,
      tdsAmount: 45000,
      hasBusinessAudit: false,
    },
    documentCategories: ["tin_certificate"],
  });

  const taxReturns = [
    {
      id: "ret-003",
      clientId: "c-001",
      assessmentYear: "2023-2024",
      incomeYear: "2022-2023",
      returnType: "IT-11",
      status: "filed",
      incomeSalary: "0",
      incomeBusiness: "1400000",
      incomeProperty: "300000",
      incomeCapitalGain: "0",
      incomeAgricultural: "0",
      incomeOther: "0",
      totalIncome: "1700000",
      previousYearIncome: "950000",
      investmentAmount: "80000",
      loanInterest: "0",
      donations: "0",
      totalAssets: "6200000",
      totalLiabilities: "1500000",
      tdsAmount: "25000",
      advanceTaxPaid: "30000",
      hasBusinessAudit: false,
      hasLargeLoanNoBank: true, // ব্যাংক বিবরণী ছাড়া ঋণ থাকায় অডিট ঝুঁকি [১০৪]
      hasExemptIncome: false,
      bookOfAccountsMaintained: false, // হিসাব খাতা সংরক্ষণ ঘাটতি [১৬৬]
      isRiskShielded: false,
      submissionDate: "2023-11-25",
      calculation: calc1Prior,
      auditRiskScore: audit1Prior.score,
      auditRiskLevel: audit1Prior.level,
      auditIssues: audit1Prior.issues,
      notes: "পূর্ববর্তী কর বছরের দাখিলকৃত রিটার্ন। ব্যাংকিং ট্রানজেকশন ঘাটতি ছিল।",
      createdAt: new Date("2023-11-20T10:00:00Z"),
      updatedAt: new Date("2023-11-25T12:00:00Z"),
    },
    {
      id: "ret-001",
      clientId: "c-001",
      assessmentYear: "2024-2025",
      incomeYear: "2023-2024",
      returnType: "IT-11",
      status: "review",
      incomeSalary: "0",
      incomeBusiness: "1850000",
      incomeProperty: "360000",
      incomeCapitalGain: "0",
      incomeAgricultural: "0",
      incomeOther: "0",
      totalIncome: "2210000",
      previousYearIncome: "1700000",
      investmentAmount: "150000",
      loanInterest: "0",
      donations: "0",
      totalAssets: "8500000",
      totalLiabilities: "1200000",
      tdsAmount: "45000",
      advanceTaxPaid: "60000",
      hasBusinessAudit: false,
      hasLargeLoanNoBank: false,
      hasExemptIncome: false,
      bookOfAccountsMaintained: true, // হিসাব খাতা সংরক্ষিত [১৬৬]
      isRiskShielded: true, // ১৫% এর অধিক আয় বৃদ্ধি (২২.১ লাখ বনাম ১৭ লাখ) [১০৪]
      submissionDate: "2024-11-28",
      calculation: calc1,
      auditRiskScore: audit1.score,
      auditRiskLevel: audit1.level,
      auditIssues: audit1.issues,
      notes: "টার্নওভারের তুলনায় নিট মুনাফা ও ব্যাংকিং চালানের পুনর্মূল্যায়ন চলছে। ১৫% বৃদ্ধি বিদ্যমান।",
      createdAt: new Date("2024-02-15T14:30:00Z"),
      updatedAt: new Date("2024-02-16T16:00:00Z"),
    },
    {
      id: "ret-004",
      clientId: "c-001",
      assessmentYear: "2025-2026",
      incomeYear: "2024-2025",
      returnType: "IT-11",
      status: "draft",
      incomeSalary: "0",
      incomeBusiness: "2200000",
      incomeProperty: "420000",
      incomeCapitalGain: "0",
      incomeAgricultural: "0",
      incomeOther: "0",
      totalIncome: "2620000",
      previousYearIncome: "2210000",
      investmentAmount: "300000",
      loanInterest: "0",
      donations: "0",
      totalAssets: "10500000",
      totalLiabilities: "800000",
      tdsAmount: "70000",
      advanceTaxPaid: "95000",
      hasBusinessAudit: true,
      hasLargeLoanNoBank: false,
      hasExemptIncome: true, // ধারা ৩ অনুযায়ী কর অব্যাহতিপ্রাপ্ত আয় [৩]
      bookOfAccountsMaintained: true,
      isRiskShielded: true, // ধারা ১০৪ অডিট সুরক্ষা সক্রিয় [১০৪]
      submissionDate: null,
      calculation: calc1Next,
      auditRiskScore: audit1Next.score,
      auditRiskLevel: audit1Next.level,
      auditIssues: audit1Next.issues,
      notes: "আগামী কর বছরের প্রাক্কলিত কমপ্লায়েন্ট রিটার্ন (অডিট সম্পন্ন)।",
      createdAt: new Date("2025-01-10T11:00:00Z"),
      updatedAt: new Date("2025-01-15T14:00:00Z"),
    },
    {
      id: "ret-005",
      clientId: "c-002",
      assessmentYear: "2023-2024",
      incomeYear: "2022-2023",
      returnType: "IT-11",
      status: "filed",
      incomeSalary: "950000",
      incomeBusiness: "0",
      incomeProperty: "0",
      incomeCapitalGain: "0",
      incomeAgricultural: "0",
      incomeOther: "300000",
      totalIncome: "1250000",
      previousYearIncome: "800000",
      investmentAmount: "100000",
      loanInterest: "0",
      donations: "0",
      totalAssets: "11000000",
      totalLiabilities: "500000",
      tdsAmount: "45000",
      advanceTaxPaid: "20000",
      hasBusinessAudit: false,
      hasLargeLoanNoBank: false,
      hasExemptIncome: false,
      bookOfAccountsMaintained: true,
      isRiskShielded: true,
      submissionDate: "2023-10-20",
      calculation: calc2Prior,
      auditRiskScore: audit2Prior.score,
      auditRiskLevel: audit2Prior.level,
      auditIssues: audit2Prior.issues,
      notes: "পূর্ববর্তী কর বছরের দাখিলকৃত ফাইল।",
      createdAt: new Date("2023-10-15T09:00:00Z"),
      updatedAt: new Date("2023-10-20T11:00:00Z"),
    },
    {
      id: "ret-002",
      clientId: "c-002",
      assessmentYear: "2024-2025",
      incomeYear: "2023-2024",
      returnType: "IT-11",
      status: "filed",
      incomeSalary: "1200000",
      incomeBusiness: "0",
      incomeProperty: "0",
      incomeCapitalGain: "0",
      incomeAgricultural: "0",
      incomeOther: "450000",
      totalIncome: "1650000",
      previousYearIncome: "1250000",
      investmentAmount: "250000",
      loanInterest: "0",
      donations: "0",
      totalAssets: "14500000",
      totalLiabilities: "0",
      tdsAmount: "85000",
      advanceTaxPaid: "40000",
      hasBusinessAudit: true,
      hasLargeLoanNoBank: false,
      hasExemptIncome: true, // সঞ্চয়পত্রের পেনশন স্কিম বা স্বীকৃত অব্যাহতি [৩]
      bookOfAccountsMaintained: true,
      isRiskShielded: true, // ১৫% এর অধিক বৃদ্ধি [১০৪]
      submissionDate: "2024-03-15",
      calculation: calc2,
      auditRiskScore: audit2.score,
      auditRiskLevel: audit2.level,
      auditIssues: audit2.issues,
      notes: "অনলাইনে সফলভাবে রিটার্ন দাখিল ও একনলেজমেন্ট প্রাপ্তি সম্পন্ন।",
      createdAt: new Date("2024-03-10T09:00:00Z"),
      updatedAt: new Date("2024-03-15T11:20:00Z"),
    },
  ];

  const deadlines = [
    {
      id: "dl-001",
      clientId: "c-001",
      title: "ব্যক্তি করদাতার আয়কর রিটার্ন দাখিলের সর্বশেষ তারিখ",
      category: "income_tax",
      dueDate: "2025-11-30",
      status: "upcoming",
      notes: "৩০ নভেম্বর ২০২৫ জাতীয় কর দিবস",
      createdAt: new Date("2024-01-10T00:00:00Z"),
    },
    {
      id: "dl-002",
      clientId: "c-001",
      title: "মাসিক ভ্যাট রিটার্ন (মুসক ৯.১) দাখিল",
      category: "vat",
      dueDate: "2025-04-15",
      status: "upcoming",
      notes: "প্রতি মাসের ১৫ তারিখের মধ্যে দাখিল বাধ্যতামূলক",
      createdAt: new Date("2024-01-10T00:00:00Z"),
    },
    {
      id: "dl-003",
      clientId: "c-002",
      title: "অগ্রিম কর (৪র্থ কিস্তি) পরিশোধের সময়সীমা",
      category: "income_tax",
      dueDate: "2025-06-15",
      status: "upcoming",
      notes: "ধারা ১২১ অনুযায়ী অগ্রিম আয়কর কিস্তি",
      createdAt: new Date("2024-01-10T00:00:00Z"),
    },
    {
      id: "dl-004",
      clientId: null,
      title: "কোম্পানি করদাতার রিটার্ন দাখিলের সময়সীমা",
      category: "income_tax",
      dueDate: "2025-12-15",
      status: "upcoming",
      notes: "অডিট রিপোর্ট সংবলিত সাধারণ করপোরেট রিটার্ন",
      createdAt: new Date("2024-01-10T00:00:00Z"),
    },
  ];

  const activityLogs = [
    {
      id: "act-001",
      clientId: "c-001",
      actorId: "u-demo-1",
      message: "নতুন ক্লায়েন্ট তৈরি করা হয়েছে: রহিম ট্রেডার্স (CID-00001)",
      createdAt: new Date("2024-02-10T10:05:00Z"),
    },
    {
      id: "act-002",
      clientId: "c-001",
      actorId: "u-demo-1",
      message: "নতুন রিটার্ন প্রস্তুত করা হয়েছে: IT-11 (2024-2025)",
      createdAt: new Date("2024-02-15T14:35:00Z"),
    },
    {
      id: "act-003",
      clientId: "c-002",
      actorId: "u-demo-1",
      message: "নতুন ক্লায়েন্ট তৈরি করা হয়েছে: ডা. নাসরিন আক্তার (CID-00002)",
      createdAt: new Date("2024-03-05T11:35:00Z"),
    },
    {
      id: "act-004",
      clientId: "c-002",
      actorId: "u-demo-1",
      message: "রিটার্নের অবস্থা পরিবর্তন করা হয়েছে: filed",
      createdAt: new Date("2024-03-15T11:25:00Z"),
    },
  ];

  const blogPosts = [
    {
      id: "post-001",
      title: "বিটিসিপি (BTCP) আর্কিটেকচার: কীভাবে আমরা আয়কর আইন ২০২৩ ও অডিট গাইডলাইন ২০২৫ এর স্বয়ংক্রিয় ইঞ্জিন তৈরি করলাম",
      slug: "btcp-architecture-income-tax-act-2023-engine",
      content: "কর ব্যবস্থার আধুনিকায়ন কেবল ফর্ম ফিলিং নয়, বরং প্রতিটি হিসাবকে আইনি সুরক্ষার মধ্যে রাখা। বিটিসিপি প্ল্যাটফর্ম তৈরি করার সময় আমাদের মূল লক্ষ্য ছিল বাংলাদেশের কর আইনজীবীদের জন্য এমন একটি নিরাপদ টুল তৈরি করা, যা অডিট নোটিশ আসার আগেই সম্ভাব্য ঝুঁকি নির্ণয় করতে পারে।\n\nআমাদের ইঞ্জিনে ধারা ১০৪ এর অধীন ১৫% আয় বৃদ্ধি অডিট শিল্ড স্বয়ংক্রিয়ভাবে কাজ করে। যদি কোনো করদাতার চলতি করবর্ষের মোট আয় পূর্ববর্তী করবর্ষের তুলনায় ১৫% বা তার বেশি হয় এবং আয়ের উৎস অপরিবর্তিত থাকে, তবে ইউনিভার্সাল সেলফ-অ্যাসেসমেন্টে তাকে স্বয়ংক্রিয় 'অডিট প্রটেক্টেড' মর্যাদা দেওয়া হয়।\n\nএছাড়াও ধারা ১৬৬ অনুযায়ী বাধ্যতামূলক হিসাব খাতার ঘাটতি এবং ধারা ১০৪ এর অধীনে ব্যাংক বিবরণীহীন ৫ লক্ষাধিক অপ্রাতিষ্ঠানিক ঋণের ঝুঁকি ডিটেক্ট করার জন্য আমাদের অ্যালগরিদম রিয়েল-টাইমে স্কোরিং তৈরি করে। এটি কর আইনজীবী এবং ক্লায়েন্ট উভয়ের সময় ও অর্থ সাশ্রয় করে।",
      excerpt: "বাংলাদেশে প্রথমবারের মতো ধারা ১০৪ এর ১৫% আয় বৃদ্ধি অডিট শিল্ড ও ধারা ১৬৬ হিসাব খাতা প্রোফাইলারের রিয়েল-টাইম সফটওয়্যার আর্কিটেকচার।",
      authorName: "শিহাবুর রহমান",
      authorRole: "developer",
      authorTitle: "প্রধান সফটওয়্যার আর্কিটেক্ট ও লিগ্যাল-টেক ডেভেলপার",
      category: "tax_tech",
      tags: "Next.js, আয়কর আইন ২০২৩, অডিট ইঞ্জিন, লিগ্যাল টেক",
      likesCount: 38,
      readMinutes: 4,
      isFeatured: true,
      createdAt: new Date("2026-03-01T10:00:00Z"),
    },
    {
      id: "post-002",
      title: "আইনজীবী হিসেবে আমার অভিজ্ঞতা: ক্লায়েন্টের অডিট ঝুঁকি ৯৫% হ্রাস এবং ধারা ১৮২(১১) নিষ্পত্তি পত্র গ্রহণ",
      slug: "lawyer-experience-audit-risk-reduction",
      content: "ঢাকা ট্যাক্সেস বারে বিগত ১৫ বছর ধরে প্র্যাকটিস করার পর আমি অনুভব করেছি—ক্লায়েন্টের সবচেয়ে বড় ভয় থাকে অডিট সিলেকশন এবং অপ্রয়োজনীয় জরিমানা।\n\nবিটিসিপি ব্যবহার করে আমরা চলতি মৌসুমে আমাদের শতাধিক ক্লায়েন্টের ফাইল প্রাক-ফাইলিং অডিট সিমুলেশন করেছি। যেসব ফাইলে পূর্বে ব্যাংক বিবরণীর ঘাটতি ছিল বা বিনিয়োগ রিবেটের প্রমাণ অনুপস্থিত ছিল, রিটার্ন জমা দেওয়ার আগেই তা সংশোধন করতে সক্ষম হয়েছি।\n\nউপ-কর কমিশনার কর্তৃক কোনো নোটিশ দেওয়ার পূর্বেই আমরা ধারা ১০৪ এর ইউনিভার্সাল সেলফ-অ্যাসেসমেন্ট শিল্ড নিশ্চিত করেছি। এটি আমাদের ক্লায়েন্টদের বিশ্বাস বহুগুণ বাড়িয়ে দিয়েছে।",
      excerpt: "বিটিসিপি ব্যবহারের পর আমাদের চেম্বারে ক্লায়েন্টদের অডিট ঝুঁকি হ্রাস এবং স্বনির্ধারণী রিটার্ন দাখিলের বাস্তব অভিজ্ঞতা।",
      authorName: "অ্যাডভোকেট এম. এ. হাসান",
      authorRole: "lawyer",
      authorTitle: "সিনিয়র অ্যাডভোকেট, ঢাকা ট্যাক্সেস বার অ্যাসোসিয়েশন",
      category: "client_story",
      tags: "অডিট ডিফেন্স, ক্লায়েন্ট অভিজ্ঞতা, আয়কর রিটার্ন ২০২৬-২০২৭",
      likesCount: 29,
      readMinutes: 3,
      isFeatured: true,
      createdAt: new Date("2026-03-05T14:30:00Z"),
    },
    {
      id: "post-003",
      title: "একজন সাধারণ উদ্যোক্তা ও ক্লায়েন্ট হিসেবে আয়কর ফাইলিংয়ে আমার দুশ্চিন্তা যেভাবে দূর হলো",
      slug: "client-story-entrepreneur-tax-peace-of-mind",
      content: "আমি একটি আইটি স্টার্টআপ চালাই। পূর্বে আয়কর রিটার্ন প্রস্তুত করার সময় সবচেয়ে বেশি ঝামেলায় পড়তাম দানকর হিসাব (Gift Tax Act 1990) এবং পরিচালকদের ব্যক্তিগত ঋণ সমন্বয় নিয়ে।\n\nআমার ট্যাক্স অ্যাডভোকেট যখন বিটিসিপি প্ল্যাটফর্মের মাধ্যমে আমাকে একটি বিস্তারিত ট্যাক্স হেলথ রিপোর্ট ও সম্ভাব্য এক্সপোজার এনালাইসিস দিলেন, আমি এক নজরে দেখতে পেলাম আমার ব্যবসায় কোন কোন নথির ঘাটতি আছে।\n\nবিশেষ করে ধারা ৩ এর অধীনে কর অব্যাহতিপ্রাপ্ত সফটওয়্যার এক্সপোর্টের আয় এবং ধারা ১০৪ এর ১৫% গ্রোথ শিল্ডের সুস্পষ্ট হিসাব আমাদের অডিট ভয় দূর করে দিয়েছে। এখন আমরা ব্যবসায়ের মূল কাজে মনোযোগ দিতে পারছি।",
      excerpt: "ব্যবসা পরিচালনা ও ব্যক্তিগত আয়কর ফাইলিংয়ে স্বচ্ছতা এবং অডিট ভীতি দূরীকরণে করদাতার বাস্তব অভিমত।",
      authorName: "তানভীর আহমেদ",
      authorRole: "client",
      authorTitle: "সিইও, ক্লাউডকোর টেকনোলজিস (ক্লায়েন্ট ও করদাতা)",
      category: "client_story",
      tags: "করদাতা মতামত, স্টার্টআপ ট্যাক্স, ব্যবসা সুরক্ষা",
      likesCount: 22,
      readMinutes: 3,
      isFeatured: false,
      createdAt: new Date("2026-03-08T09:15:00Z"),
    },
    {
      id: "post-004",
      title: "২০২৬-২০২৭ করবর্ষে এনবিআরের ডিজিটাল অডিট ক্রাইটেরিয়া ও করদাতাদের প্রস্তুতি",
      slug: "digital-audit-criteria-nbr-2026-2027",
      content: "জাতীয় রাজস্ব বোর্ড (এনবিআর) ২০২৫-২০২৬ এবং ২০২৬-২০২৭ করবর্ষে রিটার্ন প্রসেসিংয়ে কৃত্রিম বুদ্ধিমত্তা ও ডিজিটাল ডাটাবেজ ইন্টিগ্রেশন বৃদ্ধি করেছে। ব্যাংক হিসাবের তথ্য, ভূমি রেজিস্ট্রি অফিস ও গাড়ি রেজিস্ট্রেশনের ডেটা সরাসরি আয়কর সেন্ট্রাল সার্ভারের সাথে সংযুক্ত।\n\nএমতাবস্থায় করদাতাদের প্রধান ৫টি বিষয়ে সতর্ক থাকতে হবে:\n১. ৫ লক্ষাধিক টাকার অপ্রাতিষ্ঠানিক ঋণে অবশ্যই ব্যাংক স্টেটমেন্ট থাকা।\n২. ষষ্ঠ তফসিল অনুযায়ী কর অব্যাহতিপ্রাপ্ত আয়ের সুনির্দিষ্ট সরকারি অনুমোদন প্রমাণক।\n৩. ক্যাশ ব্যালেন্স ও ব্যাংক সমাপনী স্থিতির নির্ভুল মিলকরণ।\n৪. ধারা ১০৪ অনুসারে পূর্ববর্তী বছরের চেয়ে অন্তত ১৫% বেশি আয় প্রদর্শন করে সেলফ-অ্যাসেসমেন্ট শিল্ড নিশ্চিত করা।\n৫. আইটি-১০বি২০১৬ সম্পদ ও দায় বিবরণীতে কোনো গোপনীয়তা না রাখা।",
      excerpt: "এনবিআরের আধুনিক অডিট নির্দেশিকা ২০২৫ অনুযায়ী করদাতাদের ৫টি পূর্বশর্ত ও সুরক্ষাকবচ।",
      authorName: "শিহাবুর রহমান",
      authorRole: "developer",
      authorTitle: "ট্যাক্স অ্যালগরিদম রিসার্চ ও ডেভেলপার টিম",
      category: "tax_tech",
      tags: "এনবিআর, অডিট নির্দেশিকা ২০২৫, কর পরিকল্পনা",
      likesCount: 45,
      readMinutes: 5,
      isFeatured: true,
      createdAt: new Date("2026-03-10T12:00:00Z"),
    },
  ];

  return {
    users,
    clients,
    documents,
    taxReturns,
    deadlines,
    activityLogs,
    lawyers,
    clientBankAccounts,
    giftRecords,
    blogPosts,
    newsletterSubscribers: [] as Array<{
      id: string;
      email: string;
      phone: string | null;
      name: string | null;
      createdAt: Date;
    }>,
  };
}

// Global store to keep in-memory state during execution
const globalForStore = globalThis as unknown as {
  __btcpInMemoryStore?: ReturnType<typeof getInitialSeedData>;
};

export function getStore() {
  if (!globalForStore.__btcpInMemoryStore) {
    globalForStore.__btcpInMemoryStore = getInitialSeedData();
  }
  const s = globalForStore.__btcpInMemoryStore;
  const defaults = getInitialSeedData();
  if (!s.lawyers || s.lawyers.length < defaults.lawyers.length) s.lawyers = defaults.lawyers;
  if (!s.clientBankAccounts) s.clientBankAccounts = defaults.clientBankAccounts;
  if (!s.giftRecords) s.giftRecords = defaults.giftRecords;
  if (!s.blogPosts || s.blogPosts.length < defaults.blogPosts.length) s.blogPosts = defaults.blogPosts;
  if (!s.newsletterSubscribers) s.newsletterSubscribers = defaults.newsletterSubscribers;
  return s;
}

function resolveTable(table: any): keyof ReturnType<typeof getInitialSeedData> {
  const name = getTableName(table);
  switch (name) {
    case "users":
      return "users";
    case "clients":
      return "clients";
    case "lawyers":
      return "lawyers";
    case "client_bank_accounts":
    case "clientBankAccounts":
      return "clientBankAccounts";
    case "gift_records":
    case "giftRecords":
      return "giftRecords";
    case "documents":
      return "documents";
    case "tax_returns":
    case "taxReturns":
      return "taxReturns";
    case "deadlines":
      return "deadlines";
    case "activity_logs":
    case "activityLogs":
      return "activityLogs";
    case "blog_posts":
    case "blogPosts":
      return "blogPosts";
    case "newsletter_subscribers":
    case "newsletterSubscribers":
      return "newsletterSubscribers";
    default:
      return "clients";
  }
}

export function createMockDb() {
  console.log("[BTCP] In-memory database initialized with seed records.");

  return {
    select(selection?: any) {
      let sourceTable: any = null;
      let conditions: any[] = [];
      let orderBys: any[] = [];
      let limitCount: number | null = null;
      let joins: { type: "inner" | "left"; table: any; on: any }[] = [];

      const queryObj: any = {
        from(table: any) {
          sourceTable = table;
          return queryObj;
        },
        where(condition: any) {
          if (condition) conditions.push(condition);
          return queryObj;
        },
        orderBy(...orders: any[]) {
          orderBys.push(...orders);
          return queryObj;
        },
        limit(n: number) {
          limitCount = n;
          return queryObj;
        },
        innerJoin(table: any, on: any) {
          joins.push({ type: "inner", table, on });
          return queryObj;
        },
        leftJoin(table: any, on: any) {
          joins.push({ type: "left", table, on });
          return queryObj;
        },
        then(resolve: (val: any) => any, reject?: (err: any) => any) {
          try {
            const store = getStore();
            const tableKey = resolveTable(sourceTable);
            let rows: any[] = [...((store[tableKey] || []) as any[])];

            // Filter
            for (const cond of conditions) {
              rows = rows.filter((r) => matchesCondition(cond, r));
            }

            // Joins handling
            if (joins.length > 0) {
              if (tableKey === "taxReturns") {
                // Joined with clients
                rows = rows.map((ret) => {
                  const client = store.clients.find((c) => c.id === ret.clientId);
                  return {
                    id: ret.id,
                    clientId: ret.clientId,
                    clientName: client?.name ?? "",
                    clientCode: client?.clientCode ?? "",
                    assessmentYear: ret.assessmentYear,
                    incomeYear: ret.incomeYear,
                    returnType: ret.returnType,
                    status: ret.status,
                    totalIncome: ret.totalIncome,
                    isRiskShielded: ret.isRiskShielded,
                    hasLargeLoanNoBank: ret.hasLargeLoanNoBank,
                    bookOfAccountsMaintained: ret.bookOfAccountsMaintained,
                    hasExemptIncome: ret.hasExemptIncome,
                    submissionDate: ret.submissionDate,
                    auditRiskScore: ret.auditRiskScore,
                    auditRiskLevel: ret.auditRiskLevel,
                    calculation: ret.calculation,
                    auditIssues: ret.auditIssues,
                    createdAt: ret.createdAt,
                    updatedAt: ret.updatedAt,
                  };
                });
              } else if (tableKey === "deadlines") {
                // Joined with clients
                rows = rows.map((d) => {
                  const client = d.clientId ? store.clients.find((c) => c.id === d.clientId) : null;
                  return {
                    id: d.id,
                    title: d.title,
                    category: d.category,
                    dueDate: d.dueDate,
                    status: d.status,
                    notes: d.notes,
                    clientId: d.clientId,
                    clientName: client ? client.name : null,
                    createdAt: d.createdAt,
                  };
                });
              } else if (tableKey === "activityLogs") {
                // Joined with clients and users
                rows = rows.map((a) => {
                  const client = a.clientId ? store.clients.find((c) => c.id === a.clientId) : null;
                  const user = a.actorId ? store.users.find((u) => u.id === a.actorId) : null;
                  return {
                    id: a.id,
                    message: a.message,
                    createdAt: a.createdAt,
                    clientId: a.clientId,
                    clientName: client ? client.name : null,
                    actorName: user ? user.name : null,
                  };
                });
              } else if (tableKey === "giftRecords") {
                rows = rows.map((g) => {
                  const client = g.donorClientId ? store.clients.find((c) => c.id === g.donorClientId) : null;
                  return {
                    ...g,
                    donorClientName: client ? client.name : null,
                    donorClientCode: client ? client.clientCode : null,
                  };
                });
              } else if (tableKey === "clientBankAccounts") {
                rows = rows.map((b) => {
                  const client = b.clientId ? store.clients.find((c) => c.id === b.clientId) : null;
                  return {
                    ...b,
                    clientName: client ? client.name : null,
                    clientCode: client ? client.clientCode : null,
                  };
                });
              }
            }

            // Ordering
            if (orderBys.length > 0) {
              for (const ord of orderBys) {
                try {
                  const { sql: ordSql } = dialect.sqlToQuery(ord);
                  const isDesc = ordSql.toLowerCase().includes("desc");
                  rows.sort((a, b) => {
                    const valA = a.createdAt || a.updatedAt || a.uploadedAt || a.dueDate;
                    const valB = b.createdAt || b.updatedAt || b.uploadedAt || b.dueDate;
                    const timeA = valA ? new Date(valA).getTime() : 0;
                    const timeB = valB ? new Date(valB).getTime() : 0;
                    return isDesc ? timeB - timeA : timeA - timeB;
                  });
                } catch {
                  // Ignore sort error
                }
              }
            }

            // Limit
            if (limitCount !== null && limitCount >= 0) {
              rows = rows.slice(0, limitCount);
            }

            // Aggregates (Count query)
            if (selection && typeof selection === "object" && "count" in selection) {
              return resolve([{ count: rows.length }]);
            }

            return resolve(rows);
          } catch (e) {
            if (reject) reject(e);
            else throw e;
          }
        },
      };

      return queryObj;
    },

    insert(table: any) {
      let valuesToInsert: any = null;

      const insertObj: any = {
        values(data: any) {
          valuesToInsert = data;
          return insertObj;
        },
        returning() {
          return insertObj;
        },
        then(resolve: (val: any) => any, reject?: (err: any) => any) {
          try {
            const store = getStore();
            const tableKey = resolveTable(table);
            const list = store[tableKey] as any[];

            const items = Array.isArray(valuesToInsert) ? valuesToInsert : [valuesToInsert];
            const inserted: any[] = [];

            for (const item of items) {
              const newRow = {
                id: item.id || `gen-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                createdAt: new Date(),
                updatedAt: new Date(),
                ...item,
              };
              list.push(newRow);
              inserted.push(newRow);
            }

            return resolve(inserted);
          } catch (e) {
            if (reject) reject(e);
            else throw e;
          }
        },
      };

      return insertObj;
    },

    update(table: any) {
      let updates: any = {};
      let condition: any = null;

      const updateObj: any = {
        set(data: any) {
          updates = data;
          return updateObj;
        },
        where(cond: any) {
          condition = cond;
          return updateObj;
        },
        then(resolve: (val: any) => any, reject?: (err: any) => any) {
          try {
            const store = getStore();
            const tableKey = resolveTable(table);
            const list = store[tableKey] as any[];

            const updated: any[] = [];
            for (let i = 0; i < list.length; i++) {
              if (matchesCondition(condition, list[i])) {
                list[i] = {
                  ...list[i],
                  ...updates,
                  updatedAt: new Date(),
                };
                updated.push(list[i]);
              }
            }

            return resolve(updated);
          } catch (e) {
            if (reject) reject(e);
            else throw e;
          }
        },
      };

      return updateObj;
    },

    delete(table: any) {
      let condition: any = null;

      const deleteObj: any = {
        where(cond: any) {
          condition = cond;
          return deleteObj;
        },
        then(resolve: (val: any) => any, reject?: (err: any) => any) {
          try {
            const store = getStore();
            const tableKey = resolveTable(table);
            const list = store[tableKey] as any[];

            const remaining: any[] = [];
            for (let i = 0; i < list.length; i++) {
              if (!matchesCondition(condition, list[i])) {
                remaining.push(list[i]);
              }
            }
            (store as any)[tableKey] = remaining;

            return resolve({ rowCount: list.length - remaining.length });
          } catch (e) {
            if (reject) reject(e);
            else throw e;
          }
        },
      };

      return deleteObj;
    },

    async execute(sqlStatement: any) {
      return { rows: [{ "?column?": 1 }] };
    },
  };
}
