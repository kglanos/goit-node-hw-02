const Contact = require('./schemas/contactSchema');

const listContacts = async () => {
  try {
      const contacts = await Contact.find();
      return contacts;
  } catch (error) {
      console.error(error);
  }
};

const getContactById = async (contactId) => {
  try {
      const contact = await Contact.findById(contactId);
      return contact;
  } catch (error) {
      console.error(error);
  }
};

const removeContact = async (contactId) => {
  try {
      const contact = await Contact.deleteOne({ _id: contactId });
      return contact;
  } catch (error) {
      console.error(error);
  }
};

const addContact = async (body) => {
  try {
      const newContact = await Contact.create(body);
      return newContact;
  } catch (error) {
      console.error(error);
  }
};

const updateContact = async (contactId, body) => {
  try {
      const updatedContact = await Contact.findByIdAndUpdate(contactId, { favorite: body.favorite }, { new: true });
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
