import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { Menu, ShopifyURLInfo } from './lib/menu-types';
import { MenuFinder } from './components/MenuFinder';
import { MenuCopy } from './components/MenuCopy';
import { MenuExport } from './components/MenuExport';
import { MenuImport } from './components/MenuImport';
import { MenuInfo } from './components/MenuInfo';
import { NotInShopifyAdmin } from './components/NotInShopifyAdmin';
import { LoadingIndicator } from './components/LoadingIndicator';
import { getPageContext, navigateTo } from './lib/graphql';
import { ShopifyMenuService } from './lib/menu-service';

enum Tab {
  COPY = 'copy',
  IMPORT = 'import',
  EXPORT = 'export'
}

function App() {
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [pageContext, setPageContext] = useState<ShopifyURLInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>(Tab.COPY);
  const [error, setError] = useState<string | null>(null);
  
  const menuService = new ShopifyMenuService();
  
  // Load page context and auto-detect menu if on a menu page
  useEffect(() => {
    const init = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get the current page context
        const context = await getPageContext();
        setPageContext(context);
        
        // If we're on a specific menu page, load that menu
        if (context.isSpecificMenuPage && context.menuId) {
          try {
            const menu = await menuService.getMenuById(context.menuId);
            if (menu) {
              setSelectedMenu(menu);
              setActiveTab(Tab.COPY); // Default to copy tab for convenience
            } else {
              setError('Could not load menu from this page. Try using the search instead.');
            }
          } catch (err) {
            console.error('Error loading menu:', err);
            setError('Could not load menu: ' + (err instanceof Error ? err.message : String(err)));
          }
        }
      } catch (err) {
        console.error('Error initializing:', err);
        setError('Error initializing: ' + (err instanceof Error ? err.message : String(err)));
      } finally {
        setIsLoading(false);
      }
    };
    
    init();
  }, []);
  
  const handleMenuFound = (menu: Menu) => {
    setSelectedMenu(menu);
    setError(null);
  };
  
  const handleCopySuccess = async (newMenu: Menu) => {
    setSelectedMenu(newMenu);
    setError(null);
    
    // Get the numeric ID from the GraphQL ID
    if (newMenu.id && pageContext?.storeHandle) {
      const numericId = menuService.getNumericIdFromGraphqlId(newMenu.id);
      if (numericId) {
        try {
          // Navigate to the new menu page
          const menuUrl = menuService.getMenuUrl(pageContext.storeHandle, numericId);
          await navigateTo(menuUrl);
          window.close(); // Close the popup after navigation
        } catch (err) {
          console.error('Error navigating to new menu:', err);
          setError('Error navigating to new menu. Please try manually.');
        }
      }
    }
  };
  
  const handleImportSuccess = async (menu: Menu) => {
    setSelectedMenu(menu);
    setError(null);
    
    // Navigate to the new menu if we have the ID and store handle
    if (menu.id && pageContext?.storeHandle) {
      try {
        const numericId = menuService.getNumericIdFromGraphqlId(menu.id);
        if (numericId) {
          const menuUrl = menuService.getMenuUrl(pageContext.storeHandle, numericId);
          await navigateTo(menuUrl);
          window.close(); // Close the popup after navigation
        }
      } catch (err) {
        console.error('Error navigating to imported menu:', err);
        setError('Error navigating to imported menu. Please try manually.');
      }
    }
  };
  
  const renderTabContent = () => {
    if (!selectedMenu) return null;
    
    switch (activeTab) {
      case Tab.COPY:
        return <MenuCopy menu={selectedMenu} onSuccess={handleCopySuccess} />;
      case Tab.EXPORT:
        return <MenuExport menu={selectedMenu} />;
      case Tab.IMPORT:
        return <MenuImport onSuccess={handleImportSuccess} />;
    }
  };
  
  if (isLoading) {
    return <LoadingIndicator message="Loading..." />;
  }
  
  if (!pageContext?.isAdminPage) {
    return <NotInShopifyAdmin />;
  }
  
  return (
    <div className="flex flex-col w-96 p-3 bg-white">
      <header className="mb-3 flex justify-between items-center">
        <h1 className="text-lg font-semibold text-gray-800">Shopify Menu Tool</h1>
        <img src="./icon.png" alt="Shopify Menu Tool" className="h-6 w-6" />
      </header>
      
      {error && (
        <div className="mb-3 p-2 bg-red-50 text-red-700 rounded text-xs">
          {error}
        </div>
      )}
      
      {/* Only show MenuFinder if we're not already on a specific menu page */}
      {(!pageContext?.isSpecificMenuPage || !selectedMenu) && (
        <div className="mb-3">
          {pageContext?.isMenusPage && !pageContext?.isSpecificMenuPage && (
            <div className="bg-blue-50 p-2 mb-2 rounded text-xs text-blue-700">
              You're on the menus page. Select a specific menu.
            </div>
          )}
          <MenuFinder onMenuFound={handleMenuFound} />
        </div>
      )}
      
      {selectedMenu && (
        <>
          <div className="mb-3">
            <MenuInfo menu={selectedMenu} />
          </div>
          
          <div className="mb-3">
            <nav className="flex border-b border-gray-200">
              <button
                className={`flex-1 px-4 py-2 text-xs font-medium ${
                  activeTab === Tab.COPY
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab(Tab.COPY)}
              >
                Copy
              </button>
              <button
                className={`flex-1 px-4 py-2 text-xs font-medium ${
                  activeTab === Tab.EXPORT
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab(Tab.EXPORT)}
              >
                Export
              </button>
              <button
                className={`flex-1 px-4 py-2 text-xs font-medium ${
                  activeTab === Tab.IMPORT
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab(Tab.IMPORT)}
              >
                Import
              </button>
            </nav>
          </div>
          
          <div>
            {renderTabContent()}
          </div>
        </>
      )}
      
      {!selectedMenu && !pageContext?.isSpecificMenuPage && (
        <div className="text-center text-gray-600 bg-gray-50 p-4 rounded text-xs">
          {pageContext?.isMenusPage 
            ? "Select a menu from the Shopify admin" 
            : "Search for a menu to get started"}
        </div>
      )}
    </div>
  );
}

const container = document.getElementById('root');
if (!container) {
    throw new Error('Root element not found');
}

const root = createRoot(container);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
