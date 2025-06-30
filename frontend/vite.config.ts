import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import * as path from "node:path";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({isPreview}) => {
    return {
        build: {
            rollupOptions: {
                output: {
                    manualChunks: {
                        vendor: ['react', "react-dom"]
                    }
                }
            }
        },
        plugins: [react(), tailwindcss()],
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "./src"),
            },
        },
        server: {
            host: '0.0.0.0',
            port: 8000,
            proxy: {
                "/api": {
                    target: isPreview ? "http://backend:8080" : "http://localhost:5066",
                    changeOrigin: true,
                    secure: true
                },
                '/hub': {
                    target: isPreview ? "http://backend:8080" : "http://localhost:5066",
                    changeOrigin: true,
                    ws: true,
                    secure: true
                }
            }
        }
    }
})
