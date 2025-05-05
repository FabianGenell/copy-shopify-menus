import React, { useState } from 'react';
import { Menu } from '../lib/menu-types';

interface MenuExportProps {
  menu: Menu;
}

export function MenuExport({ menu }: MenuExportProps) {
  const [copied, setCopied] = useState(false);
  
  const exportData = JSON.stringify(menu, null, 2);
  
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(exportData).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  const handleDownload = () => {
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${menu.handle}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 bg-white rounded-md shadow-sm">
      <h2 className="text-lg font-medium mb-3">Export Menu</h2>
      
      <div className="text-sm mb-4">
        <div><strong>Menu:</strong> {menu.title} ({menu.handle})</div>
      </div>
      
      <div className="bg-gray-100 rounded-md p-2 overflow-auto max-h-40 mb-4">
        <pre className="text-xs text-gray-800">{exportData}</pre>
      </div>
      
      <div className="flex gap-2">
        <button 
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onClick={handleCopyToClipboard}
        >
          {copied ? 'Copied!' : 'Copy to Clipboard'}
        </button>
        
        <button 
          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          onClick={handleDownload}
        >
          Download JSON
        </button>
      </div>
    </div>
  );
}