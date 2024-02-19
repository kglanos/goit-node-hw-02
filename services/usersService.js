const { User } = require('../services/schemas/userSchema');

const signup = async (body) => {
    try {
        const newUser = new User(body);
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

module.exports = {
    signup,
    getUserByEmail,
}