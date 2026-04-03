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

  const mono = "'DM Mono', monospace";
  const serif = "'DM Serif Display', serif";

  const labelStyle: React.CSSProperties = {
    fontFamily: mono,
    fontSize: '9px',
    color: '#444444',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    display: 'block',
    marginBottom: '12px',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: '#050505',
    border: '1px solid #222222',
    color: '#ffffff',
    fontFamily: mono,
    fontSize: '12px',
    padding: '12px 14px',
    outline: 'none',
    boxSizing: 'border-box',
    resize: 'vertical',
    letterSpacing: '0.05em',
  };

  const ratingBtn = (value: number, current: number, setter: (v: number) => void) => (
    <button
      key={value}
      onClick={() => setter(value)}
      style={{
        width: '40px', height: '40px',
        background: current === value ? '#ffffff' : 'transparent',
        border: `1px solid ${current === value ? '#ffffff' : '#222222'}`,
        color: current === value ? '#000000' : '#555555',
        fontFamily: serif,
        fontSize: '16px',
        cursor: 'pointer',
        transition: 'all 0.15s',
        fontWeight: 'bold',
      }}
      onMouseEnter={e => {
        if (current !== value) {
          e.currentTarget.style.borderColor = '#666666';
          e.currentTarget.style.color = '#aaaaaa';
        }
      }}
      onMouseLeave={e => {
        if (current !== value) {
          e.currentTarget.style.borderColor = '#222222';
          e.currentTarget.style.color = '#555555';
        }
      }}
    >
      {value}
    </button>
  );

  const optionBtn = (value: string, current: string, setter: (v: string) => void) => (
    <button
      key={value}
      onClick={() => setter(value)}
      style={{
        background: current === value ? '#ffffff' : 'transparent',
        border: `1px solid ${current === value ? '#ffffff' : '#222222'}`,
        color: current === value ? '#000000' : '#555555',
        fontFamily: mono,
        fontSize: '10px',
        padding: '7px 14px',
        cursor: 'pointer',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => {
        if (current !== value) {
          e.currentTarget.style.borderColor = '#666666';
          e.currentTarget.style.color = '#aaaaaa';
        }
      }}
      onMouseLeave={e => {
        if (current !== value) {
          e.currentTarget.style.borderColor = '#222222';
          e.currentTarget.style.color = '#555555';
        }
      }}
    >
      {value}
    </button>
  );

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.92)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: '#000000',
        border: '1px solid #1a1a1a',
        borderTop: '1px solid #333333',
        width: '520px',
        maxWidth: '95vw',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '40px',
      }}>
        {submitted ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ fontFamily: serif, fontSize: '48px', color: '#ffffff', marginBottom: '16px', lineHeight: 1 }}>✓</div>
            <div style={{ fontFamily: serif, fontSize: '28px', color: '#ffffff', marginBottom: '8px' }}>Thank you</div>
            <div style={{ fontFamily: mono, fontSize: '11px', color: '#444444', marginBottom: '32px', letterSpacing: '0.1em' }}>
              YOUR FEEDBACK HELPS IMPROVE RESUMEAI PRO
            </div>
            <button
              onClick={onClose}
              style={{
                background: '#ffffff', color: '#000000',
                fontFamily: mono, fontSize: '10px',
                textTransform: 'uppercase', padding: '12px 32px',
                border: 'none', cursor: 'pointer', letterSpacing: '0.15em',
                fontWeight: 'bold',
              }}
            >
              CLOSE
            </button>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '32px' }}>
              <div style={{ fontFamily: mono, fontSize: '9px', color: '#444444', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '8px' }}>
                FEEDBACK — {step} / 2
              </div>
              <div style={{ fontFamily: serif, fontSize: '26px', color: '#ffffff', marginBottom: '4px' }}>
                {step === 1 ? 'How was your experience?' : 'Tell us more'}
              </div>
              <div style={{ fontFamily: mono, fontSize: '11px', color: '#333333', letterSpacing: '0.05em' }}>
                Takes 60 seconds. Helps us improve.
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ width: '100%', height: '1px', background: '#111111', marginBottom: '32px' }}>
              <div style={{ width: step === 1 ? '50%' : '100%', height: '100%', background: '#ffffff', transition: 'width 0.3s' }} />
            </div>

            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                <div>
                  <span style={labelStyle}>Overall Experience</span>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {[1,2,3,4,5].map(v => ratingBtn(v, form.overall, val => setForm(p => ({ ...p, overall: val }))))}
                    <span style={{ fontFamily: mono, fontSize: '10px', color: '#333333', marginLeft: '12px', letterSpacing: '0.05em' }}>
                      {form.overall === 0 ? '' : form.overall <= 2 ? 'POOR' : form.overall === 3 ? 'AVERAGE' : form.overall === 4 ? 'GOOD' : 'EXCELLENT'}
                    </span>
                  </div>
                </div>

                <div>
                  <span style={labelStyle}>How Accurate Were Your Results?</span>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {[1,2,3,4,5].map(v => ratingBtn(v, form.accuracy, val => setForm(p => ({ ...p, accuracy: val }))))}
                    <span style={{ fontFamily: mono, fontSize: '10px', color: '#333333', marginLeft: '12px', letterSpacing: '0.05em' }}>
                      {form.accuracy === 0 ? '' : form.accuracy <= 2 ? 'INACCURATE' : form.accuracy === 3 ? 'MIXED' : form.accuracy === 4 ? 'MOSTLY ACCURATE' : 'VERY ACCURATE'}
                    </span>
                  </div>
                </div>

                <div>
                  <span style={labelStyle}>Most Useful Feature</span>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {['Skill Gap Analysis', 'ATS Score', 'Action Plan', 'GitHub Portfolio', 'Career Explorer', 'PDF Export'].map(v =>
                      optionBtn(v, form.usefulFeature, val => setForm(p => ({ ...p, usefulFeature: val })))
                    )}
                  </div>
                </div>

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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
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

                <div>
                  <span style={labelStyle}>Would You Recommend ResumeAI Pro?</span>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {['Yes definitely', 'Maybe', 'No'].map(v =>
                      optionBtn(v, form.wouldRecommend, val => setForm(p => ({ ...p, wouldRecommend: val })))
                    )}
                  </div>
                </div>

                <div>
                  <span style={labelStyle}>Any Other Feedback or Feature Requests?</span>
                  <textarea
                    rows={3}
                    placeholder='Optional'
                    value={form.anythingElse}
                    onChange={e => setForm(p => ({ ...p, anythingElse: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '36px', paddingTop: '24px', borderTop: '1px solid #111111' }}>
              <div>
                {step === 2 && (
                  <button
                    onClick={() => setStep(1)}
                    style={{
                      background: 'transparent', color: '#444444',
                      border: '1px solid #222222',
                      fontFamily: mono, fontSize: '10px',
                      textTransform: 'uppercase', padding: '10px 20px',
                      cursor: 'pointer', letterSpacing: '0.1em',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.borderColor = '#555555'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#444444'; e.currentTarget.style.borderColor = '#222222'; }}
                  >
                    ← BACK
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <button
                  onClick={onClose}
                  style={{
                    background: 'transparent', color: '#333333',
                    border: 'none', fontFamily: mono,
                    fontSize: '10px', textTransform: 'uppercase',
                    padding: '10px', cursor: 'pointer', letterSpacing: '0.1em',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#666666'}
                  onMouseLeave={e => e.currentTarget.style.color = '#333333'}
                >
                  SKIP
                </button>
                {step === 1 ? (
                  <button
                    onClick={() => setStep(2)}
                    disabled={form.overall === 0}
                    style={{
                      background: form.overall === 0 ? 'transparent' : '#ffffff',
                      color: form.overall === 0 ? '#333333' : '#000000',
                      border: `1px solid ${form.overall === 0 ? '#222222' : '#ffffff'}`,
                      fontFamily: mono, fontSize: '10px',
                      textTransform: 'uppercase', padding: '10px 24px',
                      cursor: form.overall === 0 ? 'not-allowed' : 'pointer',
                      letterSpacing: '0.1em', fontWeight: 'bold',
                      transition: 'all 0.15s',
                    }}
                  >
                    NEXT →
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    style={{
                      background: '#ffffff', color: '#000000',
                      border: 'none', fontFamily: mono,
                      fontSize: '10px', textTransform: 'uppercase',
                      padding: '10px 24px', cursor: 'pointer',
                      letterSpacing: '0.1em', fontWeight: 'bold',
                    }}
                  >
                    {submitting ? 'SENDING...' : 'SUBMIT'}
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
