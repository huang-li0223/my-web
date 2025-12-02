import React, { useEffect, useMemo, useRef, useState } from "react";
import { GoogleGenAI } from "@google/genai";

/* ---------------------------------------
   天氣元件
---------------------------------------- */
function Weather() {
  const [weather, setWeather] = useState(null);
  const [city, setCity] = useState("臺北市");
  const [error, setError] = useState("");

  const API_KEY = "2b39195ce5290f028b555b28bc188d4d";

  const cities = [
    "臺北市", "新北市", "桃園市", "基隆市", "新竹市", "新竹縣", "苗栗縣",
    "臺中市", "彰化縣", "南投縣", "雲林縣", "嘉義市", "嘉義縣",
    "臺南市", "高雄市", "屏東縣", "宜蘭縣", "花蓮縣", "臺東縣",
    "澎湖縣", "金門縣", "連江縣"
  ];

  const cityMapping = {
    "臺北市": "Taipei",
    "新北市": "New Taipei",
    "桃園市": "Taoyuan",
    "基隆市": "Keelung",
    "新竹市": "Hsinchu",
    "新竹縣": "Hsinchu County",
    "苗栗縣": "Miaoli",
    "臺中市": "Taichung",
    "彰化縣": "Changhua",
    "南投縣": "Nantou",
    "雲林縣": "Yunlin",
    "嘉義市": "Chiayi",
    "嘉義縣": "Chiayi County",
    "臺南市": "Tainan",
    "高雄市": "Kaohsiung",
    "屏東縣": "Pingtung",
    "宜蘭縣": "Yilan",
    "花蓮縣": "Hualien",
    "臺東縣": "Taitung",
    "澎湖縣": "Penghu",
    "金門縣": "Kinmen",
    "連江縣": "Lienchiang"
  };

  useEffect(() => {
    const engCity = cityMapping[city];
    if (!engCity) {
      setError("無法識別城市名稱");
      return;
    }

    fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${engCity}&units=metric&lang=zh_tw&appid=${API_KEY}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.cod === 200) setWeather(data);
        else setError(data.message || "無法取得天氣");
      })
      .catch((err) => setError(err.message));
  }, [city]);

  return (
    <div style={styles.card}>
      <h3 style={{ color: "#fff" }}>🌤 天氣查詢</h3>

      <select
        value={city}
        onChange={(e) => setCity(e.target.value)}
        style={{ marginTop: 8, padding: "6px 10px", borderRadius: 8 }}
      >
        {cities.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      {error && <p style={{ color: "#f87171" }}>⚠ {error}</p>}
      {!weather && !error && <p style={{ color: "#fff" }}>載入中...</p>}

      {weather && (
        <>
          <p style={{ color: "#fff" }}>城市：{weather.name}</p>
          <p style={{ color: "#fff" }}>氣溫：{weather.main.temp}°C</p>
          <p style={{ color: "#fff" }}>天氣：{weather.weather[0].description}</p>
        </>
      )}
    </div>
  );
}

