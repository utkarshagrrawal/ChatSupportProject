const { loginLogic, fetchPersonsLogic, logoutLogic, isActiveLogic, reverseActivenessLogic } = require("../logic/adminLogic")

const login = async (req, res) => {
    const response = await loginLogic(req.body);
    if (response.error) {
        return res.json({ error: response.error })
    }
    return res.json({ success: response.success })
}

const fetchPersons = async (req, res) => {
    const response = await fetchPersonsLogic();
    if (response.error) {
        return res.json({ error: response.error })
    }
    return res.json({ success: response.success })
}

const logout = async (req, res) => {
    const response = await logoutLogic();
    if (response.error) {
        return res.json({ error: response.error })
    }
    return res.json({ success: response.success })
}

const isActive = async (req, res) => {
    const response = await isActiveLogic();
    if (response.error) {
        return res.json({ error: response.error })
    }
    return res.json({ success: response.success })
}

const reverseActiveness = async (req, res) => {
    const response = await reverseActivenessLogic();
    if (response.error) {
        return res.json({ error: response.error })
    }
    return res.json({ success: response.success })
}

module.exports = {
    login,
    fetchPersons,
    logout,
    isActive,
    reverseActiveness
}