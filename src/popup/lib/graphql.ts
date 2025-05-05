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
                    reject(new Error(chrome.runtime.lastError.message));
                    return;
                }

                if (!response.success) {
                    reject(new Error(response.error));
                    return;
                }

                resolve(response.data);
            }
        );
    });
}
