import React, { useEffect } from 'react';
import { Thing, WithContext } from 'schema-dts';
import SchemaJSONLD from './SchemaJSONLD';

interface SEOProps {
  canonical?: string;
  description: string;
  schema?: Record<string, any>;
  title: string;
}

const SEO: React.FC<SEOProps> = ({ canonical, description, schema, title }) => {
  useEffect(() => {
    // Set Title
    document.title = `${title} | Vestra Real Estate`;

    // Set Description
    let metaDesc = document.querySelector('meta[name=\'description\']');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // Set Canonical
    let linkCanonical = document.querySelector('link[rel=\'canonical\']');
    if (canonical) {
      if (!linkCanonical) {
        linkCanonical = document.createElement('link');
        linkCanonical.setAttribute('rel', 'canonical');
        document.head.appendChild(linkCanonical);
      }
      linkCanonical.setAttribute('href', canonical);
    }
  }, [title, description, canonical]);

  return schema ? <SchemaJSONLD<Thing> data={schema as WithContext<Thing>} /> : null;
};

export default SEO;