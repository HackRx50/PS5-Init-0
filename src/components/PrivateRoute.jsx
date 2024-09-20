// src/components/PrivateRoute.js
import React from "react";
// import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const role = localStorage.getItem("role");

  if (role === "admin") {
    return children;
  } else {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh", 
          fontSize: "50px",
          color: "black",
          fontWeight: "bold", 
          textAlign: "center", 
          backgroundColor: "white", 
         
        }}
      >
        Only Admins can access this page.
        {setTimeout(() => {
          window.location.href = "/";
        }, 3000)}
      </div>
    );
  }
};

export default PrivateRoute;
