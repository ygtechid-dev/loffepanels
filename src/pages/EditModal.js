// EditModal.js
import React, { useState } from 'react';
import { ref, set } from 'firebase/database';
import { database } from '../context/firebase'; // Sesuaikan path sesuai dengan lokasi file firebase.js Anda

function EditModal({ isOpen, setIsOpen, bahan }) {
  const [newName, setNewName] = useState(bahan.nama);

  const handleSave = () => {
    const bahanRef = ref(database, `masterbahan/${bahan.id}`);
    set(bahanRef, { nama: newName }).then(() => {
      setIsOpen(false);
    }).catch((error) => {
      console.error('Error updating data: ', error);
    });
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleNameChange = (e) => {
    setNewName(e.target.value);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75">
      <div className="bg-white rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Edit Data Bahan</h2>
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Nama Bahan</label>
          <input
            type="text"
            id="name"
            value={newName}
            onChange={handleNameChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleClose}
            className="mr-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditModal;
