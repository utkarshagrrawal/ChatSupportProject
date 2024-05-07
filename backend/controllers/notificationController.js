const { supabase } = require("../utilities/databaseUtility")

const subscribeNotification = async (req, res) => {
    const { error } = await supabase
        .from('subscriptions')
        .insert({ subscription: req.body })

    if (error) {
        return res.json({ error: 'Failed to subscribe' })
    }
    return res.json({ success: 'Subscribed' })
}

const getPublicKey = async (req, res) => {
    return res.json({ key: process.env.PUBLIC_KEY })
}

module.exports = {
    subscribeNotification,
    getPublicKey
}