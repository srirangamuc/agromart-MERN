import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import store from "./redux/store.js"; // Redux store
import App from "./App.jsx"; // Main App component
import "./index.css"; // Global CSS

// Create the root and render the app
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* Redux Provider for global state management */}
    <Provider store={store}>
      {/* React Router for routing */}
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
