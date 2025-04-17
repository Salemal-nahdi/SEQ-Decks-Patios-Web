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
let imgixCheckPromise = null;

// A mapping of already processed image URLs for caching
const processedImagesCache = new Map();

// Check if Imgix is working with more robust verification - optimized with caching
function checkImgixAvailability() {
    // Return existing promise if already checking
    if (imgixCheckPromise) {
        return imgixCheckPromise;
    }
    
    // Return cached result if already checked
    if (imgixChecked) {
        return Promise.resolve(imgixAvailable);
    }

    console.log('🔍 Testing Imgix availability...');
    
    // Create new promise and store it
    imgixCheckPromise = new Promise((resolve) => {
        const testImage = new Image();
        let timeoutId;
        
        testImage.onload = function() {
            clearTimeout(timeoutId);
            imgixAvailable = true;
            imgixChecked = true;
            imgixCheckPromise = null;
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
                imgixCheckPromise = null;
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
                imgixCheckPromise = null;
                console.error('❌ Imgix domain not available. Site will not show images properly.');
                
                // Always show error in preview/development environments
                showImgixStatus(false);
                
                resolve(false);
            };
            
            // Try direct path without imagesBasePath - with cache buster
            fallbackImage.src = `https://${imgixDomain}/images/seaqdecksandpatios/final%20logo.png?w=1&h=1&auto=format&s=${Date.now()}`;
        };
        
        // Try to load a test image from the Imgix domain - with cache buster
        testImage.src = `https://${imgixDomain}/${imagesBasePath}final%20logo.png?w=1&h=1&auto=format&s=${Date.now()}`;
        
        // Timeout after 3 seconds (reduced from 5s for faster loading)
        timeoutId = setTimeout(() => {
            imgixAvailable = false;
            imgixChecked = true;
            imgixCheckPromise = null;
            console.error('⏱️ Imgix availability check timed out. Site will not show images properly.');
            
            showImgixStatus(false, true);
            
            resolve(false);
        }, 3000);
    });
    
    return imgixCheckPromise;
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
        
        // Auto-hide after 3 seconds if successful (reduced from 5s)
        setTimeout(() => {
            if (statusEl.parentNode) {
                statusEl.style.opacity = '0';
                statusEl.style.transition = 'opacity 0.5s ease';
                setTimeout(() => statusEl.remove(), 500);
            }
        }, 3000);
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

// Optimized image parameter sets with WebP format by default
const galleryImageParams = {
    w: 800,
    h: 600,
    fit: "crop",
    crop: "entropy",
    q: 80,
    auto: "format,compress",
    fm: "webp"
};

const logoImageParams = {
    w: 200,
    fit: "max",
    bg: "transparent",
    auto: "format,compress",
    q: 85
};

const heroImageParams = {
    w: 1920,
    fit: "max", 
    q: 80,
    auto: "format,compress",
    fm: "webp"
};

const serviceImageParams = {
    w: 800,
    h: 650,
    fit: "crop",
    crop: "entropy",
    auto: "format,compress",
    q: 80,
    fm: "webp"
};

/**
 * Generate an Imgix URL with appropriate parameters - optimized with caching
 * @param {string} imagePath - Original image path
 * @param {Object} params - Custom parameters to override defaults
 * @returns {string} Complete Imgix URL
 */
function getImgixUrl(imagePath, params = {}) {
    // Generate cache key
    const cacheKey = `${imagePath}-${JSON.stringify(params)}`;
    
    // Check cache first
    if (processedImagesCache.has(cacheKey)) {
        return processedImagesCache.get(cacheKey);
    }
    
    const baseParams = {
        auto: 'format,compress',
        q: 75,
        fit: 'max',
        fm: 'webp',
        expires: 31536000 // 1 year cache
    };
    
    // Merge baseParams with custom params, allowing custom params to override defaults
    const mergedParams = { ...baseParams, ...params };
    
    const queryString = Object.entries(mergedParams)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');
    
    const result = imgixAvailable ? 
        `https://${imgixDomain}/${imagesBasePath}${imagePath}?${queryString}` : 
        `images/${imagePath}`;
    
    // Store in cache
    processedImagesCache.set(cacheKey, result);
    
    return result;
}

