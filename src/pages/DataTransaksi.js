import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { database } from '../context/firebase';
import { ref, onValue, update } from 'firebase/database'; 
import { Buffer } from 'buffer';
import * as XLSX from 'xlsx'; // Import XLSX for Excel export

const MIDTRANS_SERVER_KEY = 'Mid-server-QvzOpNOLQzsX6uo8yxWt22pl';

const DataTransaksi = () => {
  const [dataTransaksi, setDataTransaksi] = useState([]);
  const [filteredTransaksi, setFilteredTransaksi] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedPlace, setSelectedPlace] = useState('');

  useEffect(() => {
    const transactionsRef = ref(database, 'dataTransaction');
    onValue(transactionsRef, (snapshot) => {
      const data = snapshot.val();
      const transaksiArray = [];
      for (let id in data) {
        transaksiArray.push({ id_trx: id, ...data[id] });
      }
      setDataTransaksi(transaksiArray);
      setFilteredTransaksi(transaksiArray);
    });
  }, []);

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(angka);
  };

  const handleCheckPayment = async (transaksi) => {
    try {
      const response = await axios.get(`https://api.midtrans.com/v2/${transaksi.payment_id}/status`, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Basic ${Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString('base64')}`,
        },
      });

      const transactionData = response.data;
      if (transactionData.transaction_status !== selectedTransaction?.transaction_status) {
        const transaksiRef = ref(database, `dataTransaction/${transaksi.trx_id}`);
        await update(transaksiRef, {
          status: transactionData.transaction_status,
        });
      }
      setSelectedTransaction(transactionData);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error fetching payment status: ', transaksi);
    }
  };

  const handleShowDetail = (transaksi) => {
    setSelectedTransaction(transaksi);
    setShowDetailModal(true);
  };

  // Filter data by date and place
  const handleFilter = () => {
    const filtered = dataTransaksi.filter((transaksi) => {
      const matchDate = selectedDate ? transaksi.tanggal_book === selectedDate : true;
      const matchPlace = selectedPlace ? transaksi.place === selectedPlace : true;
      return matchDate && matchPlace;
    });
    setFilteredTransaksi(filtered);
  };

  // Export filtered data to Excel
  const handleExportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredTransaksi);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Transaksi');
    XLSX.writeFile(workbook, 'DataTransaksi.xlsx');
  };

  return (
    <div className="container mx-auto bg-white w-screen h-screen p-5">
      <h2 className="text-lg font-bold mb-4">Data Transaksi</h2>

      {/* Filter section */}
      <div className="mb-4 flex space-x-4">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border p-2 rounded"
          placeholder="Filter by Date"
        />
        <input
          type="text"
          value={selectedPlace}
          onChange={(e) => setSelectedPlace(e.target.value)}
          className="border p-2 rounded"
          placeholder="Filter by Outlet"
        />
        <button onClick={handleFilter} className="bg-blue-500 text-white px-4 py-2 rounded">
          Filter
        </button>
        <button onClick={handleExportToExcel} className="bg-green-500 text-white px-4 py-2 rounded">
          Export to Excel
        </button>
      </div>

      <table className="min-w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2">ID Transaksi</th>
            <th className="border border-gray-300 px-4 py-2">Place</th>
            <th className="border border-gray-300 px-4 py-2">Tanggal Book</th>
            <th className="border border-gray-300 px-4 py-2">Seat</th>
            <th className="border border-gray-300 px-4 py-2">Status</th>
            <th className="border border-gray-300 px-4 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredTransaksi.map((transaksi) => (
            <tr key={transaksi.id_trx} className="border-b border-gray-300">
              <td className="border border-gray-300 px-4 py-2">{transaksi.trx_id}</td>
              <td className="border border-gray-300 px-4 py-2">{transaksi.place}</td>
              <td className="border border-gray-300 px-4 py-2">
                {transaksi.tanggal_book} <br />
                {transaksi.jam_book_awal} - {transaksi.jam_book_akhir}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {transaksi.seat} | Floor: {transaksi.floor} (Person: {transaksi.person})
              </td>
              <td className="border border-gray-300 px-4 py-2">{transaksi.status}</td>
              <td className="border border-gray-300 px-4 py-2">
                <button
                  className="bg-blue-500 text-white px-2 py-1 rounded-lg hover:bg-blue-700 mr-2"
                  onClick={() => handleCheckPayment(transaksi)}
                >
                  Cek Pembayaran
                </button>
                <button
                  className="bg-green-500 text-white px-2 py-1 rounded-lg hover:bg-green-700"
                  onClick={() => handleShowDetail(transaksi)}
                >
                  Detail
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal for transaction details */}
      {showDetailModal && selectedTransaction && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-5 w-96 animate-fadeIn">
            <h2 className="text-lg font-bold mb-4">Detail Transaksi</h2>
            <p><strong>ID Transaksi:</strong> {selectedTransaction.transaction_id || selectedTransaction.trx_id}</p>
            <p><strong>Status:</strong> {selectedTransaction.transaction_status || selectedTransaction.status}</p>
            <p><strong>Waktu Pembayaran:</strong> {selectedTransaction.transaction_time || selectedTransaction.tanggal_book}</p>
            <p><strong>Jumlah:</strong> {formatRupiah(selectedTransaction.gross_amount || selectedTransaction.uang_rsvp)}</p>
            <p><strong>Payment Type:</strong> {selectedTransaction.payment_type || selectedTransaction.pay_type}</p>
            <div className="flex justify-end">
              <button
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                onClick={() => setShowDetailModal(false)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTransaksi;
