import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
    const [loginDetails, setLoginDetails] = useState({ email: '', password: '' })
    const [loggingIn, setLoggingIn] = useState(false)
    const navigate = useNavigate()


    const handleChange = (e) => {
        setLoginDetails({ ...loginDetails, [e.target.id]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoggingIn(true)

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: loginDetails.email,
                password: loginDetails.password
            })
        }

        const response = await fetch('https://chat-support-project-backend.vercel.app/admin/signin', options)
        const data = await response.json()

        setLoggingIn(false)

        if (data.error) {
            alert(data.error)
            return;
        }
        localStorage.setItem('token', data.success)
        navigate('/admin/chats')
    }

    return (
        <div className="bg-gradient-to-br from-blue-200 to-blue-400 h-screen flex flex-col items-center justify-center relative">
            <div className="absolute top-5 right-5">
                <Link to="/" className="text-white font-semibold text-lg hover:underline flex items-center gap-2">
                    Back to home
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m15 19-7-7 7-7" />
                    </svg>
                </Link>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg w-full sm:max-w-md">
                <h1 className="text-3xl font-bold text-center mb-8">Login</h1>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address:</label>
                        <input
                            type="email"
                            id="email"
                            className="mt-1 block w-full rounded-lg border-gray-300 border p-2"
                            value={loginDetails.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password:</label>
                        <input
                            type="password"
                            id="password"
                            className="mt-1 block w-full rounded-lg border-gray-300 border p-2"
                            value={loginDetails.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit" className={`bg-blue-500 text-white rounded-lg px-4 py-2 w-full flex justify-center ${loggingIn && 'opacity-70 cursor-not-allowed'}`} disabled={loggingIn}>
                        {
                            loggingIn ? (
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : 'Login'
                        }
                    </button>
                </form>
            </div>
        </div>
    )
}