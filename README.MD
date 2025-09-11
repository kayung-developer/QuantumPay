# QuantumPay V6.3 - The Global Financial Operating System

<p align="center">
  <img src="frontend/public/logo.svg" alt="QuantumPay Logo" width="120">
</p>

<h1 align="center">QuantumPay</h1>

<p align="center">
  <strong>The hyper-secure, AI-powered, globally-aware financial super-app.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.10%2B-blue?logo=python" alt="Python Version">
  <img src="https://img.shields.io/badge/Framework-FastAPI-green?logo=fastapi" alt="FastAPI">
  <img src="https://img.shields.io/badge/Frontend-React-blue?logo=react" alt="React">
  <img src="https://img.shields.io/badge/Mobile-React%20Native-blueviolet?logo=react" alt="React Native">
  <img src="https://img.shields.io/badge/Deployment-Vercel-black?logo=vercel" alt="Vercel Deployment">
</p>

---

**QuantumPay** is a production-grade, globally-aware financial super-app designed to be a complete financial operating system. This full-stack monorepo contains a FastAPI backend, a React web application, and a React Native mobile app, all built with robust, real-system implementations.

## ✨ Core Features Implemented

### For Individuals
-   **Global Multi-Currency Wallets:** Hold and manage funds in NGN, KES, GHS, ZAR, USD, and more.
-   **Instant & Global P2P Transfers:** Seamlessly send money to any user, anywhere, with real-time FX conversions.
-   **Hyper-Localized Deposits:** Fund wallets using local payment methods:
    -   **Nigeria:** Virtual Bank Accounts (via Monnify) & Card Payments.
    -   **Kenya:** M-Pesa STK Push.
    -   **Ghana:** Mobile Money (MTN/Vodafone).
    -   **South Africa:** Instant EFT.
-   **Open Banking (Plaid):** Securely link US bank accounts for ACH deposits.
-   **Global Payouts:** Withdraw funds to local bank accounts worldwide via Paystack Transfers.
-   **QuantumFX Engine:** A real-time, in-app currency exchange with live rates.
-   **Universal Biller Hub:** Pay for airtime, TV, electricity, and government services across Africa via a resilient super-aggregator engine (Interswitch, Paystack, Remita).
-   **Advanced Security:** Full Two-Factor Authentication (2FA) setup and management, plus secure account deletion.
-   **AI Financial Assistant:** A chat-based assistant for financial insights.
-   **Shared Vaults:** A complete UI for collaborative finance.

### For Businesses & Merchants
-   **Cross-Border Invoicing:** Create and send invoices in your client's local currency.
-   **Global Payroll Suite:** Manage an international team and execute multi-currency payroll runs.
-   **Mobile Point-of-Sale (POS):** A complete, product-aware POS system with cart functionality and dynamic QR code generation.
-   **Full Product Catalog Management:** Complete CRUD functionality for managing a business's products from the mobile app.
-   **AI-Powered Analytics:** Real-time dashboards for sales and cash flow forecasting.
-   **Corporate Cards & Expense Management:** Backend infrastructure for issuing cards and managing expenses.

### Platform & Admin
-   **Real-Time Live Support:** A WebSocket-powered chat system for users to talk to a support team, with a dedicated admin interface to manage conversations.
-   **Complete Admin Panel:** A mobile and web command center for user management, real-time platform stats, and a robust KYC approval queue.
-   **Advanced Identity Verification:** A real-system `IdentityService` integrated with Paystack for verifying Bank Accounts, BVN, NIN, and performing Facial Comparisons.
-   **Full Internationalization (i18n):** The web app supports multiple languages (EN, FR, ES, PT, SW) with a dynamic language switcher.
-   **Guided Tours:** A "first-time user" guided tour on the web application to improve onboarding.

---

## 🛠️ Tech Stack

-   **Backend (`main.py`):**
    -   **Framework:** FastAPI
    -   **Database:** SQLAlchemy ORM with PostgreSQL (Production) / SQLite (Development)
    -   **Authentication:** Firebase Admin SDK
    -   **AI/ML:** Scikit-learn, StatsModels, Pandas
    -   **Real-time:** WebSockets for Live Chat
    -   **Payment SDKs & Libs:** `plaid-python`, `pyotp`, `qrcode`, `cryptography`

-   **Web App (`frontend/`):**
    -   **Framework:** React 18
    -   **Styling:** Tailwind CSS & Framer Motion
    -   **State Management:** React Context API
    -   **API Client:** Axios with Interceptors
    -   **Localization:** `i18next`, `react-i18next`
    -   **Tours:** `shepherd.js`

-   **Mobile App (`mobile/`):**
    -   **Framework:** React Native (with Expo)
    -   **Styling:** NativeWind (Tailwind for RN)
    -   **State Management:** Zustand
    -   **Navigation:** React Navigation
    -   **Native Features:** Expo Camera, Contacts, Haptics, Biometrics, Notifications, Fonts
    -   **Animation:** Moti / Reanimated

---

## 🚀 Getting Started & Local Setup

(Instructions for local setup remain the same as the previous README)

---

## 🌐 Deployment to Vercel (Unified Monorepo)

This project is configured for a seamless single-project monorepo deployment on Vercel. The `vercel.json` file in the root directory orchestrates the entire process.

1.  **Create ONE Vercel Project:** Link it to your Git repository.
2.  **Root Directory:** In the Vercel project settings, **leave the Root Directory as the default** (`.`). The `vercel.json` file will handle the monorepo logic.
3.  **Build & Development Settings:** Vercel should auto-detect the monorepo structure from `vercel.json`. If you need to set it manually:
    *   **Framework Preset:** "Other"
    *   **Build Command:** `cd frontend && npm install && npm run build`
    *   **Install Command (for backend):** `cd backend && pip install -r requirements.txt`
4.  **Environment Variables:**
    *   Go to the "Environment Variables" section of your Vercel project.
    *   Copy **ALL** key-value pairs from your local `backend/.env` file.
    *   Copy **ALL** `REACT_APP_` key-value pairs from your local `frontend/.env` file.
    *   **CRITICAL:** Update the URLs to their production values as per the guide below.
5.  **Deploy!** Vercel will build both the Python backend and the React frontend and deploy them under a single domain.