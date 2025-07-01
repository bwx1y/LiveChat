import {useEffect, useState} from "react";
import {useNavigate, useSearchParams} from "react-router-dom";
import type {AuthResponse, LoginGmailPath, LoginGmailRequest} from "@/model/auth-model.ts";
import {apiService} from "@/lib/api-service.ts";
import useAuth from "@/hooks/use-auth.ts";
import {Toast} from "@/lib/toast.ts";

export function LoginGmailRedirect() {
    const navigate = useNavigate();
    const {key} = useAuth()

    useEffect(() => {
        if (key) {
            navigate("/")
        } else {
            const redirectToGmail = async () => {
                try {
                    const {data} = await apiService.get<LoginGmailPath>("Auth/Login-gmail", {key: null});
                    if (data?.url) {
                        window.location.href = data.url;
                    } else {
                        navigate("/");
                    }
                } catch (error) {
                    console.error("Failed to redirect:", error);
                    navigate("/");
                }
            };

            redirectToGmail();
        }
    }, [navigate, key]);

    return (<div className="flex flex-col items-center justify-center min-h-screen">
        <div className="loader mb-4"></div>
        <p className="text-lg font-medium text-gray-700">Loading...</p>
    </div>);
}


export function LoginGmail() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const code = searchParams.get("code");
    const {setToken, key} = useAuth()
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (code == null || key != null) {
            navigate("/");
        } else {
            if (!loading) {
                setLoading(true)
                apiService.post<AuthResponse, LoginGmailRequest>("Auth/Callback-Gmail", {
                    key: null,
                    body: {code}
                }).then(({data}) => {
                    if (data) {
                        setToken(data.token.key)

                        Toast.fire({
                            icon: "success",
                            title: "Success",
                            text: `You have been successfully logged in!`,
                        })
                    } else {
                        Toast.fire({
                            icon: "error",
                            title: "Error",
                            text: `You have not logged in!`,
                        }).then(() => navigate("/"))
                    }
                })
            }
        }
    }, [])

    return (<div className="flex flex-col items-center justify-center min-h-screen">
        <div className="loader mb-4"></div>
        <p className="text-lg font-medium text-gray-700">Loading...</p>
    </div>);
}