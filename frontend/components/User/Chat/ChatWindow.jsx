import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

export default function ChatWindow() {
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState([]);
  const socket = useRef(null);

  const fetchChats = async () => {
    const options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    };

    const response = await fetch(
      import.meta.env.VITE_API_URL +
        "/user/fetch-chats/" +
        localStorage.getItem("userId"),
      options
    );
    const data = await response.json();

    if (data.error) {
      alert(data.error);
      return;
    }

    setChats(data.success);
  };

  const handleBeforeUnload = async (e) => {
    e.preventDefault();
    e.returnValue = "true";
    return "Are you sure you want to leave? You will be disconnected from the chat.";
  };

  const handleUnload = async (e) => {
    await handleEndChat();
    return;
  };

  const handleChange = (e) => {
    setMessage(e.target.value);
  };

  useEffect(() => {
    if (!localStorage.getItem("userName") || !localStorage.getItem("userId")) {
      return;
    }
    socket.current = io(import.meta.env.VITE_API_URL);
    socket.current.on("connect", () => {
      console.log("Connected to server", socket.current.id);
    });
    socket.current.emit("join_room", {
      roomId: localStorage.getItem("userId"),
    });
    socket.current.on("receive_message", (data) => {
      fetchChats();
    });
  }, []);

  useEffect(() => {
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("unload", handleUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("unload", handleUnload);
    };
  }, []);

  useEffect(() => {
    if (!sending) {
      fetchChats();
    }
  }, [sending]);

  const handleSend = async () => {
    if (message === "") {
      alert("Please type a message");
      return;
    }
    if (message.trim() === "") {
      alert("Please type a message");
      return;
    }

    setSending(true);

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: message.trim(),
      }),
    };

    const response = await fetch(
      import.meta.env.VITE_API_URL +
        "/user/send-message/" +
        localStorage.getItem("userId"),
      options
    );
    const data = await response.json();

    setMessage("");
    setSending(false);

    if (data.error) {
      alert(data.error);
      return;
    }

    socket.current.emit("send_message", {
      roomId: localStorage.getItem("userId"),
      message: message.trim(),
      sender_name: "user",
      firstTime: chats.length === 0 ? true : false,
    });
  };

  const handleEndChat = async () => {
    window.removeEventListener("beforeunload", () => handleUnload);

    const options = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("userId"),
      },
    };

    const response = await fetch(
      import.meta.env.VITE_API_URL + "/user/end-chat",
      options
    );
    const data = await response.json();

    if (data.error) {
      alert(data.error);
      return;
    }

    socket.current.emit("disconnect_chat", {
      roomId: localStorage.getItem("userId"),
    });

    localStorage.removeItem("userId");
    localStorage.removeItem("userName");

    let notificationRegistrations =
      await navigator.serviceWorker.getRegistrations();
    const checkProdOrDevURLHost = location.href.includes("localhost")
      ? "http://localhost:5173"
      : "https://chat-support-project.vercel.app";
    let url = checkProdOrDevURLHost + "/notificationWorker.js";
    notificationRegistrations.forEach((registration) => {
      if (registration.active.scriptURL === url) {
        registration.unregister();
      }
    });

    location.reload();
  };

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
            <div
              className={`flex items-center gap-2 mb-4 ${
                chat.sender_name === "admin" ? "justify-start" : "justify-end"
              }`}
            >
              <img
                src={`https://ui-avatars.com/api/?name=${
                  chat.sender_name === "admin" ? "Admin" : chat.sender_name
                }&background=random`}
                alt="avatar"
                className="w-8 h-8 rounded-full"
              />
              <p className="text-sm font-semibold">
                {chat.sender_name === "admin" ? "Admin" : chat.sender_name}
              </p>
            </div>
            <div
              className={`p-4 rounded-lg ${
                chat.sender_name === "admin"
                  ? "bg-blue-500 text-white text-start"
                  : "bg-gray-200 text-black text-end"
              } mb-4`}
            >
              {chat.message}
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center border rounded-lg border-gray-300 overflow-hidden sticky bottom-0 min-h-[3rem]">
        <input
          type="text"
          className="w-full py-3 px-4 border-none focus:outline-none"
          placeholder="Type a message..."
          onChange={handleChange}
          id="message"
        />
        <button
          className="bg-blue-500 text-white px-6 py-3"
          onClick={handleSend}
        >
          {sending ? (
            <div className="border-gray-300 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-blue-600" />
          ) : (
            "Send"
          )}
        </button>
      </div>
    </div>
  );
}
