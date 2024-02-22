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
      const contactToFindById = await Contact.findById({
        _id: contactId,
        owner: ownerId,
      });
      return contactToFindById;
  } catch (error) {
      console.error(error);
  }
};

const removeContact = async (contactId, ownerId) => {
  try {
      const contactToRemove = await Contact.deleteOne({ 
        _id: contactId,
        owner: ownerId,
      });
      return contactToRemove;
  } catch (error) {
      console.error(error);
  }
};

const addContact = async (body, ownerId) => {
  try {
      const newContact = await Contact.create({
        ...body,
        owner: ownerId,
      });
      return newContact;
  } catch (error) {
      console.error(error);
  }
};

const updateContact = async (contactId, body, ownerId) => {
  try {
    const contactToUpdate = await Contact.findByIdAndUpdate(
      { _id: contactId, owner: ownerId },
      body,
      { new: true }
    );
    return contactToUpdate;
  } catch (error) {
    console.error("Updating contact error:", error.message);
  }
};

const updateStatusContact = async (contactId, body, ownerId) => {
  try {
    const contactToUpdate = await Contact.findByIdAndUpdate(
      { _id: contactId, owner: ownerId },
      { favorite: body.favorite },
      { new: true }
    );
    return contactToUpdate;
  } catch (error) {
    console.error("Updating contact error:", error.message);
  }
};


module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact,
}
