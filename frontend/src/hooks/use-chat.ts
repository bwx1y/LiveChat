import {useContext} from "react";
import {ChatProviderContext} from "@/context/chat-context.ts";

const useChat = () => {
    const context =  useContext(ChatProviderContext)
    if (!context) {
        throw new Error("useAuth must be used within a ThemeProvider")
    }
    return context
}

export default useChat