/* ---------------------------------------
   電影靈魂測驗室
---------------------------------------- */
function MovieSoulLab() {
  const FIXED_KEY = "AIzaSyBR8DoAiKh8DduFVXvJONHUsnxwv1GfAFg";
  const [model] = useState("gemini-2.5-flash");
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("chat");
  const [error, setError] = useState("");

  const listRef = useRef(null);
  const ai = useMemo(() => new GoogleGenAI({ apiKey: FIXED_KEY }), []);

  useEffect(() => {
    setHistory([
      {
        role: "model",
        parts: [{ text: "🍿 歡迎光臨「電影靈魂測驗室」！開始提問吧 🎥" }]
      }
    ]);
  }, []);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [history, loading]);

  async function sendMessage(message) {
    const content = (message ?? input).trim();
    if (!content || loading) return;

    setLoading(true);
    setError("");
    const newHistory = [...history, { role: "user", parts: [{ text: content }] }];
    setHistory(newHistory);
    setInput("");

    try {
      const resp = await ai.models.generateContent({
        model,
        contents: [
          {
            role: "user",
            parts: [{
              text:
                mode === "quiz"
                  ? "你是一位電影靈魂導師，請引導我回答問題，最後推薦3部電影。"
                  : "你是一位電影與影集推薦專家，請根據需求推薦作品。"
            }]
          },
          ...newHistory
        ]
      });

      const reply =
        resp?.candidates?.[0]?.content?.parts?.[0]?.text ||
        resp?.text ||
        "[沒有回覆]";

      setHistory((h) => [...h, { role: "model", parts: [{ text: reply }] }]);
    } catch (err) {
      setError(err?.message || "發生錯誤");
    } finally {
      setLoading(false);
    }
  }

  function renderMarkdownLike(text) {
    return text.split("\n").map((line, i) => (
      <div key={i} style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
        {line}
      </div>
    ));
  }

  const quickPrompts = [
    "幫我推薦最近好看的 Netflix 影集",
    "我想看溫馨療癒的電影",
    "找像《權力遊戲》的懸疑片",
    "推薦經典愛情電影",
    "2024 新上映科幻片？"
  ];

  return (
    <div style={styles.card}>
      <div style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
        <h3 style={{ color: "#fff" }}>🎬 電影靈魂測驗室</h3>

        <button
          onClick={() => {
            const next = mode === "quiz" ? "chat" : "quiz";
            setMode(next);
            if (next === "quiz") sendMessage("開始電影靈魂測驗");
          }}
          style={styles.modeBtn}
        >
          {mode === "quiz" ? "💬 聊天模式" : "🧭 開始測驗"}
        </button>
      </div>

      <div ref={listRef} style={styles.messages}>
        {history.map((m, i) => (
          <div
            key={i}
            style={{
              ...styles.msg,
              ...(m.role === "user" ? styles.userMsg : styles.botMsg)
            }}
          >
            <div style={styles.msgRole}>
              {m.role === "user" ? "你 🎭" : "🎥 Gemini"}
            </div>
            <div style={styles.msgBody}>
              {renderMarkdownLike(m.parts.map((p) => p.text).join("\n"))}
            </div>
          </div>
        ))}

        {loading && <div style={{ ...styles.msg, ...styles.botMsg }}>🎞 思考中...</div>}
      </div>

      {error && <div style={styles.error}>⚠ {error}</div>}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        style={styles.composer}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="輸入訊息..."
          style={styles.textInput}
        />
        <button type="submit" style={styles.sendBtn} disabled={!input.trim()}>
          發送 🚀
        </button>
      </form>

      <div style={styles.quickContainer}>
        {quickPrompts.map((q, idx) => (
          <button key={idx} onClick={() => sendMessage(q)} style={styles.quickBtn}>
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------
   音樂搜尋元件（美化版 iTunes API）
---------------------------------------- */
function MusicSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function searchMusic() {
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    setResults([]);

    try {
      const res = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=10`
      );
      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      setError("搜尋失敗，請稍後再試");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.card}>
      <h3 style={{ color: "#fff" }}>🎧 音樂搜尋（iTunes API）</h3>

      <div style={{ display: "flex", width: "100%", marginTop: 8 }}>
        <input
          style={{
            flex: 1,
            padding: "8px 12px",
            borderRadius: 999,
            border: "1px solid #475569",
            background: "#0f172a",
            color: "#fff",
          }}
          placeholder="輸入歌手或歌曲名稱..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          onClick={searchMusic}
          style={{
            marginLeft: 8,
            background: "#8b5cf6",
            color: "#fff",
            border: "none",
            borderRadius: 999,
            padding: "8px 16px",
            cursor: "pointer",
          }}
        >
          搜尋 🎵
        </button>
      </div>

      {loading && <p style={{ color: "#fff", marginTop: 10 }}>搜尋中...</p>}
      {error && <p style={{ color: "#f87171", marginTop: 10 }}>⚠ {error}</p>}

      <div
        style={{
          width: "100%",
          marginTop: 12,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {results.map((item) => (
          <div
            key={item.trackId}
            style={{
              display: "flex",
              alignItems: "center",
              padding: 10,
              background: "#1e293b",
              borderRadius: 12,
              color: "#fff",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#262640"}
            onMouseLeave={(e) => e.currentTarget.style.background = "#1e293b"}
          >
            <img
              src={item.artworkUrl100}
              alt="album"
              style={{
                width: 60,
                height: 60,
                borderRadius: 8,
                marginRight: 12,
              }}
            />
            <div style={{ textAlign: "left", flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: "bold" }}>
                {item.trackName}
              </div>
              <div style={{ fontSize: 14, opacity: 0.8 }}>
                {item.artistName}
              </div>
              {item.previewUrl && (
                <audio controls src={item.previewUrl} style={{ height: 30, marginTop: 4 }} />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------
   App 主體
---------------------------------------- */
export default function App() {
  return (
    <div style={styles.wrap}>
      <Weather />
      <MovieSoulLab />
      <MusicSearch />
    </div>
  );
}

/* ---------------------------------------
   置中後樣式 Styles
---------------------------------------- */
const styles = {
  wrap: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#111827",
    minHeight: "100vh",
    width: "100vw",
    fontFamily: "Inter, sans-serif",
    flexDirection: "column",
    gap: 20,
    padding: 20
  },

  card: {
    width: "90%",
    maxWidth: 900,
    background: "rgba(20,20,40,0.85)",
    border: "1px solid #334155",
    borderRadius: 20,
    display: "flex",
    flexDirection: "column",
    padding: 16,
    alignItems: "center",
    textAlign: "center",
    overflow: "hidden",
    backdropFilter: "blur(10px)",
    boxShadow: "0 0 25px rgba(0,0,0,0.4)"
  },

  modeBtn: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 999,
    padding: "6px 12px",
    cursor: "pointer",
    fontSize: 14
  },

  messages: {
    width: "100%",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    overflowY: "auto",
    maxHeight: 300,
    marginTop: 10
  },

  msg: {
    borderRadius: 12,
    padding: 12,
    maxWidth: "70%",
    wordBreak: "break-word"
  },

  userMsg: {
    alignSelf: "flex-end",
    background: "#2563eb",
    color: "#fff"
  },

  botMsg: {
    alignSelf: "flex-start",
    background: "#1e293b",
    color: "#e2e8f0"
  },

  msgRole: {
    fontSize: 12,
    opacity: 0.8,
    marginBottom: 4
  },

  msgBody: {
    fontSize: 15,
    lineHeight: 1.5
  },

  composer: {
    display: "flex",
    padding: 8,
    marginTop: 8,
    borderTop: "1px solid #334155",
    width: "100%"
  },

  textInput: {
    flex: 1,
    borderRadius: 999,
    border: "1px solid #475569",
    padding: "8px 12px",
    background: "#0f172a",
    color: "#fff",
    fontSize: 14
  },

  sendBtn: {
    marginLeft: 8,
    background: "#16a34a",
    color: "#fff",
    border: "none",
    borderRadius: 999,
    padding: "8px 12px",
    fontSize: 14,
    cursor: "pointer"
  },

  error: {
    color: "#f87171",
    padding: "4px 0",
    fontSize: 13
  },

  quickContainer: {
    width: "100%",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginTop: 8
  },

  quickBtn: {
    padding: "6px 12px",
    borderRadius: 999,
    border: "1px solid #475569",
    background: "rgba(59,130,246,0.1)",
    color: "#93c5fd",
    fontSize: 13,
    cursor: "pointer"
  }
};
