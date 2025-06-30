import { createContext } from "react"

export type AuthProviderState = {
    key: string | null,
    setToken: (token: string) => void,
    removeToken: () => void,
    userId: string|null,
}

export const AuthProviderContext = createContext<AuthProviderState>({
    key: null,
    setToken: () => null,
    removeToken: () => null,
    userId: null,
})

