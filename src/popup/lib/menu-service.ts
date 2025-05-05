import { CopyMenuOptions, Menu, MenuResponse, ShopifyURLInfo } from './menu-types';
import { executeGraphQLRequest } from './graphql';

/**
 * Service for interacting with Shopify menus
 */
export class ShopifyMenuService {
    /**
     * Extracts store and menu information from a Shopify Admin URL
     * 
     * @param url - The Shopify Admin URL to parse
     * @returns Information about the Shopify URL
     */
    extractShopifyUrlInfo(url: string): ShopifyURLInfo | null {
        if (!url.includes('admin.shopify.com')) {
            return null;
        }

        const result: ShopifyURLInfo = {
            isAdminPage: true,
            isMenusPage: false,
            isSpecificMenuPage: false,
            storeHandle: null,
            menuId: null
        };

        // Extract store handle
        const storeMatch = url.match(/admin\.shopify\.com\/store\/([^\/]+)/);
        if (storeMatch && storeMatch[1]) {
            result.storeHandle = storeMatch[1];
        }

        // Check if it's a menus page
        if (url.includes('/content/menus')) {
            result.isMenusPage = true;

            // Check if it's a specific menu page
            const menuIdMatch = url.match(/\/menus\/(\d+)(?:\/|$)/);
            if (menuIdMatch && menuIdMatch[1]) {
                result.isSpecificMenuPage = true;
                result.menuId = menuIdMatch[1];
            }
        }

        return result;
    }

    /**
     * Get the URL for a specific menu
     * 
     * @param storeHandle - The store handle
     * @param menuId - The menu ID
     * @returns The menu URL
     */
    getMenuUrl(storeHandle: string, menuId: string): string {
        return `https://admin.shopify.com/store/${storeHandle}/content/menus/${menuId}`;
    }

    /**
     * Fetches a menu by its handle
     *
     * @param handle - The handle of the menu to fetch
     * @returns The menu object
     */
    async getMenuByHandle(handle: string): Promise<Menu | null> {
        const query = `
      query getMenu($handle: String!) {
        menu(handle: $handle) {
          id
          title
          handle
          items {
            id
            title
            type
            url
            resourceId
            items {
              id
              title
              type
              url
              resourceId
              items {
                id
                title
                type
                url
                resourceId
              }
            }
          }
        }
      }
    `;

        try {
            const response = await executeGraphQLRequest({
                query,
                variables: { handle }
            });

            // Check if the response has the expected structure
            if (!response?.data?.menu) {
                console.warn('Menu not found or invalid response structure:', response);
                return null;
            }

            return response.data.menu;
        } catch (error) {
            console.error('Error fetching menu:', error);
            return null;
        }
    }

    /**
     * Fetches a menu by its ID (GraphQL ID or numeric ID)
     *
     * @param id - The ID of the menu to fetch
     * @returns The menu object
     */
    async getMenuById(id: string): Promise<Menu | null> {
        // If this is a numeric ID, convert it to a GraphQL ID
        let gqlId = id;
        if (id && !id.startsWith('gid://')) {
            gqlId = `gid://shopify/Menu/${id}`;
        }

        const query = `
      query getMenu($id: ID!) {
        menu(id: $id) {
          id
          title
          handle
          items {
            id
            title
            type
            url
            resourceId
            items {
              id
              title
              type
              url
              resourceId
              items {
                id
                title
                type
                url
                resourceId
              }
            }
          }
        }
      }
    `;

        try {
            const response = await executeGraphQLRequest({
                query,
                variables: { id: gqlId }
            });

            // Check if the response has the expected structure
            if (!response?.data?.menu) {
                console.warn('Menu not found or invalid response structure:', response);
                return null;
            }

            return response.data.menu;
        } catch (error) {
            console.error('Error fetching menu:', error);
            return null;
        }
    }

