import {
  boolean,
  char,
  date,
  integer,
  jsonb,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// ---------- ১. আইনজীবীদের (Lawyers/Subscribers) টেবিল [৪২] ----------
export const lawyers = pgTable("lawyers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  barId: varchar("bar_id", { length: 100 }).unique(), // বার কাউন্সিলের নিবন্ধন নম্বর [৪২]
  tin: char("tin", { length: 12 }).unique(),
  email: varchar("email", { length: 100 }).unique().notNull(),
  phoneNumber: varchar("phone_number", { length: 15 }).notNull(),
  subscriptionStatus: varchar("subscription_status", { length: 50 }).default("inactive"), // active, inactive, trialling
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ---------- Users (Firm staff / System Authentication) ----------
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("associate"), // partner | associate | assistant | admin
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------- ২. আইনজীবীদের ক্লায়েন্ট টেবিল [১৬৪] ----------
export const clients = pgTable("clients", {
  id: uuid("id").primaryKey().defaultRandom(),
  lawyerId: integer("lawyer_id").references(() => lawyers.id, { onDelete: "cascade" }),
  clientCode: text("client_code").notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  taxpayerType: varchar("taxpayer_type", { length: 50 }).notNull().default("individual"), // 'individual', 'firm', 'company' [১৬৪]
  clientType: text("client_type").notNull().default("individual"), // compatibility alias
  nid: varchar("nid", { length: 17 }).unique(),
  tin: char("tin", { length: 12 }).unique(),
  isResident: boolean("is_resident").default(true),
  genderCategory: varchar("gender_category", { length: 50 }).default("general"), // male, female, third_gender, disabled
  gender: text("gender"), // male | female | other
  taxpayerCategory: text("taxpayer_category").notNull().default("general"), // general | female_senior | disabled | freedom_fighter
  location: text("location").notNull().default("other"), // dhaka_ctg | other_city_corp | other
  bin: text("bin"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  businessType: text("business_type"),
  vatRegistered: boolean("vat_registered").notNull().default(false),
  status: text("status").notNull().default("active"), // active | inactive
  notes: text("notes"),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------- ৩. ক্লায়েন্টদের ব্যাংক হিসাব বিবরণী [২৮] ----------
export const clientBankAccounts = pgTable("client_bank_accounts", {
  id: serial("id").primaryKey(),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  bankName: varchar("bank_name", { length: 150 }).notNull(), // ব্যাংকের নাম [২৮]
  branchName: varchar("branch_name", { length: 150 }), // শাখার নাম [২৮]
  accountNumber: varchar("account_number", { length: 50 }).notNull(), // হিসাব নম্বর [২৮]
  totalDeposit: numeric("total_deposit", { precision: 15, scale: 2 }).default("0.00"), // আয়বর্ষে মোট জমা [২৮]
  closingBalance: numeric("closing_balance", { precision: 15, scale: 2 }).default("0.00"), // শেষ তারিখের স্থিতি [২৮]
  interestEarned: numeric("interest_earned", { precision: 15, scale: 2 }).default("0.00"), // প্রাপ্ত সুদ/মুনাফা [২৮]
  tdsDeducted: numeric("tds_deducted", { precision: 15, scale: 2 }).default("0.00"), // উৎসে কর কর্তন [২৮]
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ---------- Documents ----------
export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  category: text("category").notNull(),
  title: text("title").notNull(),
  notes: text("notes"),
  status: text("status").notNull().default("pending"), // pending | submitted | verified | expired
  expiryDate: date("expiry_date"),
  uploadedAt: timestamp("uploaded_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------- ৪. আয়কর রিটার্ন ও অডিট প্রোফাইলার টেবিল [৩, ১৬৬] ----------
export const taxReturns = pgTable("tax_returns", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  assessmentYear: varchar("assessment_year", { length: 9 }).notNull(), // যেমন: '2026-2027'
  incomeYear: varchar("income_year", { length: 9 }).notNull().default("2025-2026"), // '2025-2026'
  totalIncome: numeric("total_income", { precision: 15, scale: 2 }).notNull().default("0.00"),
  previousYearIncome: numeric("previous_year_income", { precision: 15, scale: 2 }).default("0.00"),
  hasLargeLoanNoBank: boolean("has_large_loan_no_bank").default(false), // ৫ লক্ষের বেশি প্রাতিষ্ঠানিক বহির্ভূত ঋণ ব্যাংক স্টেটমেন্ট ছাড়া [১০৪]
  hasExemptIncome: boolean("has_exempt_income").default(false), // কর অব্যাহতিপ্রাপ্ত আয় আছে কি না [৩]
  bookOfAccountsMaintained: boolean("book_of_accounts_maintained").default(true), // হিসাব খাতা সংরক্ষণ করা হয়েছে কি না [১৬৬]
  auditRiskScore: numeric("audit_risk_score", { precision: 5, scale: 2 }).default("0.00"), // স্বয়ংক্রিয়ভাবে হিসাবকৃত ঝুঁকি
  isRiskShielded: boolean("is_risk_shielded").default(false), // ১৫% আয় বৃদ্ধির নিয়মে সুরক্ষিত কি না [১০৪]
  submissionDate: date("submission_date"),
  returnType: text("return_type").notNull().default("IT-11"),
  status: text("status").notNull().default("draft"), // draft | review | filed

  incomeSalary: numeric("income_salary", { precision: 14, scale: 2 }).notNull().default("0"),
  incomeBusiness: numeric("income_business", { precision: 14, scale: 2 }).notNull().default("0"),
  incomeProperty: numeric("income_property", { precision: 14, scale: 2 }).notNull().default("0"),
  incomeCapitalGain: numeric("income_capital_gain", { precision: 14, scale: 2 }).notNull().default("0"),
  incomeAgricultural: numeric("income_agricultural", { precision: 14, scale: 2 }).notNull().default("0"),
  incomeOther: numeric("income_other", { precision: 14, scale: 2 }).notNull().default("0"),

  investmentAmount: numeric("investment_amount", { precision: 14, scale: 2 }).notNull().default("0"),
  loanInterest: numeric("loan_interest", { precision: 14, scale: 2 }).notNull().default("0"),
  donations: numeric("donations", { precision: 14, scale: 2 }).notNull().default("0"),

  totalAssets: numeric("total_assets", { precision: 14, scale: 2 }).notNull().default("0"),
  totalLiabilities: numeric("total_liabilities", { precision: 14, scale: 2 }).notNull().default("0"),

  tdsAmount: numeric("tds_amount", { precision: 14, scale: 2 }).notNull().default("0"),
  advanceTaxPaid: numeric("advance_tax_paid", { precision: 14, scale: 2 }).notNull().default("0"),

  hasBusinessAudit: boolean("has_business_audit").notNull().default(false),

  calculation: jsonb("calculation"),
  auditRiskLevel: text("audit_risk_level").notNull().default("low"),
  auditIssues: jsonb("audit_issues"),

  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------- ৫. দানকর ট্র্যাকিং টেবিল (দানকর আইন, ১৯৯০) [১৬৩৯] ----------
export const giftRecords = pgTable("gift_records", {
  id: serial("id").primaryKey(),
  donorClientId: uuid("donor_client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  recipientName: varchar("recipient_name", { length: 255 }).notNull(),
  relationship: varchar("relationship", { length: 100 }).notNull(), // 'spouse', 'parent', 'sibling' (অব্যাহতিপ্রাপ্ত) বা 'other' [১৬৩৯]
  giftDescription: text("gift_description").notNull(), // যেমন: 'স্বর্ণালংকার' [১৬৩৯]
  fairMarketValue: numeric("fair_market_value", { precision: 15, scale: 2 }).notNull(), // ন্যায্য বাজার মূল্য [১৬৩৯]
  giftTaxPayable: numeric("gift_tax_payable", { precision: 15, scale: 2 }).default("0.00"), // প্রদেয় দানকর
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ---------- Deadlines ----------
export const deadlines = pgTable("deadlines", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id").references(() => clients.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  category: text("category").notNull().default("income_tax"), // income_tax | vat | audit | appeal | other
  dueDate: date("due_date").notNull(),
  status: text("status").notNull().default("upcoming"), // upcoming | completed | overdue
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------- Activity Log ----------
export const activityLogs = pgTable("activity_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id").references(() => clients.id, { onDelete: "cascade" }),
  actorId: uuid("actor_id").references(() => users.id),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------- ৬. ল্যান্ডিং পেজ কমিউনিটি ব্লগ টেবিল (ডেভেলপার ও ক্লায়েন্ট ব্লগ) ----------
export const blogPosts = pgTable("blog_posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  authorName: varchar("author_name", { length: 150 }).notNull(),
  authorRole: varchar("author_role", { length: 50 }).notNull().default("developer"), // developer | client | lawyer
  authorTitle: varchar("author_title", { length: 150 }), // e.g. "Full-stack Developer", "করদাতা ও ক্লায়েন্ট"
  category: varchar("category", { length: 100 }).notNull().default("tax_tech"), // tax_tech | audit_defense | client_story | law_update
  tags: text("tags"),
  likesCount: integer("likes_count").default(0),
  readMinutes: integer("read_minutes").default(3),
  isFeatured: boolean("is_featured").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------- ৭. প্রচার ও লিড জেনারেশন সাবস্ক্রিপশন ----------
export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 50 }),
  name: varchar("name", { length: 150 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

