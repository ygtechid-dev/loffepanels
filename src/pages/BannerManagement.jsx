import React, { useState, useEffect } from 'react';
import { database, storage } from '../context/firebase'; // Import Firebase setup
import { ref as databaseRef, onValue, update, set } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

const BannerManagement = () => {
  const [banners, setBanners] = useState([]);
  const [newBanner, setNewBanner] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [uploading, setUploading] = useState(false);

  // Fetch banners from Firebase on component mount
  useEffect(() => {
    const bannerRef = databaseRef(database, 'setting/0/banner');
    onValue(bannerRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setBanners(data);
      }
    });
  }, []);

  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setNewBanner(file);
    }
  };

  // Handle title input change
  const handleTitleChange = (event) => {
    setNewTitle(event.target.value);
  };

  // Upload the selected banner image and its title to Firebase
  const handleAddBanner = async () => {
    if (newBanner && newTitle) {
      setUploading(true);
      const storageReference = storageRef(storage, `banners/${newBanner.name}`);
      await uploadBytes(storageReference, newBanner);
      const downloadURL = await getDownloadURL(storageReference);

      const updatedBanners = [...banners, { title: newTitle, uri: downloadURL }];
      const bannerRef = databaseRef(database, 'setting/0/banner');
      await set(bannerRef, updatedBanners);  // Update the banner list in Realtime Database
      setBanners(updatedBanners);
      setNewBanner(null);
      setNewTitle('');
      setUploading(false);
    }
  };

  // Handle deleting a banner
  const handleDeleteBanner = async (index) => {
    const updatedBanners = banners.filter((_, idx) => idx !== index);
    const bannerRef = databaseRef(database, 'setting/0/banner');
    await set(bannerRef, updatedBanners); // Update the database
    setBanners(updatedBanners);
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Banner Management</h2>

      {/* Display Banners */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {banners.map((banner, index) => (
          <div key={index} className="relative bg-gray-200 p-2 rounded shadow">
            <img src={banner.uri} alt={`Banner ${index}`} className="w-full h-40 object-cover rounded" />
            <p className="mt-2 text-center font-semibold">{banner.title}</p>
            <button
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded"
              onClick={() => handleDeleteBanner(index)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* Upload new banner */}
      <div className="mb-4">
        <input type="file" onChange={handleFileChange} className="mb-2" />
        <input 
          type="text" 
          value={newTitle} 
          onChange={handleTitleChange} 
          placeholder="Enter banner title" 
          className="border p-2 w-full rounded mb-2"
        />
        <button
          onClick={handleAddBanner}
          disabled={!newBanner || !newTitle || uploading}
          className="bg-blue-500 text-white p-2 rounded mt-2"
        >
          {uploading ? 'Uploading...' : 'Add Banner'}
        </button>
      </div>
    </div>
  );
};

export default BannerManagement;
