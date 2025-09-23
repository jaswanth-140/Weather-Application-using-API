// Weather Application JavaScript
console.log('Weather application initializing...');

// Constants
const COUNTRIES = [
    {"code": "US", "name": "United States"},
    {"code": "GB", "name": "United Kingdom"},
    {"code": "IN", "name": "India"},
    {"code": "CA", "name": "Canada"},
    {"code": "AU", "name": "Australia"},
    {"code": "DE", "name": "Germany"},
    {"code": "FR", "name": "France"},
    {"code": "JP", "name": "Japan"},
    {"code": "IT", "name": "Italy"},
    {"code": "ES", "name": "Spain"},
    {"code": "BR", "name": "Brazil"},
    {"code": "CN", "name": "China"},
    {"code": "RU", "name": "Russia"},
    {"code": "MX", "name": "Mexico"},
    {"code": "AR", "name": "Argentina"},
    {"code": "ZA", "name": "South Africa"},
    {"code": "EG", "name": "Egypt"},
    {"code": "TR", "name": "Turkey"},
    {"code": "TH", "name": "Thailand"},
    {"code": "SG", "name": "Singapore"}
];

const WEATHER_CODES = {
    "0": {"description": "Clear sky", "emoji": "☀️"},
    "1": {"description": "Mainly clear", "emoji": "🌤️"},
    "2": {"description": "Partly cloudy", "emoji": "⛅"},
    "3": {"description": "Overcast", "emoji": "☁️"},
    "45": {"description": "Fog", "emoji": "🌫️"},
    "48": {"description": "Depositing rime fog", "emoji": "🌫️"},
    "51": {"description": "Light drizzle", "emoji": "🌦️"},
    "53": {"description": "Moderate drizzle", "emoji": "🌦️"},
    "55": {"description": "Dense drizzle", "emoji": "🌧️"},
    "61": {"description": "Slight rain", "emoji": "🌧️"},
    "63": {"description": "Moderate rain", "emoji": "🌧️"},
    "65": {"description": "Heavy rain", "emoji": "🌧️"},
    "71": {"description": "Slight snow", "emoji": "🌨️"},
    "73": {"description": "Moderate snow", "emoji": "❄️"},
    "75": {"description": "Heavy snow", "emoji": "❄️"},
    "95": {"description": "Thunderstorm", "emoji": "⛈️"},
    "96": {"description": "Thunderstorm with hail", "emoji": "⛈️"},
    "99": {"description": "Thunderstorm with heavy hail", "emoji": "⛈️"}
};

const SAMPLE_CITIES = {
    "US": ["New York", "Los Angeles", "Chicago", "Houston", "Miami"],
    "GB": ["London", "Manchester", "Birmingham", "Liverpool", "Edinburgh"],
    "IN": ["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata"],
    "CA": ["Toronto", "Vancouver", "Montreal", "Calgary", "Ottawa"],
    "AU": ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide"]
};

// Global variables
let charts = {};
let isLoading = false;

// DOM elements
let countrySelect, cityInput, searchBtn, loadingState, errorState, weatherDisplay, chartsSection, retryBtn;

// Initialize application
function initApp() {
    console.log('Initializing weather application...');
    
    // Get DOM elements with error checking
    countrySelect = document.getElementById('countrySelect');
    cityInput = document.getElementById('cityInput');
    searchBtn = document.getElementById('searchBtn');
    loadingState = document.getElementById('loadingState');
    errorState = document.getElementById('errorState');
    weatherDisplay = document.getElementById('weatherDisplay');
    chartsSection = document.getElementById('chartsSection');
    retryBtn = document.getElementById('retryBtn');
    
    // Verify required elements
    if (!countrySelect || !cityInput || !searchBtn) {
        console.error('Required DOM elements not found');
        console.log('countrySelect:', countrySelect);
        console.log('cityInput:', cityInput);
        console.log('searchBtn:', searchBtn);
        return;
    }
    console.log('All required DOM elements found');
    
    // Initialize countries
    populateCountries();
    
    // Set up event listeners with error handling
    try {
        setupEventListeners();
        console.log('Event listeners set up successfully');
    } catch (error) {
        console.error('Error setting up event listeners:', error);
    }
    
    console.log('Weather application initialized successfully');
}

