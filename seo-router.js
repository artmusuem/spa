// ========================================
// SEO ROUTER
// Handles proper URL routing for SEO
// ========================================

class SEORouter {
  constructor(app) {
    this.app = app;
    this.routes = new Map();
    this.currentRoute = null;
    this.setupRoutes();
    this.init();
  }

  init() {
    // Listen for browser navigation
    window.addEventListener('popstate', () => this.handleRoute());
    
    // Intercept all link clicks for SPA navigation
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="/"]');
      if (link && !link.target && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        this.navigate(link.getAttribute('href'));
      }
    });
  }

  setupRoutes() {
    // Define SEO-friendly URL patterns
    this.addRoute('/', 'home');
    this.addRoute('/home', 'home');
    this.addRoute('/shop', 'shop');
    this.addRoute('/product/:slug', 'product');
    this.addRoute('/category/:category', 'category');
    this.addRoute('/about', 'about');
    this.addRoute('/contact', 'contact');
    this.addRoute('/cart', 'cart');
    this.addRoute('/checkout', 'checkout');
    this.addRoute('/my-account', 'account');
  }

  addRoute(pattern, handler) {
    const regex = this.patternToRegex(pattern);
    this.routes.set(regex, {
      pattern,
      handler,
      params: this.extractParams(pattern)
    });
  }

  patternToRegex(pattern) {
    const escaped = pattern
      .replace(/\//g, '\\/')
      .replace(/:\w+/g, '([^/]+)');
    return new RegExp(`^${escaped}/?$`);
  }

  extractParams(pattern) {
    const matches = pattern.match(/:(\w+)/g);
    return matches ? matches.map(m => m.slice(1)) : [];
  }

  navigate(path, replace = false) {
    if (replace) {
      window.history.replaceState(null, '', path);
    } else {
      window.history.pushState(null, '', path);
    }
    this.handleRoute();
  }

  handleRoute() {
    const path = window.location.pathname;
    const route = this.matchRoute(path);
    
    if (!route) {
      this.handle404();
      return;
    }

    this.currentRoute = route;
    this.updateSEOTags(route);
    this.renderPage(route);
    this.updateNavigation();
  }

  matchRoute(path) {
    for (const [regex, config] of this.routes.entries()) {
      const match = path.match(regex);
      if (match) {
        const params = {};
        config.params.forEach((paramName, index) => {
          params[paramName] = match[index + 1];
        });
        return { handler: config.handler, params, path };
      }
    }
    return null;
  }

  updateSEOTags(route) {
    const meta = this.generateSEOData(route);
    
    // Update page title
    document.title = meta.title;
    
    // Update meta description
    this.updateMetaTag('description', meta.description);
    this.updateMetaTag('keywords', meta.keywords);
    
    // Update Open Graph tags
    this.updateMetaProperty('og:title', meta.title);
    this.updateMetaProperty('og:description', meta.description);
    this.updateMetaProperty('og:url', window.location.href);
    
    // Update canonical URL
    this.updateCanonical(window.location.href);
  }

  generateSEOData(route) {
    switch (route.handler) {
      case 'home':
        return {
          title: 'Urban Jungle Co. - Your Premier Destination for All Green',
          description: 'Discover the Beauty of Nature at Your Fingertips. Premium plants, succulents, and garden accessories.',
          keywords: 'plants, indoor plants, outdoor plants, succulents, garden, home decor'
        };
        
      case 'shop':
        return {
          title: 'Shop Plants - Urban Jungle Co.',
          description: 'Browse our extensive collection of indoor plants, outdoor plants, succulents, and desert blooms.',
          keywords: 'shop plants, buy plants online, indoor plants, outdoor plants, succulents'
        };
        
      case 'product':
        const product = this.app.products.find(p => p.slug === route.params.slug);
        return product ? {
          title: `${product.name} - Urban Jungle Co.`,
          description: product.description,
          keywords: `${product.name}, ${product.category}, plants, buy online`
        } : this.getDefaultSEO();
        
      case 'category':
        const categoryName = this.formatCategoryName(route.params.category);
        return {
          title: `${categoryName} - Urban Jungle Co.`,
          description: `Explore our ${categoryName.toLowerCase()} collection.`,
          keywords: `${categoryName}, plants, garden`
        };
        
      case 'about':
        return {
          title: 'About Us - Urban Jungle Co.',
          description: 'Learn about Urban Jungle Co. - your trusted partner in bringing nature into your living space.',
          keywords: 'about us, company, plant experts, garden specialists'
        };
        
      case 'contact':
        return {
          title: 'Contact Us - Urban Jungle Co.',
          description: 'Get in touch with our plant experts. Contact Urban Jungle Co. for plant care advice and support.',
          keywords: 'contact, support, plant care, customer service'
        };
        
      case 'cart':
        return {
          title: 'Shopping Cart - Urban Jungle Co.',
          description: 'Review your selected plants and complete your purchase.',
          keywords: 'shopping cart, checkout, buy plants'
        };
        
      default:
        return this.getDefaultSEO();
    }
  }

  getDefaultSEO() {
    return {
      title: 'Urban Jungle Co. - Your Premier Destination for All Green',
      description: 'Discover the Beauty of Nature at Your Fingertips.',
      keywords: 'plants, garden, home decor'
    };
  }

  updateMetaTag(name, content) {
    let meta = document.querySelector(`meta[name="${name}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = name;
      document.head.appendChild(meta);
    }
    meta.content = content;
  }

  updateMetaProperty(property, content) {
    let meta = document.querySelector(`meta[property="${property}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('property', property);
      document.head.appendChild(meta);
    }
    meta.content = content;
  }

  updateCanonical(url) {
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = url;
  }

  renderPage(route) {
    // Show loading
    const content = document.getElementById('content');
    content.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';
    
    // Render page content using app's template system
    setTimeout(() => {
      this.app.renderByTemplate(route.handler, route.params);
      content.classList.add('fade-in');
      setTimeout(() => content.classList.remove('fade-in'), 500);
      this.app.setupMobileMenu();
    }, 100);
  }

  updateNavigation() {
    const currentPath = window.location.pathname;
    document.querySelectorAll('.menu-item a, .mobile-menu-list a').forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (href === currentPath || (currentPath === '/' && href === '/home')) {
        link.classList.add('active');
      }
    });
  }

  formatCategoryName(slug) {
    return slug.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  handle404() {
    document.title = '404 - Page Not Found - Urban Jungle Co.';
    this.updateMetaTag('description', 'The page you are looking for could not be found.');
    this.app.render404();
  }

  generateBreadcrumbs(route) {
    const breadcrumbs = [{ name: 'Home', url: '/' }];
    
    switch (route.handler) {
      case 'shop':
        breadcrumbs.push({ name: 'Shop', url: '/shop' });
        break;
        
      case 'product':
        const product = this.app.products.find(p => p.slug === route.params.slug);
        if (product) {
          const categorySlug = product.category.toLowerCase().replace(/\s+/g, '-');
          breadcrumbs.push({ name: 'Shop', url: '/shop' });
          breadcrumbs.push({ name: product.category, url: `/category/${categorySlug}` });
          breadcrumbs.push({ name: product.name, url: `/product/${product.slug}`, current: true });
        }
        break;
        
      case 'category':
        const categoryName = this.formatCategoryName(route.params.category);
        breadcrumbs.push({ name: 'Shop', url: '/shop' });
        breadcrumbs.push({ name: categoryName, url: `/category/${route.params.category}`, current: true });
        break;
        
      case 'about':
        breadcrumbs.push({ name: 'About', url: '/about', current: true });
        break;
        
      case 'contact':
        breadcrumbs.push({ name: 'Contact', url: '/contact', current: true });
        break;
    }
    
    return breadcrumbs;
  }
}
