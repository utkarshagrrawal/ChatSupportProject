import React, { useEffect, useRef, useState } from "react";
import socketIO from "socket.io-client";

export default function ChatWindow() {
    const [sending, setSending] = useState(false)
    const [message, setMessage] = useState('')
    const [chats, setChats] = useState([])
    const socket = useRef(null)

    const fetchChats = async () => {
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }

        const response = await fetch('https://chat-support-project-backend.vercel.app/user/fetch-chats/' + localStorage.getItem('userId'), options)
        const data = await response.json()

        if (data.error) {
            alert(data.error)
            return;
        }

        setChats(data.success)
    }

    const handleChange = (e) => {
        setMessage(e.target.value)
    }

    useEffect(() => {
        socket.current = socketIO("https://chat-support-project-backend.vercel.app")
        socket.current.emit("join_room", { roomId: localStorage.getItem('userId') })
        socket.current.on("receive_message", (data) => {
            console.log(data)
            fetchChats()
            // setChats(prev => [...prev, { message: data.message, sender_name: data.sender_name }])
        })
    }, [])

    useEffect(() => {
        if (!sending) {
            fetchChats()
        }
    }, [sending])

    const handleSend = async () => {
        setSending(true)

        if (message === '') {
            alert('Please type a message')
            return;
        }
        if (message.trim() === '') {
            alert('Please type a message')
            return;
        }

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message.trim()
            })
        }

        const response = await fetch('https://chat-support-project-backend.vercel.app/user/send-message/' + localStorage.getItem('userId'), options)
        const data = await response.json()

        socket.current.emit("send_message", { roomId: localStorage.getItem('userId'), message: message.trim(), sender_name: 'user', firstTime: chats.length === 1 })

        setSending(false)

        if (data.error) {
            alert(data.error)
            return;
        }

        setMessage('')
    }

    const handleEndChat = async () => {
        const options = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('userId')
            }
        }

        const response = await fetch('https://chat-support-project-backend.vercel.app/user/end-chat', options)
        const data = await response.json()

        if (data.error) {
            alert(data.error)
            return;
        }

        socket.current.emit("disconnect_chat", { roomId: localStorage.getItem('userId') })

        localStorage.removeItem('userId')

        let notificationRegistrations = await navigator.serviceWorker.getRegistrations()
        notificationRegistrations.forEach(registration => {
            if (registration.active.scriptURL === "https://chat-support-project.vercel.app/notificationWorker.js") {
                registration.unregister()
            }
        })

        location.reload();
    }

    return (
        <div className="bg-white p-8 rounded-lg shadow-lg w-full sm:max-w-3xl max-h-[40rem] flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-center">Chat with Admin</h1>
                <button
                    className="bg-red-500 text-white px-6 py-3 rounded-lg"
                    onClick={handleEndChat}
                >
                    End Chat
                </button>
            </div>
            <div className="overflow-y-auto">
                {chats.map((chat, index) => (
                    <div key={index}>
                        <div className={`flex items-center gap-2 mb-4 ${chat.sender_name === 'admin' ? 'justify-end' : 'justify-start'}`}>
                            <img
                                src={`https://ui-avatars.com/api/?name=${chat.sender_name === 'admin' ? 'Admin' : chat.sender_name}&background=random`}
                                alt="avatar"
                                className="w-8 h-8 rounded-full"
                            />
                            <p className="text-sm font-semibold">{chat.sender_name === 'admin' ? 'Admin' : chat.sender_name}</p>
                        </div>
                        <div className={`p-4 rounded-lg ${chat.sender_name === 'admin' ? 'bg-blue-500 text-white self-end' : 'bg-gray-200 text-black self-start'} mb-4`}>
                            {chat.message}
                        </div>
                    </div>
                ))}
            </div >
            <div className="flex items-center border rounded-lg border-gray-300 overflow-hidden sticky bottom-0 min-h-[3rem]">
                <input type="text" className="w-full py-3 px-4 border-none focus:outline-none" placeholder="Type a message..." onChange={handleChange} id="message" />
                <button className="bg-blue-500 text-white px-6 py-3" onClick={handleSend}>
                    {sending ? (
                        <div className="border-gray-300 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-blue-600" />
                    ) : ('Send')}
                </button>
            </div>
        </div>
    )
}
