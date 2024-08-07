import ReactDOM from "./core/ReactDOM.js";
import React from "./core/React.js";
import App from "./App.jsx";
const container = document.getElementById("root")
const app = ReactDOM.createRoot(container).render(<App />)
