import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// This is the single source of truth for all UI text in the application.
// Adding a new language is as simple as adding a new top-level key (e.g., "de" for German)
// and providing the key-value pairs for translation.
const resources = {
  // 1. English (Base Language)
  en: {
    translation: {
      "welcome_back": "Welcome back, {{name}}!",
      "dashboard_overview": "Overview",
      "sidebar_wallets": "Wallets",
      "sidebar_transactions": "Transactions",
      "total_balance": "Total Balance",
      "monthly_volume": "Monthly Volume (30d)",
      "monthly_transactions": "Transactions (30d)",
      "credit_score": "Credit Score",
      "settings_title": "Settings",
      "dashboard_overview" : "Overview",
      "business_dashboard_title": "Business Dashboard",
      "team_management_title": "Team Management",
      "expense_approvals_title": "Expense Approvals",
      "my_expenses_title": "My Expenses",
       "my_expenses_title": "My Expenses",
      "create_invoice_title": "New Invoice", // <-- NEW
      "invoicing_title": "Invoicing", // <-- NEW
      "payroll_title": "Payroll" // <-- NEW (if it wasn't there before)
    }
  },
  // 2. French (Français)
  fr: {
    translation: {
      "welcome_back": "Content de vous revoir, {{name}}!",
      "dashboard_overview": "Aperçu",
      "sidebar_wallets": "Portefeuilles",
      "sidebar_transactions": "Transactions",
      "total_balance": "Solde Total",
      "monthly_volume": "Volume Mensuel (30j)",
      "monthly_transactions": "Transactions (30j)",
      "credit_score": "Pointage de Crédit",
      "settings_title": "Paramètres",
            // [THE IMPLEMENTATION] New Business and User Keys
      "business_dashboard_title": "Tableau de Bord de l'Entreprise",
      "team_management_title": "Gestion de l'Équipe",
      "expense_approvals_title": "Approbations des Dépenses",
      "my_expenses_title": "Mes Dépenses"
    }
  },
  // 3. Spanish (Español)
  es: {
    translation: {
      "welcome_back": "¡Bienvenido de nuevo, {{name}}!",
      "dashboard_overview": "Resumen",
      "sidebar_wallets": "Billeteras",
      "sidebar_transactions": "Transacciones",
      "total_balance": "Balance Total",
      "monthly_volume": "Volumen Mensual (30d)",
      "monthly_transactions": "Transacciones (30d)",
      "credit_score": "Puntaje de Crédito",
      "settings_title": "Configuración",
      "business_dashboard_title": "Panel de Negocios",
      "team_management_title": "Gestión de Equipo",
      "expense_approvals_title": "Aprobaciones de Gastos",
      "my_expenses_title": "Mis Gastos"
    }
  },
  // 4. Portuguese (Português)
  pt: {
    translation: {
      "welcome_back": "Bem-vindo(a) de volta, {{name}}!",
      "dashboard_overview": "Visão Geral",
      "sidebar_wallets": "Carteiras",
      "sidebar_transactions": "Transações",
      "total_balance": "Saldo Total",
      "monthly_volume": "Volume Mensal (30d)",
      "monthly_transactions": "Transações (30d)",
      "credit_score": "Pontuação de Crédito",
      "settings_title": "Configurações",
      "business_dashboard_title": "Painel Empresarial",
      "team_management_title": "Gestão de Equipe",
      "expense_approvals_title": "Aprovações de Despesas",
      "my_expenses_title": "Minhas Despesas"
    }
  },
  // 5. Swahili (Kiswahili)
  sw: {
    translation: {
      "welcome_back": "Karibu tena, {{name}}!",
      "dashboard_overview": "Muhtasari",
      "sidebar_wallets": "Pochi",
      "sidebar_transactions": "Miamala",
      "total_balance": "Salio Kamili",
      "monthly_volume": "Kiasi cha Mwezi (siku 30)",
      "monthly_transactions": "Miamala (siku 30)",
      "credit_score": "Alama ya Mkopo",
      "settings_title": "Mipangilio",
      "business_dashboard_title": "Dashibodi ya Biashara",
      "team_management_title": "Usimamizi wa Timu",
      "expense_approvals_title": "Idhini za Gharama",
      "my_expenses_title": "Gharama Zangu"

    }
  }
};

i18n
  // Detect user's browser language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    resources,
    fallbackLng: "en", // Use English if the detected language is not available
    debug: process.env.NODE_ENV === 'development', // Show logs in development mode for easier debugging
    interpolation: {
      escapeValue: false, // React already protects from XSS
    },
    detection: {
      // Configuration for the language detector
      order: ['queryString', 'cookie', 'localStorage', 'sessionStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage', 'cookie'],
    },
  });

export default i18n;