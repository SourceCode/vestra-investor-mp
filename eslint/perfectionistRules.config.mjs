export default {
  'perfectionist/sort-enums': [
    'error',
    {
      order: 'asc',
      type: 'natural',
    },
  ],
  'perfectionist/sort-exports': [
    'error',
    {
      order: 'asc',
      type: 'natural',
    },
  ],
  'perfectionist/sort-classes': [
    'error',
    {
      type: 'natural',
      order: 'asc',
      ignoreCase: true,
      partitionByComment: false,
      groups: [
        'index-signature',
        'static-property',
        'private-property',
        'property',
        'constructor',
        ['get-method', 'set-method'],
        'static-method',
        'private-method',
        'method',
        'unknown',
      ],
    },
  ],
  'perfectionist/sort-imports': [
    'error',
    {
      type: 'natural',
      order: 'asc',
      ignoreCase: true,
      internalPattern: [
        '^@/apis/.*',
        '^@/components/.*',
        '^@/hooks/.*',
        '^@/classes/.*',
        '^@/consts/.*',
        '^@/enums/.*',
        '^@/interfaces/.*',
        '^@/types/.*',
        '^@/utils/.*',
        '^@/serverActions/.*',
        '^@/store/.*',
        '^@manpow/nw-data-definitions/.*',
      ],

      maxLineLength: undefined,
      groups: [
        'type',
        ['builtin', 'external'],
        'internal',
        ['parent', 'sibling', 'index'],
        'unknown',
      ],
      environment: 'node',
    },
  ],
  'perfectionist/sort-interfaces': [
    'error',
    {
      order: 'asc',
      type: 'natural',
    },
  ],
  'perfectionist/sort-named-exports': [
    'error',
    {
      order: 'asc',
      type: 'natural',
    },
  ],
  'perfectionist/sort-named-imports': [
    'error',
    {
      order: 'asc',
      type: 'natural',
    },
  ],
  'perfectionist/sort-object-types': [
    'error',
    {
      order: 'asc',
      type: 'natural',
    },
  ],
  'perfectionist/sort-objects': [
    'error',
    {
      type: 'natural',
      order: 'asc',
      ignoreCase: true,
      partitionByComment: true,
      partitionByNewLine: false,
      styledComponents: true,
      groups: ['unknown'],
    },
  ],
  'perfectionist/sort-union-types': [
    'error',
    {
      order: 'asc',
      type: 'natural',
    },
  ],
  'perfectionist/sort-array-includes': [
    'error',
    {
      type: 'natural',
      order: 'asc',
      // groupKind: 'spread-first',
    },
  ],
};
