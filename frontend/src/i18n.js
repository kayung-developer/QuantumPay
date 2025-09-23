// FILE: src/i18n.js

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const resources = {
  en: {
    translation: {
      // Page Titles
      "dashboard_overview": "Overview",
      "wallets_title": "My Wallets",
      "transactions_title": "Transaction History",
      "developer_title": "Developer Tools",
      "settings_title": "Settings",
      "business_dashboard_title": "Business Dashboard",
      "team_management_title": "Team Management",
      "expense_approvals_title": "Expense Approvals",
      "invoicing_title": "Invoicing",
      "create_invoice_title": "New Invoice",
      "payroll_title": "Global Payroll",
      "corporate_cards_title": "Corporate Cards",
      "business_settings_title": "Business Settings",
      "cashflow_title": "Cash Flow Forecast",
      "my_expenses_title": "My Expenses",
      "pay_bills_title": "Pay Bills & Utilities",
      "fund_with_card_title": "Fund with Card",
      "exchange_title": "Currency Exchange",
      "send_global_title": "Send Global",
      "withdraw_funds_title": "Withdraw Funds",
      "shared_vaults_title": "Shared Vaults",
      "smart_ussd_title": "Smart USSD",
      "kyc_title": "Verification Center",
      "admin_overview_title": "Admin Overview",
      "manage_users_title": "Manage Users",
      "kyc_approvals_title": "KYC Approvals",
      "live_support_title": "Live Support Center",
      "manage_jobs_title": "Manage Job Listings",
      "manage_blog_title": "Manage Blog Posts",

      // Sidebar Navigation
      "sidebar_dashboard": "Dashboard",
      "sidebar_wallets": "Wallets",
      "sidebar_withdraw": "Withdraw Funds",
      "sidebar_send_global": "Send Global",
      "sidebar_exchange": "Exchange",
      "sidebar_transactions": "Transactions",
      "sidebar_pay_bills": "Pay Bills",
      "sidebar_shared_vaults": "Shared Vaults",
      "sidebar_smart_ussd": "Smart USSD",
      "sidebar_my_expenses": "My Expenses",
      "sidebar_developer": "Developer",
      "sidebar_verification": "Verification",
      "sidebar_help_tour": "Help & Tour",
      "sidebar_logout": "Logout",
      "sidebar_business_tools": "Business Tools",
      "sidebar_admin_panel": "Admin Panel",

      // General UI Text
      "welcome_back": "Welcome back, {{name}}!",
      "total_balance": "Total Balance",
      "monthly_volume": "Monthly Volume (30d)",
      "monthly_transactions": "Transactions (30d)",
      "credit_score": "Credit Score",

      //Business
"business_header_subtitle": "A real-time overview of your business operations.",
"business_cta_title": "Ready to do more?",
"business_cta_subtitle": "Create a free business profile to start accepting payments, sending invoices, and running payroll.",
"business_cta_button": "Become a Merchant",
"team_header_subtitle": "Add, view, and manage your business team members.",
"team_invite_button": "Invite Member",
"invoicing_header_subtitle": "Create, send, and track invoices to your customers.",
"invoicing_create_button": "Create Invoice",
"payroll_header_subtitle": "Manage your international team and run payroll in multiple currencies with one click.",
"payroll_add_team_button": "Add/Edit Team",
"payroll_create_run_button": "Create Payroll Run",
"payroll_team_title": "Your Team",
"payroll_history_title": "Payroll History",
"cards_header_subtitle": "Issue, manage, and control company spending in real-time.",
"cards_issue_button": "Issue Card",
"expenses_header_subtitle": "Review and approve expense reports from your team.",
"settings_header_subtitle": "Manage your business profile, legal information, and operational settings.",
"cashflow_header_subtitle": "AI-powered 30-day forecast based on your historical transaction data."    }
  },
  fr: {
    translation: {
      "dashboard_overview": "Aperçu", "wallets_title": "Mes Portefeuilles", "transactions_title": "Historique des Transactions", "developer_title": "Outils Développeur", "settings_title": "Paramètres", "business_dashboard_title": "Tableau de Bord Entreprise", "team_management_title": "Gestion d'Équipe", "expense_approvals_title": "Approbations de Dépenses", "invoicing_title": "Facturation", "create_invoice_title": "Nouvelle Facture", "payroll_title": "Paie Internationale", "corporate_cards_title": "Cartes d'Entreprise", "business_settings_title": "Paramètres de l'Entreprise", "cashflow_title": "Prévision de Trésorerie", "my_expenses_title": "Mes Dépenses", "pay_bills_title": "Payer des Factures", "fund_with_card_title": "Alimenter par Carte", "exchange_title": "Change de Devises", "send_global_title": "Envoi International", "withdraw_funds_title": "Retirer des Fonds", "shared_vaults_title": "Coffres Partagés", "smart_ussd_title": "USSD Intelligent", "kyc_title": "Centre de Vérification", "admin_overview_title": "Aperçu Admin", "manage_users_title": "Gérer les Utilisateurs", "kyc_approvals_title": "Approbations KYC", "live_support_title": "Support en Direct", "manage_jobs_title": "Gérer les Offres d'Emploi", "manage_blog_title": "Gérer les Articles de Blog",
      "sidebar_dashboard": "Tableau de Bord", "sidebar_wallets": "Portefeuilles", "sidebar_withdraw": "Retirer des Fonds", "sidebar_send_global": "Envoi International", "sidebar_exchange": "Change", "sidebar_transactions": "Transactions", "sidebar_pay_bills": "Payer Factures", "sidebar_shared_vaults": "Coffres Partagés", "sidebar_smart_ussd": "USSD Intelligent", "sidebar_my_expenses": "Mes Dépenses", "sidebar_developer": "Développeur", "sidebar_verification": "Vérification", "sidebar_help_tour": "Aide & Tour", "sidebar_logout": "Déconnexion", "sidebar_business_tools": "Outils d'Entreprise", "sidebar_admin_panel": "Panneau Admin",
      "welcome_back": "Content de vous revoir, {{name}}!", "total_balance": "Solde Total", "monthly_volume": "Volume Mensuel (30j)", "monthly_transactions": "Transactions (30j)", "credit_score": "Pointage de Crédit",
    "business_header_subtitle": "Un aperçu en temps réel de vos opérations commerciales.",
"business_cta_title": "Prêt à en faire plus ?",
"business_cta_subtitle": "Créez un profil d'entreprise gratuit pour commencer à accepter des paiements, envoyer des factures et gérer la paie.",
"business_cta_button": "Devenir un Marchand",
"team_header_subtitle": "Ajoutez, consultez et gérez les membres de votre équipe commerciale.",
"team_invite_button": "Inviter un Membre",
"invoicing_header_subtitle": "Créez, envoyez et suivez les factures de vos clients.",
"invoicing_create_button": "Créer une Facture",
"payroll_header_subtitle": "Gérez votre équipe internationale et exécutez la paie en plusieurs devises en un clic.",
"payroll_add_team_button": "Ajouter/Modifier l'Équipe",
"payroll_create_run_button": "Créer un Cycle de Paie",
"payroll_team_title": "Votre Équipe",
"payroll_history_title": "Historique de la Paie",
"cards_header_subtitle": "Émettez, gérez et contrôlez les dépenses de l'entreprise en temps réel.",
"cards_issue_button": "Émettre une Carte",
"expenses_header_subtitle": "Examinez et approuvez les notes de frais de votre équipe.",
"settings_header_subtitle": "Gérez le profil de votre entreprise, les informations légales et les paramètres opérationnels.",
"cashflow_header_subtitle": "Prévision de flux de trésorerie sur 30 jours alimentée par l'IA, basée sur vos données de transactions historiques."


    }
  },
  es: {
    translation: {
      "dashboard_overview": "Resumen", "wallets_title": "Mis Billeteras", "transactions_title": "Historial de Transacciones", "developer_title": "Herramientas de Desarrollador", "settings_title": "Configuración", "business_dashboard_title": "Panel de Negocios", "team_management_title": "Gestión de Equipo", "expense_approvals_title": "Aprobaciones de Gastos", "invoicing_title": "Facturación", "create_invoice_title": "Nueva Factura", "payroll_title": "Nómina Global", "corporate_cards_title": "Tarjetas Corporativas", "business_settings_title": "Configuración del Negocio", "cashflow_title": "Previsión de Flujo de Caja", "my_expenses_title": "Mis Gastos", "pay_bills_title": "Pagar Facturas", "fund_with_card_title": "Depositar con Tarjeta", "exchange_title": "Cambio de Divisas", "send_global_title": "Envío Global", "withdraw_funds_title": "Retirar Fondos", "shared_vaults_title": "Bóvedas Compartidas", "smart_ussd_title": "USSD Inteligente", "kyc_title": "Centro de Verificación", "admin_overview_title": "Resumen de Admin", "manage_users_title": "Gestionar Usuarios", "kyc_approvals_title": "Aprobaciones KYC", "live_support_title": "Soporte en Vivo", "manage_jobs_title": "Gestionar Ofertas de Empleo", "manage_blog_title": "Gestionar Publicaciones del Blog",
      "sidebar_dashboard": "Panel", "sidebar_wallets": "Billeteras", "sidebar_withdraw": "Retirar Fondos", "sidebar_send_global": "Envío Global", "sidebar_exchange": "Cambio", "sidebar_transactions": "Transacciones", "sidebar_pay_bills": "Pagar Facturas", "sidebar_shared_vaults": "Bóvedas", "sidebar_smart_ussd": "USSD", "sidebar_my_expenses": "Mis Gastos", "sidebar_developer": "Desarrollador", "sidebar_verification": "Verificación", "sidebar_help_tour": "Ayuda y Tour", "sidebar_logout": "Cerrar Sesión", "sidebar_business_tools": "Herramientas de Negocio", "sidebar_admin_panel": "Panel de Admin",
      "welcome_back": "¡Bienvenido de nuevo, {{name}}!", "total_balance": "Balance Total", "monthly_volume": "Volumen Mensual (30d)", "monthly_transactions": "Transacciones (30d)", "credit_score": "Puntaje de Crédito",
    "business_header_subtitle": "Una visión general en tiempo real de sus operaciones comerciales.",
"business_cta_title": "¿Listo para hacer más?",
"business_cta_subtitle": "Cree un perfil de empresa gratuito para comenzar a aceptar pagos, enviar facturas y gestionar la nómina.",
"business_cta_button": "Convertirse en Comerciante",
"team_header_subtitle": "Añada, vea y gestione los miembros de su equipo de negocios.",
"team_invite_button": "Invitar Miembro",
"invoicing_header_subtitle": "Cree, envíe y haga seguimiento de las facturas de sus clientes.",
"invoicing_create_button": "Crear Factura",
"payroll_header_subtitle": "Gestione su equipo internacional y ejecute la nómina en múltiples monedas con un solo clic.",
"payroll_add_team_button": "Añadir/Editar Equipo",
"payroll_create_run_button": "Crear Ciclo de Nómina",
"payroll_team_title": "Su Equipo",
"payroll_history_title": "Historial de Nómina",
"cards_header_subtitle": "Emita, gestione y controle los gastos de la empresa en tiempo real.",
"cards_issue_button": "Emitir Tarjeta",
"expenses_header_subtitle": "Revise y apruebe los informes de gastos de su equipo.",
"settings_header_subtitle": "Gestione el perfil de su empresa, la información legal y la configuración operativa.",
"cashflow_header_subtitle": "Previsión de flujo de caja de 30 días impulsada por IA, basada en sus datos históricos de transacciones."

    }
  },
  pt: {
    translation: {
        "dashboard_overview": "Visão Geral", "wallets_title": "Minhas Carteiras", "transactions_title": "Histórico de Transações", "developer_title": "Ferramentas do Desenvolvedor", "settings_title": "Configurações", "business_dashboard_title": "Painel Empresarial", "team_management_title": "Gestão da Equipe", "expense_approvals_title": "Aprovações de Despesas", "invoicing_title": "Faturamento", "create_invoice_title": "Nova Fatura", "payroll_title": "Folha de Pagamento Global", "corporate_cards_title": "Cartões Corporativos", "business_settings_title": "Configurações da Empresa", "cashflow_title": "Previsão de Fluxo de Caixa", "my_expenses_title": "Minhas Despesas", "pay_bills_title": "Pagar Contas", "fund_with_card_title": "Depositar com Cartão", "exchange_title": "Câmbio de Moedas", "send_global_title": "Envio Global", "withdraw_funds_title": "Retirar Fundos", "shared_vaults_title": "Cofres Compartilhados", "smart_ussd_title": "USSD Inteligente", "kyc_title": "Centro de Verificação", "admin_overview_title": "Visão Geral do Admin", "manage_users_title": "Gerenciar Usuários", "kyc_approvals_title": "Aprovações KYC", "live_support_title": "Suporte ao Vivo", "manage_jobs_title": "Gerenciar Vagas", "manage_blog_title": "Gerenciar Postagens do Blog",
        "sidebar_dashboard": "Painel", "sidebar_wallets": "Carteiras", "sidebar_withdraw": "Retirar Fundos", "sidebar_send_global": "Envio Global", "sidebar_exchange": "Câmbio", "sidebar_transactions": "Transações", "sidebar_pay_bills": "Pagar Contas", "sidebar_shared_vaults": "Cofres", "sidebar_smart_ussd": "USSD", "sidebar_my_expenses": "Minhas Despesas", "sidebar_developer": "Desenvolvedor", "sidebar_verification": "Verificação", "sidebar_help_tour": "Ajuda e Tour", "sidebar_logout": "Sair", "sidebar_business_tools": "Ferramentas de Negócio", "sidebar_admin_panel": "Painel do Admin",
        "welcome_back": "Bem-vindo(a) de volta, {{name}}!", "total_balance": "Saldo Total", "monthly_volume": "Volume Mensal (30d)", "monthly_transactions": "Transações (30d)", "credit_score": "Pontuação de Crédito",
    "business_header_subtitle": "Uma visão geral em tempo real das suas operações de negócio.",
"business_cta_title": "Pronto para fazer mais?",
"business_cta_subtitle": "Crie um perfil de empresa gratuito para começar a aceitar pagamentos, enviar faturas e processar a folha de pagamento.",
"business_cta_button": "Tornar-se um Comerciante",
"team_header_subtitle": "Adicione, veja e gerencie os membros da sua equipe de negócios.",
"team_invite_button": "Convidar Membro",
"invoicing_header_subtitle": "Crie, envie e acompanhe as faturas dos seus clientes.",
"invoicing_create_button": "Criar Fatura",
"payroll_header_subtitle": "Gerencie sua equipe internacional e execute a folha de pagamento em várias moedas com um clique.",
"payroll_add_team_button": "Adicionar/Editar Equipe",
"payroll_create_run_button": "Criar Ciclo de Pagamento",
"payroll_team_title": "Sua Equipe",
"payroll_history_title": "Histórico da Folha de Pagamento",
"cards_header_subtitle": "Emita, gerencie e controle os gastos da empresa em tempo real.",
"cards_issue_button": "Emitir Cartão",
"expenses_header_subtitle": "Revise e aprove os relatórios de despesas da sua equipe.",
"settings_header_subtitle": "Gerencie o perfil da sua empresa, informações legais e configurações operacionais.",
"cashflow_header_subtitle": "Previsão de fluxo de caixa de 30 dias com IA, baseada nos seus dados históricos de transações."

    }
  },
  sw: {
    translation: {
        "dashboard_overview": "Muhtasari", "wallets_title": "Pochi Zangu", "transactions_title": "Historia ya Miamala", "developer_title": "Zana za Msanidi Programu", "settings_title": "Mipangilio", "business_dashboard_title": "Dashibodi ya Biashara", "team_management_title": "Usimamizi wa Timu", "expense_approvals_title": "Idhini za Gharama", "invoicing_title": "Ankara", "create_invoice_title": "Ankara Mpya", "payroll_title": "Mishahara ya Kimataifa", "corporate_cards_title": "Kadi za Kampuni", "business_settings_title": "Mipangilio ya Biashara", "cashflow_title": "Utabiri wa Mtiririko wa Pesa", "my_expenses_title": "Gharama Zangu", "pay_bills_title": "Lipa Bili", "fund_with_card_title": "Weka Pesa kwa Kadi", "exchange_title": "Kubadilisha Fedha", "send_global_title": "Tuma Ulimwenguni", "withdraw_funds_title": "Toa Pesa", "shared_vaults_title": "Vyumba vya Pamoja", "smart_ussd_title": "USSD Mahiri", "kyc_title": "Kituo cha Uthibitishaji", "admin_overview_title": "Muhtasari wa Msimamizi", "manage_users_title": "Dhibiti Watumiaji", "kyc_approvals_title": "Idhini za KYC", "live_support_title": "Msaada wa Moja kwa Moja", "manage_jobs_title": "Dhibiti Nafasi za Kazi", "manage_blog_title": "Dhibiti Machapisho ya Blogu",
        "sidebar_dashboard": "Dashibodi", "sidebar_wallets": "Pochi", "sidebar_withdraw": "Toa Pesa", "sidebar_send_global": "Tuma Ulimwenguni", "sidebar_exchange": "Badilisha", "sidebar_transactions": "Miamala", "sidebar_pay_bills": "Lipa Bili", "sidebar_shared_vaults": "Vyumba", "sidebar_smart_ussd": "USSD", "sidebar_my_expenses": "Gharama Zangu", "sidebar_developer": "Msanidi", "sidebar_verification": "Uthibitishaji", "sidebar_help_tour": "Msaada na Ziara", "sidebar_logout": "Toka", "sidebar_business_tools": "Zana za Biashara", "sidebar_admin_panel": "Jopo la Msimamizi",
        "welcome_back": "Karibu tena, {{name}}!", "total_balance": "Salio Kamili", "monthly_volume": "Kiasi cha Mwezi (siku 30)", "monthly_transactions": "Miamala (siku 30)", "credit_score": "Alama ya Mkopo",
    "business_header_subtitle": "Muhtasari wa wakati halisi wa shughuli za biashara yako.",
"business_cta_title": "Uko tayari kufanya zaidi?",
"business_cta_subtitle": "Fungua wasifu wa biashara bila malipo ili uanze kupokea malipo, kutuma ankara, na kuendesha malipo ya mishahara.",
"business_cta_button": "Kuwa Mfanyabiashara",
"team_header_subtitle": "Ongeza, tazama, na dhibiti wanachama wa timu yako ya biashara.",
"team_invite_button": "Alika Mwanachama",
"invoicing_header_subtitle": "Tengeneza, tuma, na fuatilia ankara za wateja wako.",
"invoicing_create_button": "Tengeneza Ankara",
"payroll_header_subtitle": "Dhibiti timu yako ya kimataifa na endesha malipo ya mishahara kwa sarafu mbalimbali kwa kubofya mara moja.",
"payroll_add_team_button": "Ongeza/Hariri Timu",
"payroll_create_run_button": "Anzisha Mzunguko wa Malipo",
"payroll_team_title": "Timu Yako",
"payroll_history_title": "Historia ya Malipo",
"cards_header_subtitle": "Toa, dhibiti, na simamia matumizi ya kampuni kwa wakati halisi.",
"cards_issue_button": "Toa Kadi",
"expenses_header_subtitle": "Kagua na idhinisha ripoti za gharama za timu yako.",
"settings_header_subtitle": "Dhibiti wasifu wa biashara yako, taarifa za kisheria, na mipangilio ya uendeshaji.",
"cashflow_header_subtitle": "Utabiri wa mtiririko wa pesa wa siku 30 unaoendeshwa na AI, kulingana na data yako ya kihistoria ya miamala."

    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'cookie', 'navigator'],
      caches: ['localStorage', 'cookie'],
    },
  });

export default i18n;