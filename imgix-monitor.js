/**
 * Imgix Performance Monitoring
 * Simple utility to track image performance improvements
 */

// Initialize performance tracking
document.addEventListener('DOMContentLoaded', () => {
    // Wait for images to load
    window.addEventListener('load', () => {
        setTimeout(measureImagePerformance, 500);
    });
});

/**
 * Measure image performance metrics
 */
function measureImagePerformance() {
    // Get all images on the page
    const allImages = Array.from(document.querySelectorAll('img'));
    
    // Check if Imgix is available (defined in the imgix-config.js file)
    const imgixAvailable = window.imgixUtils && typeof window.imgixUtils.checkImgixAvailability === 'function';
    
    // Get the Imgix domain from imgix-config if available
    const imgixDomain = window.imgixDomain || "seqdecksandpatios.imgix.net";
    
    // Extract performance data
    const imgixImages = allImages.filter(img => img.src.includes(imgixDomain));
    
    // Detect if any real images are loading via Imgix (exclude 1x1px test images)
    const realImgixImages = imgixImages.filter(img => !img.src.includes('w=1&h=1'));
    
    // Calculate savings
    let totalOriginalSize = 0;
    let totalOptimizedSize = 0;
    
    // Check for image errors
    const failedImages = document.querySelectorAll('.imgix-load-failed').length;
    
    // Collect performance data
    const performanceData = {
        totalImages: allImages.length,
        optimizedImages: imgixImages.length,
        failedImages: failedImages,
        optimizationPercentage: ((imgixImages.length / allImages.length) * 100).toFixed(1),
        responsiveImages: allImages.filter(img => img.hasAttribute('srcset')).length,
        lazyLoadedImages: allImages.filter(img => img.getAttribute('loading') === 'lazy').length,
        artDirectedImages: document.querySelectorAll('picture').length,
        imgixStatus: realImgixImages.length > 0 ? 'ACTIVE' : 'INACTIVE'
    };
    
    // Log performance data
    if (realImgixImages.length > 0) {
        console.log('%c 🚀 Imgix Performance Report', 'font-size: 16px; font-weight: bold; color: #3b5d50;');
    } else {
        console.log('%c ⚠️ Imgix Not Active - Using Original Images', 'font-size: 16px; font-weight: bold; color: #e74c3c;');
        console.log(`To use Imgix, please make sure the Imgix source "${imgixDomain}" is properly configured.`);
    }
    console.log(performanceData);
    
    // Add a simple UI widget if requested or in development
    if (window.location.search.includes('imgix-debug=true') || 
        window.location.hostname.includes('netlify') || 
        window.location.hostname === 'localhost') {
        showPerformanceWidget(performanceData);
    }
}

/**
 * Display a simple performance widget
 */
function showPerformanceWidget(data) {
    // Remove any existing widget
    const existingWidget = document.getElementById('imgix-performance-widget');
    if (existingWidget) {
        existingWidget.remove();
    }
    
    const widget = document.createElement('div');
    widget.id = 'imgix-performance-widget';
    widget.style.cssText = `
        position: fixed;
        bottom: 70px;
        left: 20px;
        background: rgba(59, 93, 80, 0.9);
        color: white;
        padding: 15px;
        border-radius: 5px;
        font-family: sans-serif;
        font-size: 14px;
        z-index: 9999;
        max-width: 300px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    `;
    
    // Set color based on Imgix status
    const statusColor = data.imgixStatus === 'ACTIVE' ? '#2ecc71' : '#e74c3c';
    
    // Add failed images info if any
    let failedInfo = '';
    if (data.failedImages > 0) {
        failedInfo = `<div style="color: #e74c3c; margin-bottom: 5px;">Failed: ${data.failedImages}</div>`;
    }
    
    widget.innerHTML = `
        <h3 style="margin: 0 0 10px; font-size: 16px;">Imgix Performance</h3>
        <div style="margin-bottom: 10px;">
            <strong>Status: <span style="color: ${statusColor}">${data.imgixStatus}</span></strong>
        </div>
        <div style="margin-bottom: 5px;">Images: ${data.optimizedImages}/${data.totalImages} (${data.optimizationPercentage}%)</div>
        ${failedInfo}
        <div style="margin-bottom: 5px;">Responsive: ${data.responsiveImages}</div>
        <div style="margin-bottom: 5px;">Lazy-loaded: ${data.lazyLoadedImages}</div>
        <div style="margin-bottom: 5px;">Art directed: ${data.artDirectedImages}</div>
        <button style="position: absolute; top: 5px; right: 5px; background: none; border: none; color: white; cursor: pointer; font-size: 16px;">&times;</button>
    `;
    
    document.body.appendChild(widget);
    
    // Add close functionality
    widget.querySelector('button').addEventListener('click', () => {
        widget.remove();
    });
}

// Add automatic debug if URL has debug parameter
if (window.location.search.includes('imgix-debug=true')) {
    console.log('%c Imgix Debug Mode Enabled', 'background: #3b5d50; color: white; padding: 5px 10px; border-radius: 3px;');
} 