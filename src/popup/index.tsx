import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const container = document.getElementById('root');
if (!container) {
    throw new Error('Root element not found');
}

const root = createRoot(container);
root.render(
    <React.StrictMode>
        <div className="flex flex-col h-screen">
            <div className="flex-1 overflow-auto">
                <h1>welcome to the shopify admin</h1>
            </div>
        </div>
    </React.StrictMode>
);
