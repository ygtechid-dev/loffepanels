import React, { useState, useEffect } from 'react';
import { ref, onValue, push } from 'firebase/database';
import { database } from '../context/firebase';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './Input.css';
import { format, toZonedTime } from 'date-fns-tz';

const timeZone = 'Asia/Jakarta'; // Ganti dengan zona waktu yang Anda inginkan

function Blank() {
  const [types, setTypes] = useState([]);
  const [units, setUnits] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [selectedOutlet, setSelectedOutlet] = useState('');
  const [date, setDate] = useState(new Date());
  const [items, setItems] = useState([{ name: '', qty: '', unit: '', price: '', total: 0 }]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [showAlert, setShowAlert] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [masterBahanList, setMasterBahanList] = useState([]);
  const [filteredBahanList, setFilteredBahanList] = useState([]);

  useEffect(() => {
    const typeRef = ref(database, 'type');
    onValue(typeRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setTypes(Object.values(data));
      }
    });

    const unitRef = ref(database, 'satuan');
    onValue(unitRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setUnits(Object.values(data));
      }
    });

    const outletRef = ref(database, 'address');
    onValue(outletRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setOutlets(Object.values(data));
      }
    });

    const bahanRef = ref(database, 'masterbahan');
    onValue(bahanRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map((key) => ({
          id: key,
          nama: data[key].nama,
        }));
        setMasterBahanList(list);
        setFilteredBahanList(list);
      }
    });
  }, []);

  const formatRupiah = (angka) => {
    return angka.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const newItems = [...items];
    
    if (name === 'price') {
      const cleanedValue = value.replace(/\./g, ''); // Remove existing dots
      newItems[index][name] = formatRupiah(cleanedValue); // Add dots again
    } else {
      newItems[index][name] = value;
    }

    newItems[index].total = newItems[index].qty * parseInt(newItems[index].price.replace(/\./g, '') || 0);
    setItems(newItems);
    calculateTotalPrice(newItems);
  };

  const addItem = () => {
    setItems([...items, { name: '', qty: '', unit: '', price: '', total: 0 }]);
  };

  const calculateTotalPrice = (items) => {
    const total = items.reduce((acc, item) => acc + (item.qty * parseInt(item.price.replace(/\./g, '') || 0)), 0);
    setTotalPrice(total);
  };

  const handleSave = () => {
    const datainputRef = ref(database, 'datainput');

    // Convert date to the desired time zone
    const zonedDate = toZonedTime(date, timeZone);
    const formattedDate = format(zonedDate, "yyyy-MM-dd", { timeZone });

    const dataToSave = {
      tanggal: formattedDate,
      tipe: selectedType,
      outlet: selectedOutlet,
      items: items.map(item => ({
        nama: item.name,
        qty: item.qty,
        satuan: item.unit,
        nominal: item.price,
        harga: item.total
      })),
      totalPrice: totalPrice
    };

    console.log('Data to save', dataToSave);
    push(datainputRef, dataToSave).then(() => {
      console.log('Data saved');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000); // Hide alert after 3 seconds
      
      // Reset all inputs
      setSelectedType('');
      setSelectedOutlet('');
      setDate(new Date());
      setItems([{ name: '', qty: '', unit: '', price: '', total: 0 }]);
      setTotalPrice(0);
    }).catch((error) => {
      console.error('Error saving data: ', error);
    });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    const filteredList = masterBahanList.filter(bahan =>
      bahan.nama.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setFilteredBahanList(filteredList);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-4">Form Input</h1>
      {showAlert && (
        <div className="mb-4 p-4 text-green-700 bg-green-100 border border-green-400 rounded">
          Selamat, data berhasil disimpan!
        </div>
      )}
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <label htmlFor="type" className="block text-gray-700 text-sm font-bold mb-2">Tipe</label>
          <select 
            id="type" 
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="">Pilih Tipe</option>
            {types.map((type, index) => (
              <option key={index} value={type.typename}>
                {type.typename}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="outlet" className="block text-gray-700 text-sm font-bold mb-2">Outlet</label>
          <select 
            id="outlet" 
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={selectedOutlet}
            onChange={(e) => setSelectedOutlet(e.target.value)}
          >
            <option value="">Pilih Outlet</option>
            {outlets.map((outlet, index) => (
              <option key={index} value={outlet.namaoutlet}>
                {outlet.namaoutlet}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="date" className="block text-gray-700 text-sm font-bold mb-2">Tanggal</label>
          <DatePicker 
            selected={date} 
            onChange={(date) => setDate(date)} 
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
          />
        </div>
        {items.map((item, index) => (
          <div key={index} className="flex flex-wrap mb-4 items-center space-x-2">
            <select
              name="name"
              value={item.name}
              onChange={(e) => handleItemChange(index, e)}
              className="shadow appearance-none border rounded w-1/4 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">Pilih Nama Bahan</option>
              {filteredBahanList.map((bahan) => (
                <option key={bahan.id} value={bahan.nama}>
                  {bahan.nama}
                </option>
              ))}
            </select>
            <input
              type="number"
              name="qty"
              value={item.qty}
              onChange={(e) => handleItemChange(index, e)}
              placeholder="Qty"
              className="shadow appearance-none border rounded w-1/6 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            <select 
              name="unit"
              value={item.unit}
              onChange={(e) => handleItemChange(index, e)}
              className="shadow appearance-none border rounded w-1/6 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">Pilih Satuan</option>
              {units.map((unit, i) => (
                <option key={i} value={unit.satuannama}>
                  {unit.satuannama}
                </option>
              ))}
            </select>
            <input
              type="text"
              name="price"
              value={item.price}
              onChange={(e) => handleItemChange(index, e)}
              placeholder="Nominal"
              className="shadow appearance-none border rounded w-1/6 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            <span className="text-gray-700 text-sm font-bold py-2">Total: {formatRupiah(item.total.toString())}</span>
            <button type="button" onClick={addItem} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              +
            </button>
          </div>
        ))}
        <div className="total-price mb-4">
          <h3 className="text-gray-700 text-sm font-bold">Total Harga: {formatRupiah(totalPrice.toString())}</h3>
        </div>
        <button type="button" onClick={handleSave} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
          Simpan Data
        </button>
      </div>
    </div>
  );
}

export default Blank;
