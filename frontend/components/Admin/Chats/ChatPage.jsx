import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from 'socket.io-client';

export default function ChatPage() {
    const socket = useRef('');
    const navigate = useNavigate()
    const inputRefs = useRef([]);
    const chatPersonId = useRef(null)
    const [persons, setPersons] = useState([])
    const [isPersonActive, setIsPersonActive] = useState(false)
    const [sendingMessage, setSendingMessage] = useState(false)
    const [isActive, setIsActive] = useState(false)
    const [chats, setChats] = useState([])
    const [message, setMessage] = useState('')
    const [chatIndex, setChatIndex] = useState(null)

    const fetchPersons = async () => {
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('token')
            }
        }

        const response = await fetch(import.meta.env.VITE_API_URL + '/admin/persons', options)
        const data = await response.json()

        if (data.error) {
            navigate('/admin/signin')
            return;
        }

        let tempPersons = data.success
        tempPersons = [... new Set(tempPersons.map(person => person.sender_name + '/' + person.sender))]

        setPersons(tempPersons)
    }

    const fetchChats = async () => {
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }

        const response = await fetch(import.meta.env.VITE_API_URL + '/admin/fetch-chats/' + chatPersonId.current, options)
        const data = await response.json()

        if (data.error) {
            alert(data.error)
            return;
        }

        setIsPersonActive(data.success[1].is_active)
        setChats(data.success[0])
    }

    useEffect(() => {
        socket.current = io(import.meta.env.VITE_API_URL);
        socket.current.on("connect", () => {
            console.log('connected', socket.current.id)
        });
        socket.current.on("disconnect_user", () => {
            fetchChats();
            fetchPersons();
        })
        socket.current.on("refresh_admin", () => {
            fetchPersons()
        });
    }, [])

    useEffect(() => {
        if (!sendingMessage && chatIndex)
            fetchChats()
    }, [sendingMessage, chatIndex])

    useEffect(() => {
        socket.current.on('receive_message', () => fetchChats())
    }, [])

    useEffect(() => {
        fetchPersons();
    }, [])

    useEffect(() => {
        const checkAdminStatus = async () => {
            const options = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            }

            const response = await fetch(import.meta.env.VITE_API_URL + '/admin/is-active', options)
            const data = await response.json()

            if (data.error) {
                setIsActive(false)
                return;
            } else {
                setIsActive(data.success === 'Active' ? true : false)
            }
        }

        checkAdminStatus()
    }, [])

    const handleLogout = () => {
        localStorage.removeItem('token')
        navigate('/admin/signin')
    }

    const handleChat = async (index) => {
        if (index === chatIndex - 1) {
            return;
        }
        inputRefs.current.forEach((input) => {
            input.classList.remove('bg-blue-400')
            input.classList.add('hover:bg-blue-100')
        })
        inputRefs.current[index].classList.add('bg-blue-400')
        inputRefs.current[index].classList.remove('hover:bg-blue-100')
        chatPersonId.current = persons[index].split('/')[1]
        socket.current.emit('join_room', { roomId: chatPersonId.current })
        setChats([])
        setChatIndex(index + 1)
        setIsPersonActive(false)
    }

    const handleActive = async () => {
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('token')
            }
        }

        const response = await fetch(import.meta.env.VITE_API_URL + '/admin/reverse-activeness', options)
        const data = await response.json()

        if (data.error) {
            alert(data.error)
            return;
        }

        if (isActive) {
            let notificationRegistrations = await navigator.serviceWorker.getRegistrations();
            notificationRegistrations.forEach(registration => {
                if (registration.active.scriptURL.includes('notificationWorker.js')) {
                    registration.unregister();
                }
            });
        }

        setIsActive(!isActive)
    }

    const handleChange = (e) => {
        setMessage(e.target.value)
    }

    const handleSend = async () => {
        if (message === '') {
            alert('Please type a message')
            return;
        }
        if (message.trim() === '') {
            alert('Please type a message')
            return;
        }

        setSendingMessage(true)

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message.trim()
            })
        }

        const response = await fetch(import.meta.env.VITE_API_URL + '/admin/send-message/' + chatPersonId.current, options)
        const data = await response.json()

        if (data.error) {
            alert(data.error)
            return;
        }

        setMessage('')
        setSendingMessage(false)

        socket.current.emit('send_message', { roomId: chatPersonId.current, message: message.trim(), sender_name: 'admin', firstTime: false })
    }


    return (
        <div className="bg-gradient-to-br from-blue-200 to-blue-400 h-screen flex w-full items-center justify-center">
            <div className="bg-gray-50 lg:p-8 p-4 rounded-lg shadow-lg w-4/5 mx-auto h-screen">
                <div className="flex sm:justify-between flex-wrap justify-around mb-4">
                    <h1 className="text-3xl font-bold text-center mb-4 lg:mb-6 text-blue-900">Chats</h1>
                    <div className="">
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 text-white px-4 py-2 rounded-lg"
                        >
                            Sign Out
                        </button>
                        <button
                            onClick={handleActive}
                            className={`${isActive ? 'bg-red-500' : 'bg-green-500'} text-white px-4 py-2 rounded-lg ml-4`}
                        >
                            {isActive ? 'Set inactive' : 'Set active'}
                        </button>
                    </div>
                </div>
                <div className="flex flex-col lg:flex-row lg:gap-4">
                    {/* Left part: List of chat persons */}
                    <div className="lg:w-1/3 w-full border rounded-lg lg:h-[42rem] h-[20rem] overflow-auto">
                        <h2 className="w-full p-4 text-lg font-bold sticky top-0 bg-white border-b text-center">Chat Persons</h2>
                        <div className="p-4">
                            {persons.length > 0 && (
                                persons.map((person, index) => (
                                    person.split('/')[0] !== 'admin' && (
                                        <div key={index} className="flex items-center mb-2 py-1 px-2 rounded-lg cursor-pointer duration-300 hover:bg-blue-100" onClick={() => handleChat(index)} ref={(input) => inputRefs.current[index] = input}>
                                            <img
                                                src={`https://ui-avatars.com/api/?name=${person.split('/')[0]}&background=random`}
                                                alt="Profile"
                                                className="rounded-full h-10 w-10 mr-3 border border-blue-400"
                                            />
                                            <div>
                                                <p className="text-base font-semibold text-blue-900">{person.split('/')[0]}</p>
                                                <p className="text-xs text-gray-600"><span className="font-semibold">ID:</span> {person.split('/')[1]}</p>
                                            </div>
                                        </div>
                                    )
                                ))
                            )}
                        </div>
                    </div>
                    {/* Right part: Chat messages */}
                    <div className="lg:w-2/3 relative flex flex-col w-full lg:h-[42rem] h-[24rem] overflow-auto">
                        <div className="flex flex-col p-2">
                            {chatIndex ? (
                                <div className="flex flex-col w-full">
                                    {chats.length > 0 && chats.map((chat, index) => (
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
                                </div>
                            ) : (
                                <p className="text-gray-500">Select a chat to start messaging</p>
                            )}
                        </div>
                        {chatIndex && isPersonActive && (
                            <div className="bottom-0 left-0 w-full p-2 min-h-[3rem] flex items-center justify-center sticky bg-white rounded-lg">
                                <input
                                    type="text"
                                    id="message"
                                    onChange={handleChange}
                                    className="flex-grow rounded-lg border-gray-300 border p-2 mr-2"
                                    placeholder="Type a message..."
                                />
                                <button className="bg-blue-500 text-white px-4 py-2 rounded-lg" onClick={handleSend}>
                                    {sendingMessage ? (
                                        <div className="border-gray-300 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-blue-600" />
                                    ) : ('Send')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
