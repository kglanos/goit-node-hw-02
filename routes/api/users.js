const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../../services/schemas/userSchema');
const { validationResult } = require('express-validator');
const verifyToken = require('../../middlewares/auth');
const { signup, login } = require('../../services/usersService')
const { signupAndLoginValidation } = require('../../utils/validators');


router.post('/signup', signupAndLoginValidation, async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, subscription } = req.body;

    try {
        let user = await login(email);

        if (user) {
            return res.status(409).json({ message: 'Email in use' });
        }

        user = await signup({ email, password, subscription });

        return res.status(201).json({
            user: { email: user.email, subscription: user.subscription }
        });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: 'Server error' });
    }
});

router.post('/login', signupAndLoginValidation, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        const user = await login(email);

        if (!user) {
            return res.status(401).json({ message: 'Email or password is wrong' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Email or password is wrong' });
        }

        const payload = {
            user: {
                id: user._id
            }
        };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" }, (err, token) => {
            if (err) throw err;
            return res.status(200).json({
                token,
                user: { email: user.email, subscription: user.subscription }
            });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.get('/logout', verifyToken, async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(401).json({ message: "Not authorized" });
        }

        user.token = null;
        await user.save();

        res.status(204).json({ message: "Logout successful" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

router.get('/current', verifyToken, async (req, res) => {
    try {
        const currentUser = req.user;

        if (!currentUser) {
            return res.status(401).json({ message: "Not authorized" });
        }

        res.status(200).json({
            email: currentUser.email,
            subscription: currentUser.subscription,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
