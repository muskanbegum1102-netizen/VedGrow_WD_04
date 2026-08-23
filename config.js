/**
 * Weather Dashboard Configuration
 */
const CONFIG = {
    // Public demo API keys for initial testing (Users can also add their own in Settings ⚙️)
    DEMO_API_KEYS: [
        'bd5e378503939ddaee76f12ad7a97608',
        '895284fb2d2c50a520d3e2dbee62829a',
        '6d055417ee6460f47c36e14d4b2dd604',
        '06c921750b9a82d8f5d1294e1586276f'
    ],
    DEFAULT_API_KEY: 'bd5e378503939ddaee76f12ad7a97608',

    // OpenWeatherMap API Endpoints
    API_BASE: 'https://api.openweathermap.org',
    ENDPOINTS: {
        CURRENT: 'https://api.openweathermap.org/data/2.5/weather',
        FORECAST: 'https://api.openweathermap.org/data/2.5/forecast',
        GEOCODING: 'https://api.openweathermap.org/geo/1.0/direct',
        REVERSE_GEO: 'https://api.openweathermap.org/geo/1.0/reverse',
        AIR_POLLUTION: 'https://api.openweathermap.org/data/2.5/air_pollution'
    },

    // Weather Icon Base URL
    ICON_BASE_URL: 'https://openweathermap.org/img/wn',

    // LocalStorage Keys
    STORAGE_KEYS: {
        API_KEY: 'weather_dash_api_key',
        FAVORITES: 'weather_dash_favorites',
        UNIT: 'weather_dash_unit', // 'metric' (Celsius) or 'imperial' (Fahrenheit)
        LAST_CITY: 'weather_dash_last_city'
    },

    // App Defaults
    DEFAULT_CITY: 'London',
    DEBOUNCE_DELAY_MS: 350
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
