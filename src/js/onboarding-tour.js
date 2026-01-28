/**
 * RentMe Onboarding Tour
 * A lightweight walkthrough system for new vendors
 */

class OnboardingTour {
  constructor(options = {}) {
    this.steps = options.steps || [];
    this.currentStep = 0;
    this.overlay = null;
    this.tooltip = null;
    this.spotlight = null;
    this.onComplete = options.onComplete || (() => {});
    this.onSkip = options.onSkip || (() => {});
  }

  // Initialize and inject styles
  init() {
    this.injectStyles();
    this.createOverlay();
    this.createTooltip();
    this.createSpotlight();
    this.bindKeyboardEvents();
  }

  injectStyles() {
    if (document.getElementById('tour-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'tour-styles';
    styles.textContent = `
      .tour-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        z-index: 9998;
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
      }
      .tour-overlay.active {
        opacity: 1;
        pointer-events: auto;
      }

      .tour-spotlight {
        position: fixed;
        z-index: 9999;
        border-radius: 12px;
        box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.75);
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        pointer-events: none;
      }
      .tour-spotlight::before {
        content: '';
        position: absolute;
        inset: -4px;
        border: 2px solid #3C50E0;
        border-radius: 14px;
        animation: pulse-ring 2s ease-out infinite;
      }
      @keyframes pulse-ring {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.05); opacity: 0.5; }
        100% { transform: scale(1); opacity: 1; }
      }

      .tour-tooltip {
        position: fixed;
        z-index: 10000;
        background: white;
        border-radius: 16px;
        padding: 24px;
        max-width: 360px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        opacity: 0;
        transform: translateY(10px);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .tour-tooltip.active {
        opacity: 1;
        transform: translateY(0);
      }
      .dark .tour-tooltip {
        background: #1e2a3b;
        color: white;
      }

      .tour-tooltip-arrow {
        position: absolute;
        width: 16px;
        height: 16px;
        background: white;
        transform: rotate(45deg);
      }
      .dark .tour-tooltip-arrow {
        background: #1e2a3b;
      }
      .tour-tooltip-arrow.top {
        top: -8px;
        left: 50%;
        margin-left: -8px;
      }
      .tour-tooltip-arrow.bottom {
        bottom: -8px;
        left: 50%;
        margin-left: -8px;
      }
      .tour-tooltip-arrow.left {
        left: -8px;
        top: 50%;
        margin-top: -8px;
      }
      .tour-tooltip-arrow.right {
        right: -8px;
        top: 50%;
        margin-top: -8px;
      }

      .tour-step-indicator {
        display: flex;
        gap: 6px;
        margin-bottom: 16px;
      }
      .tour-step-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #E5E7EB;
        transition: all 0.3s ease;
      }
      .dark .tour-step-dot {
        background: #4B5563;
      }
      .tour-step-dot.active {
        background: #3C50E0;
        width: 24px;
        border-radius: 4px;
      }
      .tour-step-dot.completed {
        background: #10B981;
      }

      .tour-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 16px;
      }

      .tour-title {
        font-size: 18px;
        font-weight: 700;
        color: #111827;
        margin-bottom: 8px;
      }
      .dark .tour-title {
        color: white;
      }

      .tour-description {
        font-size: 14px;
        color: #6B7280;
        line-height: 1.6;
        margin-bottom: 20px;
      }
      .dark .tour-description {
        color: #9CA3AF;
      }

      .tour-actions {
        display: flex;
        gap: 12px;
        justify-content: space-between;
        align-items: center;
      }

      .tour-btn {
        padding: 10px 20px;
        border-radius: 10px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        border: none;
      }
      .tour-btn-primary {
        background: #3C50E0;
        color: white;
      }
      .tour-btn-primary:hover {
        background: #2d3eb8;
        transform: translateY(-1px);
      }
      .tour-btn-secondary {
        background: #F3F4F6;
        color: #374151;
      }
      .dark .tour-btn-secondary {
        background: #374151;
        color: #E5E7EB;
      }
      .tour-btn-secondary:hover {
        background: #E5E7EB;
      }
      .dark .tour-btn-secondary:hover {
        background: #4B5563;
      }
      .tour-btn-skip {
        background: transparent;
        color: #9CA3AF;
        padding: 10px 12px;
      }
      .tour-btn-skip:hover {
        color: #6B7280;
      }

      .tour-progress {
        font-size: 12px;
        color: #9CA3AF;
      }

      /* Welcome modal styles */
      .tour-welcome {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0.9);
        z-index: 10001;
        background: white;
        border-radius: 24px;
        padding: 40px;
        max-width: 480px;
        width: 90%;
        text-align: center;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        opacity: 0;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .tour-welcome.active {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
      }
      .dark .tour-welcome {
        background: #1e2a3b;
      }

      .tour-welcome-icon {
        width: 80px;
        height: 80px;
        border-radius: 20px;
        background: linear-gradient(135deg, #3C50E0 0%, #7C3AED 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 24px;
      }

      .tour-welcome-title {
        font-size: 24px;
        font-weight: 700;
        color: #111827;
        margin-bottom: 12px;
      }
      .dark .tour-welcome-title {
        color: white;
      }

      .tour-welcome-description {
        font-size: 16px;
        color: #6B7280;
        line-height: 1.6;
        margin-bottom: 32px;
      }
      .dark .tour-welcome-description {
        color: #9CA3AF;
      }

      .tour-welcome-actions {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .tour-welcome-btn {
        width: 100%;
        padding: 14px 24px;
        border-radius: 12px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        border: none;
      }
      .tour-welcome-btn-primary {
        background: linear-gradient(135deg, #3C50E0 0%, #7C3AED 100%);
        color: white;
      }
      .tour-welcome-btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 20px rgba(60, 80, 224, 0.3);
      }
      .tour-welcome-btn-secondary {
        background: #F3F4F6;
        color: #374151;
      }
      .dark .tour-welcome-btn-secondary {
        background: #374151;
        color: #E5E7EB;
      }
    `;
    document.head.appendChild(styles);
  }

  createOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'tour-overlay';
    document.body.appendChild(this.overlay);
  }

  createTooltip() {
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'tour-tooltip';
    document.body.appendChild(this.tooltip);
  }

  createSpotlight() {
    this.spotlight = document.createElement('div');
    this.spotlight.className = 'tour-spotlight';
    document.body.appendChild(this.spotlight);
  }

  bindKeyboardEvents() {
    document.addEventListener('keydown', (e) => {
      if (!this.overlay.classList.contains('active')) return;

      if (e.key === 'Escape') {
        this.skip();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        this.next();
      } else if (e.key === 'ArrowLeft') {
        this.prev();
      }
    });
  }

  showWelcome() {
    return new Promise((resolve) => {
      this.init();
      this.overlay.classList.add('active');

      const welcome = document.createElement('div');
      welcome.className = 'tour-welcome';
      welcome.innerHTML = `
        <div class="tour-welcome-icon">
          <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11.5V14m0-2.5v-1a1.5 1.5 0 013 0m-3 1a1.5 1.5 0 013 0m0 0v1m0-1a1.5 1.5 0 013 0m-3 0a1.5 1.5 0 013 0m0 0v1m0-1a1.5 1.5 0 013 0m-3 0a1.5 1.5 0 013 0v3a5 5 0 01-10 0v-2m4-6l-1-1m0 0l-1-1m1 1h-1m1-1V5"/>
          </svg>
        </div>
        <h2 class="tour-welcome-title">Welcome to RentMe!</h2>
        <p class="tour-welcome-description">
          Let's take a quick tour to help you get started. We'll show you how to add listings, manage orders, and set up payouts.
        </p>
        <div class="tour-welcome-actions">
          <button class="tour-welcome-btn tour-welcome-btn-primary" id="tour-start-btn">
            Start Tour
          </button>
          <button class="tour-welcome-btn tour-welcome-btn-secondary" id="tour-skip-btn">
            Skip for now
          </button>
        </div>
      `;
      document.body.appendChild(welcome);

      // Animate in
      requestAnimationFrame(() => {
        welcome.classList.add('active');
      });

      document.getElementById('tour-start-btn').addEventListener('click', () => {
        welcome.classList.remove('active');
        setTimeout(() => {
          welcome.remove();
          resolve(true);
        }, 300);
      });

      document.getElementById('tour-skip-btn').addEventListener('click', () => {
        welcome.classList.remove('active');
        this.overlay.classList.remove('active');
        setTimeout(() => {
          welcome.remove();
          resolve(false);
        }, 300);
      });
    });
  }

  async start() {
    const shouldStart = await this.showWelcome();
    if (!shouldStart) {
      this.onSkip();
      this.cleanup();
      return;
    }

    this.currentStep = 0;
    this.showStep();
  }

  showStep() {
    const step = this.steps[this.currentStep];
    if (!step) return;

    const element = document.querySelector(step.element);
    if (!element) {
      // Skip to next step if element not found
      this.next();
      return;
    }

    // Position spotlight
    const rect = element.getBoundingClientRect();
    const padding = step.padding || 8;

    this.spotlight.style.top = `${rect.top - padding}px`;
    this.spotlight.style.left = `${rect.left - padding}px`;
    this.spotlight.style.width = `${rect.width + padding * 2}px`;
    this.spotlight.style.height = `${rect.height + padding * 2}px`;

    // Create tooltip content
    const stepIndicators = this.steps.map((_, i) =>
      `<div class="tour-step-dot ${i < this.currentStep ? 'completed' : ''} ${i === this.currentStep ? 'active' : ''}"></div>`
    ).join('');

    const iconBg = step.iconBg || 'bg-primary/10';
    const iconColor = step.iconColor || 'text-primary';

    this.tooltip.innerHTML = `
      <div class="tour-tooltip-arrow ${step.position || 'bottom'}"></div>
      <div class="tour-step-indicator">${stepIndicators}</div>
      ${step.icon ? `
        <div class="tour-icon ${iconBg}">
          ${step.icon}
        </div>
      ` : ''}
      <h3 class="tour-title">${step.title}</h3>
      <p class="tour-description">${step.description}</p>
      <div class="tour-actions">
        <button class="tour-btn tour-btn-skip" id="tour-skip">Skip tour</button>
        <div style="display: flex; gap: 8px; align-items: center;">
          <span class="tour-progress">${this.currentStep + 1} of ${this.steps.length}</span>
          ${this.currentStep > 0 ? '<button class="tour-btn tour-btn-secondary" id="tour-prev">Back</button>' : ''}
          <button class="tour-btn tour-btn-primary" id="tour-next">
            ${this.currentStep === this.steps.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    `;

    // Position tooltip
    this.positionTooltip(rect, step.position || 'bottom');

    // Show tooltip
    requestAnimationFrame(() => {
      this.tooltip.classList.add('active');
    });

    // Bind button events
    document.getElementById('tour-next').addEventListener('click', () => this.next());
    document.getElementById('tour-skip').addEventListener('click', () => this.skip());
    if (document.getElementById('tour-prev')) {
      document.getElementById('tour-prev').addEventListener('click', () => this.prev());
    }

    // Scroll element into view if needed
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  positionTooltip(targetRect, position) {
    const tooltip = this.tooltip;
    const tooltipRect = tooltip.getBoundingClientRect();
    const spacing = 16;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top, left;
    let arrowPosition = position;

    switch (position) {
      case 'top':
        top = targetRect.top - tooltipRect.height - spacing;
        left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = targetRect.bottom + spacing;
        left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
        left = targetRect.left - tooltipRect.width - spacing;
        break;
      case 'right':
        top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
        left = targetRect.right + spacing;
        break;
      default:
        top = targetRect.bottom + spacing;
        left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
    }

    // Keep tooltip in viewport
    if (left < spacing) left = spacing;
    if (left + tooltipRect.width > viewportWidth - spacing) {
      left = viewportWidth - tooltipRect.width - spacing;
    }
    if (top < spacing) {
      top = targetRect.bottom + spacing;
      arrowPosition = 'top';
    }
    if (top + tooltipRect.height > viewportHeight - spacing) {
      top = targetRect.top - tooltipRect.height - spacing;
      arrowPosition = 'bottom';
    }

    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;

    // Update arrow position
    const arrow = tooltip.querySelector('.tour-tooltip-arrow');
    if (arrow) {
      arrow.className = `tour-tooltip-arrow ${arrowPosition}`;
    }
  }

  next() {
    this.tooltip.classList.remove('active');

    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
      setTimeout(() => this.showStep(), 300);
    } else {
      this.complete();
    }
  }

  prev() {
    if (this.currentStep > 0) {
      this.tooltip.classList.remove('active');
      this.currentStep--;
      setTimeout(() => this.showStep(), 300);
    }
  }

  skip() {
    this.cleanup();
    this.onSkip();
  }

  complete() {
    this.cleanup();
    this.onComplete();
  }

  cleanup() {
    this.overlay.classList.remove('active');
    this.tooltip.classList.remove('active');

    setTimeout(() => {
      this.overlay.remove();
      this.tooltip.remove();
      this.spotlight.remove();
    }, 300);
  }
}

// Tour configuration for different pages
const tourConfigs = {
  dashboard: [
    {
      element: '#greeting',
      title: 'Welcome to Your Dashboard',
      description: 'This is your command center. Here you can see your sales, bookings, and activity at a glance.',
      position: 'bottom',
      icon: '<svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>',
      iconBg: 'background: rgba(60, 80, 224, 0.1);',
      iconColor: 'color: #3C50E0;'
    },
    {
      element: '.quick-action[href="add-listing.html"]',
      title: 'Add Your First Listing',
      description: 'Click here to add your rental items. Include photos, pricing, and availability to start getting bookings.',
      position: 'bottom',
      icon: '<svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>',
      iconBg: 'background: rgba(60, 80, 224, 0.1);',
      padding: 12
    },
    {
      element: '.quick-action[href="orders.html"]',
      title: 'Manage Your Orders',
      description: 'When customers book your items, you\'ll see them here. Track status, communicate with renters, and manage pickups.',
      position: 'bottom',
      icon: '<svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>',
      iconBg: 'background: rgba(16, 185, 129, 0.1);',
      padding: 12
    },
    {
      element: '.quick-action[href="calendar.html"]',
      title: 'Your Booking Calendar',
      description: 'See all your bookings in calendar view. Block dates when items aren\'t available or you\'re on vacation.',
      position: 'bottom',
      icon: '<svg class="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>',
      iconBg: 'background: rgba(245, 158, 11, 0.1);',
      padding: 12
    },
    {
      element: '[href="/payments.html"], [href="payments.html"], a[href*="payments"]',
      title: 'Get Paid with Stripe',
      description: 'Connect your Stripe account to receive payouts. This is essential for getting paid when customers rent your items!',
      position: 'right',
      icon: '<svg class="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
      iconBg: 'background: rgba(139, 92, 246, 0.1);',
      padding: 8
    },
    {
      element: '.quick-action[href="settings.html"]',
      title: 'Customize Your Settings',
      description: 'Update your profile, notification preferences, and business details here.',
      position: 'left',
      icon: '<svg class="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>',
      iconBg: 'background: rgba(107, 114, 128, 0.1);',
      padding: 12
    }
  ]
};

// Export for use
window.OnboardingTour = OnboardingTour;
window.tourConfigs = tourConfigs;
