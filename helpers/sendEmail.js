const formData = require('form-data');
const Mailgun = require('mailgun.js');
const mailgun = new Mailgun(formData);
const mg = mailgun.client({username: 'api', key: process.env.MAILGUN_API_KEY || process.env.MAILGUN_Key});

const sendVerificationEmail = async ( email, newVerificationToken) => {
    const messageData = {
        from: "User Karol <mailgun@sandbox84319c826e14409aaa2c744c6da23d3e.mailgun.org>",
        to: ["k.glanowski@wp.pl"],
        subject: "Verification Email",
        text: `Your new verification token is: ${newVerificationToken}`,
        html: `<h1>Verification Email</h1><p>Your new verification token is: ${newVerificationToken}</p>`
    };

    try {
        const msg = await mg.messages.create('sandbox84319c826e14409aaa2c744c6da23d3e.mailgun.org', messageData);
        console.log("Email sent:", msg);
        return msg;
    } catch (err) {
        console.error("Error sending email:", err);
        throw err;
    }
};

module.exports = { sendVerificationEmail };