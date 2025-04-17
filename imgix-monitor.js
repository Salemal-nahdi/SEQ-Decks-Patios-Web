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
    
    // Extract performance data
    const imgixImages = allImages.filter(img => img.src.includes('imgix.net'));
    
    // Calculate savings
    let totalOriginalSize = 0;
    let totalOptimizedSize = 0;
    
    // Collect performance data
    const performanceData = {
        totalImages: allImages.length,
        optimizedImages: imgixImages.length,
        optimizationPercentage: ((imgixImages.length / allImages.length) * 100).toFixed(1),
        responsiveImages: allImages.filter(img => img.hasAttribute('srcset')).length,
        lazyLoadedImages: allImages.filter(img => img.getAttribute('loading') === 'lazy').length,
        artDirectedImages: document.querySelectorAll('picture').length,
        imgixStatus: imgixImages.length > 0 ? 'ACTIVE' : 'INACTIVE'
    };
    
    // Log performance data
    if (imgixImages.length > 0) {
        console.log('%c 🚀 Imgix Performance Report', 'font-size: 16px; font-weight: bold; color: #3b5d50;');
    } else {
        console.log('%c ⚠️ Imgix Not Active - Using Original Images', 'font-size: 16px; font-weight: bold; color: #e74c3c;');
        console.log('To use Imgix, please make sure the Imgix source "seqdecks.imgix.net" is properly configured.');
    }
    console.table(performanceData);
    
    // Add a simple UI widget if requested
    if (window.location.search.includes('imgix-debug=true')) {
        showPerformanceWidget(performanceData);
    }
}

/**
 * Display a simple performance widget
 */
function showPerformanceWidget(data) {
    const widget = document.createElement('div');
    widget.style.cssText = `
        position: fixed;
        bottom: 20px;
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
    
    widget.innerHTML = `
        <h3 style="margin: 0 0 10px; font-size: 16px;">Imgix Performance</h3>
        <div style="margin-bottom: 10px;">
            <strong>Status: <span style="color: ${statusColor}">${data.imgixStatus}</span></strong>
        </div>
        <div style="margin-bottom: 5px;">Images: ${data.optimizedImages}/${data.totalImages} (${data.optimizationPercentage}%)</div>
        <div style="margin-bottom: 5px;">Responsive: ${data.responsiveImages}</div>
        <div style="margin-bottom: 5px;">Lazy-loaded: ${data.lazyLoadedImages}</div>
        <div style="margin-bottom: 5px;">Art directed: ${data.artDirectedImages}</div>
        <div style="font-size: 12px; margin-top: 10px; color: rgba(255,255,255,0.7);">Add ?imgix-debug=true to URL to show this widget</div>
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