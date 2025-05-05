# Shopify Menu Copier

A Chrome extension that makes it easy to copy, export, and import Shopify menus directly from your Shopify admin.

## ✨ Key Features

* **🔄 Copy Menus:** Quickly duplicate existing navigation menus with custom handle suffixes and optional new titles.
* **📥 Export Menus:** Export any menu as JSON to save for backup or transfer between stores.
* **📤 Import Menus:** Import previously exported menu JSON to recreate menus in any Shopify store.
* **🔒 Secure Authentication:** Uses your existing Shopify admin session for API access - no API keys needed.
* **🚀 Fast & Intuitive:** Modern React UI with a clean, user-friendly design.

## 🛠️ How It Works

This extension leverages the Shopify Admin GraphQL API to:

1. **Fetch Menu Data:** Retrieves all menu content including nested items, urls, and link targets.
2. **Copy Menus:** Duplicates a menu with a new handle (default adds "-copy") while preserving the entire structure.
3. **Export/Import:** Converts menus to/from JSON format for easy backup and migration.

## 🔧 Technical Details

* **UI Framework:** React 18 with TypeScript
* **Styling:** Tailwind CSS for a responsive, utility-first design
* **API Communication:** GraphQL requests via content script to the authenticated Shopify Admin API
* **Extension Framework:** Chrome Extension Manifest V3

## 🚀 Getting Started

### Installation

1. **Chrome Web Store:**
   * Coming soon!

2. **Manual Installation:**
   * Clone this repository
   * Run `npm install` followed by `npm run build`
   * Open Chrome and navigate to `chrome://extensions/`
   * Enable "Developer mode" (top-right toggle)
   * Click "Load unpacked" and select the `dist` folder

### Usage

1. Navigate to any page in your Shopify admin
2. Click the extension icon in your browser toolbar
3. Enter the handle of the menu you want to work with
4. Use the tabs to:
   * **Copy:** Duplicate the menu with a custom suffix
   * **Export:** Save the menu as JSON
   * **Import:** Create a new menu from JSON

## 💻 Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Load the extension from the `dist` folder (see Manual Installation)

## 📄 Technical Notes

The extension works by:

1. Using a content script that runs on Shopify Admin pages
2. Leveraging your existing authenticated session to make API calls
3. Communicating between the popup and content script using Chrome message passing

## 📦 Building for Production

```bash
npm run build
```

This generates a production-ready extension in the `dist` folder.

## 📝 License

MIT License

---

Built with ❤️ for Shopify merchants and developers