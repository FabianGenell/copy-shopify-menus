export const StorageKeys = {
    HISTORY: 'queryHistory',
    THEME: 'theme'
} as const;

export type StorageKey = (typeof StorageKeys)[keyof typeof StorageKeys];