    /**
     * Creates a new menu
     *
     * @param menu - The menu to create
     * @returns The created menu
     */
    async createMenu(menu: Menu): Promise<MenuResponse> {
        const mutation = `
      mutation menuCreate($input: MenuInput!) {
        menuCreate(input: $input) {
          menu {
            id
            title
            handle
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

        // Create a copy of the menu without the id fields
        const menuInput = {
            title: menu.title,
            handle: menu.handle,
            items: this.prepareMenuItemsForInput(menu.items)
        };

        try {
            const response = await executeGraphQLRequest({
                query: mutation,
                variables: { input: menuInput }
            });

            return response.data.menuCreate;
        } catch (error) {
            console.error('Error creating menu:', error);
            return { userErrors: [{ field: [], message: String(error) }] };
        }
    }

    /**
     * Prepares menu items for input by removing id fields
     *
     * @param items - The menu items to prepare
     * @returns The prepared menu items
     */
    private prepareMenuItemsForInput(items: any[]): any[] {
        return items.map((item) => {
            const newItem: any = {
                title: item.title,
                type: item.type
            };

            if (item.url) newItem.url = item.url;
            if (item.resourceId) newItem.resourceId = item.resourceId;

            if (item.items && item.items.length > 0) {
                newItem.items = this.prepareMenuItemsForInput(item.items);
            }

            return newItem;
        });
    }

    /**
     * Copies a menu with a new handle
     *
     * @param menuHandleOrId - The handle or ID of the menu to copy
     * @param options - Options for copying the menu
     * @returns The copied menu
     */
    async copyMenu(menuHandleOrId: string, options: CopyMenuOptions = {}): Promise<MenuResponse> {
        const handleSuffix = options.handleSuffix || '-copy';

        try {
            // Determine if menuHandleOrId is an ID or handle
            let menu: Menu | null;
            let menuType = 'handle';
            
            if (menuHandleOrId.startsWith('gid://') || /^\d+$/.test(menuHandleOrId)) {
                menuType = 'ID';
                menu = await this.getMenuById(menuHandleOrId);
            } else {
                menuType = 'handle';
                menu = await this.getMenuByHandle(menuHandleOrId);
            }

            if (!menu) {
                return {
                    userErrors: [
                        {
                            field: ['menuHandleOrId'],
                            message: `Menu with ${menuType} "${menuHandleOrId}" not found. This could be because the menu doesn't exist or you don't have permission to access it.`
                        }
                    ]
                };
            }

            if (!menu.items || !Array.isArray(menu.items)) {
                return {
                    userErrors: [
                        {
                            field: ['menu.items'],
                            message: `The menu was found but has invalid structure. Expected an array of items but got: ${JSON.stringify(menu.items)}`
                        }
                    ]
                };
            }

            // Create a new menu with modified handle and optional title
            const newMenu: Menu = {
                title: options.newTitle || menu.title,
                handle: `${menu.handle}${handleSuffix}`,
                items: menu.items
            };

            return this.createMenu(newMenu);
        } catch (error) {
            console.error('Error copying menu:', error);
            return {
                userErrors: [
                    {
                        field: ['unknown'],
                        message: `Error copying menu: ${error instanceof Error ? error.message : String(error)}`
                    }
                ]
            };
        }
    }

    /**
     * Exports a menu to a plain object
     *
     * @param menuHandleOrId - The handle or ID of the menu to export
     * @returns The exported menu object
     */
    async exportMenu(menuHandleOrId: string): Promise<Menu | null> {
        // Determine if menuHandleOrId is an ID or handle
        let menu: Menu | null;
        if (menuHandleOrId.startsWith('gid://') || /^\d+$/.test(menuHandleOrId)) {
            menu = await this.getMenuById(menuHandleOrId);
        } else {
            menu = await this.getMenuByHandle(menuHandleOrId);
        }

        return menu;
    }

    /**
     * Imports a menu from a plain object
     *
     * @param menu - The menu object to import
     * @returns The created menu
     */
    async importMenu(menu: Menu): Promise<MenuResponse> {
        return this.createMenu(menu);
    }

    /**
     * Gets the numeric ID from a GraphQL ID
     * 
     * @param graphqlId - The GraphQL ID (gid://shopify/Menu/1234)
     * @returns The numeric ID or null if not valid
     */
    getNumericIdFromGraphqlId(graphqlId: string): string | null {
        if (!graphqlId?.startsWith('gid://')) {
            return graphqlId; // Already a numeric ID
        }

        const match = graphqlId.match(/gid:\/\/shopify\/Menu\/(\d+)/);
        return match ? match[1] : null;
    }
}
