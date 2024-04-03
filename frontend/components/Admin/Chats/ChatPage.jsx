import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ChatPage() {
    const navigate = useNavigate()
    const inputRefs = useRef([]);
    const [persons, setPersons] = useState([])
    const [isChatting, setIsChatting] = useState(false)
    const [isActive, setIsActive] = useState(false)
    const [chats, setChats] = useState([])

    useEffect(() => {
        const fetchPersons = async () => {
            const options = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            }

            const response = await fetch('http://localhost:3000/admin/persons', options)
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

            const response = await fetch('http://localhost:3000/admin/is-active', options)
            const data = await response.json()

            if (data.error) {
                setIsActive(false)
                return;
            }

            setIsActive(true)
        }

        checkAdminStatus()
    }, [])

    const handleLogout = async () => {
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }

        const response = await fetch('http://localhost:3000/admin/signout', options)
        const data = await response.json()

        if (data.error) {
            alert(data.error)
            return;
        }

        navigate('/admin/signin')
    }

    const handleChat = async (index) => {
        inputRefs.current.forEach((input) => {
            input.classList.remove('bg-blue-400')
        })
        inputRefs.current[index].classList.add('bg-blue-400')
        setIsChatting(true)
    }

    const handleActive = async () => {
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }

        const response = await fetch('http://localhost:3000/admin/reverse-activeness', options)
        const data = await response.json()

        if (data.error) {
            alert(data.error)
            return;
        }

        setIsActive(!isActive)
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
            <div className="bg-white p-8 rounded-lg shadow-lg w-3/4 h-3/4 overflow-scroll">
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
                                                    <p className="text-xs text-gray-500"><span className="font-semibold">ID:</span> {person.split('/')[1]}</p>
                                                </div>
                                            </div>
                                        )
                                    ))
                                )
                            }
                        </div>
                    </div>
                    {/* Right part: Chat messages */}
                    <div className="sm:w-2/3 w-full pl-4 sm:border-l border-gray-300">
                        <div className="h-full overflow-scroll flex items-center justify-center">
                            {
                                isChatting ? (
                                    <div className="flex flex-col w-full">
                                        <div className="flex items-center mb-4">
                                            <img
                                                src="https://via.placeholder.com/40"
                                                alt="Profile"
                                                className="rounded-full h-8 w-8 mr-2 border border-blue-400"
                                            />
                                            <p className="text-sm font-semibold">John Doe</p>
                                        </div>
                                        <div className="bg-gray-100 p-4 rounded-lg mb-4">
                                            <p className="text-sm">Hello, how can I help you?</p>
                                        </div>
                                        <div className="flex items-center mb-4 flex-row-reverse">
                                            <img
                                                src="https://via.placeholder.com/40"
                                                alt="Profile"
                                                className="rounded-full h-8 w-8 ml-2 border border-blue-400"
                                            />
                                            <p className="text-sm font-semibold">Jane Smith</p>
                                        </div>
                                        <div className="bg-gray-100 p-4 rounded-lg mb-4">
                                            <p className="text-sm">I have a problem with my account</p>
                                        </div>
                                        <div className="flex items-center mb-4">
                                            <img
                                                src="https://via.placeholder.com/40"
                                                alt="Profile"
                                                className="rounded-full h-8 w-8 mr-2 border border-blue-400"
                                            />
                                            <p className="text-sm font-semibold">John Doe</p>
                                        </div>
                                        <div className="bg-gray-100 p-4 rounded-lg mb-4">
                                            <p className="text-sm">Sure, what seems to be the problem?</p>
                                        </div>
                                        <div className="flex items-center mb-4 flex-row-reverse">
                                            <img
                                                src="https://via.placeholder.com/40"
                                                alt="Profile"
                                                className="rounded-full h-8 w-8 ml-2 border border-blue-400"
                                            />
                                            <p className="text-sm font-semibold">Jane Smith</p>
                                        </div>
                                        <div className="bg-gray-100 p-4 rounded-lg mb-4">
                                            <p className="text-sm">I can't login to my account</p>
                                        </div>
                                        <div className="flex items-center mb-4">
                                            <img
                                                src="https://via.placeholder.com/40"
                                                alt="Profile"
                                                className="rounded-full h-8 w-8 mr-2 border border-blue-400"
                                            />
                                            <p className="text-sm font-semibold">John Doe</p>
                                        </div>
                                        <div className="bg-gray-100 p-4 rounded-lg mb-4">
                                            <p className="text-sm">I can help you with that, please provide your email address</p>
                                        </div>
                                        <div className="flex items-center mb-4 flex-row-reverse">
                                            <img
                                                src="https://via.placeholder.com/40"
                                                alt="Profile"
                                                className="rounded-full h-8 w-8 ml-2 border border-blue-400"
                                            />
                                            <p className="text-sm font-semibold">Jane Smith</p>
                                        </div>
                                        <div className="bg-gray-100 p-4 rounded-lg mb-4">
                                            <p className="text-sm">My email is  </p>
                                        </div>
                                    </div>
                                )
                                    : (
                                        <p className="text-gray-500">Select a chat to start messaging</p>
                                    )
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}