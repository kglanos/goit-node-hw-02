const mongoose = require('mongoose');
const { Schema } = mongoose;

const contactSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Set name for contact'],
    },
    email: {
        type: String,
    },
    phone: {
        type: String,
    },
    favorite: {
        type: Boolean,
        default: false,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "user",
    },
});

contactSchema.statics.updateContact = async function(contactId, updateData) {
    try {
        const updatedContact = await this.findByIdAndUpdate(contactId, updateData, { new: true });
        return updatedContact;
    } catch (error) {
        throw new Error(error.message);
    }
};

const Contact = mongoose.model('contact', contactSchema);

module.exports = Contact;