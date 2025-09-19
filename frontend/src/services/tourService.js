// This service defines the steps for all guided tours in the application.

// Helper to add the necessary classes for Shepherd's default theme
const defaultStepOptions = {
  classes: 'shepherd-element shepherd-theme-arrows',
  scrollTo: true,
  cancelIcon: {
    enabled: true,
  },
};

// --- Tour #1: The First-Time Dashboard Tour ---
export const dashboardTourSteps = [
  {
    ...defaultStepOptions,
    id: 'welcome',
    title: 'Welcome to Your Dashboard!',
    text: 'This is your financial command center. Let\'s take a quick look at the key features.',
    buttons: [{ text: 'Next', action() { this.next(); }}],
  },
  {
    ...defaultStepOptions,
    attachTo: { element: '#tour-wallets-link', on: 'right' },
    id: 'wallets',
    title: 'Your Wallets',
    text: 'This is where you can view your balances in different currencies and manage your funds.',
    buttons: [{ text: 'Back', action() { this.back(); }}, { text: 'Next', action() { this.next(); }}],
  },
  {
    ...defaultStepOptions,
    attachTo: { element: '#tour-deposit-link', on: 'right' },
    id: 'deposit',
    title: 'Deposit Funds',
    text: 'Quickly add money to any of your wallets using local payment methods like bank transfer, card, or M-Pesa.',
    buttons: [{ text: 'Back', action() { this.back(); }}, { text: 'Next', action() { this.next(); }}],
  },
  {
    ...defaultStepOptions,
    attachTo: { element: '#tour-global-transfer-link', on: 'right' },
    id: 'send-global',
    title: 'Send Money Globally',
    text: 'Send money to any other QuantumPay user across the world. We handle all the currency conversions for you seamlessly.',
    buttons: [{ text: 'Back', action() { this.back(); }}, { text: 'Next', action() { this.next(); }}],
  },
   {
    ...defaultStepOptions,
    attachTo: { element: '#tour-display-currency', on: 'bottom' },
    id: 'display-currency',
    title: 'Global View',
    text: 'See your total balance in any currency you prefer. Just use this switcher to change your view at any time.',
    buttons: [{ text: 'Back', action() { this.back(); }}, { text: 'Next', action() { this.next(); }}],
  },
  {
    ...defaultStepOptions,
    id: 'finish',
    title: 'You\'re All Set!',
    text: 'You\'ve mastered the basics. Feel free to explore and manage your finances like never before.',
    buttons: [{ text: 'Finish', action() { this.complete(); }}],
  }
];