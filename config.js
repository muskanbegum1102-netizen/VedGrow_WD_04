/**
 * Weather Dashboard Configuration
 */
const CONFIG = {
    // Public demo API keys for initial testing (Users can also add their own in Settings ⚙️)
    DEMO_API_KEYS: [
        '06c921750b9a82d8f5d1294e1586276f',
        '4d8fb5b93d4af21d66a2948710284366'
    ],
    DEFAULT_API_KEY: '06c921750b9a82d8f5d1294e1586276f',

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