// Populate country dropdown
function populateCountries() {
    console.log('Populating countries dropdown');
    
    try {
        // Clear existing options except first
        countrySelect.innerHTML = '<option value="">Choose your country...</option>';
        
        // Add countries
        COUNTRIES.forEach((country, index) => {
            const option = document.createElement('option');
            option.value = country.code;
            option.textContent = country.name;
            countrySelect.appendChild(option);
            
            if (index < 3) {
                console.log(`Added country: ${country.name} (${country.code})`);
            }
        });
        
        console.log(`Successfully added ${COUNTRIES.length} countries to dropdown`);
    } catch (error) {
        console.error('Error populating countries:', error);
    }
}

// Set up event listeners
function setupEventListeners() {
    console.log('Setting up event listeners');
    
    // Country selection change - using both 'change' and 'input' events for better compatibility
    countrySelect.addEventListener('change', function(e) {
        console.log('Country change event triggered, value:', e.target.value);
        onCountryChange(e.target.value);
    });
    
    countrySelect.addEventListener('input', function(e) {
        console.log('Country input event triggered, value:', e.target.value);
        onCountryChange(e.target.value);
    });
    
    // City input events
    cityInput.addEventListener('input', function(e) {
        console.log('City input changed:', e.target.value);
        onCityInput();
    });
    
    cityInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter' && !searchBtn.disabled) {
            console.log('Enter key pressed in city input');
            searchWeather();
        }
    });
    
    // Search button
    searchBtn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('Search button clicked');
        searchWeather();
    });
    // Retry button
    if (retryBtn) {
        retryBtn.addEventListener('click', function() {
            console.log('Retry button clicked');
            hideError();
            // Re-enable search if we have valid inputs
            if (countrySelect.value && cityInput.value.trim()) {
                searchBtn.disabled = false;
            }
        });
    }
    
    console.log('All event listeners attached successfully');
}

// Handle country selection change
function onCountryChange(selectedCountry) {
    console.log('Processing country change:', selectedCountry);
    
    try {
        if (selectedCountry && selectedCountry !== '') {
            console.log('Enabling city input for country:', selectedCountry);
            
            // Enable city input
            cityInput.disabled = false;
            cityInput.value = '';
            searchBtn.disabled = true;
            
            // Update placeholder with country-specific text
            const countryName = getCountryName(selectedCountry);
            let placeholder = `Enter city name in ${countryName}...`;
            
            // Show sample cities if available
            if (SAMPLE_CITIES[selectedCountry]) {
                const samples = SAMPLE_CITIES[selectedCountry].slice(0, 3).join(', ');
                placeholder = `Enter city (e.g., ${samples})...`;
            }
            
            cityInput.placeholder = placeholder;
            
            // Focus on city input after a short delay
            setTimeout(() => {
                cityInput.focus();
            }, 100);
            
            // Hide previous results
            hideAllStates();
            
            console.log('City input enabled and configured for', countryName);
        } else {
            console.log('No country selected, disabling city input');
            
            // Disable city input and search
            cityInput.disabled = true;
            cityInput.placeholder = 'Select a country first';
            cityInput.value = '';
            searchBtn.disabled = true;
            hideAllStates();
        }
    } catch (error) {
        console.error('Error in onCountryChange:', error);
    }
}

// Handle city input
function onCityInput() {
    try {
        const cityValue = cityInput.value.trim();
        const countryValue = countrySelect.value;
        
        console.log('City input validation:', { city: cityValue, country: countryValue });
        
        // Enable search button only if both country and city are selected
        const shouldEnable = !!(countryValue && cityValue.length >= 2);
        searchBtn.disabled = !shouldEnable;
        
        console.log('Search button enabled:', shouldEnable);
        
        // Hide error when user starts typing
        if (cityValue) {
            hideError();
        }
    } catch (error) {
        console.error('Error in onCityInput:', error);
    }
}

// Get country name by code
function getCountryName(code) {
    const country = COUNTRIES.find(c => c.code === code);
    return country ? country.name : code;
}

// Main search function
async function searchWeather() {
    if (isLoading) {
        console.log('Already loading, ignoring search request');
        return;
    }
    
    const country = countrySelect.value;
    const city = cityInput.value.trim();
    
    console.log('Starting weather search for:', { city, country });
    
    if (!country || !city) {
        showError('Please select a country and enter a city name');
        return;
    }
    try {
        showLoading();
        
        // Geocode the location
        console.log('Geocoding location...');
        const location = await geocodeLocation(city, country);
        console.log('Location found:', location);
        
        // Fetch weather data
        console.log('Fetching weather data...');
        const [currentWeather, hourlyForecast] = await Promise.all([
            fetchCurrentWeather(location.lat, location.lon),
            fetchHourlyForecast(location.lat, location.lon)
        ]);
        
        console.log('Weather data fetched successfully');
        
        // Display results
        displayCurrentWeather(currentWeather, location);
        createCharts(hourlyForecast);
        
        // Show results
        showResults();
        
        console.log('Weather data displayed successfully');
        
    } catch (error) {
        console.error('Search error:', error);
        showError(error.message);
    } finally {
        hideLoading();
    }
}

