const { supabase } = require("../utilities/databaseUtility")
const webpush = require('web-push')
const jwt = require('jsonwebtoken')
require('dotenv').config()

webpush.setVapidDetails(
    'mailto:utkarshagrawal09jan@gmail.com',
    process.env.PUBLIC_KEY,
    process.env.PRIVATE_KEY
)


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
        .from('users')
        .select('')
        .eq('id', process.env.ADMIN_ID)

    if (error) {
        return { error: error.message }
    }
    return { success: data[0].is_active ? 'Active' : 'Inactive' }
}

const reverseActivenessLogic = async () => {
    const { data, error } = await supabase
        .from('users')
        .select('')
        .eq('id', process.env.ADMIN_ID)

    if (error) {
        return { error: error.message }
    }

    if (!data[0].is_active) {
        const { data, error } = await supabase
            .from('subscriptions')
            .select('')

        if (error) {
            return { error: error.message }
        }

        data.forEach(async (subscription) => {
            try {
                await webpush.sendNotification(JSON.parse(subscription.subscription), JSON.stringify({ title: 'Chat support', body: 'Admin is online now' }))
            } catch (err) {
                console.log(err)
                return { error: 'Failed to send notification' }
            }
        })
    }

    const { error: updateError } = await supabase
        .from('users')
        .update({ is_active: !data[0].is_active })
        .eq('id', process.env.ADMIN_ID)

    if (updateError) {
        return { error: updateError.message }
    }
    return { success: 'Activeness reversed' }
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
    fetchChatsLogic,
}