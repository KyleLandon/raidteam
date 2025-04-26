'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function ApplicationPage() {
  const [formData, setFormData] = useState({
    characterName: '',
    realm: '',
    class: '',
    spec: '',
    ilvl: '',
    raidExperience: '',
    whyJoin: '',
    discordTag: '',
    availability: [],
    battleTag: '',
  });

  const [formStatus, setFormStatus] = useState({
    submitted: false,
    error: null,
    loading: false
  });

  const classOptions = [
    'Death Knight', 'Demon Hunter', 'Druid', 'Evoker', 'Hunter', 'Mage', 
    'Monk', 'Paladin', 'Priest', 'Rogue', 'Shaman', 'Warlock', 'Warrior'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => {
      if (checked) {
        return {
          ...prev,
          availability: [...prev.availability, value]
        };
      } else {
        return {
          ...prev,
          availability: prev.availability.filter(day => day !== value)
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus({ ...formStatus, loading: true });

    try {
      const response = await fetch('/api/application/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit application');
      }

      setFormStatus({
        submitted: true,
        error: null,
        loading: false
      });
    } catch (error) {
      console.error('Application submission error:', error);
      setFormStatus({
        submitted: false,
        error: error.message,
        loading: false
      });
    }
  };

  if (formStatus.submitted) {
    return (
      <div className="paper">
        <div className="application-success">
          <h1>Application Submitted!</h1>
          <p>Thanks for applying to Raid Team. Our officers will review your application and reach out via Discord.</p>
          <div className="success-wipe-counter">
            <span>Wipe Counter till response: </span>
            <span className="count">3</span>
          </div>
          <Link href="/" className="back-button">Return to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="paper">
      <div className="application-container">
        <Link href="/" className="back-button">← Back to Raid Team</Link>
        
        <h1 className="application-title">Join Raid Team</h1>
        <p className="application-subtitle">Fill out this form to apply to our guild. Be honest, be yourself, and prepare for wipes.</p>
        
        {formStatus.error && (
          <div className="error-message">
            Error: {formStatus.error}
          </div>
        )}
        
        <form className="application-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h2>Character Information</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="characterName">Character Name <span className="required">*</span></label>
                <input
                  type="text"
                  id="characterName"
                  name="characterName"
                  value={formData.characterName}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="realm">Realm <span className="required">*</span></label>
                <input
                  type="text"
                  id="realm"
                  name="realm"
                  value={formData.realm}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="class">Class <span className="required">*</span></label>
                <select
                  id="class"
                  name="class"
                  value={formData.class}
                  onChange={handleChange}
                  required
                  className="form-select"
                >
                  <option value="">Select Class</option>
                  {classOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="spec">Specialization <span className="required">*</span></label>
                <input
                  type="text"
                  id="spec"
                  name="spec"
                  value={formData.spec}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="ilvl">Item Level <span className="required">*</span></label>
              <input
                type="text"
                id="ilvl"
                name="ilvl"
                value={formData.ilvl}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="e.g. 480"
              />
            </div>
          </div>
          
          <div className="form-section">
            <h2>Raid Experience</h2>
            
            <div className="form-group">
              <label htmlFor="raidExperience">Tell us about your raid experience <span className="required">*</span></label>
              <textarea
                id="raidExperience"
                name="raidExperience"
                value={formData.raidExperience}
                onChange={handleChange}
                required
                className="form-textarea"
                rows="4"
                placeholder="Previous guilds, progression achievements, notable experiences..."
              ></textarea>
            </div>
            
            <div className="form-group">
              <label>Raid Availability <span className="required">*</span></label>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="availability"
                    value="Tuesday"
                    checked={formData.availability.includes('Tuesday')}
                    onChange={handleCheckboxChange}
                  />
                  Tuesday
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="availability"
                    value="Wednesday"
                    checked={formData.availability.includes('Wednesday')}
                    onChange={handleCheckboxChange}
                  />
                  Wednesday
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="availability"
                    value="Thursday"
                    checked={formData.availability.includes('Thursday')}
                    onChange={handleCheckboxChange}
                  />
                  Thursday
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="availability"
                    value="Sunday"
                    checked={formData.availability.includes('Sunday')}
                    onChange={handleCheckboxChange}
                  />
                  Sunday
                </label>
              </div>
            </div>
          </div>
          
          <div className="form-section">
            <h2>About You</h2>
            
            <div className="form-group">
              <label htmlFor="whyJoin">Why do you want to join Raid Team? <span className="required">*</span></label>
              <textarea
                id="whyJoin"
                name="whyJoin"
                value={formData.whyJoin}
                onChange={handleChange}
                required
                className="form-textarea"
                rows="4"
                placeholder="Tell us what you&apos;re looking for in a guild and why Raid Team is a good fit..."
              ></textarea>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="discordTag">Discord Tag <span className="required">*</span></label>
                <input
                  type="text"
                  id="discordTag"
                  name="discordTag"
                  value={formData.discordTag}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder="username#0000 or username"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="battleTag">Battle.net Tag</label>
                <input
                  type="text"
                  id="battleTag"
                  name="battleTag"
                  value={formData.battleTag}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="battletag#1234"
                />
              </div>
            </div>
            
            <div className="form-group crayon-question">
              <label htmlFor="favoriteColor">What&apos;s your favorite crayon flavor? <span className="required">*</span></label>
              <input
                type="text"
                id="favoriteColor"
                name="favoriteColor"
                value={formData.favoriteColor}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="e.g. Burnt Sienna"
              />
            </div>
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="submit-button"
              disabled={formStatus.loading}
            >
              {formStatus.loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 