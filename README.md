# Nexis Capital | Enterprise Loan Origination & Underwriting System (LOS)

[![Angular](https://img.shields.io/badge/Angular-17%2B-DD0031.svg)](https://angular.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%26%20Auth-FFCA28.svg)](https://firebase.google.com/)
[![Node.js](https://img.shields.io/badge/Node.js-Express%20API-339933.svg)](https://nodejs.org/)

A production-grade, enterprise-scale **Mortgage & Loan Origination System (LOS)** featuring a consumer multi-step application wizard, real-time credit risk checks, and a secure bank underwriter decision dashboard.

---

## 🌟 Dual-Portal Architecture

### 1. 👤 Consumer / Applicant Portal
* **Multi-Step Stepper Wizard**: 5-step interactive workflow with progress validation.
* **Dynamic FormArrays**: Add/remove multiple employer income streams and financial liabilities.
* **Complex Cross-Field Validation**:
  - **Loan-to-Value (LTV)**: Down payment must be $\ge 10\%$ of property value.
  - **Debt-to-Income (DTI)**: Total monthly debts vs gross income cannot exceed $50\%$.
* **Asynchronous SSN Verification**: Non-blocking background verification with RxJS `timer` and `switchMap`.
* **Single Active Application Rule**: Restricts applicants from submitting multiple loans while an existing application is in `PENDING` or `ON_HOLD` status.
* **3-Month Cooling Lock**: Mandatory 90-day waiting period with live countdown if an application is `REJECTED`.
* **Session Persistence**: Browser `localStorage` remembers the applicant's reference ID (`APP-2026-XXXX`).

### 2. 🏦 Bank Staff / Underwriting Control Center
* **Role-Based Authentication**: Secure 256-bit login gateway for bank officers.
* **Underwriter Stamping**: Decisions automatically record the reviewing officer's Name, Role, and Badge ID.
* **Interactive Decision Actions**:
  - `Approve Loan`: Set approved amount, custom rate, and underwriter notes.
  - `Request Docs / Hold`: Request missing W-2 tax forms or pay stubs.
  - `Reject Loan`: Records rejection rationale and activates the 3-month cooling lock.
* **Pipeline Analytics**: Real-time KPI cards for volume, pending reviews, and approved capital.

---

## 🔑 Bank Staff Demo Credentials

| Role | Email | Password | Badge ID |
|---|---|---|---|
| **Senior Underwriter** | `underwriter@nexiscapital.com` | `Staff@2026` | `NXS-9842` |
| **Managing Director** | `manager@nexiscapital.com` | `Staff@2026` | `NXS-1002` |
| **Credit Risk Analyst** | `analyst@nexiscapital.com` | `Staff@2026` | `NXS-4421` |

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Application
```bash
# Starts both Express API (:3000) and Angular Dev Server (:4200)
npm run dev
```

* **Frontend Gateway**: [http://localhost:4200](http://localhost:4200)
* **Underwriter API**: [http://localhost:3000](http://localhost:3000)

---

## 👨‍💻 Repository
`senodetech/angular-loan-application-portal`