// Function to preload critical images efficiently
function preloadCriticalImages() {
    // Use requestIdleCallback to not block rendering
    const preloadFunc = () => {
        // Preload hero image with high priority
        const heroBgImage = '489134129_17999939357779643_4730226159983703706_n.jpg';
        const imgixHeroBg = getImgixUrl(heroBgImage, heroImageParams);
        
        if (!document.querySelector(`link[rel="preload"][href="${imgixHeroBg}"]`)) {
            const preloadLink = document.createElement('link');
            preloadLink.rel = 'preload';
            preloadLink.as = 'image';
            preloadLink.href = imgixHeroBg;
            preloadLink.setAttribute('fetchpriority', 'high');
            document.head.appendChild(preloadLink);
        }
        
        // Preload logo with medium priority
        const logoImg = getImgixUrl('final logo.png', logoImageParams);
        if (!document.querySelector(`link[rel="preload"][href="${logoImg}"]`)) {
            const preloadLogo = document.createElement('link');
            preloadLogo.rel = 'preload';
            preloadLogo.as = 'image';
            preloadLogo.href = logoImg;
            document.head.appendChild(preloadLogo);
        }
    };
    
    if ('requestIdleCallback' in window) {
        requestIdleCallback(preloadFunc, { timeout: 2000 });
    } else {
        setTimeout(preloadFunc, 200);
    }
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
        q: 75,
        fm: "webp"
    };
}

/**
 * Generate a srcset for responsive images using Imgix - optimized for fewer sizes
 * @param {string} imagePath - Original image path
 * @param {Object} baseParams - Base parameters for the image
 * @returns {string} Complete srcset attribute value
 */
function generateSrcset(imagePath, baseParams = {}) {
    // Define widths for different screen sizes - reduced to just 3 sizes
    const widths = [400, 800, 1200];
    
    // Check cache
    const cacheKey = `srcset-${imagePath}-${JSON.stringify(baseParams)}`;
    if (processedImagesCache.has(cacheKey)) {
        return processedImagesCache.get(cacheKey);
    }
    
    const srcset = widths.map(width => {
        const params = {
            ...baseParams,
            w: width,
            fm: 'webp' // Use WebP format for better compression
        };
        return `${getImgixUrl(imagePath, params)} ${width}w`;
    }).join(', ');
    
    // Store in cache
    processedImagesCache.set(cacheKey, srcset);
    
    return srcset;
}

/**
 * Enhance gallery images with optimized picture elements
 */
function enhanceGalleryImages() {
    // Skip if Imgix isn't available
    if (!imgixAvailable) {
        return;
    }
    
    // Optimize by processing in chunks to avoid blocking the main thread
    const galleryImages = [...document.querySelectorAll('.gallery-item img')];
    const chunkSize = 5;
    
    // Process images in chunks
    function processImageChunk(startIndex) {
        const endIndex = Math.min(startIndex + chunkSize, galleryImages.length);
        
        for (let i = startIndex; i < endIndex; i++) {
            const img = galleryImages[i];
            
            // Skip if already processed or using external sources
            if (img.hasAttribute('data-imgix-processed')) {
                continue;
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
        }
        
        // Process next chunk if there are more images
        if (endIndex < galleryImages.length) {
            if ('requestIdleCallback' in window) {
                requestIdleCallback(() => processImageChunk(endIndex), { timeout: 1000 });
            } else {
                setTimeout(() => processImageChunk(endIndex), 10);
            }
        }
    }
    
    // Start processing the first chunk
    if (galleryImages.length > 0) {
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => processImageChunk(0), { timeout: 1000 });
        } else {
            setTimeout(() => processImageChunk(0), 10);
        }
    }
}

/**
 * Apply Imgix to all images on the page - optimized for performance
 */
