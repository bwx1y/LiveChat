import {
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarInput,
    useSidebar
} from "@/components/ui/sidebar.tsx";
import useChat from "@/hooks/use-chat.ts";
import type {ContactAccRequest, ContactResponse, FollowerResponse} from "@/model/contact-model.ts";
import {Button} from "@/components/ui/button.tsx";
import {apiService} from "@/lib/api-service.ts";
import {Toast} from "@/lib/toast.ts";
import {Check} from "lucide-react";
import {useEffect, useState} from "react";
import useAuth from "@/hooks/use-auth.ts";

const statusOrder = {Online: 1, Offline: 2, Inactive: 3};

export const DashboardMobilePage = () => {
    const {key} = useAuth()
    const {page, setPage, contact, setContact, setActiveChat} = useChat()
    const {isMobile} = useSidebar()

    const [search, setSearch] = useState('')
    const [follower, setFollower] = useState<FollowerResponse[]>([])
    useEffect(() => {
        apiService.get<FollowerResponse[]>("Contact/Follower", {key})
            .then((res) => {
                if (res.data) setFollower(res.data)
            })
    }, [])

    const truncate = (str: string, max = 7) => {
        return str.length > max ? str.slice(0, max) + "..." : str;
    }

    return (<div className="flex-1">
        {isMobile && (<>
            <div className="gap-3.5 border-b p-4">
                <SidebarInput placeholder="Type to search..." onChange={(e) => setSearch(e.target.value)}/>
            </div>
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
                                        setActiveChat(item);
                                        setPage(2)
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
                                    {/*<span className="font-medium">Status: {item.acc ? "Friends" : "Following"}</span>*/}
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

                                    {/*<span className="font-medium">Status: {item.acc ? "Friends" : "Following"}</span>*/}
                                </div>
                            ))}
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent></>)}
    </div>)

}