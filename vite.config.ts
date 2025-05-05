import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { readFileSync, mkdirSync, copyFileSync, unlinkSync } from 'fs';
import sharp from 'sharp';

// Plugin to generate extension icons and copy files
function extensionPlugin() {
    return {
        name: 'extension-plugin',
        async closeBundle() {
            try {
                mkdirSync('dist', { recursive: true });

                const sizes = [16, 48, 128];
                const sourceIcon = readFileSync('src/icon.png');

                await Promise.all(
                    sizes.map(async (size) => {
                        await sharp(sourceIcon).resize(size, size).toFile(`dist/icon${size}.png`);
                        console.log(`✓ Generated icon${size}.png`);
                    })
                );

                // Copy manifest.json and icon
                copyFileSync('src/manifest.json', 'dist/manifest.json');
                copyFileSync('src/icon.png', 'dist/icon.png');
                console.log('✓ Copied manifest.json and icon.png to dist/');

                copyFileSync('dist/src/popup/index.html', 'dist/popup.html');
                unlinkSync('dist/src/popup/index.html');
                console.log('✓ Created popup.html');
                console.log(`✓ Built at ${new Date().toLocaleString()}`);
            } catch (error) {
                console.error('Error in extension plugin:', error);
                throw error;
            }
        }
    };
}

export default defineConfig({
    plugins: [react(), extensionPlugin()],
    base: './',
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        cssCodeSplit: false,
        rollupOptions: {
            input: {
                'popup': 'src/popup/index.html',
                'content-script': 'src/content-script.ts'
            },
            output: {
                entryFileNames: (chunkInfo) => {
                    return chunkInfo.name === 'content-script' ? 'content-script.js' : 'popup.js';
                },
                chunkFileNames: 'assets/[name]-[hash].js',
                assetFileNames: (info) => {
                    if (info.name?.endsWith('.css')) {
                        return 'styles.css';
                    }
                    return 'assets/[name]-[hash][extname]';
                }
            }
        }
    },
    css: {
        modules: {
            localsConvention: 'camelCaseOnly'
        }
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, './src')
        }
    },
    server: {
        port: 3000,
        open: false
    },
    define: {
        'process.env.NODE_ENV': '"production"'
    }
});
