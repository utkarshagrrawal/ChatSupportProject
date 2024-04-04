require('dotenv').config();
const jwt = require('jsonwebtoken');

const authenticated = async (req, res, next) => {
    const token = req.headers.Authorization;
    if (token) {
        try {
            const payload = jwt.verify(signature, process.env.APP_SECRET_KEY);
            next();
        } catch (error) {
            return res.json({ error: error.message });
        }
    }
    return res.json({ error: 'Unauthorized' });
}

module.exports = {
    authenticated
}