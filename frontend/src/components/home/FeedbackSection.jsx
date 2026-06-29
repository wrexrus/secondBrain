import React, { useState } from 'react';
import emailjs from '@emailjs/browser';

const FeedbackSection = () => {
  const [feedback, setFeedback] = useState({ name: '', email: '', message: '' });
  const [feedbackStatus, setFeedbackStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setFeedbackStatus('Sending...');
    setIsSubmitting(true);
    
    try {
      // Setup your EmailJS keys in frontend/.env
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'YOUR_SERVICE_ID';
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'YOUR_TEMPLATE_ID';
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'YOUR_PUBLIC_KEY';

      const templateParams = {
        from_name: feedback.name,
        from_email: feedback.email || 'No email provided',
        message: feedback.message,
      };

      await emailjs.send(serviceId, templateId, templateParams, publicKey);
      
      setFeedbackStatus('Success! Thank you for the suggestion.');
      setFeedback({ name: '', email: '', message: '' });
      setTimeout(() => setFeedbackStatus(''), 3000);
    } catch (err) {
      console.error("EmailJS Error:", err);
      setFeedbackStatus('Error submitting feedback. Please try again or check API keys.');
      setTimeout(() => setFeedbackStatus(''), 3000);
    } finally {
      setIsSubmitting(false);
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
            placeholder="Your Email (Optional)" 
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
          <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ justifyContent: 'center', marginTop: '1rem', opacity: isSubmitting ? 0.7 : 1 }}>
            {isSubmitting ? 'Sending...' : 'Send Suggestion'}
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
