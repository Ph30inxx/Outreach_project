import React, { useState } from 'react';
import './App.css';

function App() {
  const [location, setLocation] = useState(null);
  const [nearestNGO, setNearestNGO] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const userLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        setLocation(userLocation);

        // Find nearest NGO
        try {
          const response = await fetch('http://localhost:5000/api/nearest-ngo', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(userLocation)
          });

          const data = await response.json();

          if (data.success) {
            setNearestNGO(data.ngo);
          } else {
            setError(data.error || 'Failed to find nearest NGO');
          }
        } catch (err) {
          setError('Failed to connect to server. Make sure backend is running.');
        }
        setLoading(false);
      },
      (error) => {
        setError('Unable to retrieve your location. Please enable location access.');
        setLoading(false);
      }
    );
  };

  const makeCall = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Animal Rescue App</h1>
        <p className="subtitle">Help injured animals find care quickly</p>
      </header>

      <main className="App-main">
        {!nearestNGO && (
          <div className="rescue-prompt">
            <div className="icon">🐾</div>
            <h2>Found an injured animal?</h2>
            <p>We'll connect you with the nearest animal rescue NGO</p>
            <button
              className="btn-primary"
              onClick={getLocation}
              disabled={loading}
            >
              {loading ? 'Finding NGO...' : 'Get Help Now'}
            </button>
          </div>
        )}

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {nearestNGO && (
          <div className="ngo-card">
            <div className="ngo-header">
              <h2>Nearest NGO Found!</h2>
              <span className="distance-badge">
                {nearestNGO.distance} km away
              </span>
            </div>

            <div className="ngo-details">
              <h3>{nearestNGO.name}</h3>
              <p className="ngo-address">
                <span className="icon">📍</span>
                {nearestNGO.address}
              </p>
              <p className="ngo-phone">
                <span className="icon">📞</span>
                {nearestNGO.phone}
              </p>
              {nearestNGO.email && (
                <p className="ngo-email">
                  <span className="icon">✉️</span>
                  {nearestNGO.email}
                </p>
              )}
            </div>

            <div className="ngo-actions">
              <button
                className="btn-call"
                onClick={() => makeCall(nearestNGO.phone)}
              >
                📞 Call Now
              </button>
              <button
                className="btn-secondary"
                onClick={() => {
                  setNearestNGO(null);
                  setLocation(null);
                }}
              >
                Search Again
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="App-footer">
        <p>Every animal deserves care and compassion</p>
      </footer>
    </div>
  );
}

export default App;
