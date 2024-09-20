import React from 'react'

function UserProfile() {
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
      <img
        src="https://www.cubertndp.co.uk/wp-content/uploads/2019/12/thank-you-tick-300x211.jpg"
        alt="Thank you "
      />
    </div>
  );
}

export default UserProfile