import React, { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  schema?: Record<string, any>;
  canonical?: string;
}

const SEO: React.FC<SEOProps> = ({ title, description, schema, canonical }) => {
  useEffect(() => {
    // Set Title
    document.title = `${title} | Vestra Real Estate`;
    
    // Set Description
    let metaDesc = document.querySelector("meta[name='description']");
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // Set Canonical
    let linkCanonical = document.querySelector("link[rel='canonical']");
    if (canonical) {
        if (!linkCanonical) {
            linkCanonical = document.createElement('link');
            linkCanonical.setAttribute('rel', 'canonical');
            document.head.appendChild(linkCanonical);
        }
        linkCanonical.setAttribute('href', canonical);
    }

    // Set JSON-LD Schema
    const scriptId = 'ld-json-schema';
    let scriptSchema = document.getElementById(scriptId);
    
    if (schema) {
      if (!scriptSchema) {
        scriptSchema = document.createElement('script');
        scriptSchema.id = scriptId;
        scriptSchema.setAttribute('type', 'application/ld+json');
        document.head.appendChild(scriptSchema);
      }
      scriptSchema.textContent = JSON.stringify(schema);
    } else if (scriptSchema) {
        // Clean up schema if not provided for this route
        scriptSchema.textContent = '';
    }

  }, [title, description, schema, canonical]);

  return null;
};

export default SEO;