// Geocode location using city and country
async function geocodeLocation(city, countryCode) {
    const query = `${encodeURIComponent(city)}&country=${countryCode}`;
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=5&language=en&format=json`;
    
    console.log('Geocoding request:', url);
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to connect to location service');
        }
        
        const data = await response.json();
        console.log('Geocoding response:', data);
        
        if (!data.results || data.results.length === 0) {
            throw new Error(`City "${city}" not found in ${getCountryName(countryCode)}. Please check the spelling and try again.`);
        }
        
        // Find result matching the country code, or use the first result
        let result = data.results.find(r => r.country_code === countryCode);
        if (!result) {
            result = data.results[0];
            console.log('No exact country match, using first result:', result);
        }
        
        return {
            lat: result.latitude,
            lon: result.longitude,
            name: result.name,
            country: result.country,
            countryCode: result.country_code
        };
        
    } catch (error) {
        console.error('Geocoding error:', error);
        if (error.message.includes('not found')) {
            throw error;
        }
        throw new Error('Unable to find location. Please check your internet connection and try again.');
    }
}
// Fetch current weather
async function fetchCurrentWeather(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,pressure_msl,wind_speed_10m,weather_code&timezone=auto`;
    
    console.log('Fetching current weather from:', url);
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch weather data');
        }
        
        const data = await response.json();
        if (!data.current) {
            throw new Error('Invalid weather data received');
        }
        
        console.log('Current weather data received:', data.current);
        return data.current;
        
    } catch (error) {
        console.error('Weather fetch error:', error);
        throw new Error('Unable to get current weather data. Please try again later.');
    }
}

