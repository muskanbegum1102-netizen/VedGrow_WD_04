/**
 * Storage Manager - LocalStorage persistence handler
 */
const StorageManager = {
    /**
     * Get API Key (Custom stored key or default fallback)
     */
    getApiKey() {
        const storedKey = localStorage.getItem(CONFIG.STORAGE_KEYS.API_KEY);
        return (storedKey && storedKey.trim() !== '') ? storedKey.trim() : CONFIG.DEFAULT_API_KEY;
    },

    /**
     * Save Custom API Key
     */
    setApiKey(apiKey) {
        if (apiKey && apiKey.trim() !== '') {
            localStorage.setItem(CONFIG.STORAGE_KEYS.API_KEY, apiKey.trim());
        } else {
            localStorage.removeItem(CONFIG.STORAGE_KEYS.API_KEY);
        }
    },

    /**
     * Clear saved API Key (reverts to default)
     */
    clearApiKey() {
        localStorage.removeItem(CONFIG.STORAGE_KEYS.API_KEY);
    },

    /**
     * Get Preferred Unit ('metric' or 'imperial')
     */
    getUnit() {
        return localStorage.getItem(CONFIG.STORAGE_KEYS.UNIT) || 'metric';
    },

    /**
     * Set Preferred Unit ('metric' or 'imperial')
     */
    setUnit(unit) {
        if (unit === 'metric' || unit === 'imperial') {
            localStorage.setItem(CONFIG.STORAGE_KEYS.UNIT, unit);
        }
    },

    /**
     * Get List of Favorite Cities
     * Returns Array of Objects: [{ name: 'London', country: 'GB', lat: 51.5, lon: -0.12 }, ...]
     */
    getFavorites() {
        try {
            const raw = localStorage.getItem(CONFIG.STORAGE_KEYS.FAVORITES);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            console.error('Error reading favorites from localStorage', e);
            return [];
        }
    },

    /**
     * Add a city to favorites
     * @param {Object} city - { name, country, lat, lon }
     */
    addFavorite(city) {
        if (!city || !city.name) return false;
        const favorites = this.getFavorites();
        
        // Check if already exists (case-insensitive name check or lat/lon match)
        const exists = favorites.some(f => 
            f.name.toLowerCase() === city.name.toLowerCase() && 
            (f.country === city.country || !city.country)
        );

        if (!exists) {
            const updated = [
                {
                    name: city.name,
                    country: city.country || '',
                    lat: city.lat,
                    lon: city.lon
                },
                ...favorites
            ];
            localStorage.setItem(CONFIG.STORAGE_KEYS.FAVORITES, JSON.stringify(updated));
            return true;
        }
        return false;
    },

    /**
     * Remove a city from favorites by name
     * @param {string} cityName 
     */
    removeFavorite(cityName) {
        if (!cityName) return;
        const favorites = this.getFavorites();
        const updated = favorites.filter(f => f.name.toLowerCase() !== cityName.toLowerCase());
        localStorage.setItem(CONFIG.STORAGE_KEYS.FAVORITES, JSON.stringify(updated));
    },

    /**
     * Check if a city is in favorites
     * @param {string} cityName 
     */
    isFavorite(cityName) {
        if (!cityName) return false;
        const favorites = this.getFavorites();
        return favorites.some(f => f.name.toLowerCase() === cityName.toLowerCase());
    },

    /**
     * Get Last Searched City Name
     */
    getLastCity() {
        return localStorage.getItem(CONFIG.STORAGE_KEYS.LAST_CITY) || CONFIG.DEFAULT_CITY;
    },

    /**
     * Save Last Searched City Name
     */
    setLastCity(cityName) {
        if (cityName && cityName.trim() !== '') {
            localStorage.setItem(CONFIG.STORAGE_KEYS.LAST_CITY, cityName.trim());
        }
    }
};
