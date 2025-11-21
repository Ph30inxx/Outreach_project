import React, { useState, useEffect } from 'react';
import './NGODashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function NGODashboard({ user, onLogout }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchComplaints();
  }, [user.ngo_id]);

  const fetchComplaints = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/ngo/complaints/${user.ngo_id}`);
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

  const handleResolve = async (complaintId) => {
    try {
      const response = await fetch(`${API_URL}/api/ngo/complaints/${complaintId}/resolve`, {
        method: 'PUT'
      });

      const data = await response.json();

      if (data.success) {
        fetchComplaints();
      } else {
        alert(data.error || 'Failed to resolve complaint');
      }
    } catch (err) {
      alert('Failed to connect to server');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ngo_user');
    onLogout();
  };

  const filteredComplaints = complaints.filter(complaint => {
    if (filter === 'all') return true;
    return complaint.status === filter;
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

  return (
    <div className="ngo-dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1>{user.ngo_name}</h1>
            <p>Welcome, {user.username}</p>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-controls">
          <h2>Complaints Dashboard</h2>
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({complaints.length})
            </button>
            <button
              className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
              onClick={() => setFilter('pending')}
            >
              Pending ({complaints.filter(c => c.status === 'pending').length})
            </button>
            <button
              className={`filter-btn ${filter === 'in_progress' ? 'active' : ''}`}
              onClick={() => setFilter('in_progress')}
            >
              In Progress ({complaints.filter(c => c.status === 'in_progress').length})
            </button>
            <button
              className={`filter-btn ${filter === 'resolved' ? 'active' : ''}`}
              onClick={() => setFilter('resolved')}
            >
              Resolved ({complaints.filter(c => c.status === 'resolved').length})
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
            <p>No complaints found</p>
          </div>
        )}

        {!loading && !error && filteredComplaints.length > 0 && (
          <div className="complaints-grid">
            {filteredComplaints.map((complaint) => (
              <div key={complaint.id} className="complaint-card">
                <div className="complaint-header">
                  <span className="complaint-id">#{complaint.id}</span>
                  <span className={`status-badge ${getStatusBadgeClass(complaint.status)}`}>
                    {complaint.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="complaint-body">
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

                  <div className="complaint-details">
                    <p className="detail-item">
                      <span className="detail-label">Location:</span>
                      <span className="detail-value">
                        {complaint.user_latitude.toFixed(4)}, {complaint.user_longitude.toFixed(4)}
                      </span>
                    </p>
                    <p className="detail-item">
                      <span className="detail-label">Reported:</span>
                      <span className="detail-value">{formatDate(complaint.created_at)}</span>
                    </p>
                  </div>
                </div>

                {complaint.status !== 'resolved' && (
                  <div className="complaint-actions">
                    <button
                      className="btn-resolve"
                      onClick={() => handleResolve(complaint.id)}
                    >
                      Mark as Resolved
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default NGODashboard;
