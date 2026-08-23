# Atmosphere - Responsive Weather Dashboard

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![OpenWeatherMap](https://img.shields.io/badge/OpenWeatherMap-REST_API-orange?style=for-the-badge)

**Atmosphere** is a modern, responsive, glassmorphism-inspired Weather Dashboard built with pure HTML, CSS, and Vanilla JavaScript using the OpenWeatherMap REST API.

---

## 🌟 Key Features

- **🔍 City Search with Autocomplete**: Real-time city suggestions using OpenWeatherMap Direct Geocoding API with input debouncing.
- **📍 Geolocation Support**: One-click weather retrieval for your current location using the HTML5 Geolocation API.
- **🌡️ Current Weather Metrics**: Temperature, condition description, high-resolution icons, feels-like temperature, humidity bar, wind speed & direction compass, atmospheric pressure, and visibility.
- **🍃 Air Quality & Index**: Integrated Air Quality Index (AQI) metric badge.
- **📅 5-Day Weather Forecast**: Daily forecast cards with min/max temperatures, icons, and daily summaries.
- **🔄 Celsius (°C) / Fahrenheit (°F) Toggle**: Seamless dynamic unit conversion across all metrics and forecast cards.
- **⭐ Favorite Cities Management**: Save, view, and delete favorite cities persisted in browser `localStorage`.
- **⚙️ Custom API Key Settings**: Built-in modal allowing users to easily configure or reset their personal OpenWeatherMap API key.
- **🎨 Dynamic Weather Themes**: Atmospheric background gradients and themes that dynamically adapt to current weather conditions (Clear, Clouds, Rain, Snow, Thunderstorm, Night).
- **📱 Fully Responsive**: Flawless layout across Desktop, Tablet, and Mobile screens.

---

## 📁 Project Architecture

```
weather dash/
├── index.html          # Semantic HTML5 layout & structure
├── css/
│   └── styles.css      # Glassmorphism styling, animations, responsive media queries
├── js/
│   ├── config.js       # App configuration constants & API endpoints
│   ├── storage.js      # LocalStorage helper for API keys, favorites & unit preferences
│   ├── api.js          # REST API fetching logic (Weather, Forecast, Geocoding, Air Quality)
│   ├── ui.js           # Rendering functions for cards, theme switching & notifications
│   └── app.js          # Main application controller & event listeners
└── README.md           # Project documentation
```

---

## 🚀 Quick Start Guide

### 1. Clone or Download the Repository
```bash
git clone https://github.com/your-username/weather-dashboard.git
cd weather-dashboard
```

### 2. Get your Free OpenWeatherMap API Key
1. Sign up for a free account at [OpenWeatherMap](https://openweathermap.org/api).
2. Go to your API Keys dashboard and copy your 32-character API Key.

### 3. Launch the Dashboard
You can launch the dashboard by opening `index.html` directly in any standard browser or running a simple HTTP server:

#### Using VS Code Live Server:
Right-click `index.html` and select **"Open with Live Server"**.

#### Using Python Simple HTTP Server:
```bash
python -m http.server 8000
```
Then open `http://localhost:8000` in your web browser.

### 4. Configure Your API Key
Click the **Gear (⚙️) Settings Icon** in the top right corner of the Atmosphere dashboard and paste your OpenWeatherMap API key. (The app also includes a default key for instant out-of-the-box demo testing).

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3 (Flexbox & CSS Grid, Modern Custom Variables, Glassmorphism design), Vanilla JavaScript (ES6+ Modules)
- **Icons**: [Phosphor Icons](https://phosphoricons.com) & OpenWeatherMap Condition Badges
- **Typography**: Google Fonts (*Outfit* & *Plus Jakarta Sans*)
- **APIs**:
  - OpenWeatherMap Current Weather API (`/data/2.5/weather`)
  - OpenWeatherMap 5-Day / 3-Hour Forecast API (`/data/2.5/forecast`)
  - OpenWeatherMap Direct & Reverse Geocoding API (`/geo/1.0/direct`)
  - OpenWeatherMap Air Pollution API (`/data/2.5/air_pollution`)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
