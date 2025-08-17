/**
 * Custom Banner - Mobile Menu Functionality
 * Handles mobile hamburger menu toggle and outside click
 */

document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const menuToggle = document.querySelector('.custom-banner__menu-toggle');
  const mobileMenu = document.querySelector('.custom-banner__mobile-menu');
  const hamburgerIcon = document.querySelector('.hamburger-icon');
  const closeIcon = document.querySelector('.close-icon');
  
  // Initialize mobile menu functionality
  if (menuToggle && mobileMenu) {
    initializeMobileMenu();
  }
  
  /**
   * Initialize mobile menu toggle functionality
   */
  function initializeMobileMenu() {
    // Menu toggle click handler
    menuToggle.addEventListener('click', toggleMobileMenu);
    
    // Close menu when clicking outside
    document.addEventListener('click', handleOutsideClick);
  }
  
  /**
   * Toggle mobile menu open/close state
   */
  function toggleMobileMenu() {
    const isActive = mobileMenu.classList.contains('active');
    
    if (isActive) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  }
  
  /**
   * Open mobile menu
   */
  function openMobileMenu() {
    mobileMenu.classList.add('active');
    hamburgerIcon.style.display = 'none';
    closeIcon.style.display = 'block';
  }
  
  /**
   * Close mobile menu
   */
  function closeMobileMenu() {
    mobileMenu.classList.remove('active');
    hamburgerIcon.style.display = 'block';
    closeIcon.style.display = 'none';
  }
  
  /**
   * Handle clicks outside menu to close it
   * @param {Event} event - Click event
   */
  function handleOutsideClick(event) {
    if (!menuToggle.contains(event.target) && !mobileMenu.contains(event.target)) {
      closeMobileMenu();
    }
  }
});
