import { useState } from "react";
import Link from "next/link";
import checkAuth from "@/lib/checkAuth";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState("");
    const [errorForm, setErrorForm] = useState("");
    const [colorError, setColorError] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password, remember }),
            });
            const data = await response.json();
            if (data.message) {
                setErrorForm(data.message);
                setColorError(data.success)
                if (data.success) {
                    document.location.href = "/";
                }
            }
        } catch (error) {
            setErrorForm("une erreur est survenue")
            setColorError(false)
        }
    };

    return (
        <section className={`h-full w-full bg-gradient-to-r from-slate-900 to-slate-950`}>
            <div className={`flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0`}>
                <div className={`w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0`}>
                    <div className={`p-6 space-y-4 md:space-y-6 sm:p-8`}>
                        <h1 className={`text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl`}>
                            Connectez vous à votre compte
                        </h1>
                        <form className={`space-y-4 md:space-y-6`} method="POST">
                            <div>
                                <label htmlFor="email" className={`block mb-2 text-sm font-medium text-gray-900`}>Votre email</label>
                                <input onChange={(e) => setEmail(e.target.value)} type="email" name="email" id="email" className={`bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-purple-600 focus:border-purple-600 block w-full p-2.5`} placeholder="name@company.com" required="" />
                            </div>
                            <div>
                                <label htmlFor="password" className={`block mb-2 text-sm font-medium text-gray-900`}>Mot de passe</label>
                                <input onChange={(e) => setPassword(e.target.value)} type="password" name="password" id="password" placeholder="••••••••" className={`bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-purple-600 focus:border-purple-600 block w-full p-2.5`} required="" />
                            </div>
                            <div className={`flex items-center justify-between`}>
                                <div className={`flex items-start`}>
                                    <div className={`flex items-center h-5`}>
                                        <input onClick={(e) => setRemember(e.target.value)} id="remember" aria-describedby="remember" type="checkbox" className={`w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-purple-300`} required="" />
                                    </div>
                                    <div className={`ml-3 text-sm`}>
                                        <label htmlFor="remember" className={`text-gray-500`}>Se souvenir de moi</label>
                                    </div>
                                </div>
                            </div>
                            {errorForm && errorForm.length > 0 && (<p className={colorError ? "text-green-500" : "text-red-500"}>{errorForm}</p>)}
                            <button onClick={handleSubmit} type="submit" className={`w-full text-white bg-purple-600 hover:bg-purple-700 focus:ring-4 focus:outline-none focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center`}>Se connecter</button>
                            <p className={`text-sm font-light text-gray-500`}>Vous n&apos;avez pas encore de compte? 
                                <Link href="/auth/signup" className={`font-medium text-purple-600 hover:underline`}> S&apos;incrire</Link>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    )
}

export async function getServerSideProps(context) {
    return await checkAuth(context);
}