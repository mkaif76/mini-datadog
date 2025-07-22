import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import "./index.css";
import Logs from "./Pages/Logs";
import Metrics from "./Pages/Metrics";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* The App component now acts as a layout that wraps our pages.
          It will render the sidebar and header.
        */}
        <Route path="/" element={<App />}>

          {/* This is the default page that will be shown inside the App layout 
            when the user visits the root URL (e.g., http://localhost:5173/)
            The 'index' prop makes it the default.
          */}
          <Route index element={<Logs />} />
          
          {/* This is the route for our metrics page. It will be shown
            when the user visits http://localhost:5173/metrics
          */}
          <Route path="metrics" element={<Metrics />} />

        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)