import React, { useEffect, useState } from "react";
import { database, storage } from "../context/firebase"; // Pastikan import Storage dari Firebase sudah benar
import { ref, onValue, remove, update, push } from "firebase/database"; // Tambahkan 'push' untuk tambah data
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage"; // Firebase Storage utilities

function DataMembership() {
  const [outlets, setOutlets] = useState([]);
  const [filteredOutlets, setFilteredOutlets] = useState([]);
  const [selectedOutlet, setSelectedOutlet] = useState(null);
  console.log('sssSX', selectedOutlet);
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false); // Modal untuk tambah data baru
  const [newData, setNewData] = useState({
    level: '',
    minpoint: '',
    maxpoint: '',
    pict: ''
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [imageFile, setImageFile] = useState(null); // State untuk gambar yang diupload
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const outletRef = ref(database, "membership_card");
    onValue(outletRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const outletList = Object.keys(data).map((key) => ({
          uid: key,
          ...data[key],
        }));
        setOutlets(outletList);
        setFilteredOutlets(outletList);
      }
    });
  }, []);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = outlets.filter(outlet =>
      outlet.level.toLowerCase().includes(term)
    );
    setFilteredOutlets(filtered);
  };

  const handleDelete = (uid) => {
    const outletRef = ref(database, `membership_card/${uid}`);
    remove(outletRef)
      .then(() => {
        alert("Membership deleted successfully!");
      })
      .catch((error) => {
        console.error("Error deleting membership: ", error);
      });
  };

  const handleEdit = (outlet) => {
    setSelectedOutlet(outlet);
    setNewData({
      level: outlet.level,
      minpoint: outlet.minpoint,
      maxpoint: outlet.maxpoint,
      pict: outlet.pict
    });
    setShowEditModal(true);
  };

  const handleUpdate = () => {
    if (imageFile) {
      const storageReference = storageRef(storage, `membership_pics/${imageFile.name}`);
      const uploadTask = uploadBytesResumable(storageReference, imageFile);

      setUploading(true);
      uploadTask.on('state_changed',
        (snapshot) => {
          // Handle upload progress here if needed
        },
        (error) => {
          console.error("Error uploading image: ", error);
          setUploading(false);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            const outletRef = ref(database, `membership_card/${selectedOutlet.uid}`);
            update(outletRef, { ...newData, pict: downloadURL })
              .then(() => {
                alert("Membership updated successfully!");
                setShowEditModal(false);
                setSelectedOutlet(null);
                setImageFile(null); // Clear the image file after update
                setUploading(false);
              })
              .catch((error) => {
                console.error("Error updating membership: ", error);
                setUploading(false);
              });
          });
        }
      );
    } else {
      const outletRef = ref(database, `membership_card/${selectedOutlet.uid}`);
      update(outletRef, newData)
        .then(() => {
          alert("Membership updated successfully!");
          setShowEditModal(false);
          setSelectedOutlet(null);
        })
        .catch((error) => {
          console.error("Error updating membership: ", error);
        });
    }
  }


  const handleDetail = (outlet) => {
    setSelectedOutlet(outlet);
    setShowDetailModal(true);
  };

  const handleImageUpload = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleAddNew = () => {
    if (imageFile) {
      const storageReference = storageRef(storage, `membership_pics/${imageFile.name}`);
      const uploadTask = uploadBytesResumable(storageReference, imageFile);

      setUploading(true);
      uploadTask.on('state_changed',
        (snapshot) => {
          // Handle upload progress here if needed
        },
        (error) => {
          console.error("Error uploading image: ", error);
          setUploading(false);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            const outletRef = ref(database, 'membership_card');
            push(outletRef, { ...newData, pict: downloadURL })
              .then(() => {
                alert("Membership added successfully!");
                setShowAddModal(false);
                setNewData({
                  level: '',
                  minpoint: '',
                  maxpoint: '',
                  pict: ''
                });
                setImageFile(null);
                setUploading(false);
              })
              .catch((error) => {
                console.error("Error adding new membership: ", error);
                setUploading(false);
              });
          });
        }
      );
    } else {
      alert("Please select an image!");
    }
  };

  return (
    <div className="container mx-auto bg-white w-screen h-screen p-5">
      <h1 className="text-xl font-bold mb-4">Membership List</h1>

      {/* Tombol Tambah Data */}
      <button
        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-700 mb-4"
        onClick={() => setShowAddModal(true)}
      >
        Tambah Membership
      </button>

      {/* Search Input */}
      

      <div className="overflow-x-auto">
      <input
        type="text"
        placeholder="Search by Level Membership"
        value={searchTerm}
        onChange={handleSearch}
        className="border border-gray-300 rounded-lg w-full max-w-screen-xl px-3 py-2 mb-4"
      />
        <table className="w-full max-w-screen-xl bg-white border border-gray-300 rounded-lg shadow-lg mx-auto ml-0">
          <thead>
            <tr className="bg-gray-100 text-gray-600 uppercase text-xs leading-normal">
              <th className="py-2 px-3 text-left">Membership Name</th>
              <th className="py-2 px-3 text-left">Min Point</th>
              <th className="py-2 px-3 text-left">Max Point</th>
              <th className="py-2 px-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-xs font-light">
            {filteredOutlets.map((outlet) => (
              <tr key={outlet.uid} className="border-b border-gray-300 hover:bg-gray-100">
                <td className="py-2 px-3">{outlet.level}</td>
                <td className="py-2 px-3">{outlet.minpoint}</td>
                <td className="py-2 px-3">{outlet.maxpoint}</td>
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

      {/* Modal untuk tambah data */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-5 w-96">
            <h2 className="text-lg font-bold mb-4">Tambah Membership Baru</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium">Nama Membership</label>
              <input
                type="text"
                className="border border-gray-300 rounded-lg w-full px-2 py-1"
                value={newData.level}
                onChange={(e) => setNewData({ ...newData, level: e.target.value })}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Minimum Point</label>
              <input
                type="text"
                className="border border-gray-300 rounded-lg w-full px-2 py-1"
                value={newData.minpoint}
                onChange={(e) => setNewData({ ...newData, minpoint: e.target.value })}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Maximum Point</label>
              <input
                type="text"
                className="border border-gray-300 rounded-lg w-full px-2 py-1"
                value={newData.maxpoint}
                onChange={(e) => setNewData({ ...newData, maxpoint: e.target.value })}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Upload Picture</label>
              <input
                type="file"
                accept="image/*"
                className="border border-gray-300 rounded-lg w-full px-2 py-1"
                onChange={handleImageUpload}
              />
            </div>
            <div className="flex justify-end">
              <button
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 mr-2"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button
                className={`bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={handleAddNew}
                disabled={uploading}
              >
                {uploading ? "Uploading..." : "Add Membership"}
              </button>
            </div>
          </div>
        </div>
      )}

       {/* Modal untuk Edit */}
      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-5 w-96">
            <h2 className="text-lg font-bold mb-4">Edit Membership</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium">Nama Membership</label>
              <input
                type="text"
                className="border border-gray-300 rounded-lg w-full px-2 py-1"
                value={newData.level}
                onChange={(e) => setNewData({ ...newData, level: e.target.value })}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Minimum Point</label>
              <input
                type="text"
                className="border border-gray-300 rounded-lg w-full px-2 py-1"
                value={newData.minpoint}
                onChange={(e) => setNewData({ ...newData, minpoint: e.target.value })}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Maximum Point</label>
              <input
                type="text"
                className="border border-gray-300 rounded-lg w-full px-2 py-1"
                value={newData.maxpoint}
                onChange={(e) => setNewData({ ...newData, maxpoint: e.target.value })}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium">Choose File</label>
              <input
                type="file"
                accept="image/*"
                className="border border-gray-300 rounded-lg w-full px-2 py-1"
                onChange={handleImageUpload}
              />
            </div>

            <div className="flex justify-end">
              <button
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 mr-2"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                onClick={handleUpdate}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Update Membership'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal untuk Detail */}
      {showDetailModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-5 w-96">
            <h2 className="text-lg font-bold mb-4">Detail Membership</h2>
            <div className="mb-4">
              <p><strong>Nama Membership:</strong> {selectedOutlet?.level}</p>
              <p><strong>Min Point:</strong> {selectedOutlet?.minpoint}</p>
              <p><strong>Max Point:</strong> {selectedOutlet?.maxpoint}</p>
              <p>
      <strong>Picture:</strong> 
      {selectedOutlet?.pict ? (
        <a 
      href={selectedOutlet.pict} 
      target="_blank" 
      rel="noopener noreferrer"
      className="blue-link" // Menggunakan kelas CSS
    >
          Klik Disini
        </a>
      ) : (
        <span>No Picture Available</span>
      )}
    </p>
            </div>
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
    </div>
  );
}

export default DataMembership;
