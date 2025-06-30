import React, {useEffect, useState} from "react";
import {ChatProviderContext} from "@/context/chat-context.ts";
import type {ContactResponse} from "@/model/contact-model.ts";
import {SignalRContext} from "@/context/signalR-context.ts";
import useAuth from "@/hooks/use-auth.ts";
import {apiService} from "@/lib/api-service.ts";

export const ChatProvider = ({children}: { children: React.ReactNode }) => {
    const {key} = useAuth()
    const [contact, setContact] = useState<ContactResponse[]>([]);
    const [activeChat, setActiveChat] = useState<ContactResponse | null>(null);
    const [page, setPage] = useState<number>(0)

    useEffect(() => {
        if (key) {
            apiService.get<ContactResponse[]>("Contact", {key})
                .then((res) => {
                    if (res.data) setContact(res.data)
                })
        }
    }, []);

    SignalRContext.useSignalREffect("ReceiveMessage", (data) => {
        const response = JSON.parse(atob(data))
        const newContact = contact.map((item) =>
            item.id === response.Form && item.acc
                ? {...item, newMessage: true,}
                : item
        );
        console.log(newContact)
        setContact(newContact);
    }, [])

    SignalRContext.useSignalREffect("UpdateContact", (data) => {
        const res = JSON.parse(atob(data)) as ContactResponse
        const newContact = contact.map((item) =>
            item.id === res.id ? res : item
        );
        setContact(newContact);
    }, [])

    return (
        <ChatProviderContext.Provider value={{contact, setContact, activeChat, setActiveChat, page, setPage}}>
            {children}
        </ChatProviderContext.Provider>
    );
};