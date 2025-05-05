import React from 'react';
import { Menu } from '../lib/menu-types';

interface MenuInfoProps {
  menu: Menu;
}

export function MenuInfo({ menu }: MenuInfoProps) {
  const countItems = (items: any[]): number => {
    let count = items.length;
    
    for (const item of items) {
      if (item.items && item.items.length > 0) {
        count += countItems(item.items);
      }
    }
    
    return count;
  };
  
  const totalItems = countItems(menu.items);
  
  const getMaxDepth = (items: any[], currentDepth = 1): number => {
    let maxDepth = currentDepth;
    
    for (const item of items) {
      if (item.items && item.items.length > 0) {
        const depth = getMaxDepth(item.items, currentDepth + 1);
        maxDepth = Math.max(maxDepth, depth);
      }
    }
    
    return maxDepth;
  };
  
  const depth = getMaxDepth(menu.items);

  return (
    <div>
      <div className="text-base font-medium mb-2 text-green-700">{menu.title}</div>
      <div className="text-sm text-gray-600 mb-1">Handle: {menu.handle}</div>
      
      <div className="flex items-center text-sm text-gray-600 space-x-4 mt-2">
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7"></path>
          </svg>
          <span><strong>{totalItems}</strong> items</span>
        </div>
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"></path>
          </svg>
          <span><strong>{depth}</strong> level{depth !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
  );
}