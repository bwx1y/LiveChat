import React from "react";
import { HttpTransportType } from "@microsoft/signalr";
import {SignalRContext} from "@/context/signalR-context.ts";
import useAuth from "@/hooks/use-auth.ts";

export const SignalRProvider = ({ children }: { children: React.ReactNode }) => {
    const { key } = useAuth();

    if (!key) return <>{children}</>;

    return (
        <SignalRContext.Provider
            url="/hub"
            accessTokenFactory={() => key}
            transport={HttpTransportType.WebSockets} // Atau LongPolling jika masih bermasalah
            automaticReconnect={true}
        >
            {children}
        </SignalRContext.Provider>
    );
};