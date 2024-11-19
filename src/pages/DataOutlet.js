import React, { useEffect, useState } from "react";
import { database } from "../context/firebase"; // Pastikan path import sudah benar
import { ref, onValue, remove, update, set } from "firebase/database";
import { addDays, format } from "date-fns";

function DataOutlet() {
  const [outlets, setOutlets] = useState([]);
  const [filteredOutlets, setFilteredOutlets] = useState([]);
  const [selectedOutlet, setSelectedOutlet] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [newData, setNewData] = useState({
    nama_outlet: null,
    lokasi: null,
    harga_dp: null,
    jumlah_meja: null,
    barcode_wl: null,
    qr_pict: null,
    file_bookmenu: null,
    tanggal_wl: null,
    total_floors: null,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [floorData, setFloorData] = useState([]);

  useEffect(() => {
    const floorRef = ref(database, "floorByDates");
    onValue(floorRef, (snapshot) => {
      const data = snapshot.val();
      setFloorData(data || []); // Ensure that floorData is an array
    });
  }, []);

  useEffect(() => {
    const outletRef = ref(database, "outletsetting");
    onValue(outletRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const outletList = Object.keys(data).map((key) => ({
          uid: key,
          ...data[key],
        }));
        setOutlets(outletList);
        setFilteredOutlets(outletList); // Set initial filtered outlets
      }
    });
  }, []);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    // Filter outlets based on search term
    const filtered = outlets.filter(
      (outlet) =>
        outlet.nama_outlet.toLowerCase().includes(term) ||
        outlet.lokasi.toLowerCase().includes(term)
    );
    setFilteredOutlets(filtered);
  };

  const handleDelete = (uid) => {
    const outletRef = ref(database, `outletsetting/${uid}`);
    remove(outletRef)
      .then(() => {
        alert("Outlet deleted successfully!");
      })
      .catch((error) => {
        console.error("Error deleting outlet: ", error);
      });
  };

  const handleEdit = (outlet) => {
    setSelectedOutlet(outlet);
    setNewData({
      nama_outlet: outlet.nama_outlet,
      lokasi: outlet.lokasi,
      harga_dp: outlet.harga_dp,
      jumlah_meja: outlet.jumlah_meja,
      barcode_wl: outlet.barcode_wl,
      qr_pict: outlet.qr_pict,
      file_bookmenu: outlet.file_bookmenu,
      tanggal_wl: outlet.tanggal_wl,
    });
    setShowEditModal(true);
  };

  const handleUpdate = () => {
    const outletRef = ref(database, `outletsetting/${selectedOutlet.uid}`);
    update(outletRef, newData)
      .then(() => {
        alert("Outlet updated successfully!");
        setNewData({
          nama_outlet: null,
          lokasi: null,
          harga_dp: null,
          jumlah_meja: null,
          barcode_wl: null,
          qr_pict: null,
          file_bookmenu: null,
          tanggal_wl: null,
          total_floors: null,
        });
        setShowEditModal(false);
        setSelectedOutlet(null);
      })
      .catch((error) => {
        console.error("Error updating outlet: ", error);
      });
  };

  function generateDateRange(startDate, endDate) {
    const dateArray = [];
    let currentDate = startDate;

    while (currentDate <= endDate) {
      dateArray.push(format(currentDate, "dd-MM-yyyy")); // Format tanggal ke dd-MM-yyyy
      currentDate = addDays(currentDate, 1); // Tambah satu hari
    }

    return dateArray;
  }

  const handleAdd = async () => {
    const createdAt = new Date(); // Tanggal saat ini sebagai created_at
    const oneYearLater = new Date(createdAt);
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

    if (
      !newData.nama_outlet ||
      !newData.harga_dp ||
      !newData.lokasi ||
      !newData.total_floors ||
      !newData.total_seats_per_floor
    ) {
      alert("please fill all data!");
      return;
    }

    const newEntryRef = ref(database, `outletsetting/${outlets.length + 1}`);
    set(newEntryRef, {
      ...newData,
      created_at: createdAt.toISOString(),
      id_outlet: outlets.length + 1,
    })
      .then(async (data) => {
        setShowAddModal(false);

        alert("Data outlet berhasil ditambahkan ");
        setNewData({
          nama_outlet: null,
          lokasi: null,
          harga_dp: null,
          jumlah_meja: null,
          barcode_wl: null,
          qr_pict: null,
          file_bookmenu: null,
          tanggal_wl: null,
          total_floors: null,
        });
        await addFloorByDates(createdAt, oneYearLater);
      })
      .catch((error) => console.error("Error menambahkan data:", error));
  };

  async function addFloorByDates(startDate, endDate) {
    const dateRangeArray = generateDateRange(startDate, endDate);

    dateRangeArray.forEach((currentFormattedDate, index) => {
      // Cek apakah tanggal ini sudah ada dalam `newData.total_floors`

      // Struktur data baru untuk setiap lantai dan kursi
      const newFloors = Array.from(
        { length: newData.total_floors },
        (_, floorIndex) => ({
          floor_id: floorIndex + 1,
          id_outlet: outlets.length + 1,
          seats: Array.from(
            { length: newData.total_seats_per_floor },
            (_, seatIndex) => ({
              seat_id: seatIndex + 1,
              status: "available",
            })
          ),
        })
      );

      // Struktur data baru untuk tanggal ini
      const newEntry = {
        date: currentFormattedDate,
        floors: newFloors,
        id: (floorData.length + index).toString(),
        name: newData.nama_outlet,
      };

      // Tambahkan data baru ke Firebase untuk floorByDates
      const newEntryRef = ref(
        database,
        `floorByDates/${floorData.length + index}`
      );
      set(newEntryRef, newEntry)
        .then(() => {})
        .catch((error) => console.error("Error menambahkan data:", error));
    });
  }

  const handleDetail = (outlet) => {
    setSelectedOutlet(outlet);
    setShowDetailModal(true);
  };

  return (
    <div className="container mx-auto bg-white w-screen h-screen p-5">
      <h1 className="text-xl font-bold mb-4">Outlet List</h1>
      <button
        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-700 mb-4"
        onClick={() => setShowAddModal(true)}
      >
        Add New Outlet
      </button>

      {/* Search Input */}

      <div className="flex mb-4">
        <input
          type="text"
          placeholder="Search by outlet name or location"
          value={searchTerm}
          onChange={handleSearch}
          className="border border-gray-300 rounded-lg w-full max-w-screen-xl px-3 py-2 mb-4"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full max-w-screen-xl bg-white border border-gray-300 rounded-lg shadow-lg mx-auto ml-0">
          <thead>
            <tr className="bg-gray-100 text-gray-600 uppercase text-xs leading-normal">
              <th className="py-2 px-3 text-left">Outlet Name</th>
              <th className="py-2 px-3 text-left">Location</th>
              <th className="py-2 px-3 text-left">Booking Price</th>
              <th className="py-2 px-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-xs font-light">
            {filteredOutlets.map((outlet) => (
              <tr
                key={outlet.uid}
                className="border-b border-gray-300 hover:bg-gray-100"
              >
                <td className="py-2 px-3">{outlet.nama_outlet}</td>
                <td className="py-2 px-3">{outlet.lokasi}</td>
                <td className="py-2 px-3">{outlet.harga_dp}</td>
                <td className="py-2 px-3">
                  <button
                    className="bg-blue-500 text-white px-2 py-1 rounded-lg hover:bg-blue-700 mr-2 text-xs"
                    onClick={() => handleEdit(outlet)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-green-500 text-white px-2 py-1 rounded-lg hover:bg-green-700 mr-2 text-xs"
                    onClick={() => handleDetail(outlet)}
                  >
                    Detail
                  </button>
                  <button
                    className="bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-700 text-xs"
                    onClick={() => handleDelete(outlet.uid)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for editing outlet */}
      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-5 w-96">
            <h2 className="text-lg font-bold mb-4">Edit Outlet</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium">Nama Outlet</label>
              <input
                type="text"
                className="border border-gray-300 rounded-lg w-full px-2 py-1"
                value={newData.nama_outlet}
                onChange={(e) =>
                  setNewData({ ...newData, nama_outlet: e.target.value })
                }
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Lokasi</label>
              <input
                type="text"
                className="border border-gray-300 rounded-lg w-full px-2 py-1"
                value={newData.lokasi}
                onChange={(e) =>
                  setNewData({ ...newData, lokasi: e.target.value })
                }
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Harga DP</label>
              <input
                type="number"
                className="border border-gray-300 rounded-lg w-full px-2 py-1"
                value={newData.harga_dp}
                onChange={(e) =>
                  setNewData({ ...newData, harga_dp: e.target.value })
                }
              />
            </div>
            <div className="flex justify-end">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 mr-2"
                onClick={handleUpdate}
              >
                Update
              </button>
              <button
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for showing outlet details */}
      {showDetailModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-5 w-96">
            <h2 className="text-lg font-bold mb-4">Detail Outlet</h2>
            <p>
              <strong>Nama Outlet:</strong> {selectedOutlet.nama_outlet}
            </p>
            <p>
              <strong>Lokasi:</strong> {selectedOutlet.lokasi}
            </p>
            <p>
              <strong>Harga DP:</strong> {selectedOutlet.harga_dp}
            </p>
            <p>
              <strong>Jumlah Meja:</strong> {selectedOutlet.jumlah_meja}
            </p>
            <p>
              <strong>Barcode:</strong> {selectedOutlet.barcode_wl}
            </p>
            <p>
              <strong>QR Code:</strong>{" "}
              <img src={selectedOutlet.qr_pict} alt="QR" />
            </p>
            <p>
              <strong>File Book Menu:</strong>{" "}
              <a href={selectedOutlet.file_bookmenu}>View File</a>
            </p>
            <p>
              <strong>Tanggal WL:</strong> {selectedOutlet.tanggal_wl}
            </p>
            <div className="flex justify-end">
              <button
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                onClick={() => setShowDetailModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for editing outlet */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-5 w-96">
            <h2 className="text-lg font-bold mb-4">Add Outlet</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium">Nama Outlet</label>
              <input
                type="text"
                className="border border-gray-300 rounded-lg w-full px-2 py-1"
                value={newData.nama_outlet}
                onChange={(e) =>
                  setNewData({ ...newData, nama_outlet: e.target.value })
                }
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Lokasi</label>
              <input
                type="text"
                className="border border-gray-300 rounded-lg w-full px-2 py-1"
                value={newData.lokasi}
                onChange={(e) =>
                  setNewData({ ...newData, lokasi: e.target.value })
                }
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Harga DP</label>
              <input
                type="number"
                className="border border-gray-300 rounded-lg w-full px-2 py-1"
                value={newData.harga_dp}
                onChange={(e) =>
                  setNewData({ ...newData, harga_dp: e.target.value })
                }
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Jumlah Lantai</label>
              <input
                type="number"
                className="border border-gray-300 rounded-lg w-full px-2 py-1"
                value={newData.total_floors}
                onChange={(e) =>
                  setNewData({ ...newData, total_floors: e.target.value })
                }
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">
                Jumlah Kursi Per Lantai
              </label>
              <input
                type="number"
                className="border border-gray-300 rounded-lg w-full px-2 py-1"
                value={newData.total_seats_per_floor}
                onChange={(e) =>
                  setNewData({
                    ...newData,
                    total_seats_per_floor: e.target.value,
                  })
                }
              />
            </div>
            <div className="flex justify-end">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 mr-2"
                onClick={handleAdd}
              >
                Add
              </button>
              <button
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataOutlet;
