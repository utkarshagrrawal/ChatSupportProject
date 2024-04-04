import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ChatPage() {
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

    useEffect(() => {
        const fetchChats = async () => {
            const options = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            }

            const response = await fetch('https://chat-support-project-backend.vercel.app/admin/fetch-chats/' + chatPersonId.current, options)
            const data = await response.json()

            if (data.error) {
                alert(data.error)
                return;
            }

            setIsPersonActive(data.success[1].is_active)
            setChats(data.success[0])
        }

        if (!sendingMessage && chatIndex) {
            fetchChats()
        }
    }, [sendingMessage, chatIndex])

    useEffect(() => {
        const fetchPersons = async () => {
            const options = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('token')
                }
            }

            const response = await fetch('https://chat-support-project-backend.vercel.app/admin/persons', options)
            const data = await response.json()

            if (data.error) {
                navigate('/admin/signin')
                return;
            }

            let tempPersons = data.success
            tempPersons = [... new Set(tempPersons.map(person => person.sender_name + '/' + person.sender))]

            setPersons(tempPersons)
        }

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

            const response = await fetch('https://chat-support-project-backend.vercel.app/admin/is-active', options)
            const data = await response.json()

            if (data.error) {
                setIsActive(false)
                return;
            }

            setIsActive(true)
        }

        checkAdminStatus()
    }, [])

    const handleLogout = () => {
        localStorage.removeItem('token')
        navigate('/admin/signin')
    }

    const handleChat = async (index) => {
        inputRefs.current.forEach((input) => {
            input.classList.remove('bg-blue-400')
        })
        inputRefs.current[index].classList.add('bg-blue-400')
        chatPersonId.current = persons[index].split('/')[1]
        setChatIndex(index)
        setChats([])
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

        const response = await fetch('https://chat-support-project-backend.vercel.app/admin/reverse-activeness', options)
        const data = await response.json()

        if (data.error) {
            alert(data.error)
            return;
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

        const response = await fetch('https://chat-support-project-backend.vercel.app/admin/send-message/' + chatPersonId.current, options)
        const data = await response.json()

        if (data.error) {
            alert(data.error)
            return;
        }
        setMessage('')

        setSendingMessage(false)
    }


    return (
        <div className="bg-gradient-to-br from-blue-200 to-blue-400 h-screen flex w-full items-center justify-center relative">
            <div className="absolute top-5 right-5">
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
            <div className="bg-white p-8 rounded-lg shadow-lg w-3/4 h-3/4">
                <h1 className="text-3xl font-bold text-center mb-8">Chats</h1>
                <div className="flex flex-col sm:flex-row">
                    {/* Left part: List of chat persons */}
                    <div className="sm:w-1/3 w-full pr-4">
                        <div className="pb-4 mb-4">
                            <h2 className="text-lg font-bold mb-6">Chat Persons</h2>
                            {
                                persons.length > 0 && (
                                    persons.map((person, index) => (
                                        person.split('/')[0] !== 'admin' && (
                                            <div key={index} className="flex items-center mb-4 py-2 px-1 rounded-lg hover:bg-blue-100 duration-50" onClick={() => handleChat(index)} ref={(input) => inputRefs.current[index] = input}>
                                                <img
                                                    src={`https://ui-avatars.com/api/?name=${person.split('/')[0]}&background=random`}
                                                    alt="Profile"
                                                    className="rounded-full h-8 w-8 mr-2 border border-blue-400"
                                                />
                                                <div>
                                                    <p className="text-sm font-semibold">{person.split('/')[0]}</p>
                                                    <p className="text-xs text-slate-500"><span className="font-semibold">ID:</span> {person.split('/')[1]}</p>
                                                </div>
                                            </div>
                                        )
                                    ))
                                )
                            }
                        </div>
                    </div>
                    {/* Right part: Chat messages */}
                    <div className="sm:w-2/3 sm:h-[30rem] overflow-auto w-full pl-4 sm:border-l border-gray-300">
                        <div className="flex flex-col items-center justify-center">
                            {
                                chatIndex || chatIndex === 0 ? (
                                    <>
                                        <div className="flex flex-col w-full">
                                            {
                                                chats.length > 0 ? chats.map((chat, index) => {
                                                    return (
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
                                                    )
                                                }) : (
                                                    <div className="animate-pulse w-full h-32">
                                                        <div className={`flex items-center gap-2 mb-4`}>
                                                            <img
                                                                src={`https://ui-avatars.com/api/?name=&background=e5e7eb`}
                                                                alt="avatar"
                                                                className="w-8 h-8 rounded-full"
                                                            />
                                                            <p className="text-sm font-semibold h-4 bg-gray-200 rounded-lg w-1/3"></p>
                                                        </div>
                                                        <div className={`p-4 rounded-lg mb-4 h-10 bg-gray-200 rounded-lg`}>
                                                        </div>
                                                    </div>
                                                )
                                            }
                                        </div>
                                    </>
                                )
                                    : (
                                        <p className="text-gray-500">Select a chat to start messaging</p>
                                    )
                            }
                        </div>
                        {
                            chatIndex && isPersonActive && (
                                <div className="flex sticky bottom-0 left-0 w-full bg-white pt-4 min-h-[3rem]">
                                    <input
                                        type="text"
                                        id="message"
                                        onChange={handleChange}
                                        className="w-full rounded-lg border-gray-300 border p-2"
                                        placeholder="Type a message..."
                                    />
                                    <button className="bg-blue-500 text-white px-4 py-2 rounded-lg ml-2" onClick={handleSend}>
                                        {sendingMessage ? (
                                            <div className="border-gray-300 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-blue-600" />
                                        ) : ('Send')}
                                    </button>
                                </div>
                            )
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}