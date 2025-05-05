import React, { useState } from 'react';
import { ShopifyMenuService } from '../lib/menu-service';
import { Menu } from '../lib/menu-types';

interface MenuFinderProps {
  onMenuFound: (menu: Menu) => void;
}

export function MenuFinder({ onMenuFound }: MenuFinderProps) {
  const [menuInput, setMenuInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const menuService = new ShopifyMenuService();

  const findMenu = async () => {
    if (!menuInput.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if the input is a numeric ID, a GraphQL ID, or a handle
      let menu: Menu | null = null;
      
      if (/^\d+$/.test(menuInput)) {
        // If it's a numeric ID
        menu = await menuService.getMenuById(menuInput);
      } else if (menuInput.startsWith('gid://')) {
        // If it's already a GraphQL ID
        menu = await menuService.getMenuById(menuInput);
      } else {
        // Otherwise treat as a handle
        menu = await menuService.getMenuByHandle(menuInput);
      }
      
      if (!menu) {
        // Try to determine what type of input it was for a better error message
        let inputType = 'handle';
        if (/^\d+$/.test(menuInput)) {
          inputType = 'ID';
        } else if (menuInput.startsWith('gid://')) {
          inputType = 'GraphQL ID';
        }
        
        setError(`Menu with ${inputType} "${menuInput}" not found. Please check the input and try again.`);
        return;
      }
      
      onMenuFound(menu);
    } catch (err) {
      console.error('Error finding menu:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      findMenu();
    }
  };

  return (
    <div className="p-4 bg-white rounded-md shadow-sm">
      <h2 className="text-lg font-medium mb-2">Find Menu</h2>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          placeholder="Menu handle or ID"
          className="flex-1 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          value={menuInput}
          onChange={(e) => setMenuInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
        <button 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          onClick={findMenu}
          disabled={!menuInput.trim() || isLoading}
        >
          {isLoading ? 'Loading...' : 'Find'}
        </button>
      </div>
      
      <div className="text-xs text-gray-500 mb-2">
        Enter a menu handle (e.g. "main-menu") or a numeric ID
      </div>
      
      {error && (
        <div className="text-red-600 text-sm mt-1 p-2 bg-red-50 rounded-md">{error}</div>
      )}
    </div>
  );
}