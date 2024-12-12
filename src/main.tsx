import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { inject } from "@vercel/analytics";
import { ConfigProvider } from "antd";
import { primaryColor } from "./someVar.ts";
import { BrowserRouter } from "react-router";

inject();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: primaryColor,
            borderRadius: 8,
          },
        }}
      >
        {/* <div
      className='bg'
      >の</div> */}
        <App />
      </ConfigProvider>
    </BrowserRouter>
  </React.StrictMode>
);
