import {AppSidebar} from "@/components/app-sidebar"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {Separator} from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import React, {useEffect, useRef, useState} from "react";
import useAuth from "@/hooks/use-auth.ts";
import {useNavigate} from "react-router-dom";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import useChat from "@/hooks/use-chat.ts";
import {apiService} from "@/lib/api-service.ts";
import type {ChatRequest, ChatResponse} from "@/model/chat-model.ts";
import {Form, Formik, type FormikHelpers} from "formik";
import {SignalRContext} from "@/context/signalR-context.ts";
import {SendIcon} from "lucide-react";
import {DashboardMobilePage} from "@/page/dashboard-mobile.tsx";

export default function Page() {
    const navigate = useNavigate();
    const {key, removeToken, userId} = useAuth();
    const {activeChat, setActiveChat, page} = useChat();

    const [messages, setMessages] = useState<ChatResponse[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!key) {
            removeToken();
            navigate("/");
        }
    }, [key, navigate, removeToken]);

    useEffect(() => {
        if (activeChat) {
            apiService.get<ChatResponse[]>(`Contact/${activeChat.id}/Chat`, {key}).then(({data}) => {
                if (data) {
                    setMessages(data);
                }
            })
        }
    }, [key, activeChat]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
    }, [messages]);

    SignalRContext.useSignalREffect("ReceiveMessage", (data) => {
        const response = JSON.parse(atob(data))
        if (activeChat && activeChat.id == response.Form) {
            setMessages((prev) => [...prev, ({
                form: response.Form,
                message: response.Message,
                id: response.Id,
                created: response.Created,
                to: response.To,
            } as ChatResponse)]);
        }
    }, [])

    const submitMessage = (value: ChatRequest, {setSubmitting, resetForm}: FormikHelpers<ChatRequest>) => {
        apiService.post<ChatResponse, ChatRequest>("Chat", {key, body: value}).then(({data}) => {
            if (data) {
                setMessages((pref) => [...pref, data]);
                resetForm();
                setSubmitting(false);
            }
        })
    }

    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "350px",
                } as React.CSSProperties
            }
        >
            <AppSidebar/>
            <SidebarInset>
                {/* Header */}
                <header className="bg-background sticky top-0 flex shrink-0 items-center gap-2 border-b p-4">
                    <SidebarTrigger className="-ml-1"/>
                    <Separator
                        orientation="vertical"
                        className="mr-2 data-[orientation=vertical]:h-4"
                    />
                    <Breadcrumb>
                        <BreadcrumbList>
                            {activeChat ? <>
                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbLink href="#" onClick={() => {
                                        setActiveChat(null)
                                    }}>All Inboxes</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block"/>
                                <BreadcrumbItem>
                                    <BreadcrumbPage>Inbox ({activeChat.name} - {activeChat.email})</BreadcrumbPage>
                                </BreadcrumbItem>
                            </> : <>
                                <BreadcrumbItem>
                                    <BreadcrumbPage>All Inboxes</BreadcrumbPage>
                                </BreadcrumbItem>
                            </>}

                        </BreadcrumbList>
                    </Breadcrumb>
                </header>

                <DashboardMobilePage/>

                {(page == 2 && activeChat) && (<>
                    <div className="flex flex-1 flex-col gap-4 p-4 pb-24 overflow-y-auto">
                        {messages?.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex ${msg.form === userId ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-xs px-4 py-2 rounded-lg ${
                                        msg.form === userId
                                            ? "bg-blue-500 text-white rounded-br-none"
                                            : "bg-muted  rounded-bl-none"
                                    }`}
                                >
                                    {msg.message}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef}/>
                    </div>

                    <div className="sticky bottom-0 bg-background border-t p-4">
                        <Formik<ChatRequest> initialValues={{toUserId: activeChat.id, message: ""}} onSubmit={submitMessage}>
                            {({values, handleChange,}) => (<Form className="flex w-full">
                                <Input
                                    name="message"
                                    type="text"
                                    className="flex-1 border border-muted rounded-l-lg px-4 py-2 focus:outline-none bg-background text-foreground"
                                    placeholder="Tulis pesan..."
                                    value={values.message}
                                    disabled={!(activeChat?.acc)}
                                    onChange={handleChange}
                                />
                                <Button
                                    variant={"outline"}
                                    type="submit"
                                    disabled={!(activeChat?.acc)}
                                    className="ms-4"
                                >
                                    Kirim <SendIcon />
                                </Button>
                            </Form>)}
                        </Formik>
                    </div>
                </>)}
            </SidebarInset>
        </SidebarProvider>
    )
}
