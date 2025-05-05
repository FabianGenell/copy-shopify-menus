console.debug('Shopify Menu Copier content script initialized');

function getGraphQLEndpoint(): string {
    const url = window.location.href;
    const storeMatch = url.match(/admin\.shopify\.com\/store\/([^\/]+)/);
    if (!storeMatch) {
        console.error('Failed to extract store name from URL:', url);
        throw new Error('Could not determine store URL. Please ensure you are on a Shopify admin page.');
    }
    const storeName = storeMatch[1];
    console.debug('Using store name for GraphQL endpoint:', storeName);
    return `https://admin.shopify.com/store/${storeName}/api/2025-01/graphql.json`;
}

// Extract information about the current page URL
function extractUrlInfo(url: string) {
    const info = {
        isAdminPage: url.includes('admin.shopify.com'),
        isMenusPage: false,
        isSpecificMenuPage: false,
        storeHandle: null as string | null,
        menuId: null as string | null
    };

    // Extract store handle
    const storeMatch = url.match(/admin\.shopify\.com\/store\/([^\/]+)/);
    if (storeMatch && storeMatch[1]) {
        info.storeHandle = storeMatch[1];
    }

    // Check if it's a menus page
    if (url.includes('/content/menus')) {
        info.isMenusPage = true;

        // Check if it's a specific menu page
        const menuIdMatch = url.match(/\/menus\/(\d+)(?:\/|$)/);
        if (menuIdMatch && menuIdMatch[1]) {
            info.isSpecificMenuPage = true;
            info.menuId = menuIdMatch[1];
        }
    }

    return info;
}

// Listen for popup being opened to send URL context
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'get-page-context') {
        const pageInfo = extractUrlInfo(window.location.href);
        sendResponse({ success: true, pageInfo });
        return false; // No async response
    }
    
    if (message.type === 'open-url') {
        if (message.url) {
            window.location.href = message.url;
            sendResponse({ success: true });
        } else {
            sendResponse({ success: false, error: 'No URL provided' });
        }
        return false; // No async response
    }
    
    if (message.type === 'graphql-request') {
        try {
            console.debug('=== GraphQL Request Start ===');
            console.debug('Message received:', {
                type: message.type,
                hasPayload: !!message.payload,
                operationName: message.payload?.operationName || 'unnamed operation'
            });

            if (!message.payload?.query?.trim()) {
                console.debug('Skipping empty GraphQL request');
                sendResponse({ success: false, error: 'No query provided' });
                return false;
            }

            // Check if we're on Shopify admin
            if (!window.location.href.includes('admin.shopify.com')) {
                console.debug('Not on Shopify admin - rejecting GraphQL request');
                sendResponse({ 
                    success: false, 
                    error: 'This operation requires being on a Shopify admin page.'
                });
                return false;
            }

            const endpoint = getGraphQLEndpoint();
            console.debug('Using endpoint:', endpoint);

            console.debug('Request details:', {
                operationName: message.payload.operationName || 'unnamed operation',
                query: message.payload.query,
                variables: message.payload.variables,
                endpoint: endpoint
            });

            fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(message.payload)
            })
                .then(async (response) => {
                    console.debug('Response received:', {
                        status: response.status,
                        statusText: response.statusText,
                        headers: Object.fromEntries(response.headers.entries())
                    });

                    if (!response.ok) {
                        const responseText = await response.text();
                        console.error('Response not OK:', {
                            status: response.status,
                            statusText: response.statusText,
                            body: responseText
                        });
                        
                        let errorMessage = `HTTP error! status: ${response.status}`;
                        
                        // Try to extract a more helpful message from the response
                        try {
                            const jsonResponse = JSON.parse(responseText);
                            if (jsonResponse.errors && jsonResponse.errors.length > 0) {
                                const messages = jsonResponse.errors.map((e: any) => e.message).join(', ');
                                errorMessage += `: ${messages}`;
                            } else if (jsonResponse.message) {
                                errorMessage += `: ${jsonResponse.message}`;
                            } else {
                                errorMessage += `\nResponse: ${responseText.substring(0, 100)}${responseText.length > 100 ? '...' : ''}`;
                            }
                        } catch (e) {
                            // If we can't parse as JSON, just include a snippet of the response
                            errorMessage += `\nResponse: ${responseText.substring(0, 100)}${responseText.length > 100 ? '...' : ''}`;
                        }
                        
                        throw new Error(errorMessage);
                    }

                    return response.json();
                })
                .then((data) => {
                    console.debug('Response parsed successfully:', {
                        operationName: message.payload.operationName || 'unnamed operation',
                        hasData: !!data.data,
                        hasErrors: !!data.errors,
                        errors: data.errors,
                        data: data.data
                    });
                    
                    // Check for GraphQL errors that might be contained in a successful HTTP response
                    if (data.errors && data.errors.length > 0) {
                        // Pass both the data and errors to the popup
                        sendResponse({ success: true, data, hasErrors: true });
                    } else {
                        sendResponse({ success: true, data });
                    }
                })
                .catch((error) => {
                    console.error('Request failed:', {
                        operationName: message.payload.operationName || 'unnamed operation',
                        error: error.message,
                        fullError: error
                    });
                    if (error instanceof Error) {
                        sendResponse({ success: false, error: error.message });
                    } else {
                        sendResponse({ success: false, error: 'An unknown error occurred' });
                    }
                })
                .finally(() => {
                    console.debug('=== GraphQL Request End ===');
                });

            // Return true to indicate we will send a response asynchronously
            return true;
        } catch (error) {
            console.error('Error in message handler:', error);
            if (error instanceof Error) {
                sendResponse({ success: false, error: error.message });
            } else {
                sendResponse({ success: false, error: 'An unknown error occurred' });
            }
            return false;
        }
    }
});
