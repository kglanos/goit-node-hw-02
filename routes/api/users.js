const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const jimp = require('jimp');
const multer = require('multer');
const path = require('path');
const fs = require('fs/promises');
const { User } = require('../../services/schemas/userSchema');
const { validationResult } = require('express-validator');
const verifyToken = require('../../middlewares/auth');
const { signup, getUserByEmail, updateUserVerification } = require('../../services/usersService')
const { signupAndLoginValidation } = require('../../utils/validators');
const { generateNewVerificationToken } = require('../../helpers');
const { sendVerificationEmail } = require('../../helpers/sendEmail');



router.post('/signup', signupAndLoginValidation, async (req, res, next) => {
    const { email, password, subscription } = req.body;

    try {
        let user = await getUserByEmail(email);

        if (user) {
            return res.status(409).json({ message: 'Email in use' });
        }

        user = await signup({ email, password, subscription, avatarUrl: null});

        await sendVerificationEmail(email, user.verificationToken);
        
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
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        const userId = req.user.id;
        const file = req.file;
        const image = await jimp.read(file.path);
        await image
            .autocrop()
            .cover(250, 250, jimp.HORIZONTAL_ALIGN_CENTER | jimp.VERTICAL_ALIGN_MIDDLE)
            .writeAsync(file.path);
        
        const avatarFileName = `${userId}-${Date.now()}${path.extname(file.originalname)}`;
        const sourcePath = file.path;
        const targetPath = path.join(__dirname, '..', '..', 'public', 'avatars', file.filename);
        await fs.rename(sourcePath, targetPath);

        const updatedUser = await User.findByIdAndUpdate(
            userId, 
            { avatarUrl: `/avatars/${avatarFileName}` }, 
            { new: true });
        if (!updatedUser) {
            return res.status(401).json({ message: "Not authorized" });
        }
        res.status(200).json({ avatarUrl: updatedUser.avatarUrl });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

router.get('/verify/:verificationToken', async (req, res) => {
    const { verificationToken } = req.params;
    try {
        const user = await User.findOne({ verificationToken });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.verify = true;
        user.verificationToken = null;
        await user.save();

        const newVerificationToken = generateNewVerificationToken();
        await sendVerificationEmail(user.email, newVerificationToken);

        return res.status(200).json({ message: "Verification successful" });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Server error" });
    }
});

router.post('/verify', async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ message: "missing required field email" });
    }

    try {
        const user = await getUserByEmail(email);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.verify) {
            return res.status(400).json({ message: "Verification has already been passed" });
        }

        const newVerificationToken = generateNewVerificationToken();

        await updateUserVerification( email, newVerificationToken);

        await sendVerificationEmail(email, newVerificationToken);

        return res.status(200).json({ message: "Verification email sent" });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
