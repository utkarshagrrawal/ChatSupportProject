const { supabase } = require("../utilities/databaseUtility")
require('dotenv').config();

const startChatLogic = async (body) => {
    const { data, error } = await supabase
        .from('users')
        .insert({ name: body.name, is_active: true })
        .select('')

    if (error) {
        return { error: error.message }
    }

    return { success: 'Chat started', userId: data[0].id }
}

const fetchChatsLogic = async (params) => {
    const { data, error } = await supabase
        .rpc('get_messages_by_id', { params_id: params.id })

    if (error) {
        return { error: error.message }
    }
    return { success: data }
}

const sendMessageLogic = async (body, params) => {
    const { data, error } = await supabase
        .from('users')
        .select('')
        .eq('id', params.id)

    const { error: sendError } = await supabase
        .from('messages')
        .insert({ sender: params.id, reciever: process.env.ADMIN_ID, message: body.message, reciever_name: 'admin', sender_name: data[0].name })

    if (sendError) {
        return { error: sendError.message }
    }
    return { success: 'Message sent' }
}

const endChatLogic = async (headers) => {
    const { error } = await supabase
        .from('users')
        .update({ is_active: false })
        .eq('id', headers.authorization)

    if (error) {
        return { error: error.message }
    }
    return { success: 'Chat ended' }
}

module.exports = {
    startChatLogic,
    fetchChatsLogic,
    sendMessageLogic,
    endChatLogic
}