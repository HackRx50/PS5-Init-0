import React from "react";
import { Route, Routes } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import UserProfile from "../pages/UserProfile";
import AdminDashboard from "../pages/AdminDashboard";
import Navbar from "./Navbar";
import { Box } from "@chakra-ui/react";
import PrivateRoute from "./PrivateRoute";

function AllRoutes() {
  return (
    <div>
      <Navbar />
      <Box mt={16}>
        {" "}
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/submit-claim" element={<Register />} />
          <Route path="/userProfile" element={<UserProfile />} />
          <Route
            path="/adminDashboard"
            element={
              <PrivateRoute>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
        </Routes>
      </Box>
    </div>
  );
}

export default AllRoutes;
