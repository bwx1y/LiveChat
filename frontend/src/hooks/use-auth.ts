import {useContext} from "react";
import {AuthProviderContext} from "@/context/auth-context.ts";

const useAuth = () => {
    const context =  useContext(AuthProviderContext)
    if (!context) {
        throw new Error("useAuth must be used within a ThemeProvider")
    }
    return context
}

export default useAuth