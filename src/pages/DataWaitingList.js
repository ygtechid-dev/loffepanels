import React, { useEffect, useState } from 'react';
import { database } from '../context/firebase'; // Pastikan import database sudah benar
import { ref, onValue } from 'firebase/database';

const DataWaitingList = () => {
  const [waitingList, setWaitingList] = useState([]);
  const [filteredWaitingList, setFilteredWaitingList] = useState([]);
  const [filterOutlet, setFilterOutlet] = useState('');

  useEffect(() => {
    const waitingListRef = ref(database, 'waitingList'); // Referensi ke node waitingList di Firebase

    // Mengambil data dari Firebase
    onValue(waitingListRef, (snapshot) => {
      const data = snapshot.val();
      const formattedData = [];

      // Konversi object menjadi array
      for (let id in data) {
        formattedData.push({ id, ...data[id] });
      }

      setWaitingList(formattedData); // Simpan data asli ke state
      setFilteredWaitingList(formattedData); // Set data awal ke filtered data
    });
  }, []);

  // Fungsi untuk menangani perubahan filter berdasarkan nama outlet
  const handleFilterChange = (e) => {
    const keyword = e.target.value.toLowerCase();
    setFilterOutlet(keyword);

    if (keyword === '') {
      // Jika input kosong, tampilkan semua data
      setFilteredWaitingList(waitingList);
    } else {
      // Filter data berdasarkan nama outlet
      const filteredData = waitingList.filter((item) =>
        item.info.nama_outlet.toLowerCase().includes(keyword)
      );
      setFilteredWaitingList(filteredData);
    }
  };

  return (
    <div className="container mx-auto bg-white p-5">
      <h2 className="text-lg font-bold mb-4">Data Waiting List</h2>

      {/* Input Filter Nama Outlet */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Filter berdasarkan Nama Outlet"
          className="border border-gray-300 px-4 py-2 rounded-lg w-full"
          value={filterOutlet}
          onChange={handleFilterChange}
        />
      </div>

      {/* Tabel Data Waiting List */}
      <table className="min-w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2">ID</th>
            <th className="border border-gray-300 px-4 py-2">Tanggal Scan</th>
            <th className="border border-gray-300 px-4 py-2">Nama Outlet</th>
            <th className="border border-gray-300 px-4 py-2">Tanggal Waiting List</th>
            <th className="border border-gray-300 px-4 py-2">Nomor Waiting List</th>
          </tr>
        </thead>
        <tbody>
          {filteredWaitingList.map((item) => (
            <tr key={item.id} className="border-b border-gray-300">
              <td className="border border-gray-300 px-4 py-2">{item.userId}</td>
              <td className="border border-gray-300 px-4 py-2">{new Date(item.tanggalScan).toLocaleString('id-ID')}</td>
              <td className="border border-gray-300 px-4 py-2">{item.info.nama_outlet}</td>
              <td className="border border-gray-300 px-4 py-2">{item.info.tanggal_wl}</td>
              <td className="border border-gray-300 px-4 py-2">{item.nomorWaiting}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataWaitingList;
