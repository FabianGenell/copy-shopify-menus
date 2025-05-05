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
    <div className="p-4 bg-white rounded-md shadow-sm">
      <h2 className="text-lg font-medium mb-3">Menu Information</h2>
      
      <div className="space-y-1 text-sm">
        <div className="grid grid-cols-3">
          <div className="font-medium">Title:</div>
          <div className="col-span-2">{menu.title}</div>
        </div>
        
        <div className="grid grid-cols-3">
          <div className="font-medium">Handle:</div>
          <div className="col-span-2">{menu.handle}</div>
        </div>
        
        <div className="grid grid-cols-3">
          <div className="font-medium">Items:</div>
          <div className="col-span-2">{totalItems}</div>
        </div>
        
        <div className="grid grid-cols-3">
          <div className="font-medium">Depth:</div>
          <div className="col-span-2">{depth} level{depth !== 1 ? 's' : ''}</div>
        </div>
        
        {menu.id && (
          <div className="grid grid-cols-3">
            <div className="font-medium">ID:</div>
            <div className="col-span-2 truncate" title={menu.id}>{menu.id}</div>
          </div>
        )}
      </div>
    </div>
  );
}