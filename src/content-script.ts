console.debug('Shopify Admin Base content script initialized');

function getGraphQLEndpoint(): string {
    const url = window.location.href;
    const storeMatch = url.match(/admin\.shopify\.com\/store\/([^\/]+)/);
    if (!storeMatch) {
        throw new Error('Could not determine store URL. Please ensure you are on a Shopify admin page.');
    }
    const storeName = storeMatch[1];
    return `https://admin.shopify.com/store/${storeName}/api/2025-01/graphql.json`;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
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
                        throw new Error(
                            `HTTP error! status: ${response.status}\nResponse: ${responseText}`
                        );
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
                    sendResponse({ success: true, data });
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
