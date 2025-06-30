import * as React from "react"
import {Check, Command, Inbox, MessageSquareHeart,} from "lucide-react"

import {NavUser} from "@/components/nav-user"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarInput,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import {useEffect, useState} from "react";
import {apiService} from "@/lib/api-service.ts";
import useAuth from "@/hooks/use-auth.ts";
import type {MeResponse} from "@/model/auth-model.ts";
import type {ContactAccRequest, ContactResponse, FollowerResponse} from "@/model/contact-model.ts";
import {Button} from "@/components/ui/button.tsx";
import {Toast} from "@/lib/toast.ts";
import useChat from "@/hooks/use-chat.ts";
import {SignalRContext} from "@/context/signalR-context.ts";

const statusOrder = {Online: 1, Offline: 2, Inactive: 3};

const data = {
    navMain: [
        {
            title: "Inbox",
            url: "/dashboard",
            icon: Inbox,
            isActive: true,
        },
        {
            title: "Follower",
            url: "",
            icon: MessageSquareHeart
        }
    ],
}

export function AppSidebar({...props}: React.ComponentProps<typeof Sidebar>) {
    const {key} = useAuth()
    const {contact, setContact, setActiveChat, page, setPage} = useChat()
    const [activeItem, setActiveItem] = React.useState(data.navMain[0])
    const {setOpen} = useSidebar()

    const [user, setUser] = useState<MeResponse | null>(null)
    const [follower, setFollower] = useState<FollowerResponse[]>([])
    const [search, setSearch] = useState<string>("")

    useEffect(() => {
        apiService.get<MeResponse>("Auth/Me", {key})
            .then((res) => {
                if (res.data) setUser(res.data)
            })

        apiService.get<FollowerResponse[]>("Contact/Follower", {key})
            .then((res) => {
                if (res.data) setFollower(res.data)
            })
    }, [])

    SignalRContext.useSignalREffect("UserStatusChanged", (data) => {
        const res = JSON.parse(atob(data));
        const newContact = contact.map((item) =>
            item.id === res.userId && item.acc
                ? {...item, status: res.status}
                : item
        );
        setContact(newContact);
    }, [])

    const truncate = (str: string, max = 7) => {
        return str.length > max ? str.slice(0, max) + "..." : str;
    }

    return (
        <Sidebar
            collapsible="icon"
            className="overflow-hidden *:data-[sidebar=sidebar]:flex-row"
            {...props}
        >
            <Sidebar
                collapsible="none"
                className="w-[calc(var(--sidebar-width-icon)+1px)]! border-r"
            >
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
                                <a href="/">
                                    <div
                                        className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                                        <Command className="size-4"/>
                                    </div>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-medium">Acme Inc</span>
                                        <span className="truncate text-xs">Enterprise</span>
                                    </div>
                                </a>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupContent className="px-1.5 md:px-0">
                            <SidebarMenu>
                                {data.navMain.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            tooltip={{
                                                children: item.title,
                                                hidden: false,
                                            }}
                                            onClick={() => {
                                                setActiveItem(item)
                                                setOpen(true)
                                                setPage(item.title == "Inbox" ? 0 : 1)
                                                setActiveChat(null)
                                            }}
                                            isActive={activeItem?.title === item.title}
                                            className="px-2.5 md:px-2"
                                        >
                                            <item.icon/>
                                            <span>{item.title}</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
                <SidebarFooter>
                    <NavUser user={user ?? {
                        name: "none",
                        picture: "none",
                        email: "none",
                        id: "none"
                    }}/>
                </SidebarFooter>
            </Sidebar>

            <Sidebar collapsible="none" className="hidden flex-1 md:flex">
                <SidebarHeader className="gap-3.5 border-b p-4">
                    <div className="flex w-full items-center justify-between">
                        <div className="text-foreground text-base font-medium">
                            {activeItem?.title}
                        </div>
                    </div>
                    <SidebarInput placeholder="Type to search..." onChange={(e) => setSearch(e.target.value)}/>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarGroup className="px-0">
                        <SidebarGroupContent>
                            {page == 0 && contact.sort((a, b) => {
                                const getStatus = (value: ContactResponse) => {
                                    if (!value.acc) return "Inactive";
                                    return value.status ? "Online" : "Offline";
                                };
                                return statusOrder[getStatus(a)] - statusOrder[getStatus(b)];
                            })
                                .filter(f => f.name.trim().toLowerCase().startsWith(search) || f.email.trim().toLowerCase().startsWith(search))
                                .map((item) => (
                                    <div
                                        onClick={() => {
                                            const newContact = contact.map((value) =>
                                                value.id === item.id && value.acc
                                                    ? {...value, newMessage: false,}
                                                    : value
                                            );
                                            setContact(newContact);
                                            setActiveChat(item)
                                        }}
                                        key={item.email}
                                        className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex flex-col items-start gap-2 border-b p-4 text-sm leading-tight whitespace-nowrap last:border-b-0"
                                    >
                                        <div className="flex w-full items-center gap-2">
                                            <span>{truncate(item.name, 12)} ({truncate(item.email, 10)})</span>{" "}
                                            <span
                                                className={`ml-auto text-xs px-3 py-0.5 rounded-full ${(item.acc && item.status) && "text-green-500"}`}>
                                            {(item.acc && item.status) ? "Online" : (item.acc) ? "Offline" : "Inactive"}
                                        </span>

                                        </div>
                                        <span className="line-clamp-2 w-[260px] text-xs whitespace-break-spaces">
                                      Status: {item.acc ? "Friends" : "Following"} {item.newMessage && "(New message)"}
                                    </span>
                                    </div>
                                ))}
                            {page == 1 && follower
                                .filter(f => f.name.trim().toLowerCase().startsWith(search) || f.email.trim().toLowerCase().startsWith(search))
                                .map((item) => (
                                    <div
                                        key={item.email}
                                        className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex flex-col items-start gap-2 border-b p-4 text-sm leading-tight whitespace-nowrap last:border-b-0"
                                    >
                                        <div className="flex w-full items-center gap-2">
                                            <div>
                                                <span>{item.name}</span>
                                                <span
                                                    className="line-clamp-2  text-xs whitespace-break-spaces">Email: {item.email}</span>
                                            </div>

                                            <Button
                                                variant={"outline"}
                                                className="ml-auto px-3 py-1 text-xs"
                                                onClick={(event) => {
                                                    (event.currentTarget as HTMLButtonElement).disabled = true
                                                    apiService.post<ContactResponse, ContactAccRequest>("Contact/Follow", {
                                                        key,
                                                        body: {
                                                            userId: item.id
                                                        }
                                                    }).then((response) => {
                                                        if (response.status == 200 && response.data != null) {
                                                            Toast.fire({
                                                                icon: "success",
                                                                title: "Success",
                                                            })

                                                            setFollower(follower.filter(f => f.id != item.id))
                                                            setContact([...contact, response.data])
                                                        } else {
                                                            Toast.fire({
                                                                icon: "error",
                                                                title: "Error",
                                                                text: response.message
                                                            })
                                                        }
                                                    })
                                                }}
                                            >
                                                <Check/>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
            </Sidebar>
        </Sidebar>
    )
}
