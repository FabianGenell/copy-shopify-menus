import React, { useState, useRef } from 'react';
import { ShopifyMenuService } from '../lib/menu-service';
import { Menu } from '../lib/menu-types';

interface MenuImportProps {
  onSuccess: (menu: Menu) => void;
}

export function MenuImport({ onSuccess }: MenuImportProps) {
  const [menuJson, setMenuJson] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const menuService = new ShopifyMenuService();

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMenuJson(e.target.value);
    setError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setMenuJson(content);
      setError(null);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!menuJson) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      let menuData: Menu;
      
      try {
        menuData = JSON.parse(menuJson);
      } catch (err) {
        setError('Invalid JSON format');
        setIsLoading(false);
        return;
      }
      
      if (!menuData.title || !menuData.handle || !Array.isArray(menuData.items)) {
        setError('Invalid menu format. Menu must have title, handle, and items array.');
        setIsLoading(false);
        return;
      }
      
      const result = await menuService.importMenu(menuData);
      
      if (result.userErrors?.length) {
        setError(result.userErrors.map(err => err.message).join(', '));
        return;
      }
      
      if (result.menu) {
        onSuccess(result.menu);
        setMenuJson('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setError('Menu was imported but no menu data was returned');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-md shadow-sm">
      <h2 className="text-lg font-medium mb-3">Import Menu</h2>
      
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Paste JSON or upload a file
        </label>
        <textarea
          className="w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-32"
          placeholder='{"title": "Main Menu", "handle": "main-menu", "items": [...]}'
          value={menuJson}
          onChange={handleTextAreaChange}
          disabled={isLoading}
        />
      </div>
      
      <div className="mb-4">
        <input
          type="file"
          accept=".json"
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          onChange={handleFileChange}
          ref={fileInputRef}
          disabled={isLoading}
        />
      </div>
      
      <button 
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        onClick={handleImport}
        disabled={!menuJson || isLoading}
      >
        {isLoading ? 'Importing...' : 'Import Menu'}
      </button>
      
      {error && (
        <div className="text-red-600 text-sm mt-3">{error}</div>
      )}
    </div>
  );
}