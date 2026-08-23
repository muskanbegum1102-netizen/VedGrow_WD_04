/**
 * UI Renderer - Manages DOM manipulation, theme styling, cards, and modal interactions
 */
const UI = {
    // DOM Elements Cache
    elements: {
        // Search & Input
        searchInput: document.getElementById('search-input'),
        searchBtn: document.getElementById('search-btn'),
        locationBtn: document.getElementById('location-btn'),
        suggestionsContainer: document.getElementById('suggestions-container'),
        
        // Unit Toggle
        unitToggleCelsius: document.getElementById('unit-celsius'),
        unitToggleFahrenheit: document.getElementById('unit-fahrenheit'),

        // Settings Modal
        settingsBtn: document.getElementById('settings-btn'),
        settingsModal: document.getElementById('settings-modal'),
        closeSettingsBtn: document.getElementById('close-settings-btn'),
        apiKeyInput: document.getElementById('api-key-input'),
        saveApiKeyBtn: document.getElementById('save-api-key-btn'),
        clearApiKeyBtn: document.getElementById('clear-api-key-btn'),
        apiKeyStatus: document.getElementById('api-key-status'),

        // Display Panels
        weatherContainer: document.getElementById('weather-container'),
        loadingState: document.getElementById('loading-state'),
        errorBanner: document.getElementById('error-banner'),
        errorMessage: document.getElementById('error-message'),

        // Current Weather Hero
        cityName: document.getElementById('city-name'),
        countryBadge: document.getElementById('country-badge'),
        dateTime: document.getElementById('date-time'),
        currentTemp: document.getElementById('current-temp'),
        tempUnitLabel: document.getElementById('temp-unit-label'),
        weatherCondition: document.getElementById('weather-condition'),
        weatherIcon: document.getElementById('weather-icon'),
        favoriteBtn: document.getElementById('favorite-btn'),
        favoriteIcon: document.getElementById('favorite-icon'),

        // Metrics Grid
        feelsLike: document.getElementById('feels-like'),
        humidity: document.getElementById('humidity'),
        humidityBar: document.getElementById('humidity-bar'),
        windSpeed: document.getElementById('wind-speed'),
        windDir: document.getElementById('wind-dir'),
        pressure: document.getElementById('pressure'),
        visibility: document.getElementById('visibility'),
        uvIndex: document.getElementById('uv-index'),
        uvQualityBadge: document.getElementById('uv-quality-badge'),

        // Forecast Grid
        forecastContainer: document.getElementById('forecast-container'),

        // Favorites Bar
        favoritesContainer: document.getElementById('favorites-container'),
        emptyFavoritesMsg: document.getElementById('empty-favorites-msg')
    },

    /**
     * Show Loading Spinner & Skeleton State
     */
    showLoading() {
        if (this.elements.loadingState) this.elements.loadingState.classList.remove('hidden');
        if (this.elements.weatherContainer) this.elements.weatherContainer.classList.add('opacity-50', 'pointer-events-none');
        this.hideError();
    },

    /**
     * Hide Loading State
     */
    hideLoading() {
        if (this.elements.loadingState) this.elements.loadingState.classList.add('hidden');
        if (this.elements.weatherContainer) this.elements.weatherContainer.classList.remove('opacity-50', 'pointer-events-none');
    },

    /**
     * Display Error Message Banner
     * @param {string} message 
     */
    showError(message) {
        if (this.elements.errorBanner && this.elements.errorMessage) {
            this.elements.errorMessage.textContent = message;
            this.elements.errorBanner.classList.remove('hidden');

            const errSettingsBtn = document.getElementById('error-settings-btn');
            if (errSettingsBtn) {
                if (message.toLowerCase().includes('api key') || message.toLowerCase().includes('rate limit')) {
                    errSettingsBtn.classList.remove('hidden');
                } else {
                    errSettingsBtn.classList.add('hidden');
                }
            }

            // Auto scroll error into view if needed
            this.elements.errorBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        this.hideLoading();
    },

    /**
     * Hide Error Banner
     */
    hideError() {
        if (this.elements.errorBanner) {
            this.elements.errorBanner.classList.add('hidden');
        }
    },

    /**
     * Render Complete Weather Data
     * @param {Object} data - Processed weather object from API
     */
    renderWeather(data) {
        if (!data || !data.current) return;

        const current = data.current;
        const forecast = data.forecast;
        const airPollution = data.airPollution;
        const unit = data.unit || 'metric';

        const isImperial = unit === 'imperial';
        const tempSymbol = isImperial ? '°F' : '°C';
        const speedSymbol = isImperial ? 'mph' : 'm/s';

        // 1. Current Hero Section
        this.elements.cityName.textContent = `${current.name}${current.sys.country ? ', ' + current.sys.country : ''}`;
        this.elements.countryBadge.textContent = current.sys.country || '';
        this.elements.dateTime.textContent = this.formatDate(new Date((current.dt + current.timezone) * 1000 - (new Date().getTimezoneOffset() * 60000)));

        this.elements.currentTemp.textContent = Math.round(current.main.temp);
        this.elements.tempUnitLabel.textContent = tempSymbol;
        
        const weatherObj = current.weather[0];
        this.elements.weatherCondition.textContent = this.capitalizeWords(weatherObj.description);
        
        // High resolution Weather Icon
        const iconCode = weatherObj.icon;
        this.elements.weatherIcon.src = `${CONFIG.ICON_BASE_URL}/${iconCode}@4x.png`;
        this.elements.weatherIcon.alt = weatherObj.description;

        // Dynamic Weather Background Theme
        this.applyWeatherTheme(weatherObj.id, iconCode);

        // Favorite Toggle Icon State
        this.updateFavoriteButtonState(current.name);

        // 2. Metrics Grid
        this.elements.feelsLike.textContent = `${Math.round(current.main.feels_like)}${tempSymbol}`;
        this.elements.humidity.textContent = `${current.main.humidity}%`;
        if (this.elements.humidityBar) {
            this.elements.humidityBar.style.width = `${current.main.humidity}%`;
        }

        this.elements.windSpeed.textContent = `${Math.round(current.wind.speed)} ${speedSymbol}`;
        this.elements.windDir.textContent = this.getCardinalDirection(current.wind.deg);

        this.elements.pressure.textContent = `${current.main.pressure} hPa`;
        
        // Visibility in km or miles
        const visibilityDist = isImperial 
            ? `${(current.visibility / 1609.34).toFixed(1)} mi` 
            : `${(current.visibility / 1000).toFixed(1)} km`;
        this.elements.visibility.textContent = visibilityDist;

        // Air Quality / UV Index representation
        if (airPollution && airPollution.list && airPollution.list.length > 0) {
            const aqi = airPollution.list[0].main.aqi; // 1 = Good, 2 = Fair, 3 = Moderate, 4 = Poor, 5 = Very Poor
            const aqiLabels = ['', 'Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];
            const aqiClasses = ['', 'aqi-good', 'aqi-fair', 'aqi-moderate', 'aqi-poor', 'aqi-very-poor'];

            this.elements.uvIndex.textContent = `AQI ${aqi}/5`;
            this.elements.uvQualityBadge.textContent = aqiLabels[aqi] || 'Moderate';
            this.elements.uvQualityBadge.className = `badge ${aqiClasses[aqi] || ''}`;
        } else {
            this.elements.uvIndex.textContent = 'N/A';
            this.elements.uvQualityBadge.textContent = 'Normal';
            this.elements.uvQualityBadge.className = 'badge';
        }

        // 3. 5-Day Forecast
        if (forecast && forecast.list) {
            this.renderForecast(forecast.list, tempSymbol);
        }

        this.hideLoading();
    },

    /**
     * Render 5-Day Forecast Cards
     * @param {Array} forecastList 3-hourly forecast items
     * @param {string} tempSymbol 
     */
    renderForecast(forecastList, tempSymbol) {
        if (!this.elements.forecastContainer) return;
        this.elements.forecastContainer.innerHTML = '';

        // Group 3-hour forecasts by day YYYY-MM-DD
        const dailyData = {};

        forecastList.forEach(item => {
            const dateStr = item.dt_txt.split(' ')[0];
            if (!dailyData[dateStr]) {
                dailyData[dateStr] = [];
            }
            dailyData[dateStr].push(item);
        });

        // Extract 5 days (skipping current day if already past, or taking next 5 consecutive days)
        const days = Object.keys(dailyData).slice(0, 5);

        days.forEach((dayKey, index) => {
            const items = dailyData[dayKey];
            
            // Calculate Min and Max temps for the day
            let minTemp = Infinity;
            let maxTemp = -Infinity;
            items.forEach(it => {
                if (it.main.temp_min < minTemp) minTemp = it.main.temp_min;
                if (it.main.temp_max > maxTemp) maxTemp = it.main.temp_max;
            });

            // Pick representative icon (closest to 12:00 PM or middle item)
            let noonItem = items.find(it => it.dt_txt.includes('12:00:00')) || items[Math.floor(items.length / 2)];
            
            const dateObj = new Date(dayKey);
            const dayName = index === 0 ? 'Today' : dateObj.toLocaleDateString('en-US', { weekday: 'short' });
            const formattedShortDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            const card = document.createElement('div');
            card.className = 'forecast-card glass-card';
            card.innerHTML = `
                <div class="forecast-day">${dayName}</div>
                <div class="forecast-date">${formattedShortDate}</div>
                <img class="forecast-icon" src="${CONFIG.ICON_BASE_URL}/${noonItem.weather[0].icon}@2x.png" alt="${noonItem.weather[0].description}">
                <div class="forecast-condition">${this.capitalizeWords(noonItem.weather[0].main)}</div>
                <div class="forecast-temps">
                    <span class="max-temp">${Math.round(maxTemp)}${tempSymbol}</span>
                    <span class="min-temp">${Math.round(minTemp)}${tempSymbol}</span>
                </div>
            `;

            this.elements.forecastContainer.appendChild(card);
        });
    },

    /**
     * Render Autocomplete Suggestions Dropdown
     * @param {Array} suggestions List of city objects
     * @param {Function} onSelect Callback when suggestion is clicked
     */
    renderSuggestions(suggestions, onSelect) {
        const container = this.elements.suggestionsContainer;
        if (!container) return;

        container.innerHTML = '';

        if (!suggestions || suggestions.length === 0) {
            container.classList.add('hidden');
            return;
        }

        suggestions.forEach(item => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            div.innerHTML = `
                <i class="ph ph-map-pin"></i>
                <div class="suggestion-text">
                    <span class="city">${item.name}</span>
                    <span class="region">${item.state ? item.state + ', ' : ''}${item.country}</span>
                </div>
            `;
            div.addEventListener('click', () => {
                container.classList.add('hidden');
                onSelect(item);
            });
            container.appendChild(div);
        });

        container.classList.remove('hidden');
    },

    /**
     * Hide Suggestions Dropdown
     */
    hideSuggestions() {
        if (this.elements.suggestionsContainer) {
            this.elements.suggestionsContainer.classList.add('hidden');
        }
    },

    /**
     * Render Favorite Cities List Chips
     * @param {Array} favorites 
     * @param {Function} onSelect 
     * @param {Function} onRemove 
     */
    renderFavorites(favorites, onSelect, onRemove) {
        const container = this.elements.favoritesContainer;
        const emptyMsg = this.elements.emptyFavoritesMsg;
        if (!container) return;

        container.innerHTML = '';

        if (!favorites || favorites.length === 0) {
            if (emptyMsg) emptyMsg.classList.remove('hidden');
            return;
        }

        if (emptyMsg) emptyMsg.classList.add('hidden');

        favorites.forEach(city => {
            const chip = document.createElement('div');
            chip.className = 'favorite-chip glass-card';
            chip.innerHTML = `
                <span class="favorite-name" title="Click to view weather">${city.name}${city.country ? ', ' + city.country : ''}</span>
                <button class="favorite-remove-btn" title="Remove from favorites" aria-label="Remove favorite">
                    <i class="ph ph-x"></i>
                </button>
            `;

            // Select favorite city click
            chip.querySelector('.favorite-name').addEventListener('click', () => {
                onSelect(city);
            });

            // Remove favorite click
            chip.querySelector('.favorite-remove-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                onRemove(city.name);
            });

            container.appendChild(chip);
        });
    },

    /**
     * Update Favorite Button State (Active/Inactive Star icon)
     * @param {string} cityName 
     */
    updateFavoriteButtonState(cityName) {
        if (!this.elements.favoriteBtn || !this.elements.favoriteIcon) return;
        const isFav = StorageManager.isFavorite(cityName);

        if (isFav) {
            this.elements.favoriteBtn.classList.add('active');
            this.elements.favoriteIcon.className = 'ph-fill ph-star';
            this.elements.favoriteBtn.title = 'Remove from favorites';
        } else {
            this.elements.favoriteBtn.classList.remove('active');
            this.elements.favoriteIcon.className = 'ph ph-star';
            this.elements.favoriteBtn.title = 'Add to favorites';
        }
    },

    /**
     * Update Active Unit Toggle Buttons Styling
     * @param {string} unit - 'metric' or 'imperial'
     */
    updateUnitToggle(unit) {
        if (unit === 'metric') {
            this.elements.unitToggleCelsius.classList.add('active');
            this.elements.unitToggleFahrenheit.classList.remove('active');
        } else {
            this.elements.unitToggleFahrenheit.classList.add('active');
            this.elements.unitToggleCelsius.classList.remove('active');
        }
    },

    /**
     * Apply Weather Atmospheric Theme Background to Body
     */
    applyWeatherTheme(conditionCode, iconCode) {
        const body = document.body;
        body.classList.remove(
            'theme-clear-day', 'theme-clear-night', 
            'theme-clouds', 'theme-rain', 
            'theme-snow', 'theme-thunderstorm', 'theme-atmosphere'
        );

        const isNight = iconCode.endsWith('n');

        if (conditionCode >= 200 && conditionCode < 300) {
            body.classList.add('theme-thunderstorm');
        } else if (conditionCode >= 300 && conditionCode < 600) {
            body.classList.add('theme-rain');
        } else if (conditionCode >= 600 && conditionCode < 700) {
            body.classList.add('theme-snow');
        } else if (conditionCode >= 700 && conditionCode < 800) {
            body.classList.add('theme-atmosphere');
        } else if (conditionCode === 800) {
            body.classList.add(isNight ? 'theme-clear-night' : 'theme-clear-day');
        } else if (conditionCode > 800) {
            body.classList.add('theme-clouds');
        }
    },

    /**
     * Helper: Format Date String
     */
    formatDate(date) {
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return date.toLocaleDateString('en-US', options);
    },

    /**
     * Helper: Wind Degree to Cardinal Direction
     */
    getCardinalDirection(angle) {
        if (typeof angle !== 'number') return 'N/A';
        const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
        return directions[Math.round(angle / 22.5) % 16];
    },

    /**
     * Helper: Capitalize String Words
     */
    capitalizeWords(str) {
        if (!str) return '';
        return str.replace(/\b\w/g, l => l.toUpperCase());
    }
};
