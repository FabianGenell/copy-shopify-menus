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
      default:
        return null;
    }
  };
  
  if (isLoading) {
    return <LoadingIndicator message="Loading..." />;
  }
  
  if (!pageContext?.isAdminPage) {
    return <NotInShopifyAdmin />;
  }
  
  return (
    <div className="flex flex-col w-96 p-4 bg-white shadow-sm">
      <header className="mb-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-800">Shopify Menu Tool</h1>
        <img src="./icon.png" alt="Shopify Menu Tool" className="h-7 w-7" />
      </header>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-100 text-sm">
          {error}
        </div>
      )}
      
      {/* Always show menu finder */}
      <div className={`${selectedMenu ? 'pb-4 mb-4' : 'pb-5 mb-5'} border-b border-gray-200`}>
        <h2 className="text-base font-medium mb-2 text-gray-800">Menu Selection</h2>
        
        {pageContext?.isMenusPage && !pageContext?.isSpecificMenuPage && !selectedMenu && (
          <div className="bg-blue-50 p-3 mb-3 rounded-md border border-blue-100 text-sm text-blue-700">
            You're on the menus page. Select a specific menu from below.
          </div>
        )}
        
        {!selectedMenu && (
          <p className="text-sm text-gray-600 mb-3">
            Find and select a menu from your store:
          </p>
        )}
        
        <MenuFinder onMenuFound={handleMenuFound} />
      </div>
      
      {selectedMenu ? (
        <>
          <div className="mb-4 p-3 bg-green-50 rounded-md border border-green-100">
            <MenuInfo menu={selectedMenu} />
          </div>
          
          {/* Show tabs after a menu is selected */}
          <div className="mb-4">
            <nav className="flex border border-gray-200 rounded-md overflow-hidden">
              <button
                className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors duration-150 ${
                  activeTab === Tab.COPY
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab(Tab.COPY)}
              >
                Copy
              </button>
              <button
                className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors duration-150 ${
                  activeTab === Tab.EXPORT
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab(Tab.EXPORT)}
              >
                Export
              </button>
              <button
                className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors duration-150 ${
                  activeTab === Tab.IMPORT
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab(Tab.IMPORT)}
              >
                Import
              </button>
            </nav>
          </div>
          
          <div className="bg-white rounded-md border border-gray-200 p-4">
            {renderTabContent()}
          </div>
        </>
      ) : (
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
          <h2 className="text-base font-medium mb-2 text-gray-800">Import a Menu</h2>
          <p className="text-sm text-gray-600 mb-3">
            Import a menu from a JSON file:
          </p>
          <MenuImport onSuccess={handleImportSuccess} />
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
