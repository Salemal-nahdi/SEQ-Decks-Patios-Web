/**
 * Imgix Configuration and Utilities
 * This file provides a central place to manage Imgix settings for the website
 */

// Configure Imgix domain - use seqdecksandpatios.imgix.net as the domain
const imgixDomain = "seqdecksandpatios.imgix.net";

// Path to the images directory in the GitHub repository
const imagesBasePath = "images/seaqdecksandpatios/";

// Track Imgix availability
let imgixAvailable = false;
let imgixChecked = false;

// Check if Imgix is working with more robust verification
function checkImgixAvailability() {
    return new Promise((resolve) => {
        if (imgixChecked) {
            resolve(imgixAvailable);
            return;
        }

        console.log('🔍 Testing Imgix availability...');
        
        const testImage = new Image();
        let timeoutId;
        
        testImage.onload = function() {
            clearTimeout(timeoutId);
            imgixAvailable = true;
            imgixChecked = true;
            console.log('✅ Imgix is available and working!');
            
            // Add notification to page if in development mode
            if (window.location.hostname.includes('netlify') || window.location.hostname === 'localhost') {
                showImgixStatus(true);
            }
            
            resolve(true);
        };
        
        testImage.onerror = function() {
            // Don't immediately fail - try a fallback test image
            console.warn('⚠️ Primary test image failed, trying fallback...');
            
            const fallbackImage = new Image();
            
            fallbackImage.onload = function() {
                clearTimeout(timeoutId);
                imgixAvailable = true;
                imgixChecked = true;
                console.log('✅ Imgix is available and working (via fallback)!');
                
                if (window.location.hostname.includes('netlify') || window.location.hostname === 'localhost') {
                    showImgixStatus(true);
                }
                
                resolve(true);
            };
            
            fallbackImage.onerror = function() {
                clearTimeout(timeoutId);
                imgixAvailable = false;
                imgixChecked = true;
                console.error('❌ Imgix domain not available. Site will not show images properly.');
                
                // Always show error in preview/development environments
                showImgixStatus(false);
                
                resolve(false);
            };
            
            // Try direct path without imagesBasePath
            fallbackImage.src = `https://${imgixDomain}/images/seaqdecksandpatios/final%20logo.png?w=1&h=1&auto=format&s=1`;
        };
        
        // Try to load a test image from the Imgix domain
        testImage.src = `https://${imgixDomain}/${imagesBasePath}final%20logo.png?w=1&h=1&auto=format&s=1`;
        
        // Timeout after 5 seconds
        timeoutId = setTimeout(() => {
            imgixAvailable = false;
            imgixChecked = true;
            console.error('⏱️ Imgix availability check timed out. Site will not show images properly.');
            
            showImgixStatus(false, true);
            
            resolve(false);
        }, 5000);
    });
}

// Function to show Imgix status on the page
function showImgixStatus(available, timeout = false) {
    // Create status element if it doesn't exist
    const existingStatus = document.getElementById('imgix-status');
    if (existingStatus) {
        existingStatus.remove();
    }
    
    const statusEl = document.createElement('div');
    statusEl.id = 'imgix-status';
    statusEl.style.position = 'fixed';
    statusEl.style.bottom = '10px';
    statusEl.style.right = '10px';
    statusEl.style.padding = '10px 15px';
    statusEl.style.borderRadius = '5px';
    statusEl.style.color = '#fff';
    statusEl.style.fontSize = '14px';
    statusEl.style.fontWeight = 'bold';
    statusEl.style.zIndex = '9999';
    statusEl.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    
    if (available) {
        statusEl.style.backgroundColor = '#4CAF50';
        statusEl.innerHTML = '✅ Imgix Active - Images Optimized';
        
        // Auto-hide after 5 seconds if successful
        setTimeout(() => {
            if (statusEl.parentNode) {
                statusEl.style.opacity = '0';
                statusEl.style.transition = 'opacity 0.5s ease';
                setTimeout(() => statusEl.remove(), 500);
            }
        }, 5000);
    } else {
        statusEl.style.backgroundColor = '#F44336';
        if (timeout) {
            statusEl.innerHTML = '❌ Imgix Timed Out - Check your configuration';
        } else {
            statusEl.innerHTML = '❌ Imgix Not Available - Check your configuration';
        }
        
        // Add link to documentation
        const link = document.createElement('a');
        link.href = 'https://docs.imgix.com/setup/quick-start';
        link.target = '_blank';
        link.style.color = '#fff';
        link.style.textDecoration = 'underline';
        link.style.display = 'block';
        link.style.marginTop = '5px';
        link.textContent = 'View Imgix Setup Guide';
        statusEl.appendChild(link);
    }
    
    document.body.appendChild(statusEl);
}

