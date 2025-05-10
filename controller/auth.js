const { createUser, loginUser } = require("../services/userService");
const generateToken = require("../utils/generateToken");
const { NotifyError } = require("../utils/notifyError");

const loginUserSession = async (req, res, next) => {
    const { username, password } = req.body;
    try {
        const loggedUser = await loginUser(username, password);

        if (!loggedUser) {
            return res.status(401).json({ loginError: 'Invalid username or password. Try again.' });
        };

        const token = generateToken({ user: loggedUser });
        res.cookie('token', token, { httpOnly: true });
        res.json(loggedUser);
    } catch (err) {
        next(err);
    }
};

const createNewUser = async (req, res) => {
    try {
        const newUser = await createUser({ userData: req.body });
        const token = generateToken({ user: newUser });

        res.cookie('token', token, { httpOnly: false });
        res.json(newUser);
    } catch (err) {
        throw new NotifyError(err.message);
    }
};

const logoutUser = (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: true,
        sameSite: 'Lax'
    });

    res.status(200).json({ message: 'Logged Out' });
};

module.exports = { createNewUser, loginUserSession, logoutUser }; 