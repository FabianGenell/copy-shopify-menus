import React, { useState } from 'react';
import { ShopifyMenuService } from '../lib/menu-service';
import { Menu } from '../lib/menu-types';

interface MenuCopyProps {
  menu: Menu;
  onSuccess: (newMenu: Menu) => void;
}

export function MenuCopy({ menu, onSuccess }: MenuCopyProps) {
  const [handleSuffix, setHandleSuffix] = useState('-copy');
  const [newTitle, setNewTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const menuService = new ShopifyMenuService();

  const copyMenu = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await menuService.copyMenu(menu.handle, {
        handleSuffix,
        newTitle: newTitle || undefined
      });
      
      if (result.userErrors?.length) {
        setError(result.userErrors.map(err => err.message).join(', '));
        return;
      }
      
      if (result.menu) {
        onSuccess(result.menu);
      } else {
        setError('Menu was copied but no menu data was returned');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-md shadow-sm">
      <h2 className="text-lg font-medium mb-3">Copy Menu</h2>
      
      <div className="text-sm mb-4">
        <div><strong>Original Menu:</strong> {menu.title} ({menu.handle})</div>
      </div>
      
      <div className="space-y-3 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Handle Suffix
          </label>
          <input
            type="text"
            className="w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            value={handleSuffix}
            onChange={(e) => setHandleSuffix(e.target.value)}
            disabled={isLoading}
          />
          <div className="mt-1 text-xs text-gray-500">
            New handle will be: {menu.handle}{handleSuffix}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            New Title (Optional)
          </label>
          <input
            type="text"
            className="w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            placeholder={menu.title}
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            disabled={isLoading}
          />
        </div>
      </div>
      
      <button 
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        onClick={copyMenu}
        disabled={isLoading}
      >
        {isLoading ? 'Copying...' : 'Copy Menu'}
      </button>
      
      {error && (
        <div className="text-red-600 text-sm mt-3">{error}</div>
      )}
    </div>
  );
}