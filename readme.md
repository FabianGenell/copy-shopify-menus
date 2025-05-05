# Shopify Admin Chrome Extension Template

A starter template for building Chrome extensions that interact with the Shopify Admin interface, featuring a pre-configured setup for making authenticated GraphQL API calls directly from the extension.

Built with React, TypeScript, Vite, and Tailwind CSS.

## ✨ Key Features

* **🚀 Pre-configured Shopify Admin API Connection:** The most significant feature! The setup for making authenticated GraphQL requests to the Shopify Admin API is already implemented using a content script (`src/content-script.ts`) and message passing (`src/popup/lib/graphql.ts`). You can start making API calls without worrying about authentication handling.
* **⚛️ Modern Tech Stack:** Utilizes React for building the popup user interface, TypeScript for enhanced code quality and type safety, Vite for a fast development experience and optimized builds, and Tailwind CSS for utility-first styling.
* **📄 Content Script Integration:** Includes a content script designed to run on Shopify Admin pages (`https://admin.shopify.com/*`), enabling interaction with the page context and handling API requests.
* **🎨 Basic Popup UI:** A simple popup UI (`src/popup/index.tsx` and `src/popup/index.html`) is provided as a starting point for your extension's interface.
* **⚡️ Fast Development Workflow:** Leverages Vite's capabilities for near-instant Hot Module Replacement (HMR) during development.
* **🛠️ Optimized Production Build:** Comes with a pre-configured Vite setup to generate optimized and bundled files for production deployment.
* **📜 Optional Schema Downloader:** Includes a utility script (`scripts/download-schema.ts`) to fetch the latest Shopify Admin GraphQL schema, aiding in development with better type checking and auto-completion.

## 🔧 How the Shopify Admin API Connection Works (The Important Part!)

This template elegantly solves the common challenge of making authenticated API calls from a Chrome extension popup to the Shopify Admin. Here’s the step-by-step process:

1.  **Popup Initiates Request:** When your popup UI needs data from the Shopify Admin (e.g., by calling the `executeGraphQLRequest` function in `src/popup/lib/graphql.ts`), it prepares the GraphQL query, variables, and operation name.
2.  **Message Passing to Content Script:** The popup sends a message with the type `graphql-request` containing the GraphQL parameters to the content script currently active on the Shopify Admin tab. This is done using `chrome.tabs.sendMessage`.
3.  **Content Script Receives Message:** The content script (`src/content-script.ts`), which is injected into the Shopify Admin page, listens for messages of type `graphql-request` using `chrome.runtime.onMessage.addListener`.
4.  **Dynamic API Endpoint:** The content script automatically determines the correct GraphQL API endpoint based on the current store's URL (e.g., `https://admin.shopify.com/store/YOUR_STORE_NAME/api/2025-01/graphql.json`).
5.  **Authenticated `fetch` Call:** This is the crucial step. The content script makes the `fetch` request to the determined Shopify Admin GraphQL endpoint. It includes the option `credentials: 'include'`, which automatically attaches the necessary authentication cookies from the user's active Shopify Admin session to the request. This leverages the user's existing login.
6.  **Content Script Handles Response:** The content script receives the JSON response (containing `data` or `errors`) from the Shopify API.
7.  **Response Sent Back to Popup:** The content script sends the received data (or error information) back to the popup script that initiated the request, using the `sendResponse` callback function provided by the message listener.
8.  **Popup Processes Result:** The `executeGraphQLRequest` function in the popup receives the response from the content script and resolves (or rejects) its promise, making the data or error available to your React components.

This architecture allows your extension popup to securely interact with the Shopify Admin API on behalf of the logged-in user without requiring separate API keys or handling complex authentication flows within the popup itself.

## 🛠️ Tech Stack

* **UI Framework:** React 18
* **Language:** TypeScript
* **Build Tool:** Vite
* **Styling:** Tailwind CSS
* **Browser API:** Chrome Extension Manifest V3

