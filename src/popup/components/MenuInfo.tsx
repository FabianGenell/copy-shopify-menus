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
    <div className="bg-gray-50 rounded p-3 mb-2">
      <div className="text-sm font-medium mb-2 text-blue-700">{menu.title}</div>
      
      <div className="flex items-center text-xs text-gray-500 space-x-3">
        <div>
          <span className="font-medium">{totalItems}</span> items
        </div>
        <div>
          <span className="font-medium">{depth}</span> level{depth !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}