// Fetch hourly forecast
async function fetchHourlyForecast(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation&timezone=auto&forecast_days=1`;
    
    console.log('Fetching hourly forecast from:', url);
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch forecast data');
        }
        
        const data = await response.json();
        if (!data.hourly) {
            throw new Error('Invalid forecast data received');
        }
        
        console.log('Hourly forecast data received');
        return data.hourly;
        
    } catch (error) {
        console.error('Forecast fetch error:', error);
        throw new Error('Unable to get weather forecast. Please try again later.');
    }
}
// Display current weather
function displayCurrentWeather(weather, location) {
    console.log('Displaying current weather for:', location.name);
    
    try {
        // Get weather description and emoji
        const weatherInfo = WEATHER_CODES[weather.weather_code.toString()] || {
            description: 'Unknown condition',
            emoji: '🌡️'
        };
        
        // Update location
        document.getElementById('locationName').textContent = location.name;
        document.getElementById('countryName').textContent = location.country;
        
        // Update weather icon and description
        document.getElementById('weatherEmoji').textContent = weatherInfo.emoji;
        document.getElementById('weatherDescription').textContent = weatherInfo.description;
        
        // Update temperature
        document.getElementById('currentTemp').textContent = Math.round(weather.temperature_2m);
        
        // Update details
        document.getElementById('feelsLike').textContent = `${Math.round(weather.apparent_temperature)}°C`;
        document.getElementById('humidity').textContent = `${weather.relative_humidity_2m}%`;
        document.getElementById('windSpeed').textContent = `${Math.round(weather.wind_speed_10m)} km/h`;
        document.getElementById('pressure').textContent = `${Math.round(weather.pressure_msl)} hPa`;
        
        console.log('Current weather display updated successfully');
    } catch (error) {
        console.error('Error displaying current weather:', error);
    }
}
// Create weather charts
function createCharts(hourlyData) {
    console.log('Creating weather charts');
    
    try {
        // Get next 24 hours of data
        const hours = hourlyData.time.slice(0, 24);
        const temperatures = hourlyData.temperature_2m.slice(0, 24);
        const humidity = hourlyData.relative_humidity_2m.slice(0, 24);
        const windSpeed = hourlyData.wind_speed_10m.slice(0, 24);
        const precipitation = hourlyData.precipitation.slice(0, 24);
        
        // Create time labels
        const timeLabels = hours.map(time => {
            const date = new Date(time);
            return date.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                hour12: true 
            });
        });
        
        console.log('Chart data prepared, creating charts...');
        
        // Create individual charts
        createTemperatureChart(timeLabels, temperatures);
        createHumidityChart(timeLabels, humidity);
        createWindChart(timeLabels, windSpeed);
        createPrecipitationChart(timeLabels, precipitation);
        
        console.log('All charts created successfully');
    } catch (error) {
        console.error('Error creating charts:', error);
    }
}
// Create temperature chart
function createTemperatureChart(labels, data) {
    const canvas = document.getElementById('temperatureChart');
    if (!canvas) {
        console.error('Temperature chart canvas not found');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    
    if (charts.temperature) {
        charts.temperature.destroy();
    }
    
    charts.temperature = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Temperature (°C)',
                data,
                borderColor: '#1FB8CD',
                backgroundColor: 'rgba(31, 184, 205, 0.1)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#1FB8CD',
                pointBorderColor: '#1FB8CD',
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        callback: function(value) {
                            return value + '°C';
                        }
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                }
            }
        }
    });
}
// Create humidity chart
function createHumidityChart(labels, data) {
    const canvas = document.getElementById('humidityChart');
    if (!canvas) {
        console.error('Humidity chart canvas not found');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    
    if (charts.humidity) {
        charts.humidity.destroy();
    }
    
    charts.humidity = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Humidity (%)',
                data,
                borderColor: '#FFC185',
                backgroundColor: 'rgba(255, 193, 133, 0.2)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#FFC185',
                pointBorderColor: '#FFC185',
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    min: 0,
                    max: 100,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                }
            }
        }
    });
}
// Create wind speed chart
function createWindChart(labels, data) {
    const canvas = document.getElementById('windChart');
    if (!canvas) {
        console.error('Wind chart canvas not found');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    
    if (charts.wind) {
        charts.wind.destroy();
    }
    
    charts.wind = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Wind Speed (km/h)',
                data,
                borderColor: '#B4413C',
                backgroundColor: 'rgba(180, 65, 60, 0.1)',
                tension: 0.4,
                fill: false,
                pointBackgroundColor: '#B4413C',
                pointBorderColor: '#B4413C',
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        callback: function(value) {
                            return value + ' km/h';
                        }
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                }
            }
        }
    });
}
// Create precipitation chart
function createPrecipitationChart(labels, data) {
    const canvas = document.getElementById('precipitationChart');
    if (!canvas) {
        console.error('Precipitation chart canvas not found');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    
    if (charts.precipitation) {
        charts.precipitation.destroy();
    }
    
    charts.precipitation = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Precipitation (mm)',
                data,
                backgroundColor: '#ECEBD5',
                borderColor: '#5D878F',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        callback: function(value) {
                            return value + ' mm';
                        }
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                }
            }
        }
    });
}

// Show loading state
function showLoading() {
    console.log('Showing loading state');
    
    isLoading = true;
    
    // Update search button
    searchBtn.classList.add('loading');
    searchBtn.disabled = true;
    
    // Hide all other states
    hideAllStates();
    
    // Show loading
    if (loadingState) {
        loadingState.classList.remove('hidden');
    }
}

// Hide loading state
function hideLoading() {
    console.log('Hiding loading state');
    
    isLoading = false;
    
    // Reset search button
    searchBtn.classList.remove('loading');
    
    // Re-enable search button if we have valid inputs
    if (countrySelect.value && cityInput.value.trim()) {
        searchBtn.disabled = false;
    }
    
    // Hide loading
    if (loadingState) {
        loadingState.classList.add('hidden');
    }
}

// Show error
function showError(message) {
    console.log('Showing error:', message);
    
    const errorMessage = document.getElementById('errorMessage');
    if (errorMessage) {
        errorMessage.textContent = message;
    }
    
    hideAllStates();
    if (errorState) {
        errorState.classList.remove('hidden');
    }
}

// Hide error
function hideError() {
    if (errorState) {
        errorState.classList.add('hidden');
    }
}

// Show results
function showResults() {
    console.log('Showing weather results');
    
    if (weatherDisplay) {
        weatherDisplay.classList.remove('hidden');
    }
    if (chartsSection) {
        chartsSection.classList.remove('hidden');
    }
}
// Hide all states
function hideAllStates() {
    if (loadingState) loadingState.classList.add('hidden');
    if (errorState) errorState.classList.add('hidden');
    if (weatherDisplay) weatherDisplay.classList.add('hidden');
    if (chartsSection) chartsSection.classList.add('hidden');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

console.log('Weather application script loaded successfully');