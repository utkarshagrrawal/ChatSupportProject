const { supabase } = require("../utilities/databaseUtility")


const loginLogic = async (body) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: body.email,
        password: body.password
    })
    if (error) {
        return { error: error.message }
    }
    return { success: data }
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

module.exports = {
    loginLogic,
    fetchPersonsLogic,
    logoutLogic,
    isActiveLogic,
    reverseActivenessLogic
}