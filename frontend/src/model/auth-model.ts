import * as Yup from "yup"

export interface AuthResponse {
    id: string;
    email: string;
    name: string;
    token: {
        key: string;
        exp: string;
        provider: string;
    }
}

export interface LoginGmailPath {
    url: string;
}

export interface LoginGmailRequest {
    code: string
}

export interface LoginRequest {
    email: string;
    password: string;
}

export const LoginSchema = Yup.object<LoginRequest>().shape({
    email: Yup.string().email("Invalid email").required("Email required").max(100),
    password: Yup.string().required("Password required").max(100),
})

export interface RegisterRequest {
    email: string;
    name: string;
    password: string;
    confirmPassword: string;
}

export const RegisterSchema = Yup.object<RegisterRequest>().shape({
    email: Yup.string().email("Invalid email").required("Email required").max(100),
    name: Yup.string().required("Name required").max(100),
    password: Yup.string().required("Password required").max(100),
    confirmPassword: Yup.string().required("Password required").oneOf([Yup.ref("password")], "Passwords must match").max(100),
})

export interface MeResponse {
    id: string
    email: string
    name: string
    picture: string | null
}
