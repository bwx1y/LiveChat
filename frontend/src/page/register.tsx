import {GalleryVerticalEnd} from "lucide-react";
import {Form, Formik, type FormikHelpers} from "formik";
import {type AuthResponse, type RegisterRequest, RegisterSchema} from "@/model/auth-model.ts";
import {Label} from "@/components/ui/label.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Link, useNavigate} from "react-router-dom";
import {apiService} from "@/lib/api-service.ts";
import {Toast} from "@/lib/toast.ts";
import useAuth from "@/hooks/use-auth.ts";
import {useEffect} from "react";

const RegisterPage = () => {
    const navigate = useNavigate();
    const {key, setToken} = useAuth()

    useEffect(() => {
        if (key) {
            navigate("/dashboard");
        }
    }, [key, navigate])

    const submitForm = async (values: RegisterRequest, {setSubmitting}: FormikHelpers<RegisterRequest>) => {
        const res = await  apiService.post<AuthResponse, RegisterRequest>("Auth/Register",{
            key: null,
            body: values
        })
        setSubmitting(false);

        if (res.data != null) {
            Toast.fire({
                icon: "success",
                title: "Success!",
                text: `Welcome ${res.data.name}`,
            }).then(() => setToken(res.data.token.key))
        } else {
            Toast.fire({
                icon: "error",
                title: "Error",
                text: res.message,
            })
        }
    }

    return (<div className="grid min-h-svh lg:grid-cols-2">
        <div className="flex flex-col gap-4 p-6 md:p-10">
            <div className="flex justify-center gap-2 md:justify-start">
                <a href="https://bwx1y.my.id/" className="flex items-center gap-2 font-medium">
                    <div
                        className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                        <GalleryVerticalEnd className="size-4"/>
                    </div>
                    BWX1Y
                </a>
            </div>
            <div className="flex flex-1 items-center justify-center">
                <div className="w-full max-w-xs">
                    <div className={"flex flex-col gap-6"}>
                        <div className="flex flex-col items-center gap-2 text-center">
                            <h1 className="text-2xl font-bold">Create new account</h1>
                            <p className="text-muted-foreground text-sm text-balance">
                                Fill in the form below to register
                            </p>
                        </div>
                        <div className="grid gap-6">
                            <Formik<RegisterRequest>
                                initialValues={{email: "", password: "", confirmPassword: "", name: ""}}
                                validationSchema={RegisterSchema}
                                onSubmit={submitForm}>
                                {({values, handleChange, errors, touched}) => (
                                    <Form>
                                        <div className="grid gap-3">
                                            <Label htmlFor="name">Name</Label>
                                            <Input
                                                id="name"
                                                type="text"
                                                required
                                                name='name'
                                                onChange={handleChange}
                                                value={values.name}
                                            />
                                            {touched.name && errors.name && (
                                                <p className="text-sm text-red-500">{errors.name}</p>
                                            )}
                                        </div>
                                        <div className="grid gap-3 mt-4">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="m@example.com"
                                                required
                                                name='email'
                                                onChange={handleChange}
                                                value={values.email}
                                            />
                                            {touched.email && errors.email && (
                                                <p className="text-sm text-red-500">{errors.email}</p>
                                            )}
                                        </div>
                                        <div className="grid gap-3 mt-4">
                                            <Label htmlFor="password">Password</Label>
                                            <Input
                                                id="password"
                                                type="password"
                                                required
                                                name='password'
                                                onChange={handleChange}
                                                value={values.password}
                                            />
                                            {touched.password && errors.password && (
                                                <p className="text-sm text-red-500">{errors.password}</p>
                                            )}
                                        </div>
                                        <div className="grid gap-3 mt-4">
                                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                                            <Input
                                                id="confirmPassword"
                                                type="password"
                                                required
                                                name='confirmPassword'
                                                onChange={handleChange}
                                                value={values.confirmPassword}
                                            />
                                            {touched.confirmPassword && errors.confirmPassword && (
                                                <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                                            )}
                                        </div>
                                        <Button type="submit" className="w-full mt-4">
                                            Register
                                        </Button>
                                    </Form>
                                )}
                            </Formik>
                            <div
                                className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                                <span className="bg-background text-muted-foreground relative z-10 px-2">Or continue with</span>
                            </div>
                            <Button variant="outline" className="w-full" asChild={true}>
                                <Link to="/login-gmail">
                                    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100"
                                         viewBox="0 0 48 48">
                                        <path fill="#FFC107"
                                              d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                                        <path fill="#FF3D00"
                                              d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                                        <path fill="#4CAF50"
                                              d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
                                        <path fill="#1976D2"
                                              d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                                    </svg>
                                    Register with Google
                                </Link>
                            </Button>
                        </div>
                        <div className="text-center text-sm">
                            already have an account?{" "}
                            <Link to="/" className="underline underline-offset-4">
                                Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div className="bg-muted relative hidden lg:block">
            <img
                src="/95163dfa-870f-4f6f-a127-b41767d1bf7a.jpeg"
                alt="Image"
                className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.5] dark:grayscale"
            />
        </div>
    </div>)
}

export default RegisterPage;