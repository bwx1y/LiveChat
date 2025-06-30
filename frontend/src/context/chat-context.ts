import { createContext } from "react"
import type {ContactResponse} from "@/model/contact-model.ts";

export type ChatProviderState = {
    contact: ContactResponse[];
    setContact: (contact: ContactResponse[]) => void;
    activeChat: ContactResponse | null;
    setActiveChat: (chat: ContactResponse | null) => void;
    page: number;
    setPage: (page: number) => void;
};

export const ChatProviderContext = createContext<ChatProviderState>({
    contact: [],
    setContact: () => {},
    activeChat: null,
    setActiveChat: () => {},
    page: 0,
    setPage: () => {},
});

