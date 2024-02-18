const Contact = require('./schemas/contactSchema');

const listContacts = async (ownerId) => {
  try {
      const contacts = await Contact.find({ owner: ownerId });
      return contacts;
  } catch (error) {
      console.error(error);
  }
};

const getContactById = async (contactId, ownerId) => {
  try {
      const contact = await Contact.findById({
        _id: contactId,
        owner: ownerId,
      });
      return contact;
  } catch (error) {
      console.error(error);
  }
};

const removeContact = async (contactId, ownerId) => {
  try {
      const contact = await Contact.deleteOne({ 
        _id: contactId,
        owner: ownerId,
      });
      return contact;
  } catch (error) {
      console.error(error);
  }
};

const addContact = async (body, ownerId) => {
  try {
      const newContact = await Contact.create({
        body,
        owner: ownerId,
      });
      return newContact;
  } catch (error) {
      console.error(error);
  }
};

const updateContact = async (contactId, body, ownerId) => {
  try {
      const updatedContact = await Contact.findByIdAndUpdate(
        {_id: contactId, owner: ownerId},
        { favorite: body.favorite },
        { new: true });
      return updatedContact;
  } catch (error) {
      console.error(error);
  }
};


module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
}
