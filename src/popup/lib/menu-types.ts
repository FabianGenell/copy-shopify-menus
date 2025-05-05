/**
 * Types for Shopify menu data structures
 */

export enum MenuItemType {
    ARTICLE = 'ARTICLE',
    BLOG = 'BLOG',
    CATALOG = 'CATALOG',
    COLLECTION = 'COLLECTION',
    COLLECTIONS = 'COLLECTIONS',
    CUSTOMER_ACCOUNT_PAGE = 'CUSTOMER_ACCOUNT_PAGE',
    FRONTPAGE = 'FRONTPAGE',
    HTTP = 'HTTP',
    METAOBJECT = 'METAOBJECT',
    PAGE = 'PAGE',
    PRODUCT = 'PRODUCT',
    SEARCH = 'SEARCH',
    SHOP_POLICY = 'SHOP_POLICY'
}

export interface MenuItem {
    id?: string;
    title: string;
    type: MenuItemType | string;
    url?: string;
    resourceId?: string;
    tags?: string[];
    items?: MenuItem[];
}

export interface Menu {
    id?: string;
    title: string;
    handle: string;
    items: MenuItem[];
}

export interface MenuResponse {
    menu?: Menu;
    userErrors?: {
        field: string[];
        message: string;
    }[];
}

export interface CopyMenuOptions {
    /**
     * Custom suffix to append to the menu handle.
     * Defaults to '-copy'
     */
    handleSuffix?: string;

    /**
     * Optional new title for the copied menu.
     * If not provided, it will use the original title.
     */
    newTitle?: string;
}

export interface ShopifyURLInfo {
    /**
     * Whether the URL is a Shopify Admin page
     */
    isAdminPage: boolean;
    
    /**
     * Whether the URL is a menus listing page
     */
    isMenusPage: boolean;
    
    /**
     * Whether the URL is a specific menu detail page
     */
    isSpecificMenuPage: boolean;
    
    /**
     * The store handle extracted from the URL (e.g. "mystore")
     */
    storeHandle: string | null;
    
    /**
     * The menu ID extracted from the URL (e.g. "123456789")
     */
    menuId: string | null;
}

export interface MenuBasicInfo {
    id: string;
    title: string;
    handle: string;
    isDefault?: boolean;
}

export interface ShopifyClientConfig {
    shopDomain: string;
    accessToken: string;
}
