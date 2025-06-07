import React from "react";

const SafeConnectLayout = ({ VideoCall, ChatBox }) => {
  return (
    <div style={styles.appContainer}>
      <header style={styles.header}>
        <h1 style={styles.title}>SafeConnect</h1>
      </header>
      <main style={styles.main}>
        <section style={styles.videoColumn}>
          <VideoCall />
        </section>
        <section style={styles.chatColumn}>
          <ChatBox />
        </section>
      </main>
    </div>
  );
};

const styles = {
  appContainer: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#fff",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  header: {
    padding: "15px 30px",
    borderBottom: "1px solid #dce3ea",
    backgroundColor: "#e6f0ff",
    textAlign: "center",
  },
  title: {
    margin: 0,
    color: "#007bff",
    fontWeight: "700",
    fontSize: "1.8rem",
  },
  main: {
    flex: 1,
    display: "flex",
    padding: "20px 30px",
    gap: "30px",
    overflow: "hidden",
  },
  videoColumn: {
    display: "flex",
    flexDirection: "column",
    width: "38%",
    gap: "20px",
  },
  chatColumn: {
    flex: 1,
    border: "1px solid #dce3ea",
    borderRadius: "10px",
    backgroundColor: "#fafafa",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
};

export default SafeConnectLayout;
