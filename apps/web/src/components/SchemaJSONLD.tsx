import React from 'react';
import { Thing, WithContext } from 'schema-dts';

interface SchemaJSONLDProps<T extends Thing> {
    data: WithContext<T> | WithContext<T>[];
    id?: string;
}

/**
 * Renders strict JSON-LD structured data into the document head.
 * Uses schema-dts for type safety.
 */
export const SchemaJSONLD = <T extends Thing>({ data, id = 'json-ld' }: SchemaJSONLDProps<T>) => {
    return (
        <script
            id={id}
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: JSON.stringify(data),
            }}
        />
    );
};

export default SchemaJSONLD;
