const formData = require('form-data');
const Mailgun = require('mailgun.js');
const mailgun = new Mailgun(formData);
const mg = mailgun.client({username: 'api', key: process.env.MAILGUN_API_KEY || process.env.MAILGUN_Key});

const sendVerificationEmail = async ( newVerificationToken) => {
    const messageData = {
        from: "User Karol <mailgun@sandbox-123.mailgun.org>",
        to: ["k.glanowski@wp.pl"],
        subject: "Verification Email",
        text: `Your new verification token is: ${newVerificationToken}`,
        html: `<h1>Verification Email</h1><p>Your new verification token is: ${newVerificationToken}</p>`
    };

    try {
        const msg = await mg.messages.create('sandbox-123.mailgun.org', messageData);
        console.log("Email sent:", msg);
        return msg;
    } catch (err) {
        console.error("Error sending email:", err);
        throw err;
    }
};

module.exports = { sendVerificationEmail };