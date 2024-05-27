import { useState } from 'react';

export default function useContacts(){
    const [contactInputValue, setContactInputValue] = useState("");
    const [selectedProfil, setSelectedProfil] = useState(1);
    const [selectedContact, setSelectedContact] = useState([]);

    const addOrRemoveContact = (contact) => {
        setSelectedContact((prev) => {
            if (prev.includes(contact)) {
                return prev.filter((c) => c !== contact);
            } else {
                return [...prev, contact];
            }
        });
    };

    const handleContactAddOrRemove = (event, contactField, click = false) => {
        if (event.key === 'Enter' || click) {
            event.preventDefault();
            const newContactField = contactField.trim();
            if (newContactField) {
                addOrRemoveContact(newContactField)
                setContactInputValue('')
            }
        }
    }

    const removeContactField = (fieldToRemove) => {
        addOrRemoveContact(fieldToRemove)
    }

    return { 
        contactInputValue, selectedProfil, selectedContact, 
        setContactInputValue, setSelectedProfil, setSelectedContact, 
        addOrRemoveContact, handleContactAddOrRemove, removeContactField 
    };
};
