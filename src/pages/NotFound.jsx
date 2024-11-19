import React, { useState, useEffect } from 'react';
import { ref, onValue, remove, update } from 'firebase/database';
import { database } from '../context/firebase';
import * as XLSX from 'xlsx';
import 'tailwindcss/tailwind.css';

function NotFound() {
  const [data, setData] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [selectedOutlet, setSelectedOutlet] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isMonthModalOpen, setIsMonthModalOpen] = useState(false); // State untuk modal bulan
  const [selectedItems, setSelectedItems] = useState([]);
  const [modalData, setModalData] = useState([]);
  const [modalTipe, setModalTipe] = useState('');
  const [dataTanggal, setDataTanggal] = useState('');
  const [modalTotalPrice, setModalTotalPrice] = useState('');
  const [currentId, setCurrentId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(''); // State untuk bulan yang dipilih

  useEffect(() => {
    const datainputRef = ref(database, 'datainput');
    onValue(datainputRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data)
          .map((key, index) => ({
            id: key,
            nomor: index + 1,
            tanggal: data[key].tanggal,
            totalPrice: data[key].totalPrice,
            tipe: data[key].tipe,
            outlet: data[key].outlet,
            items: data[key].items,
          }))
          .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
        setData(list);

        const uniqueOutlets = [...new Set(list.map(item => item.outlet))];
        setOutlets(uniqueOutlets);
      }
    });
  }, []);

  const handleOutletChange = (e) => {
    setSelectedOutlet(e.target.value);
  };

  
  const filteredData = data.filter(item => {
    const itemMonth = new Date(item.tanggal).getMonth() + 1;
    const matchesOutlet = selectedOutlet ? item.outlet === selectedOutlet : true;
    const matchesMonth = selectedMonth ? itemMonth === parseInt(selectedMonth) : true;
    return matchesOutlet && matchesMonth;
  });


  const openModal = (data) => {
    setSelectedItems(data.items);
    setModalTipe(data.tipe);
    setDataTanggal(data.tanggal);
    setModalTotalPrice(data.totalPrice);
    setCurrentId(data.id);
    setModalData(data.items.map((item) => ({
      ...item,
      outlet: data.outlet,
    })));
    setIsEditing(false);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleInputChange = (index, e) => {
    const { name, value } = e.target;
    const updatedData = [...modalData];
    updatedData[index][name] = value;
    setModalData(updatedData);
  };

  const handleSaveChanges = () => {
    const dataRef = ref(database, `datainput/${currentId}`);
    update(dataRef, {
      tipe: modalTipe,
      tanggal: dataTanggal,
      totalPrice: modalTotalPrice,
      items: modalData,
    }).then(() => {
      setIsOpen(false);
    }).catch((error) => {
      console.error('Error updating data:', error);
    });
  };

  const deleteData = (id) => {
    const dataRef = ref(database, `datainput/${id}`);
    remove(dataRef)
      .then(() => {
        setData(data.filter(item => item.id !== id));
        setIsOpen(false);
      })
      .catch(error => {
        console.error('Error deleting data:', error);
      });
  };

  const exportFilteredToExcel = () => {
    const sortedData = filteredData.filter(item => {
      const itemMonth = new Date(item.tanggal).getMonth() + 1;
      return itemMonth === parseInt(selectedMonth);
    }).sort((a, b) => {
      const dateComparison = new Date(a.tanggal) - new Date(b.tanggal);
      if (dateComparison !== 0) return dateComparison;
      const tipeComparison = a.tipe.localeCompare(b.tipe);
      if (tipeComparison !== 0) return tipeComparison;
      return a.outlet.localeCompare(b.outlet);
    });

    const dataToExport = sortedData.reduce((accumulator, currentItem) => {
      const items = currentItem.items.map(item => ({
        date: currentItem.tanggal,
        tipe: currentItem.tipe,
        outlet: currentItem.outlet,
        ...item,
        totalHarga: currentItem.totalPrice,
      }));
      return [...accumulator, ...items];
    }, []);
  
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Detail Items');
    XLSX.writeFile(workbook, `FilteredDetailItems_${selectedMonth}.xlsx`);
    setIsMonthModalOpen(false);
  };

  
  const exportToExcel = () => {
    setIsMonthModalOpen(true); // Membuka modal untuk memilih bulan sebelum export
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-4">Data Table</h1>
      <div className="mb-4">
        <label htmlFor="outlet" className="block text-sm font-medium text-gray-700">
          Select Outlet:
        </label>
        <select
          id="outlet"
          name="outlet"
          value={selectedOutlet}
          onChange={handleOutletChange}
          className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="">All Outlets</option>
          {outlets.map(outlet => (
            <option key={outlet} value={outlet}>
              {outlet}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label htmlFor="month" className="block text-sm font-medium text-gray-700">
          Select Month:
        </label>
        <select
          id="month"
          name="month"
          value={selectedMonth}
          onChange={handleMonthChange}
          className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="">All Months</option>
          <option value="1">Januari</option>
          <option value="2">Februari</option>
          <option value="3">Maret</option>
          <option value="4">April</option>
          <option value="5">Mei</option>
          <option value="6">Juni</option>
          <option value="7">Juli</option>
          <option value="8">Agustus</option>
          <option value="9">September</option>
          <option value="10">Oktober</option>
          <option value="11">November</option>
          <option value="12">Desember</option>
        </select>
      </div>

      
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nomor</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Harga</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipe</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Outlet</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredData.map((item, index) => (
            <tr key={item.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.tanggal}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.totalPrice}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.tipe}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.outlet}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  className="text-indigo-600 hover:text-indigo-900"
                  onClick={() => openModal(item)}
                >
                  Lihat Detail
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4">
        <button
          className="inline-flex justify-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-700 mr-2"
          onClick={exportToExcel} // Menggunakan fungsi baru yang membuka modal bulan
        >
          Export Filtered to Excel
        </button>
      </div>

      
 {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Detail Items</h3>
            <div className="mt-2 h-96 overflow-y-auto"> {/* Container with scroll */}
              <p className="font-medium mb-2">Tipe: {modalTipe}</p>
              <ul>
                {modalData.map((item, index) => (
                  <li key={index} className="py-2">
                    {isEditing ? (
                      <>
                        <div className="flex justify-between">
                          <label htmlFor={`nama-${index}`} className="font-medium">Nama:</label>
                          <input
                            type="text"
                            id={`nama-${index}`}
                            name="nama"
                            value={item.nama}
                            onChange={(e) => handleInputChange(index, e)}
                            className="border border-gray-300 rounded-md px-2 py-1"
                          />
                        </div>
                        <div className="flex justify-between">
                          <label htmlFor={`qty-${index}`} className="font-medium">Qty:</label>
                          <input
                            type="number"
                            id={`qty-${index}`}
                            name="qty"
                            value={item.qty}
                            onChange={(e) => handleInputChange(index, e)}
                            className="border border-gray-300 rounded-md px-2 py-1"
                          />
                        </div>
                        <div className="flex justify-between">
                          <label htmlFor={`nominal-${index}`} className="font-medium">Nominal:</label>
                          <input
                            type="number"
                            id={`nominal-${index}`}
                            name="nominal"
                            value={item.nominal}
                            onChange={(e) => handleInputChange(index, e)}
                            className="border border-gray-300 rounded-md px-2 py-1"
                          />
                        </div>
                        <div className="flex justify-between">
                          <label htmlFor={`harga-${index}`} className="font-medium">Harga:</label>
                          <input
                            type="number"
                            id={`harga-${index}`}
                            name="harga"
                            value={item.harga}
                            onChange={(e) => handleInputChange(index, e)}
                            className="border border-gray-300 rounded-md px-2 py-1"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between">
                          <span className="font-medium">Nama:</span>
                          <span>{item.nama}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Qty:</span>
                          <span>{item.qty}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Nominal:</span>
                          <span>{item.nominal}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Harga:</span>
                          <span>{item.harga}</span>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
              <div className="mt-4">
              <p className="font-medium">Total Harga: {modalTotalPrice}</p>
              </div>
            </div>
            <div className="mt-4">
              {isEditing ? (
                <button
                  className="inline-flex justify-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700 mr-2"
                  onClick={handleSaveChanges}
                >
                  Save Changes
                </button>
              ) : (
                <button
                  className="inline-flex justify-center px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-700 mr-2"
                  onClick={handleEditToggle}
                >
                  Edit
                </button>
              )}
              <button
                className="inline-flex justify-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-700 mr-2"
                onClick={() => deleteData(currentId)}
              >
                Hapus
              </button>
              <button
                className="inline-flex justify-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-700"
                onClick={closeModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}


      {isMonthModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Pilih Bulan untuk Export</h3>
            <select
              value={selectedMonth}
              onChange={handleMonthChange}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">Pilih Bulan</option>
              <option value="1">Januari</option>
              <option value="2">Februari</option>
              <option value="3">Maret</option>
              <option value="4">April</option>
              <option value="5">Mei</option>
              <option value="6">Juni</option>
              <option value="7">Juli</option>
              <option value="8">Agustus</option>
              <option value="9">September</option>
              <option value="10">Oktober</option>
              <option value="11">November</option>
              <option value="12">Desember</option>
            </select>
            <div className="mt-4 flex justify-between">
              <button
                className="inline-flex justify-center px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-700"
                onClick={() => setIsMonthModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="inline-flex justify-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-700 ml-2"
                onClick={exportFilteredToExcel}
              >
                Export
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotFound;
