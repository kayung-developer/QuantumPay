/**
 * [REAL-SYSTEM IMPLEMENTATION]
 * This file is the single source of truth for all guided tours in the application.
 * It defines the steps for each tour and the default configuration for their appearance.
 * Using a centralized service like this makes it easy to add, remove, or update tours
 * without modifying the components that trigger them.
 */

// --- Default Configuration ---
// This helper object defines the default look, feel, and behavior for all tour steps.
// By exporting it, we can ensure all tours have a consistent design.
export const defaultStepOptions = {
  classes: 'shepherd-element shepherd-theme-arrows',
  scrollTo: true,
  cancelIcon: {
    enabled: true,
  },
  // Adds a "Previous" button to all steps except the first one
  when: {
    show: () => {
      const currentStep = this.getCurrentStep();
      const firstStep = this.steps[0];
      if (currentStep.id !== firstStep.id) {
        // We add the 'shepherd-button-secondary' class to give it a different style
        this.addButtons([{
          action: this.back,
          classes: 'shepherd-button-secondary',
          text: 'Back'
        }]);
      }
    }
  }
};


// --- Tour #1: The First-Time User Dashboard Tour ---
// This tour is designed to be triggered automatically for new users after they log in.
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
    buttons: [{ text: 'Next', action() { this.next(); }}],
  },
  {
    ...defaultStepOptions,
    attachTo: { element: '#tour-deposit-link', on: 'right' },
    id: 'deposit',
    title: 'Deposit Funds',
    text: 'Quickly add money to any of your wallets using local payment methods like bank transfer, card, or M-Pesa.',
    buttons: [{ text: 'Next', action() { this.next(); }}],
  },
  {
    ...defaultStepOptions,
    attachTo: { element: '#tour-global-transfer-link', on: 'right' },
    id: 'send-global',
    title: 'Send Money Globally',
    text: 'Send money to any other QuantumPay user across the world. We handle all the currency conversions for you seamlessly.',
    buttons: [{ text: 'Next', action() { this.next(); }}],
  },
   {
    ...defaultStepOptions,
    attachTo: { element: '#tour-display-currency', on: 'bottom' },
    id: 'display-currency',
    title: 'Global View',
    text: 'See your total balance in any currency you prefer. Just use this switcher to change your view at any time.',
    buttons: [{ text: 'Next', action() { this.next(); }}],
  },
  {
    ...defaultStepOptions,
    id: 'finish',
    title: 'You\'re All Set!',
    text: 'You\'ve mastered the basics. Feel free to explore and manage your finances like never before.',
    buttons: [{ text: 'Finish', action() { this.complete(); }}],
  }
];


// --- Tour #2: The New Visitor Homepage Tour ---
// This tour is designed to be triggered automatically for visitors who have never seen it.
export const homepageTourSteps = [
  {
    ...defaultStepOptions,
    id: 'intro',
    title: 'Welcome to QuantumPay!',
    text: 'Discover the future of global payments. This quick tour will highlight our key features.',
    buttons: [{ text: 'Next', action() { this.next(); }}],
  },
  {
    ...defaultStepOptions,
    attachTo: { element: '#tour-features-section', on: 'bottom' },
    title: 'Powerful Features',
    text: 'We offer a complete financial operating system, from hyper-secure infrastructure to AI-powered intelligence.',
    buttons: [{ text: 'Next', action() { this.next(); }}],
  },
  {
    ...defaultStepOptions,
    attachTo: { element: '#tour-cta-button', on: 'bottom' },
    title: 'Get Started for Free',
    text: 'Ready to join? Creating an account is fast, free, and secure.',
    buttons: [{ text: 'Done', action() { this.complete(); }}],
  }
];