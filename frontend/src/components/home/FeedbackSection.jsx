import React, { useState } from 'react';
import axios from 'axios';

const FeedbackSection = () => {
  const [feedback, setFeedback] = useState({ name: '', email: '', message: '' });
  const [feedbackStatus, setFeedbackStatus] = useState('');

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setFeedbackStatus('Submitting...');
    try {
      await axios.post('http://localhost:5000/api/feedback/submit', feedback);
      setFeedbackStatus('Success! Thank you for the suggestion.');
      setFeedback({ name: '', email: '', message: '' });
      setTimeout(() => setFeedbackStatus(''), 3000);
    } catch (err) {
      setFeedbackStatus('Error submitting feedback. Please try again.');
      setTimeout(() => setFeedbackStatus(''), 3000);
    }
  };

  return (
    <section className="section-container" style={{ background: 'rgba(0,0,0,0.2)' }}>
      <h2 className="section-title" style={{ marginBottom: '1rem' }}>Drop a Suggestion</h2>
      <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '3rem' }}>Have an idea to make Synapse better? Let us know!</p>
      
      <div className="feedback-container">
        <form className="feedback-form" onSubmit={handleFeedbackSubmit}>
          <input 
            type="text" 
            className="feedback-input" 
            placeholder="Your Name" 
            required 
            value={feedback.name}
            onChange={(e) => setFeedback({...feedback, name: e.target.value})}
          />
          <input 
            type="email" 
            className="feedback-input" 
            placeholder="Your Email" 
            required 
            value={feedback.email}
            onChange={(e) => setFeedback({...feedback, email: e.target.value})}
          />
          <textarea 
            className="feedback-input" 
            placeholder="Your suggestion..." 
            rows="4" 
            required
            value={feedback.message}
            onChange={(e) => setFeedback({...feedback, message: e.target.value})}
            style={{ resize: 'vertical' }}
          ></textarea>
          <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center', marginTop: '1rem' }}>
            Send Suggestion
          </button>
          {feedbackStatus && (
            <p style={{ textAlign: 'center', color: feedbackStatus.includes('Error') ? '#ef4444' : '#4ade80', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              {feedbackStatus}
            </p>
          )}
        </form>
      </div>
    </section>
  );
};

export default FeedbackSection;
