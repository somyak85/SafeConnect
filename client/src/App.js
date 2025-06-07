import React from "react";
import SocketProvider from "./components/SocketProvider";

function App() {
  return (
    <div>
      <h1>SafeConnect</h1>
      <SocketProvider />
    </div>
  );
}

export default App;

// import React from "react";
// import SocketProvider from "./components/SocketProvider";
// import SkipButton from "./components/SkipButton";

// function App() {
//   return (
//     <SocketProvider>
//       <div style={{ padding: 20 }}>
//         <h1>SafeConnect Video Chat</h1>
//         <SkipButton />
//       </div>
//     </SocketProvider>
//   );
// }

// export default App;
