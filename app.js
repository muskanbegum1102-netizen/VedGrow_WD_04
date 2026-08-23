/**
 * Application Controller - Orchestrates events, API requests, state, and UI updates
 */
document.addEventListener('DOMContentLoaded', () => {
    // App State
    const AppState = {
        currentLocation: StorageManager.getLastCity(),
        currentUnit: StorageManager.getUnit(),
        currentWeatherData: null,
        searchDebounceTimer: null
    };

    /**
     * Initialize Application
     */
    async function init() {
        setupEventListeners();
        UI.updateUnitToggle(AppState.currentUnit);
        renderFavoritesList();
        checkApiKeyStatus();

        // Load initial weather for last city or default city
        await loadWeather(AppState.currentLocation);
    }

    /**
     * Fetch and display weather for a city or coordinates
     * @param {string|Object} location - City name or { lat, lon }
     */
    async function loadWeather(location) {
        UI.showLoading();
        try {
            const data = await WeatherAPI.fetchAllWeatherData(location, AppState.currentUnit);
            AppState.currentWeatherData = data;
            
            // Save last searched city name if available
            if (data.current && data.current.name) {
                AppState.currentLocation = data.current.name;
                StorageManager.setLastCity(data.current.name);
            }

            UI.renderWeather(data);
        } catch (error) {
            console.error('Weather load error:', error);
            UI.showError(error.message || 'Failed to load weather data. Please try again.');
        }
    }

    /**
     * Render Favorites Sidebar / Chips
     */
    function renderFavoritesList() {
        const favorites = StorageManager.getFavorites();
        UI.renderFavorites(
            favorites,
            // Select Favorite Callback
            async (favCity) => {
                const target = favCity.lat && favCity.lon 
                    ? { lat: favCity.lat, lon: favCity.lon } 
                    : favCity.name;
                await loadWeather(target);
            },
            // Remove Favorite Callback
            (cityName) => {
                StorageManager.removeFavorite(cityName);
                renderFavoritesList();
                if (AppState.currentWeatherData && AppState.currentWeatherData.current) {
                    UI.updateFavoriteButtonState(AppState.currentWeatherData.current.name);
                }
            }
        );
    }

    /**
     * Setup Event Listeners for UI interaction
     */
    function setupEventListeners() {
        const { elements } = UI;

        // 1. Search Input - Debounced Autocomplete
        if (elements.searchInput) {
            elements.searchInput.addEventListener('input', (e) => {
                const query = e.target.value.trim();
                clearTimeout(AppState.searchDebounceTimer);

                if (query.length < 2) {
                    UI.hideSuggestions();
                    return;
                }

                AppState.searchDebounceTimer = setTimeout(async () => {
                    const suggestions = await WeatherAPI.searchCities(query);
                    UI.renderSuggestions(suggestions, async (selectedItem) => {
                        elements.searchInput.value = selectedItem.displayName;
                        await loadWeather({ lat: selectedItem.lat, lon: selectedItem.lon });
                    });
                }, CONFIG.DEBOUNCE_DELAY_MS);
            });

            // Enter key press triggers search
            elements.searchInput.addEventListener('keydown', async (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    UI.hideSuggestions();
                    const query = elements.searchInput.value.trim();
                    if (query) {
                        await loadWeather(query);
                    }
                }
            });
        }

        // 2. Search Button Click
        if (elements.searchBtn) {
            elements.searchBtn.addEventListener('click', async () => {
                UI.hideSuggestions();
                const query = elements.searchInput.value.trim();
                if (query) {
                    await loadWeather(query);
                }
            });
        }

        // 3. Current Location Geolocation Button
        if (elements.locationBtn) {
            elements.locationBtn.addEventListener('click', () => {
                if (!navigator.geolocation) {
                    UI.showError('Geolocation is not supported by your browser.');
                    return;
                }

                UI.showLoading();
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const coords = {
                            lat: position.coords.latitude,
                            lon: position.coords.longitude
                        };
                        await loadWeather(coords);
                    },
                    (geoError) => {
                        console.error('Geolocation error:', geoError);
                        let msg = 'Unable to retrieve your location.';
                        if (geoError.code === geoError.PERMISSION_DENIED) {
                            msg = 'Location access denied. Please search for your city manually.';
                        }
                        UI.showError(msg);
                    },
                    { timeout: 10000 }
                );
            });
        }

        // 4. Unit Toggle Buttons (°C / °F)
        if (elements.unitToggleCelsius) {
            elements.unitToggleCelsius.addEventListener('click', async () => {
                if (AppState.currentUnit !== 'metric') {
                    AppState.currentUnit = 'metric';
                    StorageManager.setUnit('metric');
                    UI.updateUnitToggle('metric');
                    if (AppState.currentLocation) {
                        await loadWeather(AppState.currentLocation);
                    }
                }
            });
        }

        if (elements.unitToggleFahrenheit) {
            elements.unitToggleFahrenheit.addEventListener('click', async () => {
                if (AppState.currentUnit !== 'imperial') {
                    AppState.currentUnit = 'imperial';
                    StorageManager.setUnit('imperial');
                    UI.updateUnitToggle('imperial');
                    if (AppState.currentLocation) {
                        await loadWeather(AppState.currentLocation);
                    }
                }
            });
        }

        // 5. Favorite Star Toggle Button Click
        if (elements.favoriteBtn) {
            elements.favoriteBtn.addEventListener('click', () => {
                if (!AppState.currentWeatherData || !AppState.currentWeatherData.current) return;
                
                const current = AppState.currentWeatherData.current;
                const cityName = current.name;
                const isFav = StorageManager.isFavorite(cityName);

                if (isFav) {
                    StorageManager.removeFavorite(cityName);
                } else {
                    StorageManager.addFavorite({
                        name: current.name,
                        country: current.sys.country,
                        lat: current.coord.lat,
                        lon: current.coord.lon
                    });
                }

                UI.updateFavoriteButtonState(cityName);
                renderFavoritesList();
            });
        }

        // 6. Settings Modal Events
        const openSettingsModal = () => {
            elements.apiKeyInput.value = localStorage.getItem(CONFIG.STORAGE_KEYS.API_KEY) || '';
            elements.settingsModal.classList.remove('hidden');
        };

        if (elements.settingsBtn && elements.settingsModal) {
            elements.settingsBtn.addEventListener('click', openSettingsModal);
        }

        const errSettingsBtn = document.getElementById('error-settings-btn');
        if (errSettingsBtn && elements.settingsModal) {
            errSettingsBtn.addEventListener('click', openSettingsModal);
        }

        if (elements.closeSettingsBtn && elements.settingsModal) {
            elements.closeSettingsBtn.addEventListener('click', () => {
                elements.settingsModal.classList.add('hidden');
            });
        }

        if (elements.saveApiKeyBtn) {
            elements.saveApiKeyBtn.addEventListener('click', async () => {
                const newKey = elements.apiKeyInput.value.trim();
                if (newKey) {
                    StorageManager.setApiKey(newKey);
                    elements.settingsModal.classList.add('hidden');
                    checkApiKeyStatus();
                    await loadWeather(AppState.currentLocation);
                } else {
                    StorageManager.clearApiKey();
                    elements.settingsModal.classList.add('hidden');
                    checkApiKeyStatus();
                }
            });
        }

        if (elements.clearApiKeyBtn) {
            elements.clearApiKeyBtn.addEventListener('click', async () => {
                StorageManager.clearApiKey();
                elements.apiKeyInput.value = '';
                elements.settingsModal.classList.add('hidden');
                checkApiKeyStatus();
                await loadWeather(AppState.currentLocation);
            });
        }

        // Close modal when clicking background backdrop
        if (elements.settingsModal) {
            elements.settingsModal.addEventListener('click', (e) => {
                if (e.target === elements.settingsModal) {
                    elements.settingsModal.classList.add('hidden');
                }
            });
        }

        // Close suggestions dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (elements.suggestionsContainer && 
                !elements.suggestionsContainer.contains(e.target) && 
                !elements.searchInput.contains(e.target)) {
                UI.hideSuggestions();
            }
        });
    }

    /**
     * Check and display API Key Status indicator in settings
     */
    function checkApiKeyStatus() {
        const storedKey = localStorage.getItem(CONFIG.STORAGE_KEYS.API_KEY);
        const { apiKeyStatus } = UI.elements;
        if (!apiKeyStatus) return;

        if (storedKey) {
            apiKeyStatus.textContent = 'Using Custom API Key';
            apiKeyStatus.className = 'status-badge custom';
        } else {
            apiKeyStatus.textContent = 'Using Default API Key';
            apiKeyStatus.className = 'status-badge default';
        }
    }

    // Start App
    init();
});
