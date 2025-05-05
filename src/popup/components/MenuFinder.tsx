import React, { useState, useEffect } from 'react';
import { ShopifyMenuService } from '../lib/menu-service';
import { Menu } from '../lib/menu-types';

interface MenuFinderProps {
  onMenuFound: (menu: Menu) => void;
}

export function MenuFinder({ onMenuFound }: MenuFinderProps) {
  const [menuId, setMenuId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [menus, setMenus] = useState<Array<{id: string, title: string, idForUrl: string}>>([]);
  const [isLoadingMenus, setIsLoadingMenus] = useState(false);
  
  const menuService = new ShopifyMenuService();
  
  // Load all available menus when component mounts
  useEffect(() => {
    const loadMenus = async () => {
      try {
        setIsLoadingMenus(true);
        const menusList = await menuService.getAllMenus();
        if (menusList && menusList.length > 0) {
          setMenus(menusList.map(menu => ({
            id: menu.id || '',
            title: menu.isDefault ? `${menu.title || 'Untitled Menu'} (Default)` : (menu.title || 'Untitled Menu'),
            idForUrl: menuService.getNumericIdFromGraphqlId(menu.id || '') || ''
          })));
        } else {
          console.warn('No menus found or empty list returned');
        }
      } catch (err) {
        console.error('Error loading menus list:', err);
      } finally {
        setIsLoadingMenus(false);
      }
    };
    
    loadMenus();
  }, []);

  const findMenu = async () => {
    if (!menuId.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const menu = await menuService.getMenuById(menuId);
      
      if (!menu) {
        setError(`Menu with ID "${menuId}" not found. Please check the input and try again.`);
        return;
      }
      
      if (!menu.items || !Array.isArray(menu.items)) {
        setError(`Menu found but has invalid structure. Expected items array but got: ${JSON.stringify(menu.items)}`);
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
  
  const handleSelectMenu = (selectedId: string) => {
    setMenuId(selectedId);
    // If we're selecting from dropdown, immediately find the menu
    if (selectedId) {
      setIsLoading(true);
      setError(null);
      
      menuService.getMenuById(selectedId)
        .then(menu => {
          if (menu) {
            if (!menu.items || !Array.isArray(menu.items)) {
              setError(`Menu found but has invalid structure. Expected items array but got: ${JSON.stringify(menu.items)}`);
              return;
            }
            onMenuFound(menu);
          } else {
            setError(`Selected menu not found. Please try another.`);
          }
        })
        .catch(err => {
          console.error('Error loading selected menu:', err);
          setError(err instanceof Error ? err.message : 'An unknown error occurred');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  return (
    <div className="bg-white rounded">
      {isLoadingMenus ? (
        <div className="py-2 text-gray-500 text-xs">Loading menus...</div>
      ) : (
        <>
          {menus.length > 0 && (
            <div className="mb-3">
              <select 
                className="w-full p-2 border border-gray-200 rounded text-sm bg-gray-50"
                onChange={(e) => handleSelectMenu(e.target.value)}
                value={menuId}
              >
                <option value="">Select a menu</option>
                {menus.map(menu => (
                  <option key={menu.id} value={menu.id}>
                    {menu.title}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div className="mb-1">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Or enter menu ID directly"
                className="flex-1 rounded border-gray-200 p-2 text-sm bg-gray-50"
                value={menuId}
                onChange={(e) => setMenuId(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
              />
              <button 
                className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50"
                onClick={findMenu}
                disabled={!menuId.trim() || isLoading}
              >
                {isLoading ? '...' : 'Find'}
              </button>
            </div>
          </div>
        </>
      )}
      
      {error && (
        <div className="text-red-600 text-xs mt-1 p-2 bg-red-50 rounded">{error}</div>
      )}
    </div>
  );
}