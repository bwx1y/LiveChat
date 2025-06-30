import {createBrowserRouter} from "react-router-dom";
import IndexPage from "@/page";
import RegisterPage from "@/page/register.tsx";
import {LoginGmail, LoginGmailRedirect} from "@/page/login-gmail.tsx";
import DashboardPage from "@/page/dashboard.tsx";
import {ContactPage} from "@/page/contact.tsx";

const routes = createBrowserRouter([
    {
        path: '/',
        element: <IndexPage/>
    },
    {
        path: '/register',
        element: <RegisterPage/>
    },
    {
        path: "/login-gmail",
        element: <LoginGmailRedirect/>
    },
    {
        path: "/oauth2callback",
        element: <LoginGmail/>
    },
    {
        path: "/dashboard",
        element: <DashboardPage/>
    },
    {
        path: "/contact/:id",
        element: <ContactPage/>
    }
])

export default routes