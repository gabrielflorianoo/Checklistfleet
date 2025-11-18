import React, { createContext, useContext, useState } from 'react';

type TopBarState = {
    title?: React.ReactNode | (() => React.ReactNode);
    right?: React.ReactNode | (() => React.ReactNode);
    left?: React.ReactNode | (() => React.ReactNode);
};

type TopBarContextValue = {
    state: TopBarState;
    setState: (s: TopBarState) => void;
    clear: () => void;
};

const TopBarContext = createContext<TopBarContextValue | undefined>(undefined);

export const TopBarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setStateInternal] = useState<TopBarState>({});

    const setState = (s: TopBarState) => setStateInternal((prev) => ({ ...prev, ...s }));
    const clear = () => setStateInternal({});

    return (
        <TopBarContext.Provider value={{ state, setState, clear }}>
            {children}
        </TopBarContext.Provider>
    );
};

export function useTopBar() {
    const ctx = useContext(TopBarContext);
    if (!ctx) throw new Error('useTopBar must be used within TopBarProvider');
    return ctx;
}

export default TopBarContext;
