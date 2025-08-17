/**
 * Custom Products Grid - Modal and Cart Functionality
 * Handles product modal display and add to cart with bundle logic
 */

document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const modal = document.getElementById('customProductModal');
  const modalBody = document.getElementById('modalBody');
  const modalClose = document.getElementById('modalClose');
  const imageButtons = document.querySelectorAll('.custom-products-grid__image-btn');
  
  // Initialize event listeners
  initializeEventListeners();
  
  /**
   * Initialize all event listeners
   */
  function initializeEventListeners() {
    // Product image click handlers
    imageButtons.forEach(button => {
      button.addEventListener('click', function() {
        const productHandle = this.dataset.productHandle;
        loadProductModal(productHandle);
      });
    });
    
    // Modal close handlers
    modalClose.addEventListener('click', closeModal);
    modal.querySelector('.custom-product-modal__backdrop').addEventListener('click', closeModal);
  }
  
  /**
   * Load product data and display modal
   * @param {string} handle - Product handle
   */
  function loadProductModal(handle) {
    fetch(`/products/${handle}?section_id=custom-product-modal`)
      .then(response => response.text())
      .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const productData = doc.querySelector('.custom-product-modal-content');
        
        if (productData) {
          modalBody.innerHTML = productData.innerHTML;
          modal.style.display = 'flex';
          modal.style.visibility = 'visible';
          document.body.style.overflow = 'hidden';
          initializeModalFunctionality();
        }
      })
      .catch(error => console.error('Error loading product:', error));
  }
  
  /**
   * Close modal and reset state
   */
  function closeModal() {
    modal.style.display = 'none';
    modal.style.visibility = 'hidden';
    document.body.style.overflow = '';
    modalBody.innerHTML = '';
  }
  
  /**
   * Initialize modal functionality after content load
   */
  function initializeModalFunctionality() {
    const form = modalBody.querySelector('form[action*="/cart/add"]');
    const variantSelects = modalBody.querySelectorAll('select[name*="options"], input[name*="options"]');
    
    // Handle variant changes
    variantSelects.forEach(select => {
      select.addEventListener('change', updateVariant);
    });
    
    // Initialize with current selection
    updateVariant();
    
    // Handle form submission
    if (form) {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        addToCart(form);
      });
    }
  }
  
  /**
   * Update variant selection and pricing
   */
  function updateVariant() {
    const form = modalBody.querySelector('form[action*="/cart/add"]');
    const productData = JSON.parse(modalBody.querySelector('[data-product-json]')?.textContent || '{}');
    
    // Collect selected options
    const selectedOptions = {};
    
    // Get dropdown selections
    form.querySelectorAll('select[name*="options"]').forEach(dropdown => {
      const optionName = dropdown.name.match(/options\[(.*?)\]/)[1];
      selectedOptions[optionName] = dropdown.value;
    });
    
    // Get radio button selections
    form.querySelectorAll('input[type="radio"][name*="options"]:checked').forEach(radio => {
      const optionName = radio.name.match(/options\[(.*?)\]/)[1];
      selectedOptions[optionName] = radio.value;
    });
    
    // Find matching variant
    const matchingVariant = productData.variants?.find(variant => {
      return variant.options.every((optionValue, index) => {
        const optionName = productData.options[index];
        return selectedOptions[optionName] === optionValue;
      });
    });
    
    if (matchingVariant) {
      // Update price
      const priceElement = modalBody.querySelector('.custom-modal-price');
      if (priceElement) {
        const price = (matchingVariant.price / 100).toFixed(2);
        priceElement.textContent = `$${price}`;
      }
      
      // Update hidden variant ID
      const variantInput = form.querySelector('input[name="id"]');
      if (variantInput) {
        variantInput.value = matchingVariant.id;
      }
      
      // Update availability
      const addToCartBtn = modalBody.querySelector('.custom-modal-add-to-cart');
      const addToCartBtnText = modalBody.querySelector('.custom-modal-add-to-cart span');
      if (addToCartBtn) {
        addToCartBtn.disabled = !matchingVariant.available;
        if (addToCartBtnText) {
          addToCartBtnText.textContent = matchingVariant.available ? 'ADD TO CART' : 'SOLD OUT';
        }
      }
    }
  }
  
  /**
   * Add product to cart and handle bundle logic
   * @param {HTMLFormElement} form - Product form
   */
  function addToCart(form) {
    const formData = new FormData(form);
    const addToCartBtn = form.querySelector('.custom-modal-add-to-cart');
    const originalText = addToCartBtn.textContent;
    
    // Update button state
    addToCartBtn.disabled = true;
    addToCartBtn.textContent = 'ADDING...';
    
    // Add main product to cart
    fetch('/cart/add.js', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      if (data.status && data.status === 422) {
        throw new Error(data.description || 'Error adding to cart');
      }
      
      // Check for bundle condition (Black + M)
      const selectedOptions = {};
      
      // Collect all selected options
      const dropdowns = form.querySelectorAll('select[name*="options"]');
      const radioButtons = form.querySelectorAll('input[type="radio"][name*="options"]:checked');
      
      dropdowns.forEach(dropdown => {
        const optionName = dropdown.name.match(/options\[(.*?)\]/)[1];
        selectedOptions[optionName] = dropdown.value;
      });
      
      radioButtons.forEach(radio => {
        const optionName = radio.name.match(/options\[(.*?)\]/)[1];
        selectedOptions[optionName] = radio.value;
      });
      
      // Auto-add bundle if Black and M are selected
      if (selectedOptions['Color'] === 'Black' && selectedOptions['Size'] === 'M') {
        addBundleProduct();
      }
      
      // Update cart UI
      updateCartUI();
      closeModal();
      showCartNotification('Product added to cart!');
    })
    .catch(error => {
      console.error('Error:', error);
      showCartNotification('Error adding product to cart', 'error');
    })
    .finally(() => {
      addToCartBtn.disabled = false;
      addToCartBtn.textContent = originalText;
    });
  }
  
  /**
   * Add bundle product (Dark Winter Jacket) to cart
   */
  function addBundleProduct() {
    const bundleVariantId = '50940597928238';
    const bundleFormData = new FormData();
    bundleFormData.append('id', bundleVariantId);
    bundleFormData.append('quantity', '1');
    
    fetch('/cart/add.js', {
      method: 'POST',
      body: bundleFormData
    })
    .then(response => response.json())
    .then(data => {
      if (data && !data.status) {
        showCartNotification('Bonus "Dark Winter Jacket" added to cart!');
        updateCartUI();
      }
    })
    .catch(error => {
      console.error('Bundle product error:', error);
    });
  }
  
  /**
   * Update cart UI after additions
   */
  function updateCartUI() {
    fetch('/cart.js')
      .then(response => response.json())
      .then(cart => {
        document.dispatchEvent(new CustomEvent('cart:updated', { detail: cart }));
      });
  }
  
  /**
   * Show cart notification
   * @param {string} message - Notification message
   * @param {string} type - Notification type (success/error)
   */
  function showCartNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `cart-notification cart-notification--${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'error' ? '#dc3545' : '#28a745'};
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 4px;
      z-index: 10000;
      font-size: 14px;
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  }
});
