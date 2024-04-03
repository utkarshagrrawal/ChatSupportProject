const { supabase } = require("../utilities/databaseUtility")
require('dotenv').config();

const startChatLogic = async (body) => {
    const { data, error } = await supabase
        .from('users')
        .insert({ name: body.name })
        .select('')

    if (error) {
        return { error: error.message }
    }

    return { success: 'Chat started', userId: data[0].id }
}

const fetchChatsLogic = async (params) => {
    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender.eq.${params.id}`, `receiver.eq.${params.id}`);

    if (error) {
        return { error: error.message }
    }
    return { success: data }
}

const sendMessageLogic = async (body, params) => {
    const { error } = await supabase
        .from('messages')
        .insert({ sender: params.id, reciever: process.env.ADMIN_ID, message: body.message, reciever_name: 'admin', sender_name: body.name })

    if (error) {
        return { error: error.message }
    }
    return { success: 'Message sent' }
}


module.exports = {
    startChatLogic,
    fetchChatsLogic,
    sendMessageLogic
}