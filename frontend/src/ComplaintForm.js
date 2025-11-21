import React, { useState } from 'react';
import './ComplaintForm.css';

function ComplaintForm({ ngo, location, onComplaintSubmitted, onCancel }) {
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 16 * 1024 * 1024) {
        setError('Image size must be less than 16MB');
        return;
      }
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!description.trim()) {
      setError('Please provide a description');
      return;
    }

    setSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append('ngo_id', ngo.id);
    formData.append('description', description);
    formData.append('latitude', location.latitude);
    formData.append('longitude', location.longitude);

    if (image) {
      formData.append('image', image);
    }

    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/complaints`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        onComplaintSubmitted(data);
      } else {
        setError(data.error || 'Failed to submit complaint');
        setSubmitting(false);
      }
    } catch (err) {
      setError('Failed to connect to server. Make sure backend is running.');
      setSubmitting(false);
    }
  };

  return (
    <div className="complaint-form-container">
      <div className="complaint-header">
        <h2>Register Complaint</h2>
        <p>Reporting to: {ngo.name}</p>
      </div>

      <form onSubmit={handleSubmit} className="complaint-form">
        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the situation with the injured animal..."
            rows="5"
            required
            disabled={submitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="image">Upload Photo (Optional)</label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleImageChange}
            disabled={submitting}
          />
          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Preview" />
            </div>
          )}
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        <div className="form-actions">
          <button
            type="submit"
            className="btn-primary"
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Complaint'}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default ComplaintForm;
