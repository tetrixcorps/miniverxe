#!/usr/bin/env node

/**
 * Cache Busting Script for Cloudflare CDN Issues
 * 
 * This script adds version parameters to JavaScript and CSS files
 * to prevent Cloudflare from serving cached versions.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Configuration
const BUILD_DIR = './dist';
const VERSION = process.env.BUILD_VERSION || Date.now().toString(36);
const FILES_TO_PROCESS = ['.html', '.astro'];

// Function to generate content hash
function generateHash(content) {
  return crypto.createHash('md5').update(content).digest('hex').substring(0, 8);
}

// Function to add cache-busting parameters to URLs
function addCacheBusting(content) {
  // Pattern to match script and link tags with src/href attributes
  const patterns = [
    // Script tags: <script src="/path/to/file.js">
    /<script([^>]*)\ssrc=["']([^"']*\.(js|css))["']([^>]*)>/g,
    // Link tags: <link rel="stylesheet" href="/path/to/file.css">
    /<link([^>]*)\shref=["']([^"']*\.(js|css))["']([^>]*)>/g
  ];

  let modifiedContent = content;

  patterns.forEach(pattern => {
    modifiedContent = modifiedContent.replace(pattern, (match, before, url, ext, after) => {
      // Skip if already has version parameter
      if (url.includes('?v=') || url.includes('&v=')) {
        return match;
      }

      // Add version parameter
      const separator = url.includes('?') ? '&' : '?';
      const newUrl = `${url}${separator}v=${VERSION}`;
      
      return match.replace(url, newUrl);
    });
  });

  return modifiedContent;
}

// Function to process a single file
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const modifiedContent = addCacheBusting(content);
    
    if (content !== modifiedContent) {
      fs.writeFileSync(filePath, modifiedContent, 'utf8');
      console.log(`✅ Added cache-busting to: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Function to recursively find and process files
function processDirectory(dirPath) {
  let processedCount = 0;
  
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Recursively process subdirectories
        processedCount += processDirectory(fullPath);
      } else if (stat.isFile()) {
        // Check if file should be processed
        const ext = path.extname(item);
        if (FILES_TO_PROCESS.includes(ext)) {
          if (processFile(fullPath)) {
            processedCount++;
          }
        }
      }
    }
  } catch (error) {
    console.error(`❌ Error processing directory ${dirPath}:`, error.message);
  }
  
  return processedCount;
}

// Main execution
function main() {
  console.log('🚀 Starting cache-busting process...');
  console.log(`📁 Build directory: ${BUILD_DIR}`);
  console.log(`🔢 Version: ${VERSION}`);
  
  if (!fs.existsSync(BUILD_DIR)) {
    console.error(`❌ Build directory not found: ${BUILD_DIR}`);
    process.exit(1);
  }
  
  const processedCount = processDirectory(BUILD_DIR);
  
  if (processedCount > 0) {
    console.log(`✅ Cache-busting complete! Processed ${processedCount} files.`);
    console.log('🌐 Deploy to see the changes take effect.');
  } else {
    console.log('ℹ️  No files needed cache-busting.');
  }
}

// Run the script
main();

export { addCacheBusting, processFile, processDirectory };
