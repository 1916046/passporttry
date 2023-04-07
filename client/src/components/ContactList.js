import { useState, useEffect } from 'react';
import axios from 'axios';

const ContactList = ({ user }) => {
    const [contacts, setContacts] = useState([]);

    useEffect(() => {
        const fetchContacts = async () => {
            const response = await axios.get(`http://localhost:5000/api/contacts?user=${user._id}`);
            setContacts(response.data);
        };
        fetchContacts();
    }, [user]);

    return (
        <ul>
            {contacts.map(contact => (
                <li key={contact._id}>
                    {contact.name}: {contact.phone}
                </li>
            ))}
        </ul>
    );
};

export default ContactList;