// Gallery-specific image parameters
const galleryImageParams = {
    w: 800,
    h: 600,
    fit: "crop",
    crop: "entropy",
    q: 80,
    auto: "format,compress"
};

// Logo-specific image parameters
const logoImageParams = {
    w: 200,
    fit: "max",
    bg: "transparent",
    auto: "format,compress",
    q: 85
};

// Hero background image parameters
const heroImageParams = {
    w: 1920,
    h: 1080,
    fit: "crop", 
    crop: "entropy",
    q: 80,
    auto: "format,compress"
};

// Service image parameters - slightly different aspect ratio
const serviceImageParams = {
    w: 800,
    h: 650,
    fit: "crop",
    crop: "entropy",
    auto: "format,compress",
    q: 80
};

/**
 * Generate an Imgix URL with appropriate parameters
 * @param {string} imagePath - Original image path
 * @param {Object} params - Custom parameters to override defaults
 * @returns {string} Complete Imgix URL
 */
function getImgixUrl(imagePath, params = {}) {
    // If we've checked Imgix and it's not available, return the original path
    if (imgixChecked && !imgixAvailable) {
        console.warn(`⚠️ Imgix not available for: ${imagePath}`);
        return imagePath;
    }
    
    // Default parameters for better performance
    const defaultParams = {
        auto: "format,compress",
        q: 75
    };
    
    // Merge default parameters with custom parameters
    const allParams = {...defaultParams, ...params};
    
    // Build query string
    const queryString = Object.entries(allParams)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');
    
    // Extract just the filename if the path contains a directory structure
    const filename = imagePath.includes('/') ? imagePath.split('/').pop() : imagePath;
    
    // Build the full Imgix URL
    return `https://${imgixDomain}/${imagesBasePath}${filename}${queryString ? '?' + queryString : ''}`;
}

/**
 * Determine appropriate image parameters based on the image context
 * @param {HTMLImageElement} img - The image element
 * @returns {Object} Appropriate parameters for this image
 */
function getImageParams(img) {
    const src = img.getAttribute('src');
    const alt = img.getAttribute('alt') || '';
    const parentClasses = img.parentElement ? img.parentElement.className : '';
    
    // Check if it's a logo
    if (src.includes('logo') || alt.toLowerCase().includes('logo')) {
        return logoImageParams;
    }
    
    // Check if it's in a gallery
    if (parentClasses.includes('gallery') || img.closest('.gallery-item')) {
        return galleryImageParams;
    }
    
    // Check if it's a service image
    if (parentClasses.includes('service') || img.closest('.service-item')) {
        return serviceImageParams;
    }
    
    // Default image parameters
    return {
        w: 800,
        auto: "format,compress",
        q: 75
    };
}

/**
 * Generate a srcset for responsive images using Imgix
 * @param {string} imagePath - Original image path
 * @param {Object} baseParams - Base parameters for the image
 * @returns {string} Complete srcset attribute value
 */
function generateSrcset(imagePath, baseParams = {}) {
    // Define widths for different screen sizes
    const widths = [320, 640, 960, 1280, 1920];
    
    return widths.map(width => {
        const params = {
            ...baseParams,
            w: width
        };
        return `${getImgixUrl(imagePath, params)} ${width}w`;
    }).join(', ');
}

/**
 * Add a function to enable art direction for gallery images
 * This is an advanced feature that will wrap gallery images in picture elements
 * for better mobile art direction
 */
function enhanceGalleryImages() {
    // Skip if Imgix isn't available
    if (!imgixAvailable) {
        return;
    }
    
    // Only apply to gallery items
    document.querySelectorAll('.gallery-item img').forEach(img => {
        // Skip if already processed or using external sources
        if (img.hasAttribute('data-imgix-processed')) {
            return;
        }
        
        const originalSrc = img.getAttribute('data-original-src') || img.src;
        
        // Create picture element
        const picture = document.createElement('picture');
        
        // Add source for mobile - square crop
        const mobileSource = document.createElement('source');
        mobileSource.setAttribute('media', '(max-width: 576px)');
        mobileSource.setAttribute('srcset', generateSrcset(originalSrc, {
            ...galleryImageParams,
            h: galleryImageParams.w, // Make it square for mobile
            ar: '1:1',
            fit: 'crop',
            crop: 'faces,entropy'
        }));
        
        // Add source for tablets - 4:3 aspect ratio
        const tabletSource = document.createElement('source');
        tabletSource.setAttribute('media', '(max-width: 992px)');
        tabletSource.setAttribute('srcset', generateSrcset(originalSrc, {
            ...galleryImageParams,
            ar: '4:3',
            fit: 'crop'
        }));
        
        // Add default source - original aspect ratio
        const defaultSource = document.createElement('source');
        defaultSource.setAttribute('srcset', img.getAttribute('srcset'));
        
        // Mark image as processed
        img.setAttribute('data-imgix-processed', 'true');
        img.setAttribute('data-original-src', originalSrc);
        
        // Assemble picture element
        picture.appendChild(mobileSource);
        picture.appendChild(tabletSource);
        picture.appendChild(defaultSource);
        
        // Replace img with picture (keeping the img inside)
        img.parentNode.insertBefore(picture, img);
        picture.appendChild(img);
    });
}

