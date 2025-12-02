import React from "react";
import Weather from "./weather"; // 注意小寫檔名
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>🌤 我的個人網站</h1>
        <p>這裡放一些網站介紹文字</p>

        {/* 天氣小工具 */}
        <Weather />
      </header>
    </div>
  );
}

export default App;
