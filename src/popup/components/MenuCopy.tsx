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
    <div className="bg-white rounded">
      <div className="space-y-3 mb-3">
        <div>
          <input
            type="text"
            className="w-full rounded border-gray-200 p-2 text-sm bg-gray-50"
            placeholder="Handle suffix (default: -copy)"
            value={handleSuffix}
            onChange={(e) => setHandleSuffix(e.target.value)}
            disabled={isLoading}
          />
          <div className="mt-1 text-xs text-gray-500">
            {menu.handle}{handleSuffix}
          </div>
        </div>
        
        <div>
          <input
            type="text"
            className="w-full rounded border-gray-200 p-2 text-sm bg-gray-50"
            placeholder={`New title (default: ${menu.title})`}
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            disabled={isLoading}
          />
        </div>
      </div>
      
      <button 
        className="w-full py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
        onClick={copyMenu}
        disabled={isLoading}
      >
        {isLoading ? 'Copying...' : 'Create Copy'}
      </button>
      
      {error && (
        <div className="text-red-600 text-xs mt-2">{error}</div>
      )}
    </div>
  );
}