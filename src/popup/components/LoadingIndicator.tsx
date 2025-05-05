import React from 'react';

interface LoadingIndicatorProps {
  message?: string;
}

export function LoadingIndicator({ message = 'Loading...' }: LoadingIndicatorProps) {
  return (
    <div className="flex flex-col w-96 p-3 bg-white">
      <header className="mb-3 flex justify-between items-center">
        <h1 className="text-lg font-semibold text-gray-800">Shopify Menu Tool</h1>
        <img src="./icon.png" alt="Shopify Menu Tool" className="h-6 w-6" />
      </header>
      
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-blue-600 mb-4"></div>
        <div className="text-gray-600 text-sm font-medium">{message}</div>
      </div>
    </div>
  );
}