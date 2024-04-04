import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ChatWindow from "../Chat/ChatWindow";
import StartChat from "./StartChat";


export default function LandingPage() {
    const [name, setName] = useState('')

    return (
        <div className="bg-gradient-to-br from-blue-200 to-blue-400 h-screen flex items-center justify-center relative">
            <Link to="/admin/signin" className="text-white font-semibold text-lg absolute top-10 right-10 hover:underline flex items-center gap-2">
                Sign in as admin
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25" />
                </svg>
            </Link>
            {localStorage.getItem('userId') ? <ChatWindow name={name} /> : <StartChat name={name} setName={setName} />}
        </div>
    )
}