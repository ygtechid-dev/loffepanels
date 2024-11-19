import React, { useEffect, useState } from "react";
import { database } from "../context/firebase"; // Pastikan path import sudah benar
import { ref, onValue, remove, update } from "firebase/database";

function DataUser() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [newData, setNewData] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const userRef = ref(database, "userlogin");
    onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const userList = Object.keys(data).map((key) => ({
          uid: key,
          ...data[key],
        }));
        setUsers(userList);
        setFilteredUsers(userList); // Set initial filtered users
      }
    });
  }, []);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    // Filter users based on search term
    const filtered = users.filter(user =>
      user.namaLengkap.toLowerCase().includes(term) ||
      user.handphone.includes(term) ||
      user.email.toLowerCase().includes(term)
    );
    setFilteredUsers(filtered);
  };

  const handleDelete = (uid) => {
    const userRef = ref(database, `userlogin/${uid}`);
    remove(userRef)
      .then(() => {
        alert("User deleted successfully!");
      })
      .catch((error) => {
        console.error("Error deleting user: ", error);
      });
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setNewData({ 
      namaLengkap: user.namaLengkap, 
      handphone: user.handphone, 
      membership_status: user.membership_status,
      address: user.address,
      email: user.email,
      password: user.password,
      point_member: user.point_member,
    });
    setShowEditModal(true);
  };

  const handleUpdate = () => {
    const userRef = ref(database, `userlogin/${selectedUser.uid}`);
    update(userRef, newData)
      .then(() => {
        alert("User updated successfully!");
        setShowEditModal(false);
        setSelectedUser(null);
      })
      .catch((error) => {
        console.error("Error updating user: ", error);
      });
  };

  const handleDetail = (user) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  return (
    <div className="container mx-auto bg-white w-screen h-screen p-5">
      <h1 className="text-xl font-bold mb-4">User List</h1>

      {/* Search Input */}
      <input
        type="text"
        placeholder="Search by name, phone, or email"
        value={searchTerm}
        onChange={handleSearch}
        className="border border-gray-300 rounded-lg w-full max-w-screen-xl px-3 py-2 mb-4" // Use the same width classes
      />

      <div className="overflow-x-auto">
      <table className="w-full max-w-screen-xl bg-white border border-gray-300 rounded-lg shadow-lg mx-auto ml-0">
 {/* Use w-full for table */}
          <thead>
            <tr className="bg-gray-100 text-gray-600 uppercase text-xs leading-normal">
              <th className="py-2 px-3 text-left">UID</th>
              <th className="py-2 px-3 text-left">Nama Lengkap</th>
              <th className="py-2 px-3 text-left">Handphone</th>
              <th className="py-2 px-3 text-left">Membership Status</th>
              <th className="py-2 px-3 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-xs font-light">
            {filteredUsers.map((user) => (
              <tr key={user.uid} className="border-b border-gray-300 hover:bg-gray-100">
                <td className="py-2 px-3">{user.uid}</td>
                <td className="py-2 px-3">{user.namaLengkap}</td>
                <td className="py-2 px-3">{user.handphone}</td>
                <td className="py-2 px-3">{user.membership_status}</td>
                <td className="py-2 px-3">
                  <button
                    className="bg-blue-500 text-white px-2 py-1 rounded-lg hover:bg-blue-700 mr-2 text-xs"
                    onClick={() => handleEdit(user)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-green-500 text-white px-2 py-1 rounded-lg hover:bg-green-700 mr-2 text-xs"
                    onClick={() => handleDetail(user)}
                  >
                    Detail
                  </button>
                  <button
                    className="bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-700 text-xs"
                    onClick={() => handleDelete(user.uid)}
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for editing user */}
      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-5 w-96">
            <h2 className="text-lg font-bold mb-4">Edit User</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium">Nama Lengkap</label>
              <input
                type="text"
                className="border border-gray-300 rounded-lg w-full px-2 py-1"
                value={newData.namaLengkap}
                onChange={(e) => setNewData({ ...newData, namaLengkap: e.target.value })}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Handphone</label>
              <input
                type="text"
                className="border border-gray-300 rounded-lg w-full px-2 py-1"
                value={newData.handphone}
                onChange={(e) => setNewData({ ...newData, handphone: e.target.value })}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Membership Status</label>
              <input
                type="text"
                className="border border-gray-300 rounded-lg w-full px-2 py-1"
                value={newData.membership_status}
                onChange={(e) => setNewData({ ...newData, membership_status: e.target.value })}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Email</label>
              <input
                type="email"
                className="border border-gray-300 rounded-lg w-full px-2 py-1"
                value={newData.email}
                onChange={(e) => setNewData({ ...newData, email: e.target.value })}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Address</label>
              <input
                type="text"
                className="border border-gray-300 rounded-lg w-full px-2 py-1"
                value={newData.address}
                onChange={(e) => setNewData({ ...newData, address: e.target.value })}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Password</label>
              <input
                type="password"
                className="border border-gray-300 rounded-lg w-full px-2 py-1"
                value={newData.password}
                onChange={(e) => setNewData({ ...newData, password: e.target.value })}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Point Member</label>
              <input
                type="number"
                className="border border-gray-300 rounded-lg w-full px-2 py-1"
                value={newData.point_member}
                onChange={(e) => setNewData({ ...newData, point_member: e.target.value })}
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

      {/* Modal for showing user details */}
      {showDetailModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-5 w-96">
            <h2 className="text-lg font-bold mb-4">Detail User</h2>
            <p><strong>UID:</strong> {selectedUser.uid}</p>
            <p><strong>Nama Lengkap:</strong> {selectedUser.namaLengkap}</p>
            <p><strong>Handphone:</strong> {selectedUser.handphone}</p>
            <p><strong>Email:</strong> {selectedUser.email}</p>
            <p><strong>Address:</strong> {selectedUser.address}</p>
            <p><strong>Membership Status:</strong> {selectedUser.membership_status}</p>
            <p><strong>Password:</strong> {selectedUser.password}</p>
            <p><strong>Point Member:</strong> {selectedUser.point_member}</p>
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

export default DataUser;