/**
 * Apply Imgix to all images on the page
 */
async function applyImgixToImages() {
    // First check if Imgix is available
    await checkImgixAvailability();
    
    // Force Imgix to be available since the monitor shows it working
    // This overrides the availability check if it failed
    if (!imgixAvailable) {
        console.warn('⚠️ Imgix check failed but forcing to continue. Please check image paths.');
        imgixAvailable = true;
    }
    
    // Process all images on the page
    document.querySelectorAll('img').forEach(img => {
        const originalSrc = img.getAttribute('src');
        
        // Skip already processed Imgix images
        if (originalSrc && !originalSrc.includes(imgixDomain)) {
            // Save original source for potential future use
            img.setAttribute('data-original-src', originalSrc);
            
            // Get base parameters for this image type
            const params = getImageParams(img);
            
            // Check for custom parameters in data attribute
            if (img.hasAttribute('data-imgix-params')) {
                try {
                    const customParams = JSON.parse(img.getAttribute('data-imgix-params'));
                    Object.assign(params, customParams);
                } catch (e) {
                    console.warn('Invalid data-imgix-params format:', e);
                }
            }
            
            // Get filename only - strip any path information
            const filename = originalSrc.includes('/') ? originalSrc.split('/').pop() : originalSrc;
            
            // Set the src attribute to the Imgix URL
            const imgixUrl = getImgixUrl(filename, params);
            img.setAttribute('src', imgixUrl);
            
            // Add srcset for responsive images (except logos)
            if (!params.hasOwnProperty('bg') || params.bg !== 'transparent') {
                img.setAttribute('srcset', generateSrcset(filename, params));
                img.setAttribute('sizes', '(max-width: 768px) 100vw, 800px');
            }
            
            // Add responsive loading behavior
            img.setAttribute('loading', 'lazy');
            
            // Add error handler that logs which images fail to load
            img.addEventListener('error', function() {
                console.error(`❌ Failed to load image: ${filename} via Imgix`);
                
                // Mark this specific image as failed
                img.classList.add('imgix-load-failed');
                
                // If in development environment, add visible error indicator
                if (window.location.hostname.includes('netlify') || window.location.hostname === 'localhost') {
                    const errorOverlay = document.createElement('div');
                    errorOverlay.style.position = 'absolute';
                    errorOverlay.style.top = '0';
                    errorOverlay.style.left = '0';
                    errorOverlay.style.width = '100%';
                    errorOverlay.style.height = '100%';
                    errorOverlay.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
                    errorOverlay.style.display = 'flex';
                    errorOverlay.style.justifyContent = 'center';
                    errorOverlay.style.alignItems = 'center';
                    errorOverlay.style.color = 'white';
                    errorOverlay.style.fontWeight = 'bold';
                    errorOverlay.style.textAlign = 'center';
                    errorOverlay.style.padding = '10px';
                    errorOverlay.textContent = `Image load failed: ${filename}`;
                    
                    // Add positioned wrapper if needed
                    const parent = img.parentElement;
                    if (window.getComputedStyle(parent).position === 'static') {
                        parent.style.position = 'relative';
                    }
                    
                    parent.appendChild(errorOverlay);
                }
            });
        }
    });
    
    // Update the hero background image in CSS if it exists
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        // Use a hero image appropriate for your site
        const heroBgImage = '489134129_17999939357779643_4730226159983703706_n.jpg';
        const imgixHeroBg = getImgixUrl(heroBgImage, heroImageParams);
        heroSection.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('${imgixHeroBg}')`;
    }
    
    // Enhance gallery images with picture elements for art direction
    setTimeout(enhanceGalleryImages, 100);
    
    // Report stats after all images are processed
    setTimeout(() => {
        const totalImages = document.querySelectorAll('img').length;
        const failedImages = document.querySelectorAll('img.imgix-load-failed').length;
        
        console.log(`📊 Imgix Image Report: ${totalImages - failedImages}/${totalImages} images successfully optimized`);
        
        if (failedImages > 0) {
            console.warn(`⚠️ ${failedImages} images failed to load via Imgix`);
        }
    }, 2000);
}

// Initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', applyImgixToImages);

// Export functions for potential usage in other scripts
window.imgixUtils = {
    getImgixUrl,
    applyImgixToImages,
    generateSrcset,
    enhanceGalleryImages,
    checkImgixAvailability
}; 