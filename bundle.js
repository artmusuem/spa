// ========================================
// URBAN JUNGLE CO. SEO SPA APPLICATION
// Main application file with SEO routing
// ========================================

class UrbanJungleEcommerce {
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
    
    // SEO components
    this.seoRouter = null;
    this.templateManager = null;
    
    this.eventHandlers = {
      menuToggle: null,
      mobileOverlay: null,
      escHandler: null,
      storage: null
    };
    
    this.init();
  }

  // ========================================
  // INITIALIZATION
  // ========================================
  async init() {
    try {
      await this.loadData();
      
      // Initialize SEO router and templates
      this.seoRouter = new SEORouter(this);
      this.templateManager = new TemplateManager(this);
      
      this.setupGlobalEventListeners();
      this.updateCartDisplay();
      
      // Start router
      this.seoRouter.handleRoute();
      
    } catch (error) {
      console.error('Failed to initialize app:', error);
      this.renderError('Failed to load application data');
    }
  }

  // ========================================
  // DATA LOADING
  // ========================================
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

  // ========================================
  // TEMPLATE RENDERING
  // ========================================
  renderByTemplate(templateName, params = {}) {
    try {
      const html = this.templateManager.render(templateName, params);
      document.getElementById('content').innerHTML = html;
      
      if (this.seoRouter && this.seoRouter.currentRoute) {
        const breadcrumbs = this.seoRouter.generateBreadcrumbs(this.seoRouter.currentRoute);
        this.renderBreadcrumbs(breadcrumbs);
      }
      
    } catch (error) {
      console.error('Error rendering template:', error);
      this.render404();
    }
  }

  renderBreadcrumbs(breadcrumbs) {
    const breadcrumbNav = document.getElementById('breadcrumbs');
    if (!breadcrumbNav || breadcrumbs.length <= 1) {
      if (breadcrumbNav) breadcrumbNav.style.display = 'none';
      return;
    }

    breadcrumbNav.style.display = 'block';
    const ol = breadcrumbNav.querySelector('ol');
    
    if (ol) {
      ol.innerHTML = breadcrumbs.map((crumb, index) => `
        <li>
          ${crumb.current ? 
            `<span>${crumb.name}</span>` :
            `<a href="${crumb.url}">${crumb.name}</a>`
          }
        </li>
      `).join('');
    }
  }

  // ========================================
  // NAVIGATION
  // ========================================
  navigate(url) {
    if (this.seoRouter) {
      this.seoRouter.navigate(url);
    }
  }

  handleRoute() {
    if (this.seoRouter) {
      this.seoRouter.handleRoute();
    }
  }

  // ========================================
  // EVENT LISTENERS
  // ========================================
  setupGlobalEventListeners() {
    this.eventHandlers.storage = (e) => {
      if (e.key === 'urbanJungleCart') {
        this.cart = this.loadCart();
        this.updateCartDisplay();
      }
    };
    window.addEventListener('storage', this.eventHandlers.storage);
  }

  // ========================================
  // CART MANAGEMENT
  // ========================================
  loadCart() {
    const cart = localStorage.getItem('urbanJungleCart');
    return cart ? JSON.parse(cart) : [];
  }

  saveCart() {
    localStorage.setItem('urbanJungleCart', JSON.stringify(this.cart));
    this.calculateCartTotal();
  }

  calculateCartTotal() {
    this.cartTotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

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
    this.showNotification(`${product.name} added to cart!`);
  }

  updateCartQuantity(index, quantity) {
    if (quantity <= 0) {
      this.removeFromCart(index);
      return;
    }
    
    this.cart[index].quantity = parseInt(quantity);
    this.saveCart();
    this.updateCartDisplay();
    
    if (this.seoRouter?.currentRoute?.handler === 'cart') {
      this.renderByTemplate('cart');
    }
  }

  removeFromCart(index) {
    this.cart.splice(index, 1);
    this.saveCart();
    this.updateCartDisplay();
    
    if (this.seoRouter?.currentRoute?.handler === 'cart') {
      this.renderByTemplate('cart');
    }
  }

  updateCartDisplay() {
    this.calculateCartTotal();
    const cartCount = this.cart.reduce((sum, item) => sum + item.quantity, 0);
    
    document.querySelectorAll('.cart-contents-count, #cart-count, #mobile-cart-count').forEach(element => {
      element.textContent = cartCount;
    });
    
    document.querySelectorAll('.cart-contents-total').forEach(element => {
      element.textContent = `$${this.cartTotal.toFixed(2)}`;
    });
  }

  // ========================================
  // UTILITY METHODS
  // ========================================
  getCategories() {
    const categoryMap = new Map();
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
      productsGrid.innerHTML = filteredProducts.map(product => 
        this.templateManager.renderProductCard(product)
      ).join('');
    }
  }

  // ========================================
  // MOBILE MENU
  // ========================================
  setupMobileMenu() {
    this.removeMobileMenuListeners();
    
    setTimeout(() => {
      this.attachMobileMenuListeners();
    }, 100);
  }

  attachMobileMenuListeners() {
    const menuToggle = document.getElementById('menu-toggle');
    const mobileOverlay = document.getElementById('mobile-overlay');
    const mobileMenu = document.getElementById('mobile-menu');

    if (menuToggle) {
      this.eventHandlers.menuToggle = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleMobileMenu();
      };
      
      menuToggle.addEventListener('click', this.eventHandlers.menuToggle, { passive: false });
      menuToggle.addEventListener('touchstart', this.eventHandlers.menuToggle, { passive: false });
    }

    if (mobileOverlay) {
      this.eventHandlers.mobileOverlay = (e) => {
        e.preventDefault();
        this.closeMobileMenu();
      };
      mobileOverlay.addEventListener('click', this.eventHandlers.mobileOverlay);
    }

    if (mobileMenu) {
      const mobileLinks = mobileMenu.querySelectorAll('a[href^="/"]');
      mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
          this.closeMobileMenu();
        });
      });
    }

    this.eventHandlers.escHandler = (e) => {
      if (e.key === 'Escape' && this.mobileMenuActive) {
        this.closeMobileMenu();
      }
    };
    document.addEventListener('keydown', this.eventHandlers.escHandler);
  }

  removeMobileMenuListeners() {
    const menuToggle = document.getElementById('menu-toggle');
    const mobileOverlay = document.getElementById('mobile-overlay');
    
    if (menuToggle && this.eventHandlers.menuToggle) {
      menuToggle.removeEventListener('click', this.eventHandlers.menuToggle);
      menuToggle.removeEventListener('touchstart', this.eventHandlers.menuToggle);
    }
    
    if (mobileOverlay && this.eventHandlers.mobileOverlay) {
      mobileOverlay.removeEventListener('click', this.eventHandlers.mobileOverlay);
    }
    
    if (this.eventHandlers.escHandler) {
      document.removeEventListener('keydown', this.eventHandlers.escHandler);
    }

    this.eventHandlers.menuToggle = null;
    this.eventHandlers.mobileOverlay = null;
    this.eventHandlers.escHandler = null;
  }

  toggleMobileMenu() {
    if (this.mobileMenuActive) {
      this.closeMobileMenu();
    } else {
      this.openMobileMenu();
    }
  }

  openMobileMenu() {
    this.mobileMenuActive = true;

    const menuToggle = document.getElementById('menu-toggle');
    const mobileOverlay = document.getElementById('mobile-overlay');
    const mobileMenu = document.getElementById('mobile-menu');

    if (menuToggle) menuToggle.classList.add('is-active');
    if (mobileOverlay) mobileOverlay.classList.add('is-active');
    if (mobileMenu) mobileMenu.classList.add('is-active');
    
    document.body.style.overflow = 'hidden';
    document.body.classList.add('mobile-menu-open');
  }

  closeMobileMenu() {
    this.mobileMenuActive = false;

    const menuToggle = document.getElementById('menu-toggle');
    const mobileOverlay = document.getElementById('mobile-overlay');
    const mobileMenu = document.getElementById('mobile-menu');

    if (menuToggle) menuToggle.classList.remove('is-active');
    if (mobileOverlay) mobileOverlay.classList.remove('is-active');
    if (mobileMenu) mobileMenu.classList.remove('is-active');
    
    document.body.style.overflow = '';
    document.body.classList.remove('mobile-menu-open');
  }

  // ========================================
  // FORM HANDLERS
  // ========================================
  selectPaymentMethod(element, method) {
    document.querySelectorAll('.payment-method').forEach(pm => pm.classList.remove('selected'));
    element.classList.add('selected');
    element.querySelector('input[type="radio"]').checked = true;
    
    const creditFields = document.getElementById('credit-card-fields');
    if (creditFields) {
      creditFields.style.display = method === 'credit' ? 'block' : 'none';
    }
  }

  processOrder(event) {
    event.preventDefault();
    
    this.showNotification('Processing your order...');
    
    setTimeout(() => {
      this.cart = [];
      this.saveCart();
      this.updateCartDisplay();
      
      this.showNotification('Order placed successfully! Thank you for your purchase.');
      this.navigate('/');
    }, 2000);
  }

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

  submitContactForm(event) {
    event.preventDefault();
    this.showNotification('Thank you for your message! We\'ll get back to you soon.');
    event.target.reset();
  }

  submitLogin(event) {
    event.preventDefault();
    this.showNotification('Login functionality is not implemented in this demo.');
  }

  // ========================================
  // NOTIFICATIONS
  // ========================================
  showNotification(message) {
    document.querySelectorAll('.notification').forEach(n => n.remove());
    
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
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
      }
    }, 3000);
  }

  // ========================================
  // ERROR HANDLING
  // ========================================
  render404() {
    const html = `
      <div class="container">
        <div class="empty-state">
          <h1>Page Not Found</h1>
          <p>The page you're looking for doesn't exist.</p>
          <a href="/" class="wp-block-button__link">Go Home</a>
        </div>
      </div>
    `;
    document.getElementById('content').innerHTML = html;
  }

  renderError(message) {
    const html = `
      <div class="container">
        <div class="empty-state">
          <h2>Error</h2>
          <p>${message}</p>
          <button onclick="location.reload()" class="wp-block-button__link">Retry</button>
        </div>
      </div>
    `;
    document.getElementById('content').innerHTML = html;
  }

  // ========================================
  // CLEANUP
  // ========================================
  destroy() {
    this.removeMobileMenuListeners();
    
    if (this.eventHandlers.storage) {
      window.removeEventListener('storage', this.eventHandlers.storage);
    }
  }
}

// ========================================
// NOTIFICATION ANIMATIONS
// ========================================
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

  .breadcrumbs {
    display: flex;
    list-style: none;
    padding: 0;
    margin: 20px 0;
    font-size: 14px;
  }

  .breadcrumbs li {
    display: flex;
    align-items: center;
  }

  .breadcrumbs li:not(:last-child)::after {
    content: '/';
    margin: 0 10px;
    color: #ccc;
  }

  .breadcrumbs a {
    color: var(--link-color);
    text-decoration: none;
  }

  .breadcrumbs a:hover {
    text-decoration: underline;
  }

  .breadcrumbs li:last-child span {
    color: var(--text-color);
    font-weight: 500;
  }
`;
document.head.appendChild(style);

// ========================================
// INITIALIZATION
// ========================================
document.addEventListener('DOMContentLoaded', () => {
  window.app = new UrbanJungleEcommerce();
});
