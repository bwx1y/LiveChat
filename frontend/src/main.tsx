import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import '@/index.css'
import {ThemeProvider} from "@/provider/theme-provider.tsx";
import {RouterProvider} from "react-router-dom";
import routes from "@/lib/routes.tsx";
import {AuthProvider} from "@/provider/auth-provider.tsx";
import {SignalRProvider} from "@/provider/signalR-provider.tsx";
import {ChatProvider} from "@/provider/chat-provider.tsx";

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ThemeProvider defaultTheme={'dark'} storageKey={'vite-ui-theme'}>
            <AuthProvider>
                <SignalRProvider>
                    <ChatProvider>
                        <RouterProvider router={routes}/>
                    </ChatProvider>
                </SignalRProvider>
            </AuthProvider>
        </ThemeProvider>
    </StrictMode>
)
