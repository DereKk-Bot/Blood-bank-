import React, { useState } from 'react';
import DonorQuestionnaire from '../../components/DonorQuestionnaire';
import BloodCompatibilityTable from '../../components/BloodCompatibilityTable';
import { checkDonorEligibility } from '../../utils/bloodUtils';
import { Heart, Activity, FileText, Sparkles, Droplet, ShieldCheck, CheckCircle2, Clock, Calendar, HelpCircle, ChevronDown, ChevronUp, Coffee, Smile, Award } from 'lucide-react';

export default function DonorDashboard() {
  const [tab, setTab] = useState('questionnaire');
  const [lastDateInput, setLastDateInput] = useState('');
  const [calcResult, setCalcResult] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  const handleCalculateInterval = (e) => {
    e.preventDefault();
    if (!lastDateInput) return;
    const res = checkDonorEligibility(lastDateInput, 56);
    setCalcResult(res);
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: 'Does giving blood hurt?',
      a: 'You will feel a brief quick pinch for a fraction of a second when the needle is inserted. The actual donation procedure is painless and comfortable.'
    },
    {
      q: 'How long does the entire donation process take?',
      a: 'The actual blood extraction takes only 8 to 10 minutes. The full appointment (registration, mini-health check, donation, and refreshments) takes about 45 minutes.'
    },
    {
      q: 'How much blood is taken during donation?',
      a: 'Standard whole blood donation collects 1 pint (approx. 470 ml), which is less than 10% of an adult’s total blood volume. Your body replaces the fluid volume within 24 hours.'
    },
    {
      q: 'How often can I donate whole blood?',
      a: 'You can safely donate whole blood once every 56 days (8 weeks) to allow your body adequate time to replenish iron stores.'
    }
  ];

  return (
    <div className="page-shell" style={{ maxWidth: '1040px' }}>
      {/* Donor Hero Banner */}
      <section className="card" style={{
        background: 'linear-gradient(135deg, #881337 0%, #0F172A 60%, #1E1B4B 100%)',
        color: '#FFFFFF',
        padding: '40px 36px',
        marginBottom: '28px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', position: 'relative', zIndex: 10 }}>
          <div>
            <div className="section-label" style={{ background: 'rgba(254, 205, 211, 0.15)', color: '#FECDD3', border: '1px solid rgba(254, 205, 211, 0.3)' }}>
              <Heart size={14} fill="#F43F5E" color="#F43F5E" /> Voluntary Blood Donation Hub
            </div>
            <h1 style={{ margin: '12px 0 10px', fontSize: '32px', fontWeight: '800', color: '#FFFFFF' }}>
              Be a Hero. <span style={{ color: '#FB7185' }}>Save 3 Lives Today.</span>
            </h1>
            <p style={{ margin: 0, color: '#E2E8F0', fontSize: '16px', maxWidth: '640px', lineHeight: 1.5 }}>
              Check your clinical eligibility, explore blood compatibility, and prepare for your voluntary donation.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setTab('questionnaire')}
              className="primary-btn"
              style={{ padding: '12px 20px' }}
            >
              <FileText size={16} /> Pre-Screening Test
            </button>
            <button
              onClick={() => setTab('calculator')}
              className="secondary-btn"
              style={{ background: 'rgba(255,255,255,0.1)', color: '#FFF', borderColor: 'rgba(255,255,255,0.3)', padding: '12px 20px' }}
            >
              <Calendar size={16} /> Interval Calculator
            </button>
          </div>
        </div>
      </section>

      {/* Navigation Tab Selector */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setTab('questionnaire')}
          style={{
            background: tab === 'questionnaire' ? '#E30613' : '#FFFFFF',
            color: tab === 'questionnaire' ? '#FFFFFF' : '#64748B',
            border: `1.5px solid ${tab === 'questionnaire' ? '#E30613' : '#CBD5E1'}`,
            borderRadius: '12px',
            padding: '10px 20px',
            fontWeight: '700',
            fontSize: '14px',
            cursor: 'pointer',
            boxShadow: tab === 'questionnaire' ? '0 4px 12px rgba(227, 6, 19, 0.25)' : 'none'
          }}
        >
          <FileText size={16} /> Clinical Pre-Screening
        </button>

        <button
          onClick={() => setTab('journey')}
          style={{
            background: tab === 'journey' ? '#E30613' : '#FFFFFF',
            color: tab === 'journey' ? '#FFFFFF' : '#64748B',
            border: `1.5px solid ${tab === 'journey' ? '#E30613' : '#CBD5E1'}`,
            borderRadius: '12px',
            padding: '10px 20px',
            fontWeight: '700',
            fontSize: '14px',
            cursor: 'pointer',
            boxShadow: tab === 'journey' ? '0 4px 12px rgba(227, 6, 19, 0.25)' : 'none'
          }}
        >
          <Sparkles size={16} /> Donation Journey & FAQs
        </button>

        <button
          onClick={() => setTab('matrix')}
          style={{
            background: tab === 'matrix' ? '#E30613' : '#FFFFFF',
            color: tab === 'matrix' ? '#FFFFFF' : '#64748B',
            border: `1.5px solid ${tab === 'matrix' ? '#E30613' : '#CBD5E1'}`,
            borderRadius: '12px',
            padding: '10px 20px',
            fontWeight: '700',
            fontSize: '14px',
            cursor: 'pointer',
            boxShadow: tab === 'matrix' ? '0 4px 12px rgba(227, 6, 19, 0.25)' : 'none'
          }}
        >
          <Activity size={16} /> Compatibility Matrix
        </button>

        <button
          onClick={() => setTab('calculator')}
          style={{
            background: tab === 'calculator' ? '#E30613' : '#FFFFFF',
            color: tab === 'calculator' ? '#FFFFFF' : '#64748B',
            border: `1.5px solid ${tab === 'calculator' ? '#E30613' : '#CBD5E1'}`,
            borderRadius: '12px',
            padding: '10px 20px',
            fontWeight: '700',
            fontSize: '14px',
            cursor: 'pointer',
            boxShadow: tab === 'calculator' ? '0 4px 12px rgba(227, 6, 19, 0.25)' : 'none'
          }}
        >
          <Calendar size={16} /> Eligibility Calculator
        </button>
      </div>

      {/* TAB 1: QUESTIONNAIRE */}
      {tab === 'questionnaire' && <DonorQuestionnaire />}

      {/* TAB 2: DONATION JOURNEY & FAQS */}
      {tab === 'journey' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Step Journey Card */}
          <div className="card" style={{ padding: '32px' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: '22px', color: '#0F172A', fontWeight: '800' }}>
              The 4-Step Donation Journey
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
              <div style={{ background: '#F8FAFC', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                <div style={{ background: '#FFE4E6', color: '#BE123C', width: '36px', height: '36px', borderRadius: '50%', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>1</div>
                <h4 style={{ margin: '0 0 6px', color: '#0F172A', fontSize: '16px' }}>Pre-Registration</h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748B', lineHeight: 1.5 }}>
                  Complete your medical pre-screening online and present your donor ID.
                </p>
              </div>

              <div style={{ background: '#F8FAFC', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                <div style={{ background: '#E0F2FE', color: '#0369A1', width: '36px', height: '36px', borderRadius: '50%', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>2</div>
                <h4 style={{ margin: '0 0 6px', color: '#0F172A', fontSize: '16px' }}>Mini Health Check</h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748B', lineHeight: 1.5 }}>
                  Quick check for hemoglobin levels, blood pressure, temperature, and pulse rate.
                </p>
              </div>

              <div style={{ background: '#F8FAFC', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                <div style={{ background: '#DCFCE7', color: '#15803D', width: '36px', height: '36px', borderRadius: '50%', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>3</div>
                <h4 style={{ margin: '0 0 6px', color: '#0F172A', fontSize: '16px' }}>The Donation</h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748B', lineHeight: 1.5 }}>
                  Rest comfortably for 8-10 minutes while 1 pint of blood is extracted safely.
                </p>
              </div>

              <div style={{ background: '#F8FAFC', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                <div style={{ background: '#FEF3C7', color: '#B45309', width: '36px', height: '36px', borderRadius: '50%', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>4</div>
                <h4 style={{ margin: '0 0 6px', color: '#0F172A', fontSize: '16px' }}>Snacks & Recovery</h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748B', lineHeight: 1.5 }}>
                  Enjoy juices, light snacks, and rest for 15 minutes before heading out.
                </p>
              </div>
            </div>
          </div>

          {/* FAQs Accordion */}
          <div className="card" style={{ padding: '32px' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: '22px', color: '#0F172A', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HelpCircle size={22} color="#E30613" /> Frequently Asked Questions
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  onClick={() => toggleFaq(idx)}
                  style={{
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    cursor: 'pointer',
                    background: openFaq === idx ? '#FFF1F2' : '#FFFFFF',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '700', fontSize: '15px', color: '#0F172A' }}>
                    <span>{faq.q}</span>
                    {openFaq === idx ? <ChevronUp size={18} color="#E30613" /> : <ChevronDown size={18} color="#94A3B8" />}
                  </div>
                  {openFaq === idx && (
                    <p style={{ margin: '12px 0 0', fontSize: '14px', color: '#475569', lineHeight: 1.6 }}>
                      {faq.a}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MATRIX */}
      {tab === 'matrix' && <BloodCompatibilityTable />}

      {/* TAB 4: CALCULATOR */}
      {tab === 'calculator' && (
        <div className="card" style={{ padding: '32px', maxWidth: '640px', margin: '0 auto' }}>
          <h3 style={{ margin: '0 0 8px', fontSize: '22px', color: '#0F172A', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={22} color="#E30613" /> Whole Blood Donation Interval Calculator
          </h3>
          <p style={{ color: '#64748B', fontSize: '14px', margin: '0 0 24px' }}>
            Enter the date of your last donation to calculate your next eligible donation date (56-day standard requirement).
          </p>

          <form onSubmit={handleCalculateInterval} style={{ marginBottom: '24px' }}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '13px', color: '#334155' }}>
                Last Donation Date
              </label>
              <input
                type="date"
                value={lastDateInput}
                onChange={e => setLastDateInput(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="primary-btn" style={{ width: '100%', padding: '12px' }}>
              Calculate Next Eligible Date
            </button>
          </form>

          {calcResult && (
            <div style={{
              background: calcResult.eligible ? '#DCFCE7' : '#FEF3C7',
              border: `1.5px solid ${calcResult.eligible ? '#86EFAC' : '#FCD34D'}`,
              borderRadius: '16px',
              padding: '20px',
              color: calcResult.eligible ? '#15803D' : '#92400E'
            }}>
              <div style={{ fontWeight: '800', fontSize: '16px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {calcResult.eligible ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                {calcResult.eligible ? 'ELIGIBLE TO DONATE NOW' : 'WAITING PERIOD ACTIVE'}
              </div>
              <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5 }}>
                {calcResult.reason}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
