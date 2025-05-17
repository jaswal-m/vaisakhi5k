document.addEventListener('DOMContentLoaded', initializeCourse);

async function initializeCourse() {
    // Check if we're on the course page
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    // Add loading state
    mapContainer.innerHTML = '<div class="map-loading">Loading map...</div>';

    try {
        // Ensure mapboxgl is available
        if (typeof mapboxgl === 'undefined') {
            throw new Error('Mapbox GL JS is not loaded');
        }

        // Initialize map
        mapboxgl.accessToken = 'YOUR_MAPBOX_ACCESS_TOKEN'; // Remember to replace with your actual token
        const map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [-73.9665, 40.7812], // Central Park coordinates
            zoom: 14
        });

        // Add map controls
        map.addControl(new mapboxgl.NavigationControl());

        // Add route data once map is loaded
        map.on('load', () => {
            // Add course route data here
            map.addSource('route', {
                'type': 'geojson',
                'data': {
                    'type': 'Feature',
                    'properties': {},
                    'geometry': {
                        'type': 'LineString',
                        'coordinates': [
                            [-73.9683, 40.7752], // 72nd Street Transverse start
                            [-73.9680, 40.7745],
                            [-73.9675, 40.7747],
                            [-73.9665, 40.7760],
                            [-73.9685, 40.7775],
                            [-73.9690, 40.7785],
                            [-73.9669, 40.7812]  // Bethesda Fountain finish
                        ]
                    }
                }
            });

            map.addLayer({
                'id': 'route',
                'type': 'line',
                'source': 'route',
                'layout': {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                'paint': {
                    'line-color': '#0851a6',
                    'line-width': 4
                }
            });
        });

        // Initialize elevation chart
        const ctx = document.getElementById('elevation-profile');
        if (ctx) {
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Start', '0.5mi', '1mi', '1.5mi', '2mi', '2.5mi', 'Finish'],
                    datasets: [{
                        label: 'Elevation (feet)',
                        data: [80, 95, 110, 85, 124, 90, 75],
                        fill: true,
                        borderColor: '#0851a6',
                        backgroundColor: 'rgba(8, 81, 166, 0.1)',
                        tension: 0.4
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
                            min: 60,
                            max: 140
                        }
                    }
                }
            });
        }

    } catch (error) {
        console.error('Map initialization error:', error);
        mapContainer.innerHTML = `
            <div class="map-error">
                <p>Sorry, we couldn't load the course map.</p>
                <p>Please refresh the page or try again later.</p>
            </div>`;
    }
}

function initializeScrollAnimations() {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.tip-card').forEach(card => {
        observer.observe(card);
        card.classList.add('animate-on-scroll');
    });
}

function addMarker(map, coordinates, color, title, description) {
    new mapboxgl.Marker({ color })
        .setLngLat(coordinates)
        .setPopup(new mapboxgl.Popup().setHTML(`<h3>${sanitize(title)}</h3><p>${sanitize(description)}</p>`))
        .addTo(map);
}

// ✅ Escape HTML content to prevent injection
function sanitize(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function initializeWeatherUpdates() {
    const weatherInfo = document.querySelector('.weather-info');
    if (!weatherInfo) return;

    updateWeather(weatherInfo);
    setInterval(() => updateWeather(weatherInfo), 300000); // 5 mins
}

function updateWeather(container) {
    const weather = {
        temperature: Math.round(Math.random() * (85 - 65) + 65),
        conditions: ['Sunny', 'Partly Cloudy', 'Clear'][Math.floor(Math.random() * 3)],
        humidity: Math.round(Math.random() * (80 - 40) + 40)
    };

    container.innerHTML = `
        <div class="weather-update">
            <span class="temperature">${weather.temperature}°F</span>
            <span class="conditions">${sanitize(weather.conditions)}</span>
            <span class="humidity">Humidity: ${weather.humidity}%</span>
        </div>
    `;
}

export { initializeCourse };
