import React, { useState, useEffect } from 'react';
import { ShopifyMenuService } from '../lib/menu-service';
import { Menu } from '../lib/menu-types';

interface MenuFinderProps {
  onMenuFound: (menu: Menu | null) => void;
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
    } else {
      // If user selects the empty option, inform parent component
      onMenuFound(null);
    }
  };

  return (
    <div className="bg-white rounded">
      {isLoadingMenus ? (
        <div className="py-4 text-gray-500 text-sm flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading available menus...
        </div>
      ) : (
        <>
          {menus.length > 0 ? (
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path>
                </svg>
              </div>
              <select 
                className="w-full p-2 pl-10 border border-gray-300 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 appearance-none bg-white hover:border-blue-400 transition-colors"
                onChange={(e) => handleSelectMenu(e.target.value)}
                value={menuId}
              >
                <option value="">-- Select a menu --</option>
                {menus.map(menu => (
                  <option key={menu.id} value={menu.id}>
                    {menu.title}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="p-3 bg-yellow-50 text-yellow-700 rounded-md text-sm mb-3 border border-yellow-100 flex items-center">
              <svg className="w-5 h-5 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
              No menus found in this store. Create a menu first or import one.
            </div>
          )}
        </>
      )}
      
      {error && (
        <div className="text-red-600 text-sm mt-3 p-3 bg-red-50 rounded-md border border-red-100 flex items-center">
          <svg className="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          {error}
        </div>
      )}
    </div>
  );
}