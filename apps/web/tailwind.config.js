export default {
    content: [
        './src/**/*.{js,ts,jsx,tsx}',
        './index.html',
    ],
    theme: {
        extend: {
            fontSize: {
                'display-lg': ['var(--os-type-display-large-size)', { lineHeight: 'var(--os-type-display-large-line-height)', letterSpacing: 'var(--os-type-display-large-tracking)', fontWeight: 'var(--os-type-display-large-weight)' }],
                'display-md': ['var(--os-type-display-medium-size)', { lineHeight: 'var(--os-type-display-medium-line-height)', letterSpacing: 'var(--os-type-display-medium-tracking)', fontWeight: 'var(--os-type-display-medium-weight)' }],
                'display-sm': ['var(--os-type-display-small-size)', { lineHeight: 'var(--os-type-display-small-line-height)', letterSpacing: 'var(--os-type-display-small-tracking)', fontWeight: 'var(--os-type-display-small-weight)' }],
                'headline-lg': ['var(--os-type-headline-large-size)', { lineHeight: 'var(--os-type-headline-large-line-height)', letterSpacing: 'var(--os-type-headline-large-tracking)', fontWeight: 'var(--os-type-headline-large-weight)' }],
                'headline-md': ['var(--os-type-headline-medium-size)', { lineHeight: 'var(--os-type-headline-medium-line-height)', letterSpacing: 'var(--os-type-headline-medium-tracking)', fontWeight: 'var(--os-type-headline-medium-weight)' }],
                'headline-sm': ['var(--os-type-headline-small-size)', { lineHeight: 'var(--os-type-headline-small-line-height)', letterSpacing: 'var(--os-type-headline-small-tracking)', fontWeight: 'var(--os-type-headline-small-weight)' }],
                'title-lg': ['var(--os-type-title-large-size)', { lineHeight: 'var(--os-type-title-large-line-height)', letterSpacing: 'var(--os-type-title-large-tracking)', fontWeight: 'var(--os-type-title-large-weight)' }],
                'title-md': ['var(--os-type-title-medium-size)', { lineHeight: 'var(--os-type-title-medium-line-height)', letterSpacing: 'var(--os-type-title-medium-tracking)', fontWeight: 'var(--os-type-title-medium-weight)' }],
                'title-sm': ['var(--os-type-title-small-size)', { lineHeight: 'var(--os-type-title-small-line-height)', letterSpacing: 'var(--os-type-title-small-tracking)', fontWeight: 'var(--os-type-title-small-weight)' }],
                'body-lg': ['var(--os-type-body-large-size)', { lineHeight: 'var(--os-type-body-large-line-height)', letterSpacing: 'var(--os-type-body-large-tracking)', fontWeight: 'var(--os-type-body-large-weight)' }],
                'body-md': ['var(--os-type-body-medium-size)', { lineHeight: 'var(--os-type-body-medium-line-height)', letterSpacing: 'var(--os-type-body-medium-tracking)', fontWeight: 'var(--os-type-body-medium-weight)' }],
                'body-sm': ['var(--os-type-body-small-size)', { lineHeight: 'var(--os-type-body-small-line-height)', letterSpacing: 'var(--os-type-body-small-tracking)', fontWeight: 'var(--os-type-body-small-weight)' }],
                'label-lg': ['var(--os-type-label-large-size)', { lineHeight: 'var(--os-type-label-large-line-height)', letterSpacing: 'var(--os-type-label-large-tracking)', fontWeight: 'var(--os-type-label-large-weight)' }],
                'label-md': ['var(--os-type-label-medium-size)', { lineHeight: 'var(--os-type-label-medium-line-height)', letterSpacing: 'var(--os-type-label-medium-tracking)', fontWeight: 'var(--os-type-label-medium-weight)' }],
                'label-sm': ['var(--os-type-label-small-size)', { lineHeight: 'var(--os-type-label-small-line-height)', letterSpacing: 'var(--os-type-label-small-tracking)', fontWeight: 'var(--os-type-label-small-weight)' }],
            },
            boxShadow: {
                'elevation-1': 'var(--os-elevation-1)',
                'elevation-2': 'var(--os-elevation-2)',
                'elevation-3': 'var(--os-elevation-3)',
                'elevation-4': 'var(--os-elevation-4)',
                'elevation-5': 'var(--os-elevation-5)',
            },
            colors: {
                // Map OS variables to Tailwind colors if needed, or rely on CSS variables directly
            },
        },
    },
    plugins: [],
    // Optimization: Exclude unused paths and ensure precise content globs
    blocklist: [],
};
