import { useEffect } from 'react';

export interface SEOProps {
  title: string;
  description: string;
  canonicalPath?: string;
  keywords?: string[];
  ogType?: 'website' | 'article';
}

const DEFAULT_BASE_URL = 'https://cybertrack.nandha.edu.in';

export function useSEO({
  title,
  description,
  canonicalPath = '',
  keywords,
  ogType = 'website',
}: SEOProps) {
  useEffect(() => {
    // 1. Update Document Title
    const formattedTitle = title.includes('CyberTrack')
      ? title
      : `${title} | CyberTrack Nexus`;
    document.title = formattedTitle;

    // 2. Helper to set or create meta tags
    const setMetaTag = (attribute: string, name: string, content: string) => {
      let meta = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // 3. Set description
    setMetaTag('name', 'description', description);

    // 4. Set keywords if provided
    if (keywords && keywords.length > 0) {
      setMetaTag('name', 'keywords', keywords.join(', '));
    }

    // 5. Update Canonical link
    const cleanPath = canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`;
    const canonicalUrl = `${DEFAULT_BASE_URL}${cleanPath === '/' ? '' : cleanPath}`;
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // 6. Open Graph Tags
    setMetaTag('property', 'og:title', formattedTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:type', ogType);

    // 7. Twitter Tags
    setMetaTag('name', 'twitter:title', formattedTitle);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:url', canonicalUrl);
  }, [title, description, canonicalPath, keywords, ogType]);
}
