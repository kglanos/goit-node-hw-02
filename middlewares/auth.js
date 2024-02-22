const jwt = require("jsonwebtoken");
const { User } = require("../services/schemas/userSchema");
require("dotenv").config();

const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        console.log("Authorization header:", authHeader);

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Authorization header missing or invalid" });  
        }

        const token = authHeader.split(" ")[1];

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken.id;

        const user = await User.findOne({ _id: userId });

        if (!user || user.token !== token) {
            return res.status(401).json({ message: "Not authorized" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.log(error); 
        return res.status(401).json({ message: "Error authorized"});
    }
};

module.exports = verifyToken;

