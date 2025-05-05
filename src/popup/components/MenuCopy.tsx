import React, { useState, useEffect } from 'react';
import { ShopifyMenuService } from '../lib/menu-service';
import { Menu } from '../lib/menu-types';

interface MenuCopyProps {
  menu: Menu;
  onSuccess: (newMenu: Menu) => void;
}

export function MenuCopy({ menu, onSuccess }: MenuCopyProps) {
  const [newHandle, setNewHandle] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const menuService = new ShopifyMenuService();
  
  // Initialize the new handle when the menu changes
  useEffect(() => {
    setNewHandle(`${menu.handle}-copy`);
  }, [menu.handle]);

  const copyMenu = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Extract the suffix by comparing with original handle
      const handleSuffix = newHandle.startsWith(menu.handle)
        ? newHandle.slice(menu.handle.length)
        : `-${newHandle}`; // Fallback to ensure there's a separator
        
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
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Handle
          </label>
          <input
            type="text"
            className="w-full rounded border-gray-200 p-2 text-sm bg-gray-50"
            placeholder="New handle"
            value={newHandle}
            onChange={(e) => setNewHandle(e.target.value)}
            disabled={isLoading}
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Title
          </label>
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