document.addEventListener('DOMContentLoaded', () => {
    // Initialize Google Maps
    if (typeof google !== 'undefined' && document.getElementById('map')) {
        const centralPark = { lat: 40.7829, lng: -73.9654 };
        const map = new google.maps.Map(document.getElementById('map'), {
            zoom: 15,
            center: centralPark,
            styles: [
                {
                    featureType: 'poi',
                    elementType: 'labels',
                    stylers: [{ visibility: 'off' }]
                }
            ]
        });

        // Course path coordinates (example path)
        const coursePath = [
            { lat: 40.7744, lng: -73.9694 }, // Start at 72nd St Transverse
            { lat: 40.7747, lng: -73.9684 },
            { lat: 40.7750, lng: -73.9674 },
            { lat: 40.7760, lng: -73.9664 },
            { lat: 40.7770, lng: -73.9654 },
            { lat: 40.7780, lng: -73.9644 },
            { lat: 40.7790, lng: -73.9634 },
            { lat: 40.7800, lng: -73.9624 },
            { lat: 40.7810, lng: -73.9614 },
            { lat: 40.7820, lng: -73.9604 },
            { lat: 40.7725, lng: -73.9684 }  // Finish at Bethesda Fountain
        ];

        // Draw course path
        const courseLine = new google.maps.Polyline({
            path: coursePath,
            geodesic: true,
            strokeColor: '#4F46E5',
            strokeOpacity: 1.0,
            strokeWeight: 3
        });
        courseLine.setMap(map);

        // Add start marker
        new google.maps.Marker({
            position: coursePath[0],
            map: map,
            title: 'Start Line',
            icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#4F46E5">
                        <path d="M12 0C8.13 0 5 3.13 5 7c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                `),
                scaledSize: new google.maps.Size(32, 32),
                anchor: new google.maps.Point(16, 32)
            }
        });

        // Add finish marker
        new google.maps.Marker({
            position: coursePath[coursePath.length - 1],
            map: map,
            title: 'Finish Line',
            icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#4CAF50">
                        <path d="M12 0C8.13 0 5 3.13 5 7c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                `),
                scaledSize: new google.maps.Size(32, 32),
                anchor: new google.maps.Point(16, 32)
            }
        });

        // Add aid station markers
        const aidStations = [
            { position: coursePath[3], title: 'Aid Station 1' },
            { position: coursePath[6], title: 'Aid Station 2' }
        ];

        aidStations.forEach(station => {
            new google.maps.Marker({
                position: station.position,
                map: map,
                title: station.title,
                icon: {
                    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#FF9800">
                            <path d="M12 0C8.13 0 5 3.13 5 7c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                        </svg>
                    `),
                    scaledSize: new google.maps.Size(24, 24),
                    anchor: new google.maps.Point(12, 24)
                }
            });
        });
    }

    // Animate course tips on scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, {
        threshold: 0.1
    });

    document.querySelectorAll('.tip-card').forEach(card => {
        observer.observe(card);
        card.classList.add('animate-on-scroll');
    });
});
