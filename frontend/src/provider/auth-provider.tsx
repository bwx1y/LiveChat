import * as React from "react";
import {useEffect, useState} from "react";
import {AuthProviderContext} from "../context/auth-context.ts";

type AuthProviderProps = {
    children: React.ReactNode
    storageKey?: string
}

export const AuthProvider = ({
                                 children,
                                 storageKey = "auth-token",
                             }: AuthProviderProps) => {
    const [token, setToken] = useState<string | null>(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem(storageKey)
        }
        return null
    })
    const [userId, setUserId] = useState<string | null>(null)

    useEffect(() => {
        if (token) {
            const body = JSON.parse(atob(token.split(".")[1]))
            setUserId(body["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/sid"])
            window.localStorage.setItem(storageKey, token)
        } else {
            window.localStorage.removeItem(storageKey)
        }
    }, [storageKey, token])

    const removeToken = () => setToken(null);

    return (
        <AuthProviderContext.Provider value={{key: token, userId: userId, setToken, removeToken}}>
            {children}
        </AuthProviderContext.Provider>
    )
}