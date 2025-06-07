import React, { useEffect, useState } from "react";

const BackendStatus = () => {
  const [message, setMessage] = useState("");
  useEffect(() => {
    fetch("http://localhost:5000")
      .then((res) => res.text())
      .then((data) => setMessage(data));
  }, []);

  return (
    <div>
      <h2>Backend Says:</h2>
      <p>{message}</p>
    </div>
  );
};

export default BackendStatus;
