import React, { useEffect, useState } from "react";
import { database } from "../context/firebase";
import {
  ref,
  onValue,
  update,
  push,
  set,
  query,
  orderByChild,
  equalTo,
  get,
} from "firebase/database";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";

const FloorManagement = () => {
  const [floorData, setFloorData] = useState([]);
  const [filteredFloors, setFilteredFloors] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [notification, setNotification] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isModalStatus, setIsModalStatus] = useState({
    isOpen: false,
    floorsIndex: null,
    floorIndex: null,
    seatIndex: null,
    floorData: null,
    seatNo: null,
  });
  const [newData, setNewData] = useState({
    date: "",
    end_date: "",
    id_outlet: 0,
    floors: 0,
    seats: 10,
  });
  const [outletList, setOutlet] = useState([]);

  useEffect(() => {
    const floorRef = ref(database, "floorByDates");
    onValue(floorRef, (snapshot) => {
      const data = snapshot.val();
      setFloorData(data || []); // Ensure that floorData is an array
      setFilteredFloors(data || []); // Ensure that filteredFloors is an array
    });
  }, []);

  useEffect(() => {
    const floorRef = ref(database, "outletsetting");
    onValue(floorRef, (snapshot) => {
      const data = snapshot.val();
      setOutlet(data || []); // Ensure that floorData is an array
    });
  }, []);

  // enhance filter logic using query firestore
  const handleFilterByDate = async (event) => {
    const selected = event.target.value;
    setSelectedDate(selected);

    const [year, month, day] = selected.split("-");
    const formattedDate = `${day}-${month}-${year}`;

    const floorRef = ref(database, "floorByDates");

    try {
      const snapshot = await get(floorRef); // Mendapatkan hasil query
      if (snapshot.exists()) {
        const data = snapshot.val(); // Mengambil semua data
        let dataArray;

        if (selected) {
          dataArray = data.filter((entry) => entry.date === formattedDate);
        } else {
          dataArray = data;
        }

        setFilteredFloors(dataArray);
      } else {
        console.log("No data found.");
        setFloorData([]);
      }
    } catch (error) {
      console.error("Error finding data by date:", error);
    }
  };

  const handleSeatClick = async () => {
    const { floorsIndex, floorIndex, seatIndex, floorData } = isModalStatus;
    const updatedFloors = { ...floorData };

    const targetFloor = updatedFloors.floors[floorIndex];
    if (!targetFloor || !targetFloor.seats[seatIndex]) {
      console.error("Invalid floor or seat index.");
      return;
    }

    const targetSeat = targetFloor.seats[seatIndex];

    targetSeat.status =
      targetSeat.status === "available" ? "booked" : "available";

    setFilteredFloors([...filteredFloors, updatedFloors]);

    const updates = {};
    updates[`floorByDates/${floorsIndex}`] = updatedFloors;

    try {
      await update(ref(database), updates);
      setIsModalStatus({ ...isModalStatus, isOpen: false });
      setNotification(
        `Seat has been ${
          targetSeat.status === "booked" ? "booked" : "made available"
        }!`
      );
    } catch (error) {
      console.error("Error updating seat status:", error);
    }

    setTimeout(() => setNotification(""), 3000);
  };

  const handleAddDataSeats = () => {
    setIsModalOpen(true);
  };

  const handleEdit = () => {
    const { date, id_outlet, floors, seats, id } = newData; //ada end_date
    const formattedDate = date.split("-").reverse().join("-");

    const floorByDatesRef = ref(database, "floorByDates");
    const outletName =
      id_outlet === 1
        ? "Loffee Coffe & Eatery Tebet"
        : "Loffee Coffe & Eatery Gandaria";
    // Dapatkan data existing dari floorByDates

    // Cari jika date sudah ada
    const existingDateData = floorData.findIndex((floor) => floor.id === id);

    if (existingDateData === -1) {
      // Buat struktur baru untuk date, floors, dan seats
      const newFloors = Array.from({ length: floors }, (_, floorIndex) => ({
        floor_id: floorIndex + 1,
        id_outlet: Number(id_outlet),
        seats: Array.from({ length: seats }, (_, seatIndex) => ({
          seat_id: seatIndex + 1,
          status: "available",
        })),
      }));

      const newEntry = {
        date: formattedDate,
        floors: newFloors,
        id: floorData.length.toString(),
        name: outletName,
      };

      const newEntryRef = ref(database, `floorByDates/${floorData.length}`);
      set(newEntryRef, newEntry)
        .then(() => {
          setIsModalOpen(false);
          setIsEdit(false);
          setNewData({
            date: "",
            end_date: "",
            id_outlet: 0,
            floors: 1,
            seats: 10,
          });
          setNotification("New floor data added successfully!");
          setTimeout(() => setNotification(""), 3000);
        })
        .catch((error) => console.error("Error menambahkan data:", error));
    } else {
      const updatedFloors = Array.from({ length: floors }, (_, floorIndex) => ({
        floor_id: floorIndex + 1,
        id_outlet: Number(id_outlet),
        seats: Array.from({ length: seats }, (_, seatIndex) => ({
          seat_id: seatIndex + 1,
          status: "available",
        })),
      }));

      const updatedEntry = {
        ...floorData[existingDateData],
        date: formattedDate,
        floors: updatedFloors,
        name: outletName,
      };

      const existingEntryRef = ref(
        database,
        `floorByDates/${existingDateData}`
      );
      set(existingEntryRef, updatedEntry)
        .then(() => {
          setIsModalOpen(false);
          setIsEdit(false);
          setNewData({
            date: "",
            end_date: "",
            id_outlet: 0,
            floors: 1,
            seats: 10,
          });
          setNotification("Floor data updated successfully!");
          setTimeout(() => setNotification(""), 3000);
        })
        .catch((error) => console.error("Error mengupdate data:", error));
    }
  };

  const handleSaveNewData = () => {
    const { date, end_date, id_outlet, floors, seats } = newData;

    if (!date || !end_date || !id_outlet || !floors || !seats) {
      alert("please fill all data!");
      return;
    }

    const floorByDatesRef = ref(database, "floorByDates");
    const outletName =
      Number(id_outlet) === 1
        ? "Loffee Coffe & Eatery Tebet"
        : "Loffee Coffe & Eatery Gandaria";

    const getDateRange = (start, end) => {
      const dateArray = [];
      let currentDate = new Date(start);
      const endDate = new Date(end);

      while (currentDate <= endDate) {
        const formattedDate = currentDate.toISOString().split("T")[0]; // Format jadi YYYY-MM-DD
        dateArray.push(formattedDate);
        currentDate.setDate(currentDate.getDate() + 1); // Tambah 1 hari
      }
      return dateArray;
    };

    const dateRangeArray = getDateRange(date, end_date);

    dateRangeArray.forEach((currentFormattedDate, index) => {
      const existingDateData = floorData.findIndex(
        (floor) => floor.date === currentFormattedDate
      );

      if (existingDateData === -1) {
        const newFloors = Array.from({ length: floors }, (_, floorIndex) => ({
          floor_id: floorIndex + 1,
          id_outlet: Number(id_outlet),
          seats: Array.from({ length: seats }, (_, seatIndex) => ({
            seat_id: seatIndex + 1,
            status: "available",
          })),
        }));

        const formattedStartDate = currentFormattedDate
          .split("-")
          .reverse()
          .join("-");
        const formattedEndDate = end_date.split("-").reverse().join("-");

        const newEntry = {
          date: formattedStartDate,
          floors: newFloors,
          id: (floorData.length + index).toString(),
          name: outletName,
        };

        const newEntryRef = ref(
          database,
          `floorByDates/${floorData.length + index}`
        );
        set(newEntryRef, newEntry)
          .then(() => {})
          .catch((error) => console.error("Error menambahkan data:", error));
      } else {
        console.log(`Data untuk tanggal ${currentFormattedDate} sudah ada.`);
      }
    });

    setIsModalOpen(false);
    setIsEdit(false);
    setNewData({
      date: "",
      end_date: "",
      id_outlet: 0,
      floors: 1,
      seats: 10,
    });
    setNotification("New floor data added successfully!");
    setTimeout(() => setNotification(""), 3000);
  };

  async function handleGetOutletFloorsById(id_outlet) {
    const dbRef = ref(database, "outletsetting");

    try {
      const snapshot = await get(dbRef);

      if (snapshot.exists()) {
        const outlets = snapshot.val();

        const outlet = outlets.find(
          (outlet) => outlet.id_outlet === Number(id_outlet)
        );
        if (!outlet) {
          console.log(`Outlet with id_outlet ${id_outlet} not found.`);
          return;
        }

        const total_floors = outlet.total_floors || 0;
        const total_seats_per_floor = outlet.total_seats_per_floor || 0;

        return { total_floors, total_seats_per_floor };
      } else {
        console.log("No data available");
      }
    } catch (error) {
      console.error("Error fetching outlet data:", error);
    }
  }

  const handleChange = async (e) => {
    const { name, value } = e.target;

    if (name === "id_outlet") {
      const { total_floors, total_seats_per_floor } =
        await handleGetOutletFloorsById(value);
      setNewData((prev) => ({
        ...prev,
        [name]: value,
        floors: total_floors,
        seats: total_seats_per_floor,
      }));
    } else {
      setNewData((prev) => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Floor and Seat Management</h2>

      <div className="mb-4">
        <label htmlFor="dateFilter" className="mr-2 font-semibold">
          Filter by Date:
        </label>
        <input
          type="date"
          id="dateFilter"
          value={selectedDate}
          onChange={handleFilterByDate}
          className="border p-2 rounded"
        />
      </div>

      {notification && (
        <div className="mb-4 p-2 bg-green-300 text-green-800 rounded">
          {notification}
        </div>
      )}

      <button
        onClick={handleAddDataSeats}
        className="mb-4 p-2 bg-blue-500 text-white rounded"
      >
        Add Data Seats
      </button>

      {/* modal update status seat */}

      {isModalStatus.isOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg">
            <h3>
              Apakah anda Yakin ingin merubah status seat {isModalStatus.seatNo}{" "}
            </h3>
            <div className="flex mt-2">
              <button
                onClick={() => handleSeatClick()}
                className="bg-green-500 text-white p-2 rounded mr-2"
              >
                Ya
              </button>
              <button
                onClick={() =>
                  setIsModalStatus({ ...isModalStatus, isOpen: false })
                }
                className="bg-red-500 text-white p-2 rounded"
              >
                Tidak
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for adding new data */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4">Add New Data</h3>

            <label className="block mb-2">Date:</label>
            <input
              type="date"
              name="date"
              value={newData.date}
              onChange={handleChange}
              className="border p-2 mb-4 rounded w-full"
            />
            {!isEdit && (
              <>
                <label className="block mb-2">End Date:</label>
                <input
                  type="date"
                  name="end_date"
                  value={newData.end_date}
                  onChange={handleChange}
                  className="border p-2 mb-4 rounded w-full"
                />
              </>
            )}

            <label className="block mb-2">ID Outlet: </label>
            <select
              name="id_outlet"
              value={newData.id_outlet}
              onChange={handleChange}
              className="border p-2 mb-4 rounded w-full"
            >
              <option value={0} disabled>
                Choose outlet
              </option>
              {outletList.map((data, index) => {
                return <option value={index}>{data.nama_outlet}</option>;
              })}
            </select>

            {isEdit && (
              <>
                <label className="block mb-2">Number of Floors:</label>
                <input
                  type="number"
                  name="floors"
                  value={newData.floors}
                  onChange={handleChange}
                  className="border p-2 mb-4 rounded w-full"
                />

                <label className="block mb-2">Number of Seats per Floor:</label>
                <input
                  type="number"
                  name="seats"
                  value={newData.seats}
                  onChange={handleChange}
                  className="border p-2 mb-4 rounded w-full"
                />
              </>
            )}

            <button
              onClick={() => {
                isEdit ? handleEdit() : handleSaveNewData();
              }}
              className="bg-green-500 text-white p-2 rounded mr-2"
            >
              Save
            </button>
            <button
              onClick={() => {
                setIsModalOpen(false);
                setIsEdit(false);
                setNewData({
                  date: "",
                  end_date: "",
                  id_outlet: 0,
                  floors: 1,
                  seats: 10,
                });
              }}
              className="bg-red-500 text-white p-2 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFloors.map((floorData, floorsIndex) => (
          <div key={floorData.id} className="bg-white p-4 rounded shadow-lg">
            <div className="flex justify-between">
              <div className="flex flex-col">
                <h3 className="text-xl font-semibold mb-2">{floorData.name}</h3>
                <p className="text-gray-600 mb-2">Date: {floorData.date}</p>
              </div>
              <FontAwesomeIcon
                className="cursor-pointer"
                icon={faEdit}
                onClick={async () => {
                  const id_outlet = "Loffee Coffe & Eatery Tebet" ? 1 : 0;
                  // const id_outlet = "Loffee Coffe & Eatery Tebet" ? 1 : 0;

                  const [day, month, year] = floorData.date.split("-");
                  const validDate = new Date(`${year}-${month}-${day}`);
                  setNewData({
                    ...newData,
                    date: `${year}-${month}-${day}`,
                    id_outlet: floorData.floors[0].id_outlet,
                    id: floorData.id,
                    floors: floorData.floors.length,
                    seats: floorData.floors[0].seats.length,
                  });

                  setIsModalOpen(true);
                  setIsEdit(true);
                }}
              ></FontAwesomeIcon>
            </div>

            {floorData.floors?.map(
              (
                floor,
                floorIndex // Check if floors exist
              ) => (
                <div key={floor.floor_id} className="mb-4">
                  <h4 className="font-semibold">Floor {floor.floor_id}</h4>

                  <div className="grid grid-cols-5 gap-2">
                    {floor.seats?.map(
                      (
                        seat,
                        seatIndex // Check if seats exist
                      ) => (
                        <div
                          key={seat.seat_id}
                          onClick={() => {
                            setIsModalStatus({
                              isOpen: true,
                              floorsIndex,
                              floorIndex,
                              seatIndex,
                              floorData,
                              seatNo: seat.seat_id,
                            });
                          }}
                          className={`cursor-pointer p-2 text-center rounded ${
                            seat.status === "booked"
                              ? "bg-red-300"
                              : "bg-green-300 hover:bg-green-400"
                          }`}
                        >
                          Seat {seat.seat_id} ({seat.status})
                        </div>
                      )
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FloorManagement;
