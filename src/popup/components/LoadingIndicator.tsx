import React from 'react';

interface LoadingIndicatorProps {
  message?: string;
}

export function LoadingIndicator({ message = 'Loading...' }: LoadingIndicatorProps) {
  return (
    <div className="flex flex-col items-center justify-center p-6">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700 mb-3"></div>
      <div className="text-gray-700">{message}</div>
    </div>
  );
}