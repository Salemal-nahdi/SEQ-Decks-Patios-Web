/**
 * Imgix Configuration and Utilities
 * This file provides a central place to manage Imgix settings for the website
 */

// Configure Imgix domain - use seqdecksandpatios.imgix.net as the domain
const imgixDomain = "seqdecksandpatios.imgix.net";

// Path to the images directory in the GitHub repository
const imagesBasePath = "images/seaqdecksandpatios/";

// Track Imgix availability - use a global module pattern to avoid polluting global scope
const ImgixLoader = (function() {
    // Private variables
    let imgixAvailable = false;
    let imgixChecked = false;
    let imgixCheckPromise = null;
    
    // Cache system for processed URLs
    const processedImagesCache = new Map();
    const pendingImageOperations = [];
    
    // Core image parameter sets
    const imageParams = {
        gallery: {
            w: 800,
            h: 600,
            fit: "crop",
            crop: "entropy",
            q: 80,
            auto: "format",
            fm: "webp"
        },
        logo: {
            w: 200,
            fit: "max",
            bg: "transparent",
            auto: "format",
            q: 85
        },
        hero: {
            w: 1920,
            fit: "max", 
            q: 80,
            auto: "format",
            fm: "webp"
        },
        service: {
            w: 800,
            h: 650,
            fit: "crop",
            crop: "entropy",
            auto: "format",
            q: 80,
            fm: "webp"
        }
    };
    
    /**
     * Core function to generate an Imgix URL - optimized with caching
     */
    function getImgixUrl(imagePath, params = {}) {
        // Skip processing for empty paths
        if (!imagePath) return '';
        
        // Special case for hero image - always use local path for guaranteed loading
        if (imagePath.includes('489134129_17999939357779643_4730226159983703706_n.jpg')) {
            return 'images/' + imagePath.split('/').pop();
        }
        
        // Generate cache key for exact parameter combination
        const cacheKey = `${imagePath}-${JSON.stringify(params)}`;
        
        // Return from cache if available
        if (processedImagesCache.has(cacheKey)) {
            return processedImagesCache.get(cacheKey);
        }
        
        // Apply default parameters
        const baseParams = {
            auto: 'format',
            q: 75,
            fit: 'max',
            fm: 'webp',
            expires: 31536000 // 1 year cache
        };
        
        // Merge parameters with custom overrides
        const mergedParams = { ...baseParams, ...params };
        
        // Build query string efficiently
        const queryString = Object.entries(mergedParams)
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
            .join('&');
        
        // Generate final URL based on Imgix availability
        const result = imgixAvailable ? 
            `https://${imgixDomain}/${imagesBasePath}${imagePath}?${queryString}` : 
            `images/${imagePath}`;
        
        // Store in cache for future reuse
        processedImagesCache.set(cacheKey, result);
        
        return result;
    }
    
    /**
     * Check if Imgix is available with optimized verification
     */
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
        
        // Create new promise for availability check
        imgixCheckPromise = new Promise((resolve) => {
            // Try loading a small test image
            const testImage = new Image();
            let timeoutId;
            
            // Setup success handler
            testImage.onload = function() {
                clearTimeout(timeoutId);
                imgixAvailable = true;
                imgixChecked = true;
                imgixCheckPromise = null;
                console.log('✅ Imgix is available and working!');
                
                // Show status notification in dev environments
                if (window.location.hostname.includes('netlify') || window.location.hostname === 'localhost') {
                    showImgixStatus(true);
                }
                
                // Process any pending image operations
                processQueue();
                
                resolve(true);
            };
            
            // Setup error handler
            testImage.onerror = function() {
                // Try fallback before failing
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
                    
                    // Process any pending image operations
                    processQueue();
                    
                    resolve(true);
                };
                
                fallbackImage.onerror = function() {
                    clearTimeout(timeoutId);
                    imgixAvailable = false;
                    imgixChecked = true;
                    imgixCheckPromise = null;
                    console.error('❌ Imgix domain not available. Using fallback image paths.');
                    
                    // Set hero background directly with local path
                    const heroSection = document.querySelector('.hero');
                    if (heroSection) {
                        heroSection.style.backgroundImage = 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(images/489134129_17999939357779643_4730226159983703706_n.jpg)';
                    }
                    
                    // Show error notification
                    showImgixStatus(false);
                    
                    // Process queue with fallback paths
                    processQueue();
                    
                    resolve(false);
                };
                
                // Try direct path with cache buster
                fallbackImage.src = `https://${imgixDomain}/images/seaqdecksandpatios/final%20logo.png?w=1&h=1&s=${Date.now()}`;
            };
            
            // Start loading test image with cache buster
            testImage.src = `https://${imgixDomain}/${imagesBasePath}final%20logo.png?w=1&h=1&s=${Date.now()}`;
            
            // Set timeout for 2.5 seconds
            timeoutId = setTimeout(() => {
                imgixAvailable = false;
                imgixChecked = true;
                imgixCheckPromise = null;
                console.error('⏱️ Imgix availability check timed out. Using fallback image paths.');
                
                // Set hero background directly with local path
                const heroSection = document.querySelector('.hero');
                if (heroSection) {
                    heroSection.style.backgroundImage = 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(images/489134129_17999939357779643_4730226159983703706_n.jpg)';
                }
                
                // Show timeout notification
                showImgixStatus(false, true);
                
                // Process queue with fallback paths
                processQueue();
                
                resolve(false);
            }, 2000); // Reduced timeout for faster fallback
        });
        
        return imgixCheckPromise;
    }
    
    /**
     * Display Imgix status for developers
     */
    function showImgixStatus(available, timeout = false) {
        // Only show in development
        if (!window.location.hostname.includes('netlify') && window.location.hostname !== 'localhost') {
            return;
        }
        
        // Remove existing status element
        const existingStatus = document.getElementById('imgix-status');
        if (existingStatus) {
            existingStatus.remove();
        }
        
        // Create status element
        const statusEl = document.createElement('div');
        statusEl.id = 'imgix-status';
        statusEl.style.cssText = 
            'position:fixed;bottom:10px;right:10px;padding:10px 15px;border-radius:5px;' +
            'color:#fff;font-size:14px;font-weight:bold;z-index:9999;box-shadow:0 2px 10px rgba(0,0,0,0.2);';
        
        if (available) {
            statusEl.style.backgroundColor = '#4CAF50';
            statusEl.innerHTML = '✅ Imgix Active - Images Optimized';
            
            // Auto-hide after 2 seconds if successful
            setTimeout(() => {
                if (statusEl.parentNode) {
                    statusEl.style.opacity = '0';
                    statusEl.style.transition = 'opacity 0.5s ease';
                    setTimeout(() => statusEl.remove(), 500);
                }
            }, 2000);
        } else {
            statusEl.style.backgroundColor = '#F44336';
            statusEl.innerHTML = timeout ? 
                '❌ Imgix Timed Out - Check your configuration' : 
                '❌ Imgix Not Available - Check your configuration';
            
            // Add documentation link
            const link = document.createElement('a');
            link.href = 'https://docs.imgix.com/setup/quick-start';
            link.target = '_blank';
            link.style.cssText = 'color:#fff;text-decoration:underline;display:block;margin-top:5px;';
            link.textContent = 'View Imgix Setup Guide';
            statusEl.appendChild(link);
        }
        
        document.body.appendChild(statusEl);
    }
    
    /**
     * Process an image with Imgix
     */
    function processImage(img) {
        // Skip already processed or external images
        const originalSrc = img.getAttribute('src');
        if (!originalSrc || originalSrc.includes(imgixDomain) || originalSrc.startsWith('http')) {
            return;
        }
        
        // Save original source
        img.setAttribute('data-original-src', originalSrc);
        
        // Get appropriate parameters
        let params = getImageParams(img);
        
        // Check for custom parameters in data attribute
        if (img.hasAttribute('data-imgix-params')) {
            try {
                const customParams = JSON.parse(img.getAttribute('data-imgix-params'));
                params = { ...params, ...customParams };
            } catch (e) {
                console.warn('Invalid data-imgix-params format');
            }
        }
        
        // Extract filename from path
        const filename = originalSrc.split('/').pop();
        
        // Set Imgix URL
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
        
        // Add error handler for fallback
        img.addEventListener('error', function() {
            // Log the failure
            console.error(`❌ Failed to load image: ${filename} via Imgix`);
            
            // Mark image as failed
            img.classList.add('imgix-load-failed');
            
            // In development, show visual indicator
            if (window.location.hostname.includes('netlify') || window.location.hostname === 'localhost') {
                // Create error overlay
                const errorOverlay = document.createElement('div');
                errorOverlay.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;' +
                    'background-color:rgba(255,0,0,0.3);display:flex;justify-content:center;' +
                    'align-items:center;color:white;font-weight:bold;text-align:center;padding:10px;';
                errorOverlay.textContent = `Image load failed: ${filename}`;
                
                // Position parent if needed
                const parent = img.parentElement;
                if (window.getComputedStyle(parent).position === 'static') {
                    parent.style.position = 'relative';
                }
                
                parent.appendChild(errorOverlay);
            }
            
            // Try original image as fallback
            if (originalSrc) {
                console.log(`🔄 Trying original image: ${originalSrc}`);
                img.src = originalSrc;
            }
        });
    }
    
    /**
     * Process all pending operations
     */
    function processQueue() {
        if (pendingImageOperations.length > 0) {
            console.log(`Processing ${pendingImageOperations.length} pending image operations`);
            
            // Process in chunks to avoid blocking
            const processChunk = (startIndex, chunkSize) => {
                const endIndex = Math.min(startIndex + chunkSize, pendingImageOperations.length);
                
                for (let i = startIndex; i < endIndex; i++) {
                    try {
                        pendingImageOperations[i]();
                    } catch (e) {
                        console.error('Error processing image operation:', e);
                    }
                }
                
                // Process next chunk if there are more
                if (endIndex < pendingImageOperations.length) {
                    setTimeout(() => processChunk(endIndex, chunkSize), 0);
                } else {
                    // Clear the queue when done
                    pendingImageOperations.length = 0;
                }
            };
            
            // Start processing chunks
            processChunk(0, 5);
        }
    }
    
    /**
     * Determine parameters based on image context
     */
    function getImageParams(img) {
        const src = img.getAttribute('src') || '';
        const alt = img.getAttribute('alt') || '';
        const parentClasses = img.parentElement ? img.parentElement.className : '';
        
        // Check if it's a logo
        if (src.includes('logo') || alt.toLowerCase().includes('logo')) {
            return imageParams.logo;
        }
        
        // Check if it's in a gallery
        if (parentClasses.includes('gallery') || img.closest('.gallery-item')) {
            return imageParams.gallery;
        }
        
        // Check if it's a service image
        if (parentClasses.includes('service') || img.closest('.service-item')) {
            return imageParams.service;
        }
        
        // Default parameters
        return {
            w: 800,
            auto: "format",
            q: 75,
            fm: "webp"
        };
    }
    
    /**
     * Generate a responsive srcset
     */
    function generateSrcset(imagePath, baseParams = {}) {
        // Special case for hero image - don't generate srcset
        if (imagePath.includes('489134129_17999939357779643_4730226159983703706_n.jpg')) {
            return '';
        }
        
        // Optimized for minimal sizes
        const widths = [400, 800, 1200];
        
        // Check cache first
        const cacheKey = `srcset-${imagePath}-${JSON.stringify(baseParams)}`;
        if (processedImagesCache.has(cacheKey)) {
            return processedImagesCache.get(cacheKey);
        }
        
        // Generate srcset with widths
        const srcset = widths.map(width => {
            const params = {
                ...baseParams,
                w: width,
                fm: 'webp'
            };
            return `${getImgixUrl(imagePath, params)} ${width}w`;
        }).join(', ');
        
        // Cache for reuse
        processedImagesCache.set(cacheKey, srcset);
        
        return srcset;
    }
    
    /**
     * Update hero background image
     */
    function applyHeroBackground() {
        const heroSection = document.querySelector('.hero');
        if (!heroSection) return;
        
        // Direct reference to local hero image for guaranteed loading
        heroSection.style.backgroundImage = 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(images/489134129_17999939357779643_4730226159983703706_n.jpg)';
        
        // Only try imgix if available and not in fallback mode
        if (imgixAvailable) {
            const heroBgImage = new Image();
            heroBgImage.onload = function() {
                heroSection.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('${heroBgImage.src}')`;
            };
            heroBgImage.src = `https://${imgixDomain}/${imagesBasePath}489134129_17999939357779643_4730226159983703706_n.jpg?w=1920&fit=max&q=80&auto=format&fm=webp`;
        }
    }
    
    /**
     * Add picture elements to gallery images
     */
    function enhanceGalleryImages() {
        if (!imgixAvailable) return;
        
        // Find all gallery images
        const galleryImages = [...document.querySelectorAll('.gallery-item img')];
        if (!galleryImages.length) return;
        
        // Enhanced image processing with IntersectionObserver
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                
                const img = entry.target;
                observer.unobserve(img);
                
                // Skip if already processed
                if (img.hasAttribute('data-enhanced')) return;
                img.setAttribute('data-enhanced', 'true');
                
                // Get source path
                const originalSrc = img.getAttribute('data-original-src') || img.getAttribute('src');
                if (!originalSrc) return;
                
                const filename = originalSrc.split('/').pop();
                
                // Create picture element
                const picture = document.createElement('picture');
                
                // Mobile source (square)
                const mobileSource = document.createElement('source');
                mobileSource.setAttribute('media', '(max-width: 576px)');
                mobileSource.setAttribute('srcset', generateSrcset(filename, {
                    ...imageParams.gallery,
                    ar: '1:1',
                    fit: 'crop',
                    crop: 'faces,entropy'
                }));
                
                // Tablet source (4:3)
                const tabletSource = document.createElement('source');
                tabletSource.setAttribute('media', '(max-width: 992px)');
                tabletSource.setAttribute('srcset', generateSrcset(filename, {
                    ...imageParams.gallery,
                    ar: '4:3',
                    fit: 'crop'
                }));
                
                // Add all sources to picture
                picture.appendChild(mobileSource);
                picture.appendChild(tabletSource);
                
                // Replace img with picture
                if (img.parentNode) {
                    img.parentNode.insertBefore(picture, img);
                    picture.appendChild(img);
                }
            });
        }, { rootMargin: '200px' });
        
        // Start observing gallery images
        galleryImages.forEach(img => observer.observe(img));
    }
    
    /**
     * Main function to apply Imgix to page images
     */
    async function applyImgixToImages() {
        // Apply the hero background first with local path for guaranteed rendering
        applyHeroBackground();
        
        // Then check Imgix availability for other images
        await checkImgixAvailability();
        
        // Use Intersection Observer for lazy image processing
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        processImage(img);
                        observer.unobserve(img);
                    }
                });
            }, { rootMargin: '200px' });
            
            // Process top images immediately, observe others
            document.querySelectorAll('img').forEach((img, index) => {
                if (index < 5) {
                    processImage(img);
                } else {
                    observer.observe(img);
                }
            });
            
            // Enhance gallery images when idle
            if ('requestIdleCallback' in window) {
                requestIdleCallback(() => enhanceGalleryImages(), { timeout: 2000 });
            } else {
                setTimeout(enhanceGalleryImages, 1000);
            }
            
            // Log stats in development
            if (window.location.hostname.includes('netlify') || window.location.hostname === 'localhost') {
                setTimeout(() => {
                    const totalImages = document.querySelectorAll('img').length;
                    const failedImages = document.querySelectorAll('img.imgix-load-failed').length;
                    console.log(`📊 Imgix: ${totalImages - failedImages}/${totalImages} images optimized`);
                }, 3000);
            }
        } else {
            // Fallback for older browsers
            document.querySelectorAll('img').forEach(img => processImage(img));
        }
    }
    
    // Public API
    return {
        init: function() {
            // Start when DOM is ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    // Priority 1: Set the hero image immediately for fastest LCP
                    applyHeroBackground();
                    
                    // Priority 2: Process critical images
                    if ('requestIdleCallback' in window) {
                        requestIdleCallback(() => applyImgixToImages(), { timeout: 2000 });
                    } else {
                        setTimeout(applyImgixToImages, 200);
                    }
                });
            } else {
                // DOM already loaded - apply immediately
                applyHeroBackground();
                setTimeout(applyImgixToImages, 0);
            }
        },
        getUrl: getImgixUrl,
        checkAvailability: checkImgixAvailability,
        getDomain: () => imgixDomain,
        isAvailable: () => imgixAvailable
    };
})();

// Initialize Imgix - Start immediately for faster performance
ImgixLoader.init();

// Export utils to window
window.imgixUtils = {
    getImgixUrl: ImgixLoader.getUrl,
    checkImgixAvailability: ImgixLoader.checkAvailability,
    getDomain: ImgixLoader.getDomain,
    isAvailable: ImgixLoader.isAvailable
};