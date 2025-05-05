import React from 'react';

export function NotInShopifyAdmin() {
  return (
    <div className="p-6 flex flex-col items-center text-center">
      <div className="text-lg font-semibold text-red-600 mb-2">
        Not in Shopify Admin
      </div>
      <p className="text-gray-700 mb-4">
        Please navigate to a Shopify admin page to use this extension.
      </p>
      <a
        href="https://admin.shopify.com"
        target="_blank"
        rel="noopener noreferrer"
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Go to Shopify Admin
      </a>
    </div>
  );
}