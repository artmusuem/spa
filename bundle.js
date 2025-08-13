// Start of Class Definition: UrbanJungleEcommerce
class UrbanJungleEcommerce {
  // Start of Constructor
  constructor() {
    this.currentRoute = '';
    this.products = [];
    this.services = [];
    this.testimonials = [];
    this.aboutData = {};
    this.contactData = {};
    this.cart = this.loadCart();
    this.cartTotal = 0;
    this.mobileMenuActive = false;
    
    // Store references to event handlers for proper cleanup
    this.eventHandlers = {
      menuToggle: null,
      mobileOverlay: null,
      escHandler: null,
      hashChange: null,
      globalClick: null,
      storage: null
    };
    
    this.init();
  }
  // End of Constructor

  // Start of Method: init
  async init() {
    try {
      await this.loadData();
      this.setupGlobalEventListeners();
      this.updateCartDisplay();
      this.handleRoute();
    } catch (error) {
      console.error('Failed to initialize app:', error);
      this.renderError('Failed to load application data');
    }
  }
  // End of Method: init

  // Start of Method: loadData
  async loadData() {
    try {
      const [products, services, testimonials, about, contact] = await Promise.all([
        fetch('products.json').then(r => r.json()),
        fetch('services.json').then(r => r.json()),
        fetch('testimonials.json').then(r => r.json()),
        fetch('about.json').then(r => r.json()),
        fetch('contact.json').then(r => r.json())
      ]);

      this.products = products;
      this.services = services;
      this.testimonials = testimonials;
      this.aboutData = about;
      this.contactData = contact;
    } catch (error) {
      console.error('Error loading data:', error);
      throw error;
    }
  }
  // End of Method: loadData

  // Start of Method: setupGlobalEventListeners
  setupGlobalEventListeners() {
    // Hash change for routing
    this.eventHandlers.hashChange = () => this.handleRoute();
    window.addEventListener('hashchange', this.eventHandlers.hashChange);
    
    // Global click handler for navigation
    this.eventHandlers.globalClick = (e) => {
      if (e.target.matches('a[href^="#"]')) {
        const href = e.target.getAttribute('href');
        if (href && href !== '#') {
          this.closeMobileMenu();
          this.navigate(href);
        }
      }
    };
    document.addEventListener('click', this.eventHandlers.globalClick);

    // Update cart count on storage change
    this.eventHandlers.storage = (e) => {
      if (e.key === 'urbanJungleCart') {
        this.cart = this.loadCart();
        this.updateCartDisplay();
      }
    };
    window.addEventListener('storage', this.eventHandlers.storage);
  }
  // End of Method: setupGlobalEventListeners

  // Start of Method: setupMobileMenu
  // FIXED: Mobile menu setup that works reliably
  setupMobileMenu() {
    // Remove any existing mobile menu listeners first
    this.removeMobileMenuListeners();
    
    // Use a longer timeout to ensure DOM is fully rendered
    setTimeout(() => {
      this.attachMobileMenuListeners();
    }, 100);
  }
  // End of Method: setupMobileMenu

