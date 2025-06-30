import {
    ChevronsUpDown,
    LogOut,
    Moon,
    Sun,
    Laptop, Copy,
} from "lucide-react"

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import {useTheme} from "@/hooks/use-theme.ts";
import useAuth from "@/hooks/use-auth.ts";
import {useNavigate} from "react-router-dom";
import type {MeResponse} from "@/model/auth-model.ts";
import {Toast} from "@/lib/toast.ts";

export function NavUser({user}: { user: MeResponse }) {
    const navigate = useNavigate()
    const {removeToken} = useAuth()
    const {isMobile} = useSidebar()
    const {setTheme} = useTheme()

    function getInitials(name: string): string {
        if (!name) return "";

        const words = name.trim().split(/\s+/);
        const initials = words.slice(0, 2).map(word => word[0].toUpperCase());

        return initials.join("");
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground md:h-8 md:p-0"
                        >
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage src={user.picture ?? ""} alt={user.name}/>
                                <AvatarFallback className="rounded-lg">{getInitials(user.name)}</AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">{user.name}</span>
                                <span className="truncate text-xs">{user.email}</span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4"/>
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    {user.picture ? (<AvatarImage src={user.picture} alt={user.name}/>) : (
                                        <AvatarFallback className="rounded-lg">CN</AvatarFallback>)}
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">{user.name}</span>
                                    <span className="truncate text-xs">{user.email}</span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem onClick={() => {
                            navigator.clipboard.writeText(`${window.location.host}/contact/${user.id}`)
                                .then(() => {
                                    Toast.fire({
                                        icon: "success",
                                        text: "Success copy link profile",
                                    })
                                });
                        }}>
                            <Copy className="mr-2 h-4 w-4"/>
                            Copy link profile
                        </DropdownMenuItem>
                        <DropdownMenuSeparator/>
                        <DropdownMenuLabel>Theme</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => setTheme("light")}>
                            <Sun className="mr-2 h-4 w-4"/>
                            Light
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme("dark")}>
                            <Moon className="mr-2 h-4 w-4"/>
                            Dark
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme("system")}>
                            <Laptop className="mr-2 h-4 w-4"/>
                            System
                        </DropdownMenuItem>
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem onClick={() => {
                            removeToken()
                            navigate("/")
                        }}>
                            <LogOut/>
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
