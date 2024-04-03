const { supabase } = require("../utilities/databaseUtility")

const authenticated = async (req, res, next) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return res.json({ error: 'Unauthorized' });
    }
    next();
}

module.exports = {
    authenticated
}