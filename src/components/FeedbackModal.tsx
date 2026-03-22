import React, { useState } from 'react';

interface Props {
  onClose: () => void;
}

export function FeedbackModal({ onClose }: Props) {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    overall: 0,
    accuracy: 0,
    usefulFeature: '',
    whatWasWrong: '',
    careerStage: '',
    wouldRecommend: '',
    anythingElse: '',
  });

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await fetch('https://formspree.io/f/mqeyonav', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: '#080808',
    border: '1px solid #3A3A3A',
    color: '#F0F0F0',
    fontFamily: "'DM Mono', monospace",
    fontSize: '12px',
    padding: '10px 14px',
    outline: 'none',
    boxSizing: 'border-box',
    resize: 'vertical' as const,
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "'DM Mono', monospace",
    fontSize: '9px',
    color: '#0EA5E9',
    letterSpacing: '0.2em',
    textTransform: 'uppercase' as const,
    display: 'block',
    marginBottom: '8px',
  };

  const optionBtn = (value: string, current: string, setter: (v: string) => void) => (
    <button
      key={value}
      onClick={() => setter(value)}
      style={{
        background: current === value ? '#0EA5E9' : 'transparent',
        border: `1px solid ${current === value ? '#0EA5E9' : '#3A3A3A'}`,
        color: current === value ? '#000000' : '#E0E0E0',
        fontFamily: "'DM Mono', monospace",
        fontSize: '11px',
        padding: '6px 12px',
        cursor: 'pointer',
        letterSpacing: '0.05em',
        transition: 'all 0.15s',
      }}
    >
      {value}
    </button>
  );

  const ratingBtn = (value: number, current: number, setter: (v: number) => void) => (
    <button
      key={value}
      onClick={() => setter(value)}
      style={{
        background: current === value ? '#0EA5E9' : 'transparent',
        border: `1px solid ${current === value ? '#0EA5E9' : '#3A3A3A'}`,
        color: current === value ? '#000000' : '#E0E0E0',
        fontFamily: "'DM Mono', monospace",
        fontSize: '13px',
        width: '36px',
        height: '36px',
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'all 0.15s',
      }}
    >
      {value}
    </button>
  );

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.88)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: '#0D0D0D',
        border: '1px solid #3A3A3A',
        borderTop: '2px solid #0EA5E9',
        width: '520px',
        maxWidth: '95vw',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '32px',
      }}>
        {submitted ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>✓</div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '22px', color: '#FFFFFF', marginBottom: '8px' }}>
              Thank you
            </div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '12px', color: '#9A9A9A', marginBottom: '24px' }}>
              Your feedback helps improve ResumeAI Pro for everyone.
            </div>
            <button
              onClick={onClose}
              style={{
                background: '#0EA5E9', color: '#000000',
                fontFamily: "'DM Mono', monospace", fontSize: '11px',
                textTransform: 'uppercase', padding: '10px 24px',
                border: 'none', cursor: 'pointer', letterSpacing: '0.1em',
                fontWeight: 'bold',
              }}
            >
              CLOSE
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '9px', color: '#0EA5E9', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '6px' }}>
                FEEDBACK — {step}/2
              </div>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '20px', color: '#FFFFFF', marginBottom: '4px' }}>
                {step === 1 ? 'How was your experience?' : 'Tell us more'}
              </div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', color: '#666666' }}>
                Takes 60 seconds. Helps us improve.
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ width: '100%', height: '2px', background: '#1A1A1A', marginBottom: '24px' }}>
              <div style={{ width: step === 1 ? '50%' : '100%', height: '100%', background: '#0EA5E9', transition: 'width 0.3s' }} />
            </div>

            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Overall rating */}
                <div>
                  <span style={labelStyle}>Overall Experience</span>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {[1,2,3,4,5].map(v => ratingBtn(v, form.overall, val => setForm(p => ({ ...p, overall: val }))))}
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', color: '#666666', alignSelf: 'center', marginLeft: '8px' }}>
                      {form.overall === 0 ? 'Select rating' : form.overall <= 2 ? 'Poor' : form.overall === 3 ? 'Average' : form.overall === 4 ? 'Good' : 'Excellent'}
                    </span>
                  </div>
                </div>

                {/* Accuracy rating */}
                <div>
                  <span style={labelStyle}>How Accurate Were Your Results?</span>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {[1,2,3,4,5].map(v => ratingBtn(v, form.accuracy, val => setForm(p => ({ ...p, accuracy: val }))))}
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', color: '#666666', alignSelf: 'center', marginLeft: '8px' }}>
                      {form.accuracy === 0 ? 'Select rating' : form.accuracy <= 2 ? 'Very inaccurate' : form.accuracy === 3 ? 'Somewhat accurate' : form.accuracy === 4 ? 'Mostly accurate' : 'Very accurate'}
                    </span>
                  </div>
                </div>

                {/* Most useful feature */}
                <div>
                  <span style={labelStyle}>Most Useful Feature</span>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {['Skill Gap Analysis', 'ATS Score', 'Action Plan', 'GitHub Portfolio', 'Career Explorer', 'PDF Export'].map(v =>
                      optionBtn(v, form.usefulFeature, val => setForm(p => ({ ...p, usefulFeature: val })))
                    )}
                  </div>
                </div>

                {/* Career stage */}
                <div>
                  <span style={labelStyle}>Your Career Stage</span>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {['Student', 'Fresher', 'Junior', 'Mid-level', 'Senior'].map(v =>
                      optionBtn(v, form.careerStage, val => setForm(p => ({ ...p, careerStage: val })))
                    )}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* What was wrong */}
                <div>
                  <span style={labelStyle}>What Was Inaccurate or Missing?</span>
                  <textarea
                    rows={3}
                    placeholder='e.g. "It said I was missing Python but it is on my resume"'
                    value={form.whatWasWrong}
                    onChange={e => setForm(p => ({ ...p, whatWasWrong: e.target.value }))}
                    style={inputStyle}
                  />
                </div>

                {/* Would recommend */}
                <div>
                  <span style={labelStyle}>Would You Recommend ResumeAI Pro?</span>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {['Yes definitely', 'Maybe', 'No'].map(v =>
                      optionBtn(v, form.wouldRecommend, val => setForm(p => ({ ...p, wouldRecommend: val })))
                    )}
                  </div>
                </div>

                {/* Anything else */}
                <div>
                  <span style={labelStyle}>Any Other Feedback or Feature Requests?</span>
                  <textarea
                    rows={3}
                    placeholder='Optional — anything else you want us to know'
                    value={form.anythingElse}
                    onChange={e => setForm(p => ({ ...p, anythingElse: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
              {step === 2 && (
                <button
                  onClick={() => setStep(1)}
                  style={{
                    background: 'transparent', color: '#9A9A9A',
                    border: '1px solid #3A3A3A',
                    fontFamily: "'DM Mono', monospace", fontSize: '11px',
                    textTransform: 'uppercase', padding: '10px 20px',
                    cursor: 'pointer', letterSpacing: '0.08em',
                  }}
                >
                  ← BACK
                </button>
              )}
              {step === 1 ? (
                <button
                  onClick={() => setStep(2)}
                  disabled={form.overall === 0}
                  style={{
                    background: form.overall === 0 ? '#1A1A1A' : '#0EA5E9',
                    color: form.overall === 0 ? '#555555' : '#000000',
                    border: 'none',
                    fontFamily: "'DM Mono', monospace", fontSize: '11px',
                    textTransform: 'uppercase', padding: '10px 24px',
                    cursor: form.overall === 0 ? 'not-allowed' : 'pointer',
                    letterSpacing: '0.08em', fontWeight: 'bold',
                  }}
                >
                  NEXT →
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  style={{
                    background: '#0EA5E9', color: '#000000',
                    border: 'none',
                    fontFamily: "'DM Mono', monospace", fontSize: '11px',
                    textTransform: 'uppercase', padding: '10px 24px',
                    cursor: 'pointer', letterSpacing: '0.08em', fontWeight: 'bold',
                  }}
                >
                  {submitting ? 'SENDING...' : 'SUBMIT FEEDBACK'}
                </button>
              )}
              <button
                onClick={onClose}
                style={{
                  background: 'transparent', color: '#555555',
                  border: 'none',
                  fontFamily: "'DM Mono', monospace", fontSize: '11px',
                  textTransform: 'uppercase', padding: '10px',
                  cursor: 'pointer', letterSpacing: '0.08em',
                  marginLeft: 'auto',
                }}
              >
                SKIP
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
