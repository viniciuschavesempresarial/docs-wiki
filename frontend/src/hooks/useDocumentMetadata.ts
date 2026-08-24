import { useEffect } from 'react';

/**
 * Hook to dynamically update document title, description, and social media sharing (Open Graph/Twitter) metadata.
 * Promotes SEO and social sharing guidelines across the QAndora Docs-Wiki workspace.
 */
export const useDocumentMetadata = (title: string, description: string) => {
  useEffect(() => {
    const fullTitle = `${title} | QAndora Docs-Wiki`;
    
    // Set browser tab title
    document.title = fullTitle;

    // Helper to find or create a meta tag dynamically
    const setMetaTag = (selector: string, attributeName: string, attributeValue: string, contentValue: string) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attributeName, attributeValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', contentValue);
    };

    // Update standard SEO description
    setMetaTag('meta[name="description"]', 'name', 'description', description);

    // Update Open Graph (Facebook/LinkedIn/Slack) tags
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', fullTitle);
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', description);
    setMetaTag('meta[property="og:image"]', 'property', 'og:image', '/og-image.jpg');

    // Update Twitter Card tags
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', fullTitle);
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', '/og-image.jpg');
  }, [title, description]);
};
