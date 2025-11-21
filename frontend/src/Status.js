import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Status.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Status() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/complaints/all`);
      const data = await response.json();

      if (data.success) {
        setComplaints(data.complaints);
      } else {
        setError(data.error || 'Failed to fetch complaints');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const filteredComplaints = complaints.filter(complaint => {
    if (filter === 'pending') {
      return complaint.status === 'pending' || complaint.status === 'in_progress';
    }
    return complaint.status === 'resolved';
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'in_progress': return 'status-in-progress';
      case 'resolved': return 'status-resolved';
      default: return '';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const pendingCount = complaints.filter(c => c.status === 'pending' || c.status === 'in_progress').length;
  const resolvedCount = complaints.filter(c => c.status === 'resolved').length;

  return (
    <div className="status-page">
      <header className="status-header">
        <div className="header-content">
          <Link to="/" className="back-link">← Back to Home</Link>
          <h1>Complaint Status Tracker</h1>
          <p>Track all animal rescue complaints and their status</p>
        </div>
      </header>

      <main className="status-main">
        <div className="status-controls">
          <div className="toggle-buttons">
            <button
              className={`toggle-btn ${filter === 'pending' ? 'active' : ''}`}
              onClick={() => setFilter('pending')}
            >
              Pending ({pendingCount})
            </button>
            <button
              className={`toggle-btn ${filter === 'resolved' ? 'active' : ''}`}
              onClick={() => setFilter('resolved')}
            >
              Resolved ({resolvedCount})
            </button>
          </div>
        </div>

        {loading && (
          <div className="loading-message">
            <p>Loading complaints...</p>
          </div>
        )}

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && filteredComplaints.length === 0 && (
          <div className="empty-state">
            <p>No {filter} complaints found</p>
          </div>
        )}

        {!loading && !error && filteredComplaints.length > 0 && (
          <div className="status-grid">
            {filteredComplaints.map((complaint) => (
              <div key={complaint.id} className="status-card">
                <div className="status-card-header">
                  <span className="complaint-id">#{complaint.id}</span>
                  <span className={`status-badge ${getStatusBadgeClass(complaint.status)}`}>
                    {complaint.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="status-card-body">
                  <p className="complaint-description">{complaint.description}</p>

                  {complaint.image_path && (
                    <div className="complaint-image">
                      <img
                        src={`${API_URL}/uploads/${complaint.image_path}`}
                        alt="Complaint"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  <div className="ngo-info">
                    <h4>Assigned to:</h4>
                    <p className="ngo-name">{complaint.ngo_name}</p>
                    <p className="ngo-detail">
                      <span className="icon">📍</span>
                      {complaint.ngo_address}
                    </p>
                    <p className="ngo-detail">
                      <span className="icon">📞</span>
                      {complaint.ngo_phone}
                    </p>
                  </div>

                  <div className="complaint-meta">
                    <p className="meta-item">
                      <span className="meta-label">Reported:</span>
                      <span className="meta-value">{formatDate(complaint.created_at)}</span>
                    </p>
                    <p className="meta-item">
                      <span className="meta-label">Location:</span>
                      <span className="meta-value">
                        {complaint.user_latitude.toFixed(4)}, {complaint.user_longitude.toFixed(4)}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="status-footer">
        <p>Every animal deserves care and compassion</p>
      </footer>
    </div>
  );
}

export default Status;
