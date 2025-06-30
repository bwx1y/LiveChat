import {Link, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {apiService} from "@/lib/api-service.ts";
import useAuth from "@/hooks/use-auth.ts";
import {Card} from "@/components/ui/card.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar.tsx";
import type {
    ContactAccRequest,
    ContactGetByIdResponse,
    ContactResponse,
} from "@/model/contact-model.ts";
import {Toast} from "@/lib/toast.ts";
import useChat from "@/hooks/use-chat.ts";

export const ContactPage = () => {
    const {key} = useAuth()
    const {id} = useParams()
    const {contact, setContact} = useChat()
    const [user, setUser] = useState<ContactGetByIdResponse | null>(null)

    useEffect(() => {
        apiService.get<ContactGetByIdResponse>(`Contact/${id}`, {key}).then(({data}) => {
            if (data) {
                setUser(data)
            }
        })
    }, []);

    function getInitials(name: string): string {
        if (!name) return "";

        const words = name.trim().split(/\s+/);
        const initials = words.slice(0, 2).map(word => word[0].toUpperCase());

        return initials.join("");
    }

    const followClick = () => {
        apiService.post<ContactResponse, ContactAccRequest>(`Contact/Follow`, {key, body: {userId: id ?? ""}}).then(({data}) => {
            if (data) {
                Toast.fire({
                    title: "Success",
                    icon: "success",
                    text: `Following ${user?.name}`,
                })
                setUser((prev) => {
                    if (!prev) return null;
                    return {
                        ...prev,
                        enableAdd: false,
                    };
                });

                setContact([...contact, data])
            }
        })
    }

    return (<div className="flex items-center justify-center min-h-screen ">
        <Card className="w-full max-w-sm p-6 rounded-2xl shadow-lg text-center">
            <div className="flex flex-col items-center space-y-4">
                {/* Foto Profil */}
                <Avatar className="h-24 w-24 rounded-lg">
                    {user?.picture ? (<AvatarImage src={user.picture} alt={user.name}/>) : (
                        <AvatarFallback className="rounded-lg">{getInitials(user?.name ?? "none")}</AvatarFallback>)}
                </Avatar>

                {/* Nama dan Email */}
                <div>
                    <h2 className="text-xl font-semibold">{user?.name}</h2>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                </div>

                {/* Tombol */}
                <div className="flex w-full pt-4 gap-4">
                    <Button variant="outline" className="flex-1" asChild>
                        <Link to={"/"}>Back</Link>
                    </Button>
                    {user?.enableAdd && <Button onClick={followClick} className="flex-1">Follow</Button>}
                </div>

            </div>
        </Card>
    </div>)
}