import React, { createContext, useContext, useState } from 'react';

import { FeatureFlags } from '../types';

const defaultFlags: FeatureFlags = {
    advancedSearch: false,
    darkMode: false,
    networkDeals: true,
    newAnalytics: true
};

const FeatureFlagContext = createContext<FeatureFlags>(defaultFlags);

export const FeatureFlagProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // In a real app, these would be fetched from an API or config service
    const [flags] = useState<FeatureFlags>(defaultFlags);

    return (
        <FeatureFlagContext.Provider value={flags}>
            {children}
        </FeatureFlagContext.Provider>
    );
};

export const useFeatureFlags = () => useContext(FeatureFlagContext);
