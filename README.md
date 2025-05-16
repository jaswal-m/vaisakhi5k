# Vaisakhi 5K Race Website

A modern, progressive web application for the Vaisakhi 5K race event with enhanced features and offline support.

## Features

- **Progressive Web App (PWA)**
  - Offline support via Service Worker
  - Caching for improved performance
  - Installable on mobile devices

- **Enhanced Router**
  - Client-side navigation
  - Page preloading
  - Rate limiting for navigation
  - Real-time updates support

- **Modern Features**
  - Social sharing integration
  - Real-time race updates
  - Weather updates
  - Interactive course map
  - Registration system
  - FAQ section

- **Performance Optimizations**
  - Asset preloading
  - Service Worker caching
  - Optimized resource loading
  - Responsive images

- **Security Features**
  - CSRF protection
  - Secure session handling
  - Input validation
  - XSS prevention

## Project Structure

```
vaisakhi-5k/
├── css/               # Stylesheets
├── js/               # JavaScript files
├── images/           # Image assets
├── pages/            # HTML pages
├── sw.js            # Service Worker
└── index.html       # Entry point
```

## Getting Started

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd vaisakhi-5k
   ```

2. Start a local server:
   ```bash
   # Using PHP's built-in server
   php -S localhost:8000
   
   # Or using Python
   python -m http.server 8000
   ```

3. Open `http://localhost:8000` in your browser

## Development

- The site uses vanilla JavaScript with a custom router implementation
- Service Worker handles offline functionality and caching
- Real-time updates are implemented using Server-Sent Events
- Styles are organized in modular CSS files

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details
