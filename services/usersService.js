const { generateNewVerificationToken } = require('../helpers');
const { User } = require('../services/schemas/userSchema');
const gravatar = require('gravatar');

const signup = async (body) => {
    try {
        const { email, password, subscription } = body;

        const newVerificationToken = generateNewVerificationToken();
        
        const avatarUrl = gravatar.url(email, { 
            protocol: 
            'https', 
            s: '200', 
            r: 'pg', 
            d: '404'
        });

        const newUser = new User({ 
            email, 
            password, 
            subscription, 
            avatarUrl,
            verificationToken: newVerificationToken});
        await newUser.setPassword(body.password);
        await newUser.save();
        return newUser;
    }
    catch (error) {
        console.log("Wrong adding user:", error.message);
        throw error;
    }
};

const getUserByEmail = async (email) => {
    try {
        const user = await User.findOne({ email });
        return user;
    }
    catch (error) {
        console.log("Wrong login:", error.message);
        throw error;
    }
};

const updateUserVerification = async (email, newVerificationToken) => {
    try {
        const user = await User.findOne({ email });

        if (!user) {
            throw new Error("User not found");
        }

        user.verify = false;
        user.verificationToken = newVerificationToken;
        await user.save();

        return user;
    }
    catch (error) {
        console.log("Wrong verification:", error.message);
        throw error;
    }
};


module.exports = {
    signup,
    getUserByEmail,
    updateUserVerification
}