async function applyImgixToImages() {
    // First check if Imgix is available
    await checkImgixAvailability();
    
    // Force Imgix to be available only in development environments
    if (!imgixAvailable && (window.location.hostname.includes('netlify') || window.location.hostname === 'localhost')) {
        console.warn('⚠️ Imgix check failed but forcing to continue in development environment. Please check image paths.');
        imgixAvailable = true;
    }
    
    // Preload critical images
    preloadCriticalImages();
    
    // Use Intersection Observer for lazy loading
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                processImage(img);
                imageObserver.unobserve(img);
            }
        });
    }, {
        rootMargin: '200px' // Start loading images when they're 200px from viewport
    });
    
    // Process all images on the page with optimized processing
    function processImage(img) {
        const originalSrc = img.getAttribute('src');
        
        // Skip already processed Imgix images or external images
        if (originalSrc && !originalSrc.includes(imgixDomain) && !originalSrc.startsWith('http')) {
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
            img.setAttribute('decoding', 'async');
            
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
                
                // Try to load the original image as fallback
                if (originalSrc) {
                    console.log(`🔄 Trying to load original image: ${originalSrc}`);
                    img.src = originalSrc;
                }
            });
        }
    }
    
    // Immediately process images above the fold, observe others
    document.querySelectorAll('img').forEach((img, index) => {
        // Process first 5 images immediately (likely above the fold)
        if (index < 5) {
            processImage(img);
        } else {
            // Observe others for intersection
            imageObserver.observe(img);
        }
    });
    
    // Update the hero background image in CSS if it exists - high priority
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        // Use a hero image appropriate for your site
        const heroBgImage = '489134129_17999939357779643_4730226159983703706_n.jpg';
        
        // Use Imgix if available, otherwise use local image
        const imgixHeroBg = imgixAvailable ? 
            getImgixUrl(heroBgImage, heroImageParams) : 
            `images/${heroBgImage}`;
            
        // Set the background image with fallback
        try {
            // Apply the image directly without waiting
            heroSection.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('${imgixHeroBg}')`;
            
            // Add a backup inline style with fallback image if needed
            if (imgixAvailable) {
                const fallbackImg = new Image();
                fallbackImg.src = imgixHeroBg;
                fallbackImg.onerror = function() {
                    console.error('❌ Hero background failed to load via Imgix, using fallback');
                    heroSection.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('images/${heroBgImage}')`;
                };
            }
        } catch (e) {
            console.error('Error setting hero background:', e);
            // Fallback to a solid color if all else fails
            heroSection.style.backgroundColor = '#3b5d50';
        }
    }
    
    // Enhance gallery images with picture elements for art direction - defer this work
    if ('requestIdleCallback' in window) {
        requestIdleCallback(enhanceGalleryImages, { timeout: 2000 });
    } else {
        setTimeout(enhanceGalleryImages, 1000);
    }
    
    // Report stats after all images are processed - only in dev mode
    if (window.location.hostname.includes('netlify') || window.location.hostname === 'localhost') {
        setTimeout(() => {
            const totalImages = document.querySelectorAll('img').length;
            const failedImages = document.querySelectorAll('img.imgix-load-failed').length;
            
            console.log(`📊 Imgix Image Report: ${totalImages - failedImages}/${totalImages} images successfully optimized`);
            
            if (failedImages > 0) {
                console.warn(`⚠️ ${failedImages} images failed to load via Imgix`);
            }
        }, 3000);
    }
}

// Initialize when the DOM is loaded - use DOMContentLoaded for faster response
document.addEventListener('DOMContentLoaded', () => {
    // Use requestIdleCallback to not block rendering
    if ('requestIdleCallback' in window) {
        requestIdleCallback(applyImgixToImages, { timeout: 2000 });
    } else {
        // Fallback for browsers that don't support requestIdleCallback
        setTimeout(applyImgixToImages, 200);
    }
});

// Export functions for potential usage in other scripts
window.imgixUtils = {
    getImgixUrl,
    applyImgixToImages,
    generateSrcset,
    enhanceGalleryImages,
    checkImgixAvailability
};