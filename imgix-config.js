/**
 * Imgix Configuration for SEQ Decks & Patios
 * 
 * This script handles the optimization of images through Imgix
 * by replacing standard image paths with Imgix-processed URLs.
 */

// Change this to your Imgix source domain after setup
const IMGIX_DOMAIN = 'seqdecks.imgix.net';

// Parameters for image optimization
const DEFAULT_PARAMS = {
  auto: 'format,compress', // Automatically choose best format and compress
  q: 75, // Quality (0-100)
  fit: 'max' // Fit behavior
};

// Initialize Imgix when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initImgix();
});

// Main initialization function
function initImgix() {
  // Process all images in the document
  const images = document.querySelectorAll('img');
  
  images.forEach(img => {
    const src = img.getAttribute('src');
    
    // Skip if already an Imgix URL or external URL
    if (src.includes(IMGIX_DOMAIN) || src.startsWith('http') || src.startsWith('//')) {
      return;
    }
    
    // Skip SVGs and data URLs
    if (src.endsWith('.svg') || src.startsWith('data:')) {
      return;
    }
    
    // Create optimized Imgix URL
    const imgixUrl = buildImgixUrl(src);
    
    // Update image source
    img.setAttribute('src', imgixUrl);
    
    // Add loading="lazy" for better performance
    if (!img.hasAttribute('loading')) {
      img.setAttribute('loading', 'lazy');
    }
  });
  
  // Process background images in CSS (for hero section)
  processBackgroundImages();
}

// Build Imgix URL with parameters
function buildImgixUrl(originalSrc) {
  // Remove leading slash if present
  const path = originalSrc.startsWith('/') ? originalSrc.substring(1) : originalSrc;
  
  // Create base URL
  let url = `https://${IMGIX_DOMAIN}/${encodeURIComponent(path)}`;
  
  // Add parameters
  url += '?';
  for (const [key, value] of Object.entries(DEFAULT_PARAMS)) {
    url += `${key}=${value}&`;
  }
  
  // Determine appropriate width based on viewport for responsive images
  const width = Math.min(window.innerWidth, 1600); // Cap at 1600px
  url += `w=${width}`;
  
  return url;
}

// Process background images in hero section
function processBackgroundImages() {
  const heroSection = document.querySelector('.hero');
  if (!heroSection) return;
  
  const computedStyle = window.getComputedStyle(heroSection);
  const backgroundImage = computedStyle.backgroundImage;
  
  // Extract image URL from background-image style
  const matches = /url\(['"]?([^'"')]+)['"]?\)/i.exec(backgroundImage);
  if (matches && matches[1]) {
    const originalBgUrl = matches[1];
    
    // Skip if already an Imgix URL
    if (originalBgUrl.includes(IMGIX_DOMAIN)) return;
    
    // Extract filename from URL or path
    const bgPath = originalBgUrl.split('/').pop();
    
    // Create Imgix URL with blur for hero (creates a nice effect)
    const imgixBgUrl = `https://${IMGIX_DOMAIN}/${encodeURIComponent(bgPath)}?auto=format,compress&q=75&w=${window.innerWidth}&fit=crop&crop=faces&blur=10`;
    
    // Update background image
    heroSection.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${imgixBgUrl})`;
  }
} 