-- ============================================================================
-- বাংলাদেশ ট্যাক্স কমপ্লায়েন্স প্ল্যাটফর্ম (BTCP) - কোর ডাটাবেজ স্কিমা
-- Bangladesh Tax Compliance Platform - Core Database Schema
-- ============================================================================

-- ১. আইনজীবীদের (Lawyers/Subscribers) টেবিল [৪২]
CREATE TABLE IF NOT EXISTS lawyers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    bar_id VARCHAR(100) UNIQUE, -- বার কাউন্সিলের নিবন্ধন নম্বর [৪২]
    tin CHAR(12) UNIQUE,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    subscription_status VARCHAR(50) DEFAULT 'inactive', -- active, inactive, trialling
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ২. আইনজীবীদের ক্লায়েন্ট টেবিল [১৬৪]
CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    lawyer_id INT REFERENCES lawyers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    taxpayer_type VARCHAR(50) NOT NULL, -- 'individual', 'firm', 'company' [১৬৪]
    nid VARCHAR(17) UNIQUE,
    tin CHAR(12) UNIQUE,
    is_resident BOOLEAN DEFAULT TRUE,
    gender_category VARCHAR(50) DEFAULT 'general', -- male, female, third_gender, disabled
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ৩. ক্লায়েন্টদের ব্যাংক হিসাব বিবরণী [২৮]
CREATE TABLE IF NOT EXISTS client_bank_accounts (
    id SERIAL PRIMARY KEY,
    client_id INT REFERENCES clients(id) ON DELETE CASCADE,
    bank_name VARCHAR(150) NOT NULL, -- ব্যাংকের নাম [২৮]
    branch_name VARCHAR(150), -- শাখার নাম [২৮]
    account_number VARCHAR(50) NOT NULL, -- হিসাব নম্বর [২৮]
    total_deposit NUMERIC(15, 2) DEFAULT 0.00, -- আয়বর্ষে মোট জমা [২৮]
    closing_balance NUMERIC(15, 2) DEFAULT 0.00, -- শেষ তারিখের স্থিতি [২৮]
    interest_earned NUMERIC(15, 2) DEFAULT 0.00, -- প্রাপ্ত সুদ/মুনাফা [২৮]
    tds_deducted NUMERIC(15, 2) DEFAULT 0.00 -- উৎসে কর কর্তন [২৮]
);

-- ৪. আয়কর রিটার্ন ও অডিট প্রোফাইলার টেবিল [৩, ১৬৬]
CREATE TABLE IF NOT EXISTS tax_returns (
    id SERIAL PRIMARY KEY,
    client_id INT REFERENCES clients(id) ON DELETE CASCADE,
    assessment_year VARCHAR(9) NOT NULL, -- যেমন: '2026-2027'
    income_year VARCHAR(9) NOT NULL, -- '2025-2026'
    total_income NUMERIC(15, 2) NOT NULL,
    previous_year_income NUMERIC(15, 2) DEFAULT 0.00,
    has_large_loan_no_bank BOOLEAN DEFAULT FALSE, -- ৫ লক্ষের বেশি প্রাতিষ্ঠানিক বহির্ভূত ঋণ ব্যাংক স্টেটমেন্ট ছাড়া [১০৪]
    has_exempt_income BOOLEAN DEFAULT FALSE, -- কর অব্যাহতিপ্রাপ্ত আয় আছে কি না [৩]
    book_of_accounts_maintained BOOLEAN DEFAULT TRUE, -- হিসাব খাতা সংরক্ষণ করা হয়েছে কি না [১৬৬]
    audit_risk_score NUMERIC(5, 2) DEFAULT 0.00, -- স্বয়ংক্রিয়ভাবে হিসাবকৃত ঝুঁকি
    is_risk_shielded BOOLEAN DEFAULT FALSE, -- ১৫% আয় বৃদ্ধির নিয়মে সুরক্ষিত কি না [১০৪]
    submission_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ৫. দানকর ট্র্যাকিং টেবিল (দানকর আইন, ১৯৯০) [১৬৩৯]
CREATE TABLE IF NOT EXISTS gift_records (
    id SERIAL PRIMARY KEY,
    donor_client_id INT REFERENCES clients(id) ON DELETE CASCADE,
    recipient_name VARCHAR(255) NOT NULL,
    relationship VARCHAR(100) NOT NULL, -- 'spouse', 'parent', 'sibling' (অব্যাহতিপ্রাপ্ত) বা 'other' [১৬৩৯]
    gift_description TEXT NOT NULL, -- যেমন: 'স্বর্ণালংকার' [১৬৩৯]
    fair_market_value NUMERIC(15, 2) NOT NULL, -- ন্যায্য বাজার মূল্য [১৬৩৯]
    gift_tax_payable NUMERIC(15, 2) DEFAULT 0.00 -- প্রদেয় দানকর
);

-- ইনডেক্সিং (দ্রুত কোয়েরি ও অডিট প্রোফাইলিংয়ের জন্য)
CREATE INDEX IF NOT EXISTS idx_clients_lawyer ON clients(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_client ON client_bank_accounts(client_id);
CREATE INDEX IF NOT EXISTS idx_tax_returns_client ON tax_returns(client_id);
CREATE INDEX IF NOT EXISTS idx_gift_records_donor ON gift_records(donor_client_id);
