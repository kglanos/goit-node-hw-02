const fs = require('fs/promises')
const path = require('path')
const { v4 } = require('uuid')

const contactsPath = path.join(__dirname, 'contacts.json')

const listContacts = async () => {
  try {
    const contacts = await fs.readFile(contactsPath, {encoding: 'utf-8'})
    return JSON.parse(contacts)
  } catch (error) {
    console.error(error)
  }
};

const getContactById = async (contactId) => {
  try{
    const contacts = await listContacts()
    const contactById = contacts.find(contact => contact.id === contactId)
    return contactById
  } catch (error) {
    console.error(error)
  }
};

const removeContact = async (contactId) => {
  try {
    const contacts = await listContacts()
    const contactById = await getContactById(contactId)
    const newContacts = contacts.filter(contact => contact.id !== contactId)
    await fs.writeFile(contactsPath, JSON.stringify(newContacts), null, 2)
    return contactById
  } catch (error) {
    console.error(error)
  }
};

const addContact = async (body) => {
  try {
    const contacts = await listContacts()
    const { name, email, phone } = body;
    const newContact = { id: v4(), name, email, phone }
    const newContactsList = [...contacts, newContact]
    await fs.writeFile(contactsPath, JSON.stringify(newContactsList, null, 2),
    { encoding: 'utf-8' });
    return newContact;
  } catch (error) {
    console.error(error)
  }
};

const updateContact = async (contactId, body) => {
  try {
    const contacts = await listContacts()
    const contactById = await getContactById(contactId)
    if (contactById) {
      const updatedContacts = contacts.map(contact => contact.id === contactId ? { ...contact, ...body } : contact)
      await fs.writeFile(contactsPath, JSON.stringify(updatedContacts, null, 2),
      { encoding: 'utf-8' });
      return updatedContacts
    }
  } catch (error) {
    console.error(error)
  }
};


module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
}
