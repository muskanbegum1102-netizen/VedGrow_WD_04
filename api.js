/**
 * API Service - Handles OpenWeatherMap REST API calls
 */
const WeatherAPI = {
    /**
     * Search Cities for Autocomplete using Direct Geocoding API
     * @param {string} query 
     * @param {number} limit 
     * @returns {Promise<Array>} List of matching locations
     */
    async searchCities(query, limit = 5) {
        if (!query || query.trim().length < 2) return [];
        
        const apiKey = StorageManager.getApiKey();
        const url = `${CONFIG.ENDPOINTS.GEOCODING}?q=${encodeURIComponent(query.trim())}&limit=${limit}&appid=${apiKey}`;
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Invalid API Key. Please check your API key settings.');
                }
                throw new Error(`Geocoding failed (${response.status})`);
            }
            const data = await response.json();
            return data.map(item => ({
                name: item.name,
                state: item.state || '',
                country: item.country || '',
                lat: item.lat,
                lon: item.lon,
                displayName: `${item.name}${item.state ? ', ' + item.state : ''}, ${item.country}`
            }));
        } catch (error) {
            console.error('Error fetching city suggestions:', error);
            return [];
        }
    },

    /**
     * Reverse Geocoding - Get city name from coordinates
     * @param {number} lat 
     * @param {number} lon 
     */
    async getReverseGeocode(lat, lon) {
        const apiKey = StorageManager.getApiKey();
        const url = `${CONFIG.ENDPOINTS.REVERSE_GEO}?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`;
        
        try {
            const response = await fetch(url);
            if (!response.ok) return null;
            const data = await response.json();
            if (data && data.length > 0) {
                return {
                    name: data[0].name,
                    country: data[0].country,
                    state: data[0].state || ''
                };
            }
            return null;
        } catch (e) {
            console.error('Reverse geocode error:', e);
            return null;
        }
    },

    /**
     * Execute fetch with key fallback support
     */
    async fetchWithFallback(urlBuilder) {
        const customKey = localStorage.getItem(CONFIG.STORAGE_KEYS.API_KEY);
        const keysToTry = customKey ? [customKey] : (CONFIG.DEMO_API_KEYS || [CONFIG.DEFAULT_API_KEY]);

        let lastResponse = null;

        for (let i = 0; i < keysToTry.length; i++) {
            const key = keysToTry[i];
            const url = urlBuilder(key);
            
            try {
                const response = await fetch(url);
                if (response.ok) {
                    return await response.json();
                }

                lastResponse = response;
                // If not 429 or 401, don't try other keys (e.g. 404 City not found)
                if (response.status !== 429 && response.status !== 401) {
                    break;
                }
            } catch (err) {
                console.warn(`Fetch attempt with key index ${i} failed:`, err);
            }
        }

        // If all attempts failed, throw detailed error
        if (lastResponse) {
            await this.handleApiError(lastResponse);
        } else {
            throw new Error('Network error. Please check your internet connection.');
        }
    },

    /**
     * Get Current Weather Data
     */
    async getCurrentWeather(location, unit = 'metric') {
        let queryParam = '';
        if (typeof location === 'string') {
            queryParam = `q=${encodeURIComponent(location)}`;
        } else if (location && typeof location.lat === 'number' && typeof location.lon === 'number') {
            queryParam = `lat=${location.lat}&lon=${location.lon}`;
        } else {
            throw new Error('Invalid location parameter');
        }

        return this.fetchWithFallback(key => 
            `${CONFIG.ENDPOINTS.CURRENT}?${queryParam}&units=${unit}&appid=${key}`
        );
    },

    /**
     * Get 5-Day / 3-Hour Forecast Data
     */
    async getForecast(location, unit = 'metric') {
        let queryParam = '';
        if (typeof location === 'string') {
            queryParam = `q=${encodeURIComponent(location)}`;
        } else if (location && typeof location.lat === 'number' && typeof location.lon === 'number') {
            queryParam = `lat=${location.lat}&lon=${location.lon}`;
        } else {
            throw new Error('Invalid location parameter');
        }

        return this.fetchWithFallback(key => 
            `${CONFIG.ENDPOINTS.FORECAST}?${queryParam}&units=${unit}&appid=${key}`
        );
    },

    /**
     * Standardized API Error Handler
     */
    async handleApiError(response) {
        let message = 'An unexpected error occurred.';
        try {
            const errorJson = await response.json();
            if (errorJson && errorJson.message) {
                message = errorJson.message;
            }
        } catch (e) {
            // Ignore parse error
        }

        if (response.status === 404) {
            throw new Error('City not found. Please check the spelling and try again.');
        } else if (response.status === 401) {
            throw new Error('Invalid API key. Click ⚙️ Settings in top right to paste your free OpenWeatherMap key.');
        } else if (response.status === 429) {
            throw new Error('OpenWeatherMap API rate limit exceeded (60 req/min limit). Click ⚙️ Settings to enter your own free API Key!');
        } else {
            throw new Error(`Weather service error (${response.status}): ${message}`);
        }
    }
};
