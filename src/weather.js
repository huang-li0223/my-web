import React, { useState } from "react";

export default function WeatherWidget() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);

  const getWeather = async () => {
    if (!city) return;
    setLoading(true);
    setWeather(null);

    try {
      // 查詢經緯度
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`
      );
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        setWeather({ error: "找不到這個城市" });
        setLoading(false);
        return;
      }

      const { latitude, longitude, name, country } = geoData.results[0];

      // 查當前天氣
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
      );
      const weatherData = await weatherRes.json();

      setWeather({
        ...weatherData.current_weather,
        city: name,
        country,
      });
    } catch (err) {
      setWeather({ error: "取得天氣失敗" });
    } finally {
      setLoading(false);
    }
  };

  // 根據天氣碼設定背景顏色
  const getBackground = () => {
    if (!weather) return "#0f172a";
    if (weather.error) return "#374151";
    const code = weather.weathercode;
    if ([0, 1].includes(code)) return "#38bdf8"; // 晴天
    if ([2, 3, 45, 48].includes(code)) return "#60a5fa"; // 多雲
    if ([51, 53, 55, 61, 63, 65].includes(code)) return "#3b82f6"; // 小雨
    if ([71, 73, 75, 85, 86].includes(code)) return "#e0f2fe"; // 小雪
    if ([95, 96, 99].includes(code)) return "#f97316"; // 雷雨
    return "#0f172a"; // 預設
  };

  return (
    <div
      style={{
        maxWidth: 350,
        margin: "20px auto",
        padding: 20,
        borderRadius: 20,
        color: "#fff",
        background: getBackground(),
        boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2 style={{ marginBottom: 10 }}>🌤 天氣查詢</h2>
      <div style={{ display: "flex", marginBottom: 10 }}>
        <input
          type="text"
          placeholder="輸入城市，例如 Taipei"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          style={{
            flex: 1,
            padding: 8,
            borderRadius: 8,
            border: "none",
            marginRight: 6,
          }}
        />
        <button
          onClick={getWeather}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "none",
            background: "#16a34a",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          查詢
        </button>
      </div>

      {loading && <p>查詢中...</p>}

      {weather && weather.error && (
        <p style={{ color: "#f87171" }}>{weather.error}</p>
      )}

      {weather && !weather.error && (
        <div style={{ marginTop: 10 }}>
          <h3>
            {weather.city}, {weather.country}
          </h3>
          <p>🌡 溫度：{weather.temperature}°C</p>
          <p>💨 風速：{weather.windspeed} km/h</p>
          <p>🌀 天氣碼：{weather.weathercode}</p>
        </div>
      )}
    </div>
  );
}
