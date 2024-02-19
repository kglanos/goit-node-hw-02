const jwt = require("jsonwebtoken");
const { User } = require("../services/schemas/userSchema"); // fix import this is default
require("dotenv").config();

const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Not authorized" }); // change message 
        }

        const token = authHeader.split(" ")[1];

        const verify = jwt.verify(token, process.env.JWT_SECRET);
        console.log(verify); // verify.user.id
        const user = await User.findOne({ _id: verify.id });

        if (!user || user.token !== token) {
        return res.status(401).json({ message: "Not authorized" });
        }
        req.user = user;
        next();
        } catch (error) {
            console.log(error); // always console log error 
        return res.status(401).json({ message: "Not authorized" }); // change massage
    }
};

module.exports = verifyToken;

