import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Table from "./pages/Table";
import AuthLayout from "./components/Layout/AuthLayout";
import GuestLayout from "./components/Layout/GuestLayout";
import Login from "./pages/auth/Login";
import Blank from "./pages/Blank";
import NotFound from "./pages/NotFound";
import Pengiriman from "./pages/Pengiriman";
import Form from "./pages/Form";
import RegisterIndex from "./pages/auth/Register";
import DataUser from "./pages/DataUser";
import DataOutlet from "./pages/DataOutlet";
import DataMembership from "./pages/DataMembership";
import DataTransaksi from "./pages/DataTransaksi";
import DataWaitingList from "./pages/DataWaitingList";
import FloorManagement from "./pages/FloorManagement";
import BannerManagement from "./pages/BannerManagement";

function App() {
  const isAuthenticated = !!localStorage.getItem("authToken");

  return (
    <Routes>
      <Route path="/" element={<AuthLayout />}>
        {/* Jika sudah login, arahkan ke Dashboard */}
        <Route 
          path="/" 
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/auth/login" />} 
        />
        <Route path="/table" element={isAuthenticated ? <Table /> : <Navigate to="/auth/login" />} />
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/dashboard" />} />

        <Route path="/data-user" element={isAuthenticated ? <DataUser /> : <Navigate to="/data-user" />} />
        <Route path="/data-outlet" element={isAuthenticated ? <DataOutlet /> : <Navigate to="/data-outlet" />} />
        <Route path="/data-membership" element={isAuthenticated ? <DataMembership /> : <Navigate to="/data-membership" />} />
        <Route path="/data-transaksi" element={isAuthenticated ? <DataTransaksi /> : <Navigate to="/data-transaksi" />} />
        <Route path="/data-waitinglist" element={isAuthenticated ? <DataWaitingList /> : <Navigate to="/data-waitinglist" />} />
        <Route path="/floor-management" element={isAuthenticated ? <FloorManagement /> : <Navigate to="/floor-management" />} />
        <Route path="/banner-management" element={isAuthenticated ? <BannerManagement /> : <Navigate to="/banner-management" />} />




       
        <Route path="/kirim" element={isAuthenticated ? <Pengiriman /> : <Navigate to="/auth/login" />} />
        <Route path="/form" element={isAuthenticated ? <Form /> : <Navigate to="/auth/login" />} />
        <Route path="/profile" element={isAuthenticated ? <Blank /> : <Navigate to="/auth/login" />} />
      </Route>
      <Route path="/auth" element={<GuestLayout />}>
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<RegisterIndex />} />
      </Route>
    </Routes>
  );
}

export default App;