## 🚀 Getting Started

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <repository-directory>
    ```
2.  **Install dependencies:**
    ```bash
    # Using npm
    npm install

    # Or using yarn
    yarn install

    # Or using bun
    bun install
    ```
3.  **Run the development build:**
    This command starts Vite in watch mode. It will continuously build the extension into the `dist` folder whenever you make changes to the source files.
    ```bash
    # Using npm
    npm run dev

    # Or using yarn
    yarn dev

    # Or using bun
    bun run dev
    ```
4.  **Load the extension in Google Chrome:**
    * Open Chrome and navigate to the extensions page: `chrome://extensions`.
    * Enable "Developer mode" using the toggle switch (usually located in the top-right corner).
    * Click the "Load unpacked" button.
    * Select the `dist` folder that was generated in your project directory by the build process.
5.  **Test:** Navigate to any page within your Shopify Admin dashboard (e.g., `https://admin.shopify.com/store/your-store-name/orders`). Click the extension's icon in your Chrome toolbar. The basic popup UI should appear.

## 💻 Development Workflow

* Keep the `npm run dev` (or yarn/bun equivalent) command running in your terminal.
* Modify the code within the `src` directory. Vite will automatically rebuild the affected parts of the extension into the `dist` folder.
* **Reloading:**
    * Changes to the popup UI (`src/popup/*`) often take effect simply by closing and reopening the popup.
    * Changes to the content script (`src/content-script.ts`) or the manifest file (`src/manifest.json`) usually require you to reload the extension from the `chrome://extensions` page (click the refresh icon on the extension's card).

## 📦 Building for Production

1.  **Run the production build command:**
    ```bash
    # Using npm
    npm run build

    # Or using yarn
    yarn build

    # Or using bun
    bun run build
    ```
2.  This command generates an optimized and minified version of your extension in the `dist` folder.
3.  **Packaging:** You can create a zip archive of the *contents* of the `dist` folder. This zip file is what you would typically upload to the Chrome Web Store or distribute manually.

## 📁 Project Structure

```
.
├── dist/                 # Built extension files (output directory)
├── scripts/
│   └── download-schema.ts # Optional script to fetch Shopify GraphQL schema
├── src/
│   ├── lib/               # General utility functions shared across the extension
│   │   └── utils.ts
│   ├── popup/             # Contains all code related to the extension's popup window
│   │   ├── lib/           # Utilities specific to the popup
│   │   │   ├── graphql.ts # Core function to send GraphQL requests via content script
│   │   │   └── utils.ts   # Popup-specific helper functions (e.g., cn for classnames)
│   │   ├── constants.ts   # Application constants (e.g., storage keys)
│   │   ├── index.html     # HTML entry point for the popup
│   │   ├── index.tsx      # React root component for the popup UI
│   │   └── styles.css     # Base CSS and Tailwind directives for the popup
│   ├── content-script.ts # Script injected into Shopify Admin pages to handle API calls
│   ├── icon.png          # Source icon used to generate various sizes
│   └── manifest.json     # Chrome Extension manifest file (configuration)
├── .gitignore            # Specifies intentionally untracked files for Git
├── package.json          # Project metadata and dependencies
├── postcss.config.js     # PostCSS configuration (for Tailwind/Autoprefixer)
├── tailwind.config.ts    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript compiler options for the main source
├── tsconfig.node.json    # TypeScript compiler options for Node.js scripts (like Vite config)
└── vite.config.ts        # Vite build tool configuration
```

## 📜 Downloading GraphQL Schema (Optional)

For enhanced development experience with type safety and autocompletion for your GraphQL queries, you can download the Shopify Admin API schema:

```bash
# Using npm
npm run download-schema

# Or using yarn
yarn download-schema

# Or using bun
bun run download-schema
```

This script performs an introspection query against the Shopify Admin GraphQL endpoint and saves the resulting schema definition to `src/popup/lib/schema.ts`. You can potentially integrate this schema with tools like GraphQL Code Generator for even more robust type generation. Note that the generated `schema.ts` file is ignored by default in `.repomixignore`.

---

Happy Building!
