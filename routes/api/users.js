const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const jimp = require('jimp');
const multer = require('multer');
const path = require('path');
const { User } = require('../../services/schemas/userSchema');
const { validationResult } = require('express-validator');
const verifyToken = require('../../middlewares/auth');
const { signup, getUserByEmail } = require('../../services/usersService')
const { signupAndLoginValidation } = require('../../utils/validators');


router.post('/signup', signupAndLoginValidation, async (req, res, next) => {
    const { email, password, subscription } = req.body;

    try {
        let user = await getUserByEmail(email);

        if (user) {
            return res.status(409).json({ message: 'Email in use' });
        }

        user = await signup({ email, password, subscription, avatarUrl: null});

        return res.status(201).json({
            user: { email: user.email, subscription: user.subscription, avatarUrl: user.avatarUrl}
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
        const user = await getUserByEmail(email);

        if (!user) {
            return res.status(401).json({ message: 'Email or password is wrong' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Email or password is wrong' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1h",
            });
            user.token = token;
            await user.save();
            return res.status(200).json({
            token,
            user: { email: user.email, subscription: user.subscription },
            });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.get('/logout', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const updatedUser = await User.findOneAndUpdate(
            { _id: userId },
            { $set: { token: null }},
            { new: true }
        );
        if (!updatedUser) {
            return res.status(401).json({ message: "Not authorized" });
        }
        res.status(204).json({ message: "Logout successful" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

router.get('/current', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({
            email: user.email,
            subscription: user.subscription,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'tmp/avatars');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + extension);
    }
});

const upload = multer({ storage: storage });

router.patch('/avatars', verifyToken, upload.single('avatar'), async (req, res) => {
    try {
        const userId = req.user.id;
        const file = req.file;
        const img = await jimp.read(file.path);
        await img
            .autocrop()
            .cover(250, 250, jimp.HORIZONTAL_ALIGN_CENTER | jimp.VERTICAL_ALIGN_MIDDLE)
            .writeAsync(file.path);
        const avatarUrl = file.path;
        const updatedUser = await User.findOneAndUpdate(
            { _id: userId },
            { $set: { avatarUrl }},
            { new: true }
        );
        if (!updatedUser) {
            return res.status(401).json({ message: "Not authorized" });
        }
        res.status(200).json({ avatarUrl: updatedUser.avatarUrl });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});


module.exports = router;
