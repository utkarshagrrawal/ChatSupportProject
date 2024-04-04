require('dotenv').config();
const jwt = require('jsonwebtoken');

const authenticated = async (req, res, next) => {
    const token = req.headers.authorization;
    if (token) {
        try {
            const payload = jwt.verify(token, process.env.SECRET_KEY);
            return next();
        } catch (error) {
            return res.json({ error: error.message });
        }
    }
    return res.json({ error: 'Unauthorized' });
}

module.exports = {
    authenticated
}