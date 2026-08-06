# 24_ENTERPRISE_FINANCE_ENGINE.md

# ENTERPRISE FINANCE & ACCOUNTING ENGINE

Version : 1.0 Enterprise
Architecture : Single Tenant
Database : MySQL
ORM : Prisma
Backend : Node.js (Express)
Frontend : React + Vite + Tailwind
Target : Production Ready

---

# OBJECTIVE

Membangun Enterprise Finance & Accounting System yang terintegrasi penuh dengan seluruh ERP Sekolah, Pondok Pesantren, PKBM dan Yayasan.

Seluruh modul harus saling terhubung melalui Prisma Relation.
Tidak boleh ada data duplicate.
Tidak boleh ada Local Memory.
Tidak boleh ada Dummy Data.
Tidak boleh ada Hardcode.
Semua pengaturan berasal dari Database.

---

# CORE MODULES

## 1. GENERAL LEDGER (GL)
- Chart of Accounts (COA) - Dynamic & Hierarchical
- Journal Vouchers (JV) - Manual & Auto
- General Ledger Posting
- Trial Balance
- Balance Sheet
- Income Statement (Laba Rugi)
- Cash Flow Statement

## 2. CASH & BANK MANAGEMENT
- Multi Bank Accounts
- Cash-In / Cash-Out Transactions
- Bank Reconciliation
- Petty Cash Management
- Transfer Between Accounts

## 3. BUDGETING
- Budget Planning (Annual/Monthly)
- Budget vs Realization Tracking
- Budget Limit Control
- Multi-Level Approval for Over-Budget

## 4. ACCOUNTS RECEIVABLE (AR)
- Student Billing Integration (SPP, Buildings, etc)
- Payment Gateway Integration Ready
- AR Aging Report
- Invoice Generation

## 5. ACCOUNTS PAYABLE (AP)
- Purchase Invoice Tracking
- Supplier Payments
- AP Aging Report

## 6. ACCOUNTING PERIODS
- Monthly Closing
- Year-End Closing
- Period Lock/Unlock

---

# DATABASE SCHEMA (PRISMA)

## Model: COA (Chart of Accounts)
- id: UUID
- tenant_id: String
- code: String (Unique)
- name: String
- category: Enum (ASET, KEWAJIBAN, EKUITAS, PENDAPATAN, BEBAN)
- normal_balance: Enum (DEBIT, KREDIT)
- parent_id: String?
- is_header: Boolean
- status: String (ACTIVE/INACTIVE)

## Model: BankAccount
- id: UUID
- tenant_id: String
- name: String
- bank_name: String
- account_number: String
- account_holder: String
- coa_id: String
- balance: Float
- status: String

## Model: AccountingTransaction
- id: UUID
- tenant_id: String
- date: DateTime
- type: Enum (RECEIPT, PAYMENT, TRANSFER)
- doc_type: Enum (CASH, BANK, JOURNAL)
- ref_no: String (Auto-generated)
- description: Text
- total_amount: Float
- status: Enum (DRAFT, POSTED, CANCELLED)
- created_by: String

## Model: JournalVoucher
- id: UUID
- tenant_id: String
- voucher_no: String
- date: DateTime
- description: Text
- status: Enum (DRAFT, POSTED)
- is_auto: Boolean

## Model: JournalItem
- id: UUID
- journal_id: String
- coa_id: String
- debit: Float
- credit: Float
- description: String

## Model: BudgetPlan
- id: UUID
- tenant_id: String
- coa_id: String
- period: String (Year/Month)
- amount: Float
- realized_amount: Float

---

# IMPLEMENTATION STEPS

1. Update `prisma/schema.prisma` with Finance models.
2. Run Prisma migration.
3. Refactor `FinanceController` to use Prisma instead of `inMemoryDb`.
4. Implement Auto-Journal Logic for Transactions.
5. Create UI Components for COA, Transactions, and Reports.
