import React, { useEffect, useState } from 'react';
import { database } from '../context/firebase'; // Import Firebase setup
import { ref as databaseRef, onValue, update, set } from 'firebase/database';

const Pengiriman = () => {
  const [noWa, setNoWa] = useState('');
  const [editing, setEditing] = useState(false);
  const [newNoWa, setNewNoWa] = useState('');

  // Fetch WhatsApp number from Firebase
  useEffect(() => {
    const noWaRef = databaseRef(database, 'setting/0/no_wa');
    onValue(noWaRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setNoWa(data);
      }
    });
  }, []);

  // Handle Editing WhatsApp Number
  const handleEditClick = () => {
    setEditing(true);
    setNewNoWa(noWa);
  };

  // Handle Save after Editing
  const handleSaveClick = async () => {
    const noWaRef = databaseRef(database, 'setting/0/no_wa');
    await set(noWaRef, newNoWa); // Update Firebase
    setNoWa(newNoWa); // Update local state
    setEditing(false);
  };

  // Handle Delete WhatsApp Number
  const handleDeleteClick = async () => {
    const noWaRef = databaseRef(database, 'setting/0/no_wa');
    await set(noWaRef, null); // Remove the WhatsApp number from Firebase
    setNoWa(''); // Update local state
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">WhatsApp Management</h2>

      <div className="bg-white p-4 rounded shadow-lg">
        <h3 className="text-lg font-semibold mb-2">WhatsApp Number</h3>
        
        {!editing ? (
          <div className="mb-4">
            <p className="text-gray-700 text-lg">Current Number: {noWa || 'No WhatsApp number set'}</p>
            
            <button
              onClick={handleEditClick}
              className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
            >
              Edit
            </button>
            <button
              onClick={handleDeleteClick}
              className="bg-red-500 text-white px-4 py-2 rounded"
              disabled={!noWa}
            >
              Delete
            </button>
          </div>
        ) : (
          <div className="mb-4">
            <input
              type="text"
              value={newNoWa}
              onChange={(e) => setNewNoWa(e.target.value)}
              className="border p-2 rounded w-full mb-2"
              placeholder="Enter new WhatsApp number"
            />

            <button
              onClick={handleSaveClick}
              className="bg-green-500 text-white px-4 py-2 rounded mr-2"
            >
              Save
            </button>
            <button
              onClick={() => setEditing(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pengiriman;
