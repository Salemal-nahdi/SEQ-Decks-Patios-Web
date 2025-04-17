/**
 * Imgix Configuration and Utilities
 * This file provides a central place to manage Imgix settings for the website
 */

// Configure Imgix domain
const imgixDomain = "seqdecks.imgix.net";

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
        
    return `https://${imgixDomain}/${imagePath}${queryString ? '?' + queryString : ''}`;
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
    // Only apply to gallery items
    document.querySelectorAll('.gallery-item img').forEach(img => {
        // Skip if already processed or using external sources
        if (img.hasAttribute('data-imgix-processed') || img.src.startsWith('http')) {
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
function applyImgixToImages() {
    document.querySelectorAll('img').forEach(img => {
        const originalSrc = img.getAttribute('src');
        if (originalSrc && !originalSrc.includes(imgixDomain)) {
            // Skip external images or images already using Imgix
            if (!originalSrc.startsWith('http')) {
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
                
                // Set the src attribute to the default Imgix URL
                img.setAttribute('src', getImgixUrl(originalSrc, params));
                
                // Add srcset for responsive images (except logos)
                if (!params.hasOwnProperty('bg') || params.bg !== 'transparent') {
                    img.setAttribute('srcset', generateSrcset(originalSrc, params));
                    img.setAttribute('sizes', '(max-width: 768px) 100vw, 800px');
                }
                
                // Add responsive loading behavior
                img.setAttribute('loading', 'lazy');
            }
        }
    });
    
    // Update the hero background image in CSS if it exists
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        const heroBgImage = '489134129_17999939357779643_4730226159983703706_n.jpg';
        const imgixHeroBg = getImgixUrl(heroBgImage, heroImageParams);
        heroSection.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('${imgixHeroBg}')`;
    }
    
    // Enhance gallery images with picture elements for art direction
    // Run this after basic Imgix processing
    setTimeout(enhanceGalleryImages, 100);
}

// Initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', applyImgixToImages);

// Export functions for potential usage in other scripts
window.imgixUtils = {
    getImgixUrl,
    applyImgixToImages,
    generateSrcset,
    enhanceGalleryImages
}; 