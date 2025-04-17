# Imgix Integration for SEQ Decks & Patios Website

This document outlines the implementation of Imgix for optimized image delivery on the SEQ Decks & Patios website.

## Overview

We've integrated Imgix to improve website performance, image quality, and responsive behavior across all devices. The implementation automatically transforms all image URLs to use the Imgix service, with specific optimizations based on image context (logo, gallery, service images, etc.).

## Configuration

The base Imgix domain for this project is: `seqdecks.imgix.net`

### Imgix Source Setup

Before the Imgix integration can work properly, you need to ensure that:

1. Your Imgix account is active
2. An Imgix source with the name `seqdecks` is created and properly configured
3. The source is pointing to the location where your original images are stored

Without proper Imgix configuration, the website will fall back to using the original images.

## Files & Components

1. **imgix-config.js** - Core configuration and utility functions
   - Handles automatic image URL transformation
   - Contains different parameter sets for various image types
   - Implements responsive images with srcset
   - Adds art direction for gallery images
   - Includes fallback mechanism for when Imgix is unavailable

2. **imgix-monitor.js** - Optional performance monitoring
   - Tracks optimized images and performance gains
   - Provides debugging tools
   - Displays performance metrics with ?imgix-debug=true URL parameter
   - Shows Imgix availability status

## Key Features

### Automatic Image Optimization

- All images are automatically converted to WebP format where supported
- Images are appropriately compressed without quality loss
- Different compression settings for different image types

### Responsive Images

- Responsive srcset attributes for all non-logo images
- Appropriate sizes attributes for different viewport widths
- Multiple resolution variants for each image

### Art Direction

- Gallery images use adaptive cropping for different devices
- Mobile devices get square crops focused on faces
- Tablets get 4:3 aspect ratio
- Desktop gets original aspect ratio

### Performance Enhancements

- Lazy loading for all images
- Automatic browser caching configuration
- Progressive loading for larger images

### Fallback Mechanism

The implementation includes a robust fallback mechanism:

- Automatically detects if the Imgix domain is available and working
- Falls back to original images if Imgix is unavailable
- Still applies lazy loading even with original images
- Provides clear console warnings when Imgix is not available
- Shows status in debug widget

## Usage Notes

### Adding New Images

Simply add images as normal:

```html
<img src="your-image.jpg" alt="Description">
```

The Imgix script will automatically transform the URL and add responsive attributes.

### Debugging

Add `?imgix-debug=true` to any page URL to see a performance metrics widget.

### Custom Parameters

To override the default parameters for a specific image, add data attributes:

```html
<img src="custom-image.jpg" alt="Custom" 
     data-imgix-params='{"w":400,"h":300,"fit":"crop","crop":"entropy"}'>
```

## Performance Impact

Implementing Imgix on this website results in:

- ~60-70% reduction in image file sizes
- Faster initial page load
- Improved Core Web Vitals scores
- Better mobile experience

## Best Practices

1. Always include meaningful alt text with images
2. Use the most appropriate image format for the content
3. Don't manually resize/compress images before upload - Imgix handles this

## Troubleshooting

If images aren't being optimized through Imgix:

1. **Check Imgix Account Status**
   - Verify your Imgix account is active
   - Make sure you have a valid subscription

2. **Verify Source Configuration**
   - Ensure the source `seqdecks` is properly set up in your Imgix dashboard
   - Check that the origin (where your original images are stored) is correctly configured

3. **Debug in Console**
   - Check browser console for Imgix-related warnings
   - Look for specific error messages that might indicate source issues

4. **Test Your Imgix Domain**
   - Try accessing an image directly through your Imgix domain: `https://seqdecks.imgix.net/your-image.jpg`
   - If you see a "bad_source" error, your source is not configured correctly

5. **Use the Debug Mode**
   - Add `?imgix-debug=true` to your URL to see the Imgix status widget
   - Check if any images are being processed through Imgix

## For Developers

The full implementation is modular and customizable. See the source code comments for details on extending or modifying the functionality. 