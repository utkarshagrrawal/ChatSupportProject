import React, { useEffect, useState } from "react";


export default function StartChat(props) {
    const [adminOnline, setAdminOnline] = useState(false)
    const [startingChat, setStartingChat] = useState(false)

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
                setAdminOnline(false)
                return;
            }

            setAdminOnline(true)
        }

        checkAdminStatus()
    }, [])

    const handleChange = (e) => {
        props.setName(e.target.value)
    }

    const handleNotify = () => {
        alert('You will be notified when the admin is online')
    }

    const handleStart = async () => {
        if (props.name === '') {
            alert('Please enter your name')
            return;
        }
        if (props.name.trim() === '') {
            alert('Please enter your name')
            return;
        }

        setStartingChat(true)

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: props.name
            })
        }

        const response = await fetch('http://localhost:3000/user/start-chat', options)
        const data = await response.json()

        setStartingChat(false)

        if (data.error) {
            alert(data.error)
            return;
        }

        localStorage.setItem('userId', data.userId)
    }

    return (
        <div className="bg-white p-8 rounded-lg shadow-lg w-full sm:max-w-md">
            <h1 className="text-3xl font-bold text-center mb-8">Welcome to Support</h1>
            <div className="bg-blue-100 rounded-lg p-6">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <img
                            src="https://media.istockphoto.com/id/1300845620/vector/user-icon-flat-isolated-on-white-background-user-symbol-vector-illustration.jpg?s=612x612&w=0&k=20&c=yBeyba0hUkh14_jgv1OKqIH0CCSWU_4ckRkAoy2p73o="
                            className="h-16 w-16 rounded-full"
                            alt="profile"
                        />
                        {adminOnline ? (
                            <span className="absolute bg-green-500 h-3 w-3 rounded-full bottom-0 right-0"></span>
                        ) : (
                            <span className="absolute bg-gray-500 h-3 w-3 rounded-full bottom-0 right-0"></span>
                        )}
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold">Admin</h2>
                        {adminOnline ? (<p className="text-gray-600">Online</p>) : (<p className="text-gray-600">Offline</p>)}
                    </div>
                </div>
            </div>
            {
                adminOnline ? (
                    <div className="bg-white mt-8 w-full sm:max-w-md flex flex-col">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Please enter your name:</label>
                        <input
                            type="text"
                            id="name"
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-lg border-gray-300 border p-2"
                        />
                        <button className={`mt-2 bg-blue-500 text-white rounded-lg px-4 py-2 flex justify-center ${startingChat && 'cursor-not-allowed opacity-50'}`} onClick={handleStart}>
                            {startingChat ? (
                                <div className="border-gray-300 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-blue-600" />
                            ) : (
                                'Start Chat'
                            )}
                        </button>
                    </div>
                ) : (
                    <button onClick={handleNotify} className="w-full bg-blue-500 mt-4 rounded-lg p-2 text-white">
                        Notify me
                    </button>
                )
            }
        </div>
    )
}