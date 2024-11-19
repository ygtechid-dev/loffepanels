// services/adminLogin.js

export const adminLogin = async (username, password) => {
    // Simulasi API request. 
    // Ganti dengan fetch atau axios untuk memanggil API yang sebenarnya.
    return new Promise((resolve, reject) => {
      if (username === 'admin' && password === 'password') {
        resolve({ success: true, message: 'Login successful', token: 'dummyToken' });
      } else {
        reject({ success: false, message: 'Invalid credentials' });
      }
    });
  };
  