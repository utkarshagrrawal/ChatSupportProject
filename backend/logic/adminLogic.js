const { supabase } = require("../utilities/databaseUtility")
const jwt = require('jsonwebtoken')
require('dotenv').config()


const loginLogic = async (body) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: body.email,
        password: body.password
    })

    if (error) {
        return { error: error.message }
    }

    const token = jwt.sign({ email: body.email }, process.env.SECRET_KEY, { expiresIn: '1d' })

    return { success: token }
}

const fetchPersonsLogic = async () => {
    const { data, error } = await supabase
        .from('messages')
        .select('')

    if (error) {
        return { error: error.message }
    }
    return { success: data }
}

const logoutLogic = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
        return { error: error.message }
    }
    return { success: 'Logged out' }
}

const isActiveLogic = async () => {
    const { data, error } = await supabase
        .from('admin_active')
        .select('')
        .eq('is_active', true)

    if (error) {
        return { error: error.message }
    }
    if (data.length > 0) {
        return { success: 'Active' }
    }
    return { error: 'Inactive' }
}

const reverseActivenessLogic = async () => {
    const { data, error } = await supabase
        .from('admin_active')
        .select('')
        .eq('is_active', true)

    if (error) {
        return { error: error.message }
    }
    if (data.length > 0) {
        const { error } = await supabase
            .from('admin_active')
            .update({ is_active: false })
            .eq('is_active', true)
        if (error) {
            return { error: error.message }
        }
        return { success: 'Deactivated' }
    }

    const { error: activationError } = await supabase
        .from('admin_active')
        .insert({ is_active: true })
    if (activationError) {
        return { error: activationError.message }
    }
    return { success: 'Activated' }

}

const sendMessageLogic = async (params, body) => {
    const { data, error } = await supabase
        .from('users')
        .select('')
        .eq('id', params.id)

    if (error) {
        return { error: error.message }
    }

    const { error: messageError } = await supabase
        .from('messages')
        .insert({ reciever: params.id, sender: process.env.ADMIN_ID, sender_name: 'admin', reciever_name: data[0].name, message: body.message })

    if (messageError) {
        return { error: messageError.message }
    }
    return { success: 'Message sent' }
}

const fetchChatsLogic = async (params) => {
    const { data, error } = await supabase
        .rpc('get_messages_by_id', { params_id: params.id })

    if (error) {
        return { error: error.message }
    }

    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('')
        .eq('id', params.id)

    if (userError) {
        return { error: userError.message }
    }

    return { success: [data, userData[0]] }

}

module.exports = {
    loginLogic,
    fetchPersonsLogic,
    logoutLogic,
    isActiveLogic,
    reverseActivenessLogic,
    sendMessageLogic,
    fetchChatsLogic
}