  // Start of Method: attachMobileMenuListeners
  attachMobileMenuListeners() {
    const menuToggle = document.getElementById('menu-toggle');
    const mobileOverlay = document.getElementById('mobile-overlay');
    const mobileMenu = document.getElementById('mobile-menu');

    // Menu toggle button handler
    if (menuToggle) {
      this.eventHandlers.menuToggle = (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Menu toggle clicked'); // Debug log
        this.toggleMobileMenu();
      };
      
      // Use both click and touchstart for better mobile support
      menuToggle.addEventListener('click', this.eventHandlers.menuToggle, { passive: false });
      menuToggle.addEventListener('touchstart', this.eventHandlers.menuToggle, { passive: false });
    } else {
      console.warn('Menu toggle button not found');
    }

    // Mobile overlay handler
    if (mobileOverlay) {
      this.eventHandlers.mobileOverlay = (e) => {
        e.preventDefault();
        this.closeMobileMenu();
      };
      mobileOverlay.addEventListener('click', this.eventHandlers.mobileOverlay);
    }

    // Mobile menu link handler
    if (mobileMenu) {
      const mobileLinks = mobileMenu.querySelectorAll('a[href^="#"]');
      mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
          this.closeMobileMenu();
        });
      });
    }

    // ESC key handler
    this.eventHandlers.escHandler = (e) => {
      if (e.key === 'Escape' && this.mobileMenuActive) {
        this.closeMobileMenu();
      }
    };
    document.addEventListener('keydown', this.eventHandlers.escHandler);
  }
  // End of Method: attachMobileMenuListeners

  // Start of Method: removeMobileMenuListeners
  removeMobileMenuListeners() {
    const menuToggle = document.getElementById('menu-toggle');
    const mobileOverlay = document.getElementById('mobile-overlay');
    
    // Remove menu toggle listeners
    if (menuToggle && this.eventHandlers.menuToggle) {
      menuToggle.removeEventListener('click', this.eventHandlers.menuToggle);
      menuToggle.removeEventListener('touchstart', this.eventHandlers.menuToggle);
    }
    
    // Remove overlay listener
    if (mobileOverlay && this.eventHandlers.mobileOverlay) {
      mobileOverlay.removeEventListener('click', this.eventHandlers.mobileOverlay);
    }
    
    // Remove ESC key listener
    if (this.eventHandlers.escHandler) {
      document.removeEventListener('keydown', this.eventHandlers.escHandler);
    }

    // Clear handler references
    this.eventHandlers.menuToggle = null;
    this.eventHandlers.mobileOverlay = null;
    this.eventHandlers.escHandler = null;
  }
  // End of Method: removeMobileMenuListeners

  // Start of Method: navigate
  navigate(route) {
    window.location.hash = route;
  }
  // End of Method: navigate

  // Start of Method: handleRoute
  handleRoute() {
    const hash = window.location.hash || '#home';
    const [route, param] = hash.substring(1).split('/');
    
    this.currentRoute = route;
    this.updateActiveNavLinks();
    
    const content = document.getElementById('content');
    content.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';
    
    // Close mobile menu when navigating
    this.closeMobileMenu();
    
    setTimeout(() => {
      switch (route) {
        case 'home':
        case '':
          this.renderHome();
          break;
        case 'shop':
          this.renderShop();
          break;
        case 'category':
          this.renderCategory(param);
          break;
        case 'product':
          this.renderProduct(param);
          break;
        case 'cart':
          this.renderCart();
          break;
        case 'checkout':
          this.renderCheckout();
          break;
        case 'about':
          this.renderAbout();
          break;
        case 'contact':
          this.renderContact();
          break;
        case 'my-account':
          this.renderAccount();
          break;
        default:
          this.render404();
      }
      
      content.classList.add('fade-in');
      setTimeout(() => content.classList.remove('f...(truncated 24895 characters)...goryMap = new Map();
    this.products.forEach(product => {
      const slug = product.category.toLowerCase().replace(/\s+/g, '-');
      if (!categoryMap.has(slug)) {
        categoryMap.set(slug, {
          name: product.category,
          slug: slug,
          image: product.image
        });
      }
    });
    return Array.from(categoryMap.values());
  }
  // End of Method: handleRoute

  // Start of Method: loadCart
  // Cart Management
  loadCart() {
    const cart = localStorage.getItem('urbanJungleCart');
    return cart ? JSON.parse(cart) : [];
  }
  // End of Method: loadCart

  // Start of Method: saveCart
  saveCart() {
    localStorage.setItem('urbanJungleCart', JSON.stringify(this.cart));
    this.calculateCartTotal();
  }
  // End of Method: saveCart

  // Start of Method: calculateCartTotal
  calculateCartTotal() {
    this.cartTotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }
  // End of Method: calculateCartTotal

  // Start of Method: addToCart
  addToCart(productId, quantity = 1) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = this.cart.find(item => item.id === productId);
    
    if (existingItem) {
      existingItem.quantity += parseInt(quantity);
    } else {
      this.cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        quantity: parseInt(quantity)
      });
    }

    this.saveCart();
    this.updateCartDisplay();
    
    // Show feedback
    this.showNotification(`${product.name} added to cart!`);
  }
  // End of Method: addToCart

  // Start of Method: updateCartQuantity
  updateCartQuantity(index, quantity) {
    if (quantity <= 0) {
      this.removeFromCart(index);
      return;
    }
    
    this.cart[index].quantity = parseInt(quantity);
    this.saveCart();
    this.updateCartDisplay();
    this.renderCart(); // Re-render cart to update display
  }
  // End of Method: updateCartQuantity

  // Start of Method: removeFromCart
  removeFromCart(index) {
    this.cart.splice(index, 1);
    this.saveCart();
    this.updateCartDisplay();
    this.renderCart();
  }
  // End of Method: removeFromCart

  // Start of Method: updateCartDisplay
  updateCartDisplay() {
    this.calculateCartTotal();
    const cartCount = this.cart.reduce((sum, item) => sum + item.quantity, 0);
    
    // Update cart count
    document.querySelectorAll('.cart-contents-count, #cart-count, #mobile-cart-count').forEach(element => {
      element.textContent = cartCount;
    });
    
    // Update cart total
    document.querySelectorAll('.cart-contents-total').forEach(element => {
      element.textContent = `$${this.cartTotal.toFixed(2)}`;
    });
  }
  // End of Method: updateCartDisplay

  // Start of Method: filterProducts
  // Filter Products
  filterProducts(category) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    if (event && event.target) {
      event.target.classList.add('active');
    }

    const productsGrid = document.getElementById('shop-products');
    let filteredProducts;

    if (category === 'all') {
      filteredProducts = this.products;
    } else {
      filteredProducts = this.products.filter(p => 
        p.category.toLowerCase().replace(/\s+/g, '-') === category
      );
    }

    if (productsGrid) {
      productsGrid.innerHTML = filteredProducts.map(product => this.renderProductCard(product)).join('');
    }
  }
  // End of Method: filterProducts

  // Start of Method: selectPaymentMethod
  // Checkout functions
  selectPaymentMethod(element, method) {
    document.querySelectorAll('.payment-method').forEach(pm => pm.classList.remove('selected'));
    element.classList.add('selected');
    element.querySelector('input[type="radio"]').checked = true;
    
    const creditFields = document.getElementById('credit-card-fields');
    if (creditFields) {
      creditFields.style.display = method === 'credit' ? 'block' : 'none';
    }
  }
  // End of Method: selectPaymentMethod

  // Start of Method: processOrder
  processOrder(event) {
    event.preventDefault();
    
    // Simulate order processing
    this.showNotification('Processing your order...');
    
    setTimeout(() => {
      this.cart = [];
      this.saveCart();
      this.updateCartDisplay();
      
      this.showNotification('Order placed successfully! Thank you for your purchase.');
      this.navigate('#home');
    }, 2000);
  }
  // End of Method: processOrder

  // Start of Method: changeMainImage
  changeMainImage(imageSrc) {
    const mainImage = document.getElementById('main-image');
    if (mainImage) {
      mainImage.src = imageSrc;
    }
    
    document.querySelectorAll('.product-thumbnail').forEach(thumb => thumb.classList.remove('active'));
    if (event && event.target) {
      event.target.classList.add('active');
    }
  }
  // End of Method: changeMainImage

  // Start of Method: submitContactForm
  // Form Handlers
  submitContactForm(event) {
    event.preventDefault();
    this.showNotification('Thank you for your message! We\'ll get back to you soon.');
    event.target.reset();
  }
  // End of Method: submitContactForm

  // Start of Method: submitLogin
  submitLogin(event) {
    event.preventDefault();
    this.showNotification('Login functionality is not implemented in this demo.');
  }
  // End of Method: submitLogin

  // Start of Method: showNotification
  // Notification system
  showNotification(message) {
    // Remove existing notifications
    document.querySelectorAll('.notification').forEach(n => n.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--primary-color);
      color: white;
      padding: 15px 20px;
      border-radius: var(--border-radius);
      box-shadow: var(--box-shadow);
      z-index: 9999;
      font-weight: 500;
      max-width: 300px;
      animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
      }
    }, 3000);
  }
  // End of Method: showNotification

  // Start of Method: destroy
  // Cleanup method for proper teardown
  destroy() {
    this.removeMobileMenuListeners();
    
    // Remove global listeners
    if (this.eventHandlers.hashChange) {
      window.removeEventListener('hashchange', this.eventHandlers.hashChange);
    }
    if (this.eventHandlers.globalClick) {
      document.removeEventListener('click', this.eventHandlers.globalClick);
    }
    if (this.eventHandlers.storage) {
      window.removeEventListener('storage', this.eventHandlers.storage);
    }
  }
  // End of Method: destroy
}
// End of Class Definition: UrbanJungleEcommerce

// Start of Notification Animations Setup
// Add notification animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
// End of Notification Animations Setup

// Start of App Initialization
// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.app = new UrbanJungleEcommerce();
});
// End of App Initialization
