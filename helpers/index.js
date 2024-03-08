const { v4: uuidv4 } = require('uuid');

const generateNewVerificationToken = () => {
    return uuidv4();
};

module.exports = { generateNewVerificationToken };