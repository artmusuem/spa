// ========================================
// TEMPLATE MANAGER
// Handles page templates for SEO SPA
// ========================================

class TemplateManager {
  constructor(app) {
    this.app = app;
    this.templates = new Map();
    this.setupTemplates();
  }

  setupTemplates() {
    this.templates.set('home', this.renderHome.bind(this));
    this.templates.set('shop', this.renderShop.bind(this));
    this.templates.set('product', this.renderProduct.bind(this));
    this.templates.set('category', this.renderCategory.bind(this));
    this.templates.set('about', this.renderAbout.bind(this));
    this.templates.set('contact', this.renderContact.bind(this));
    this.templates.set('cart', this.renderCart.bind(this));
    this.templates.set('checkout', this.renderCheckout.bind(this));
    this.templates.set('account', this.renderAccount.bind(this));
  }

  render(templateName, params = {}) {
    const template = this.templates.get(templateName);
    if (!template) {
      console.error(`Template '${templateName}' not found`);
      return this.render404();
    }
    return template(params);
  }

  renderHome(params) {
    const trendingProducts = this.app.products.slice(0, 3);
    const popularProducts = this.app.products.slice(3, 6);
    const categories = this.app.getCategories();

    return `
      <!-- HERO SECTION -->
      <section class="hero-section">
        <div class="container">
          <div class="hero-content">
            <h1>Welcome to Urban Jungle Co.</h1>
            <p>Discover the Beauty of Nature at Your Fingertips</p>
            <a href="/shop" class="wp-block-button__link">Shop Now</a>
          </div>
        </div>
      </section>

      <!-- SERVICES SECTION -->
      <section class="wp-block-group section-alt">
        <div class="container">
          <div class="section-header">
            <h2>Why Choose Us</h2>
            <p>We provide the best service for your green needs</p>
          </div>
          <div class="services-grid">
            ${this.app.services.map(service => `
              <div class="service-item">
                <div class="service-icon">${service.icon}</div>
                <h3 class="service-title">${service.title}</h3>
                <p class="service-description">${service.description}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- TRENDING PRODUCTS SECTION -->
      <section class="wp-block-group">
        <div class="container">
          <div class="section-header">
            <h2>Trending Products</h2>
            <p>Discover our most popular plants</p>
          </div>
          <div class="products-grid wc-block-grid">
            ${trendingProducts.map(product => this.renderProductCard(product)).join('')}
          </div>
        </div>
      </section>

      <!-- FLASH SALE SECTION -->
      <section class="wp-block-group section-alt">
        <div class="container">
          <div class="section-header">
            <h2>Flash Sale: Up to 50% Off On Select Items!</h2>
            <p>Don't miss out on our flash sale event! For a limited time, enjoy up to 50% off on a selection of our best-selling products.</p>
            <a href="/shop" class="wp-block-button__link btn-outline">Shop Sale</a>
          </div>
        </div>
      </section>

      <!-- CATEGORIES SECTION -->
      <section class="wp-block-group">
        <div class="container">
          <div class="section-header">
            <h2>Our Categories</h2>
            <p>Explore our diverse collection of plants</p>
          </div>
          <div class="categories-grid">
            ${categories.map(category => `
              <div class="category-item" onclick="app.seoRouter.navigate('/category/${category.slug}')">
                <img src="${category.image}" alt="${category.name}" class="category-image">
                <div class="category-overlay">
                  <h3 class="category-title">${category.name}</h3>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- POPULAR PRODUCTS SECTION -->
      <section class="wp-block-group">
        <div class="container">
          <div class="section-header">
            <h2>Popular Products</h2>
            <p>Our customers' favorite plants</p>
          </div>
          <div class="products-grid wc-block-grid">
            ${popularProducts.map(product => this.renderProductCard(product)).join('')}
          </div>
        </div>
      </section>

      <!-- TESTIMONIALS SECTION -->
      <section class="wp-block-group section-alt">
        <div class="container">
          <div class="section-header">
            <h2>What Our Customers Say</h2>
            <p>Discover the reasons why people love us</p>
          </div>
          <div class="testimonials-grid">
            ${this.app.testimonials.map(testimonial => `
              <div class="testimonial-item">
                <div class="testimonial-content">"${testimonial.content}"</div>
                <div class="testimonial-author">
                  <img src="${testimonial.avatar}" alt="${testimonial.name}" class="author-avatar">
                  <div class="author-info">
                    <h4>${testimonial.name}</h4>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    `;
  }

  renderShop(params) {
    const categories = this.app.getCategories();
    
    return `
      <div class="container">
        <div class="section-header">
          <h1>Shop Our Plants</h1>
          <p>Find your perfect green companion</p>
        </div>
        
        <!-- PRODUCT FILTERS -->
        <div class="filters-container">
          <div class="filter-buttons">
            <span class="filter-label">Filter by:</span>
            <button class="filter-btn active" onclick="app.filterProducts('all')">All Products</button>
            ${categories.map(cat => `
              <button class="filter-btn" onclick="app.filterProducts('${cat.slug}')">${cat.name}</button>
            `).join('')}
          </div>
        </div>
        
        <!-- PRODUCTS GRID -->
        <div class="products-grid wc-block-grid" id="shop-products">
          ${this.app.products.map(product => this.renderProductCard(product)).join('')}
        </div>
      </div>
    `;
  }

  renderProduct(params) {
    const product = this.app.products.find(p => p.slug === params.slug);
    
    if (!product) {
      return this.render404();
    }

    const relatedProducts = this.app.products
      .filter(p => p.category === product.category && p.id !== product.id)
      .slice(0, 3);

    return `
      <div class="container product-detail-container">
        <!-- PRODUCT DETAIL GRID -->
        <div class="product-detail-grid">
          <!-- PRODUCT GALLERY -->
          <div class="product-gallery">
            <img src="${product.image}" alt="${product.name}" class="product-main-image" id="main-image">
            <div class="product-thumbnails">
              <img src="${product.image}" alt="${product.name}" class="product-thumbnail active" onclick="app.changeMainImage('${product.image}')">
            </div>
          </div>
          
          <!-- PRODUCT SUMMARY -->
          <div class="product-summary">
            <div class="product-meta">
              <span>Category: ${product.category}</span>
            </div>
            <h1>${product.name}</h1>
            <div class="product-rating">
              <span class="star-rating">★★★★★</span>
              <span>Rated 5 out of 5</span>
            </div>
            <div class="price">$${product.price.toFixed(2)}</div>
            <div class="product-description">
              <p>${product.description}</p>
            </div>
            
            <div class="quantity-selector">
              <label for="quantity">Quantity:</label>
              <input type="number" id="quantity" class="quantity-input" value="1" min="1">
            </div>
            
            <button class="single_add_to_cart_button button" onclick="app.addToCart(${product.id}, document.getElementById('quantity').value)">
              Add to Cart
            </button>
          </div>
        </div>
        
        <!-- RELATED PRODUCTS -->
        ${relatedProducts.length > 0 ? `
          <div class="section-header">
            <h2>Related Products</h2>
          </div>
          <div class="products-grid wc-block-grid">
            ${relatedProducts.map(product => this.renderProductCard(product)).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }

  renderCategory(params) {
    const categorySlug = params.category;
    const category = this.app.getCategories().find(cat => cat.slug === categorySlug);
    const products = this.app.products.filter(p => 
      p.category.toLowerCase().replace(/\s+/g, '-') === categorySlug
    );

    if (!category) {
      return this.render404();
    }

    return `
      <div class="container">
        <div class="section-header">
          <h1>${category.name}</h1>
          <p>Explore our ${category.name.toLowerCase()} collection</p>
        </div>
        
        <div class="products-grid wc-block-grid">
          ${products.length > 0 ? 
            products.map(product => this.renderProductCard(product)).join('') :
            '<div class="empty-state"><h3>No products found</h3><p>No products found in this category.</p></div>'
          }
        </div>
      </div>
    `;
  }

  renderAbout(params) {
    return `
      <div class="container">
        <div class="section-header">
          <h1>${this.app.aboutData.title}</h1>
          <p>${this.app.aboutData.subtitle}</p>
        </div>
        
        ${this.app.aboutData.sections.map(section => `
          <div class="wp-block-group">
            <h2>${section.title}</h2>
            <p>${section.content}</p>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderContact(params) {
    return `
      <div class="container">
        <div class="section-header">
          <h1>Contact Us</h1>
          <p>Get in touch with our team</p>
        </div>
        
        <div class="checkout-grid">
          <!-- CONTACT FORM -->
          <div class="checkout-form">
            <form onsubmit="app.submitContactForm(event)">
              <div class="form-group">
                <label for="contact-name" class="form-label">Name *</label>
                <input type="text" id="contact-name" class="form-input" required>
              </div>
              
              <div class="form-group">
                <label for="contact-email" class="form-label">Email *</label>
                <input type="email" id="contact-email" class="form-input" required>
              </div>
              
              <div class="form-group">
                <label for="contact-subject" class="form-label">Subject</label>
                <input type="text" id="contact-subject" class="form-input">
              </div>
              
              <div class="form-group">
                <label for="contact-message" class="form-label">Message *</label>
                <textarea id="contact-message" class="form-textarea" rows="6" required></textarea>
              </div>
              
              <button type="submit" class="wp-block-button__link">Send Message</button>
            </form>
          </div>
          
          <!-- CONTACT INFORMATION -->
          <div class="checkout-sidebar">
            <h3>Contact Information</h3>
            <div class="textwidget">
              <p><strong>Email:</strong><br>${this.app.contactData.email}</p>
              <p><strong>Phone:</strong><br>${this.app.contactData.phone}</p>
              <p><strong>Address:</strong><br>${this.app.contactData.address}</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderCart(params) {
    if (this.app.cart.length === 0) {
      return `
        <div class="container">
          <div class="section-header">
            <h1>Your Cart</h1>
          </div>
          <div class="empty-state">
            <h3>Your cart is empty</h3>
            <p>Looks like you haven't added any plants to your cart yet.</p>
            <a href="/shop" class="wp-block-button__link">Continue Shopping</a>
          </div>
        </div>
      `;
    }

    return `
      <div class="container cart-container">
        <div class="section-header">
          <h1>Your Cart</h1>
        </div>
        
        <!-- CART TABLE -->
        <table class="cart-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Total</th>
              <th>Remove</th>
            </tr>
          </thead>
          <tbody>
            ${this.app.cart.map((item, index) => `
              <tr>
                <td>
                  <div class="cart-item-details">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                    <div>
                      <h4>${item.name}</h4>
                      <div class="cart-item-meta">Category: ${item.category || 'Plants'}</div>
                    </div>
                  </div>
                </td>
                <td>$${item.price.toFixed(2)}</td>
                <td>
                  <div class="quantity-control">
                    <button class="quantity-btn" onclick="app.updateCartQuantity(${index}, ${item.quantity - 1})">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" onclick="app.updateCartQuantity(${index}, ${item.quantity + 1})">+</button>
                  </div>
                </td>
                <td>$${(item.price * item.quantity).toFixed(2)}</td>
                <td>
                  <button class="button btn-outline" onclick="app.removeFromCart(${index})">Remove</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <!-- CART TOTALS -->
        <div class="cart-totals">
          <h3>Cart Totals</h3>
          <div class="totals-row">
            <span>Subtotal:</span>
            <span>$${this.app.cartTotal.toFixed(2)}</span>
          </div>
          <div class="totals-row">
            <span>Shipping:</span>
            <span>Free</span>
          </div>
          <div class="totals-row">
            <strong>Total:</strong>
            <strong>$${this.app.cartTotal.toFixed(2)}</strong>
          </div>
          <a href="/checkout" class="wc-block-cart__submit-button">Proceed to Checkout</a>
        </div>
      </div>
    `;
  }

  renderCheckout(params) {
    return `
      <div class="container checkout-container">
        <div class="section-header">
          <h1>Checkout</h1>
        </div>
        
        <div class="checkout-grid">
          <!-- CHECKOUT FORM -->
          <div class="checkout-form">
            <form id="checkout-form" onsubmit="app.processOrder(event)">
              <!-- BILLING DETAILS SECTION -->
              <div class="form-section">
                <h3>Billing Details</h3>
                <div class="form-row">
                  <div class="form-group">
                    <label for="first-name" class="form-label">First Name *</label>
                    <input type="text" id="first-name" class="form-input" required>
                  </div>
                  <div class="form-group">
                    <label for="last-name" class="form-label">Last Name *</label>
                    <input type="text" id="last-name" class="form-input" required>
                  </div>
                </div>
                
                <div class="form-group">
                  <label for="email" class="form-label">Email Address *</label>
                  <input type="email" id="email" class="form-input" required>
                </div>
                
                <div class="form-group">
                  <label for="phone" class="form-label">Phone *</label>
                  <input type="tel" id="phone" class="form-input" required>
                </div>
                
                <div class="form-group">
                  <label for="address" class="form-label">Street Address *</label>
                  <input type="text" id="address" class="form-input" required>
                </div>
                
                <div class="form-row">
                  <div class="form-group">
                    <label for="city" class="form-label">City *</label>
                    <input type="text" id="city" class="form-input" required>
                  </div>
                  <div class="form-group">
                    <label for="state" class="form-label">State *</label>
                    <select id="state" class="form-select" required>
                      <option value="">Select State</option>
                      <option value="FL">Florida</option>
                      <option value="CA">California</option>
                      <option value="NY">New York</option>
                      <option value="TX">Texas</option>
                    </select>
                  </div>
                </div>
                
                <div class="form-group">
                  <label for="zip" class="form-label">ZIP Code *</label>
                  <input type="text" id="zip" class="form-input" required>
                </div>
              </div>
              
              <button type="submit" class="wc-block-cart__submit-button">Place Order</button>
            </form>
          </div>
          
          <!-- ORDER SUMMARY SIDEBAR -->
          <div class="checkout-sidebar">
            <div class="order-summary">
              <h3>Your Order</h3>
              ${this.app.cart.map(item => `
                <div class="order-item">
                  <span>${item.name} × ${item.quantity}</span>
                  <span>$${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              `).join('')}
              <div class="order-item">
                <span>Subtotal:</span>
                <span>$${this.app.cartTotal.toFixed(2)}</span>
              </div>
              <div class="order-item">
                <span>Shipping:</span>
                <span>Free</span>
              </div>
              <div class="order-item">
                <strong>Total:</strong>
                <strong>$${this.app.cartTotal.toFixed(2)}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderAccount(params) {
    return `
      <div class="container">
        <div class="section-header">
          <h1>My Account</h1>
          <p>Login to your account</p>
        </div>
        
        <div class="checkout-form" style="max-width: 400px; margin: 0 auto;">
          <form onsubmit="app.submitLogin(event)">
            <div class="form-group">
              <label for="username" class="form-label">Username or Email *</label>
              <input type="text" id="username" class="form-input" required>
            </div>
            
            <div class="form-group">
              <label for="password" class="form-label">Password *</label>
              <input type="password" id="password" class="form-input" required>
            </div>
            
            <button type="submit" class="wp-block-button__link">Login</button>
            
            <div class="text-center mt-2">
              <p>Don't have an account? <a href="#" style="color: var(--primary-color);">Register here</a></p>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  render404() {
    return `
      <div class="container">
        <div class="empty-state">
          <h1>Page Not Found</h1>
          <p>The page you're looking for doesn't exist.</p>
          <a href="/" class="wp-block-button__link">Go Home</a>
        </div>
      </div>
    `;
  }

  renderProductCard(product) {
    return `
      <div class="product-item wc-block-grid__product" onclick="app.seoRouter.navigate('/product/${product.slug}')">
        <img src="${product.image}" alt="${product.name}" class="product-image">
        <div class="product-details">
          <div class="product-category">${product.category}</div>
          <h3 class="product-title">${product.name}</h3>
          <div class="product-rating">
            <span class="star-rating">★★★★★</span>
            <span>Rated 5 out of 5</span>
          </div>
          <div class="product-price">$${product.price.toFixed(2)}</div>
          <button class="single_add_to_cart_button button" onclick="event.stopPropagation(); app.addToCart(${product.id})">
            Add to Cart
          </button>
        </div>
      </div>
    `;
  }
}
