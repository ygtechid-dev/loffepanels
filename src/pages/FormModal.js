import React, { useState } from 'react';
import { ref, push } from 'firebase/database';
import { database } from '../context/firebase'; // Sesuaikan path sesuai dengan lokasi file firebase.js Anda
import { read, utils } from 'xlsx';

function FormModal({ setIsModalOpen }) {
  const [items, setItems] = useState([{ name: '' }]);
  const [showAlert, setShowAlert] = useState(false);

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const newItems = [...items];
    newItems[index][name] = value;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { name: '' }]);
  };

  const handleSave = () => {
    const masterbahanRef = ref(database, 'masterbahan');
    items.forEach(item => {
      push(masterbahanRef, { nama: item.name }).then(() => {
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
        setItems([{ name: '' }]);
        setTimeout(() => {
        setIsModalOpen(false);
            
        }, 3000);
      }).catch(error => console.error('Error saving data: ', error));
    });
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (evt) => {
      const data = evt.target.result;
      const workbook = read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const parsedData = utils.sheet_to_json(sheet);

      const masterbahanRef = ref(database, 'masterbahan');
      parsedData.forEach((row) => {
        push(masterbahanRef, { nama: row['Nama'] });
      });
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    };

    reader.readAsBinaryString(file);
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Tambah Data Bahan Baku / Perlengkapan</h2>
        {showAlert && (
          <div className="mb-4 p-4 text-green-700 bg-green-100 border border-green-400 rounded">
            Data berhasil disimpan!
          </div>
        )}
        {items.map((item, index) => (
          <div key={index} className="flex items-center mb-4">
            <input
              type="text"
              name="name"
              value={item.name}
              onChange={(e) => handleItemChange(index, e)}
              placeholder="Nama Bahan Baku"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-2"
            />
            {index === items.length - 1 && (
              <button type="button" onClick={addItem} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">
                +
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={handleSave} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full mb-4">
          Simpan
        </button>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Import Excel:</label>
          <input type="file" accept=".xlsx, .xls" onChange={handleImport} className="w-full" />
        </div>
        <button
          onClick={() => setIsModalOpen(false)}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded w-full"
        >
          Tutup
        </button>
      </div>
    </div>
  );
}

export default FormModal;
