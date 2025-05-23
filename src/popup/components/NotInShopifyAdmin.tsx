import React from 'react';

export function NotInShopifyAdmin() {
  return (
    <div className="flex flex-col w-96 p-3 bg-white">
      <header className="mb-3 flex justify-between items-center">
        <h1 className="text-lg font-semibold text-gray-800">Shopify Menu Tool</h1>
        <img src="./icon.png" alt="Shopify Menu Tool" className="h-6 w-6" />
      </header>
      
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
    </div>
  );
}