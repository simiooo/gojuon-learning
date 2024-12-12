import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import { Layout, Result, Row, Select, Space, Tabs } from "antd";
import OcrPage from "./page/OcrPage";
import KanaLearning from "./page/KanaLearning";
import Vocabulary from "./page/Vocabulary";
import Grammar from "./page/Grammar";
import Login from "./page/Login";
import { Route, Link, Routes, useNavigate, useLocation } from "react-router";

function App() {
  const [currentTab, setCurrentTab] = useState("/learning");
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token && location.pathname !== '/login') {
      navigate('/login');
    }
  }, [location.pathname]);

  useEffect(() => {
    location.pathname === '/' && navigate('/learning')
    console.log(location.pathname)
    location.pathname !== '/' && setCurrentTab(location.pathname)
  }, [])

  return (
    <Layout
      style={{
        padding: "1rem 2rem",
      }}
    >
      <Tabs
        onChange={(v) => {
          setCurrentTab(v);
          navigate(v);
        }}
        
        activeKey={currentTab}
        items={[
          {
            key: "/learning",
            label: "Learning",
          },
          {
            label: "Image To Text",
            key: "/ocr",
          },
          {
            label: "Vocabulary",
            key: "/vocabulary",
          },
          {
            label: "Grammar",
            key: "/grammar",
          },
        ]}
      ></Tabs>
      <Routes>
        <Route element={<KanaLearning />} path="/learning"></Route>
        <Route element={<OcrPage />} path="/ocr"></Route>
        <Route element={<Vocabulary />} path="/vocabulary"></Route>
        <Route element={<Grammar />} path="/grammar"></Route>
        <Route element={<Login />} path="/login"></Route>
        <Route path="*" element={<Result status={'404'} />}></Route>
      </Routes>
    </Layout>
  );
}

export default App;
