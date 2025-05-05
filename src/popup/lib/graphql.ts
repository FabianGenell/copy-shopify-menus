import { ShopifyURLInfo } from './menu-types';

type GraphQLResponse<T = any> = {
    data?: T;
    errors?: Array<{
        message: string;
        locations?: Array<{
            line: number;
            column: number;
        }>;
        path?: string[];
        extensions?: Record<string, any>;
    }>;
};

/**
 * Gets the current page context from the content script
 * 
 * @returns Promise with the current page context
 */
export async function getPageContext(): Promise<ShopifyURLInfo> {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    const tabId = tab?.id;
    if (typeof tabId !== 'number') {
        throw new Error('No active tab found');
    }

    if (!tab.url?.includes('admin.shopify.com')) {
        return {
            isAdminPage: false,
            isMenusPage: false,
            isSpecificMenuPage: false,
            storeHandle: null,
            menuId: null
        };
    }

    return new Promise((resolve, reject) => {
        chrome.tabs.sendMessage(
            tabId,
            {
                type: 'get-page-context'
            },
            (response) => {
                if (chrome.runtime.lastError) {
                    console.error('Error getting page context:', chrome.runtime.lastError);
                    // Default to basic context if we can't get it from content script
                    resolve({
                        isAdminPage: true,
                        isMenusPage: false,
                        isSpecificMenuPage: false,
                        storeHandle: null,
                        menuId: null
                    });
                    return;
                }

                if (!response || !response.success) {
                    console.error('Invalid response from content script:', response);
                    // Default to basic context
                    resolve({
                        isAdminPage: true,
                        isMenusPage: false,
                        isSpecificMenuPage: false,
                        storeHandle: null,
                        menuId: null
                    });
                    return;
                }

                resolve(response.pageInfo);
            }
        );
    });
}

/**
 * Redirects to a URL in the current tab
 * 
 * @param url - The URL to navigate to
 */
export async function navigateTo(url: string): Promise<boolean> {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    const tabId = tab?.id;
    if (typeof tabId !== 'number') {
        throw new Error('No active tab found');
    }

    return new Promise((resolve, reject) => {
        chrome.tabs.sendMessage(
            tabId,
            {
                type: 'open-url',
                url
            },
            (response) => {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                    return;
                }

                if (!response || !response.success) {
                    reject(new Error(response?.error || 'Failed to navigate'));
                    return;
                }

                resolve(true);
            }
        );
    });
}

export async function executeGraphQLRequest<T = any>(graphQLParams: {
    query: string;
    variables?: Record<string, any>;
    operationName?: string;
}): Promise<GraphQLResponse<T>> {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    const tabId = tab?.id;
    if (typeof tabId !== 'number') {
        throw new Error('No active tab found');
    }

    if (!tab.url?.includes('admin.shopify.com')) {
        throw new Error('Please open this extension while on a Shopify admin page');
    }

    return new Promise((resolve, reject) => {
        chrome.tabs.sendMessage(
            tabId,
            {
                type: 'graphql-request',
                payload: graphQLParams
            },
            (response) => {
                if (chrome.runtime.lastError) {
                    console.error('Chrome runtime error:', chrome.runtime.lastError);
                    reject(new Error(chrome.runtime.lastError.message || 'Unknown error communicating with the content script'));
                    return;
                }

                if (!response) {
                    console.error('Empty response from content script');
                    reject(new Error('Empty response from content script. Please reload the page and try again.'));
                    return;
                }

                if (!response.success) {
                    console.error('GraphQL request failed:', response.error);
                    reject(new Error(response.error || 'Unknown GraphQL error'));
                    return;
                }

                // Check for GraphQL errors in the response
                if (response.data?.errors && response.data.errors.length > 0) {
                    const errorMessages = response.data.errors
                        .map(err => err.message)
                        .join(', ');
                    
                    console.error('GraphQL errors:', response.data.errors);
                    reject(new Error(`GraphQL errors: ${errorMessages}`));
                    return;
                }

                resolve(response.data);
            }
        );
    });
}
