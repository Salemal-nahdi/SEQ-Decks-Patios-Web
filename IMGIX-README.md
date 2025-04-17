# Imgix Integration for SEQ Decks & Patios Website

This document outlines the implementation of Imgix for optimized image delivery on the SEQ Decks & Patios website.

## Overview

We've integrated Imgix to improve website performance, image quality, and responsive behavior across all devices. The implementation automatically transforms all image URLs to use the Imgix service, with specific optimizations based on image context (logo, gallery, service images, etc.).

## Configuration

The base Imgix domain for this project is: `seqdecks.imgix.net`

## Files & Components

1. **imgix-config.js** - Core configuration and utility functions
   - Handles automatic image URL transformation
   - Contains different parameter sets for various image types
   - Implements responsive images with srcset
   - Adds art direction for gallery images

2. **imgix-monitor.js** - Optional performance monitoring
   - Tracks optimized images and performance gains
   - Provides debugging tools
   - Displays performance metrics with ?imgix-debug=true URL parameter

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

If an image isn't being optimized:
- Check the browser console for errors
- Ensure the image path is relative, not absolute
- Verify the image filename doesn't contain special characters

## For Developers

The full implementation is modular and customizable. See the source code comments for details on extending or modifying the functionality. 