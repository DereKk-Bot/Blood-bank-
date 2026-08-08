import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, ShieldCheck, FileText, Calendar, Activity, Sparkles, User, Heart, Info, ArrowRight, ArrowLeft, RefreshCw, Award } from 'lucide-react';
import { checkDonorEligibility } from '../utils/bloodUtils';

export default function DonorQuestionnaire({ onComplete }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    age: '25',
    weightKg: '68',
    heightCm: '175',
    gender: 'male',
    lastDonationDate: '',
    q_feelingHealthy: 'yes',
    q_recentFever: 'no',
    q_takingAntibiotics: 'no',
    q_recentDental: 'no',
    q_majorSurgery: 'no',
    q_bloodTransfusion: 'no',
    q_tattooPiercing: 'no',
    q_malariaTravel: 'no',
    q_pregnancyLactation: 'no'
  });

  const [evaluation, setEvaluation] = useState(null);

  const calculateBMI = () => {
    const hM = parseFloat(formData.heightCm) / 100;
    const wKg = parseFloat(formData.weightKg);
    return (hM > 0 && wKg > 0) ? (wKg / (hM * hM)).toFixed(1) : null;
  };

  const evaluateClinicalEligibility = () => {
    const deferrals = [];
    const ageNum = parseInt(formData.age, 10);
    const weightNum = parseFloat(formData.weightKg);

    // 1. Age Rule (18 to 65 years)
    if (isNaN(ageNum) || ageNum < 18) {
      deferrals.push({ rule: 'Age Limit', reason: 'Donors must be at least 18 years of age.' });
    } else if (ageNum > 65) {
      deferrals.push({ rule: 'Senior Age Limit', reason: 'Donors above 65 years require physician approval prior to donation.' });
    }

    // 2. Weight Rule (Minimum 50 kg / 110 lbs)
    if (isNaN(weightNum) || weightNum < 50) {
      deferrals.push({ rule: 'Minimum Weight Requirement', reason: 'Weight must be at least 50 kg (110 lbs) for safe blood volume extraction.' });
    }

    // 3. Donation Interval Rule (56 days / 8 weeks for whole blood)
    if (formData.lastDonationDate) {
      const donationCheck = checkDonorEligibility(formData.lastDonationDate, 56);
      if (!donationCheck.eligible) {
        deferrals.push({ rule: 'Donation Interval', reason: donationCheck.reason });
      }
    }

    // 4. Current Health Status Today
    if (formData.q_feelingHealthy === 'no') {
      deferrals.push({ rule: 'Current Wellbeing', reason: 'Donors must be feeling healthy and well on donation day.' });
    }

    // 5. Recent Fever / Cold / Infection (14 days)
    if (formData.q_recentFever === 'yes') {
      deferrals.push({ rule: 'Recent Infection', reason: '14-day waiting period required after recovery from fever or active infection.' });
    }

    // 6. Antibiotics / Antiviral Medication (14 days)
    if (formData.q_takingAntibiotics === 'yes') {
      deferrals.push({ rule: 'Medication Course', reason: 'Must complete antibiotics course and wait 14 days before donating.' });
    }

    // 7. Dental Work / Extraction (7 days)
    if (formData.q_recentDental === 'yes') {
      deferrals.push({ rule: 'Dental Deferral', reason: '7-day waiting period required after minor oral surgery or dental extraction.' });
    }

    // 8. Major Surgery / Endoscopy (6 months)
    if (formData.q_majorSurgery === 'yes') {
      deferrals.push({ rule: 'Surgical Deferral', reason: '6-month waiting period required following major surgery or invasive procedures.' });
    }

    // 9. Blood Transfusion Received (12 months)
    if (formData.q_bloodTransfusion === 'yes') {
      deferrals.push({ rule: 'Transfusion Deferral', reason: '12-month waiting period required if you have received blood or blood products.' });
    }

    // 10. Tattoos, Piercings, Acupuncture (6 months)
    if (formData.q_tattooPiercing === 'yes') {
      deferrals.push({ rule: 'Tattoo / Piercing Deferral', reason: '6-month waiting period required after receiving tattoos, piercings, or microblading.' });
    }

    // 11. Travel to Endemic Malaria / Dengue Zones (12 months)
    if (formData.q_malariaTravel === 'yes') {
      deferrals.push({ rule: 'Endemic Travel Deferral', reason: '12-month waiting period required after travel to malaria or tropical endemic regions.' });
    }

    // 12. Pregnancy / Breastfeeding (6 months)
    if (formData.gender === 'female' && formData.q_pregnancyLactation === 'yes') {
      deferrals.push({ rule: 'Pregnancy & Lactation', reason: '6-month waiting period required after childbirth or termination of breastfeeding.' });
    }

    const bmi = calculateBMI();
    const passed = deferrals.length === 0;
    const refCode = 'DON-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    const res = {
      passed,
      deferrals,
      bmi,
      refCode,
      evaluatedAt: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    };

    setEvaluation(res);
    if (onComplete) onComplete(res);
  };

  const handleNextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      evaluateClinicalEligibility();
    }
  };

  const handleReset = () => {
    setEvaluation(null);
    setStep(1);
  };

  const bmiValue = calculateBMI();

  return (
    <div className="card" style={{ padding: '32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '24px', borderBottom: '1px solid #E2E8F0', paddingBottom: '18px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={24} color="#E30613" />
            <h3 style={{ margin: 0, fontSize: '22px', color: '#0F172A', fontWeight: '800' }}>
              Red Cross Clinical Pre-Screening
            </h3>
          </div>
          <p style={{ color: '#64748B', fontSize: '14px', margin: '4px 0 0' }}>
            Official WHO & Red Cross blood donor qualification wizard
          </p>
        </div>

        {!evaluation && (
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {[1, 2, 3].map(s => (
              <div
                key={s}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: step === s ? '#E30613' : step > s ? '#DCFCE7' : '#F1F5F9',
                  color: step === s ? '#FFFFFF' : step > s ? '#15803D' : '#64748B',
                  fontWeight: '800',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: step === s ? '2px solid #9F1239' : 'none'
                }}
              >
                {s}
              </div>
            ))}
          </div>
        )}
      </div>

      {!evaluation ? (
        <div>
          {/* STEP 1: PHYSICAL VITALS */}
          {step === 1 && (
            <div>
              <div className="section-label" style={{ marginBottom: '16px' }}>
                <User size={14} /> Step 1: Vitals & Donation History
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '18px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '13px', color: '#334155' }}>
                    Donor Age (Years)
                  </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={e => setFormData({ ...formData, age: e.target.value })}
                    placeholder="e.g. 25"
                    required
                  />
                  <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>Eligible range: 18 - 65 yrs</div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '13px', color: '#334155' }}>
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={formData.weightKg}
                    onChange={e => setFormData({ ...formData, weightKg: e.target.value })}
                    placeholder="e.g. 65"
                    required
                  />
                  <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>Minimum requirement: 50 kg</div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '13px', color: '#334155' }}>
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    value={formData.heightCm}
                    onChange={e => setFormData({ ...formData, heightCm: e.target.value })}
                    placeholder="e.g. 170"
                    required
                  />
                  <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>Calculates BMI for fluid safety</div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '13px', color: '#334155' }}>
                    Gender
                  </label>
                  <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              {bmiValue && (
                <div style={{ background: '#E0F2FE', border: '1px solid #BAE6FD', color: '#0369A1', padding: '12px 16px', borderRadius: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '700' }}>
                  <Activity size={18} /> Calculated Body Mass Index (BMI): {bmiValue}
                </div>
              )}

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', fontSize: '13px', color: '#334155' }}>
                  Date of Last Whole Blood Donation (Leave blank if first-time donor)
                </label>
                <input
                  type="date"
                  value={formData.lastDonationDate}
                  onChange={e => setFormData({ ...formData, lastDonationDate: e.target.value })}
                />
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
                  Standard minimum waiting interval between whole blood donations is 56 days (8 weeks).
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: HEALTH STATUS TODAY */}
          {step === 2 && (
            <div>
              <div className="section-label" style={{ marginBottom: '16px' }}>
                <Heart size={14} /> Step 2: Current Health Status
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '24px' }}>
                <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <label style={{ display: 'block', fontWeight: '700', fontSize: '14px', color: '#0F172A', marginBottom: '8px' }}>
                    1. Are you currently feeling healthy, well, and fully rested today?
                  </label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: '600' }}>
                      <input type="radio" name="q_feelingHealthy" value="yes" checked={formData.q_feelingHealthy === 'yes'} onChange={e => setFormData({ ...formData, q_feelingHealthy: e.target.value })} /> Yes, I feel well
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: '600' }}>
                      <input type="radio" name="q_feelingHealthy" value="no" checked={formData.q_feelingHealthy === 'no'} onChange={e => setFormData({ ...formData, q_feelingHealthy: e.target.value })} /> No, I feel unwell / fatigued
                    </label>
                  </div>
                </div>

                <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <label style={{ display: 'block', fontWeight: '700', fontSize: '14px', color: '#0F172A', marginBottom: '8px' }}>
                    2. Have you experienced fever, sore throat, cough, or active infection in the past 14 days?
                  </label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: '600' }}>
                      <input type="radio" name="q_recentFever" value="no" checked={formData.q_recentFever === 'no'} onChange={e => setFormData({ ...formData, q_recentFever: e.target.value })} /> No
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: '600' }}>
                      <input type="radio" name="q_recentFever" value="yes" checked={formData.q_recentFever === 'yes'} onChange={e => setFormData({ ...formData, q_recentFever: e.target.value })} /> Yes
                    </label>
                  </div>
                </div>

                <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <label style={{ display: 'block', fontWeight: '700', fontSize: '14px', color: '#0F172A', marginBottom: '8px' }}>
                    3. Have you taken any oral or IV antibiotics or antiviral medications in the past 14 days?
                  </label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: '600' }}>
                      <input type="radio" name="q_takingAntibiotics" value="no" checked={formData.q_takingAntibiotics === 'no'} onChange={e => setFormData({ ...formData, q_takingAntibiotics: e.target.value })} /> No
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: '600' }}>
                      <input type="radio" name="q_takingAntibiotics" value="yes" checked={formData.q_takingAntibiotics === 'yes'} onChange={e => setFormData({ ...formData, q_takingAntibiotics: e.target.value })} /> Yes
                    </label>
                  </div>
                </div>

                <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <label style={{ display: 'block', fontWeight: '700', fontSize: '14px', color: '#0F172A', marginBottom: '8px' }}>
                    4. Have you had tooth extraction or minor dental surgery in the past 7 days?
                  </label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: '600' }}>
                      <input type="radio" name="q_recentDental" value="no" checked={formData.q_recentDental === 'no'} onChange={e => setFormData({ ...formData, q_recentDental: e.target.value })} /> No
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: '600' }}>
                      <input type="radio" name="q_recentDental" value="yes" checked={formData.q_recentDental === 'yes'} onChange={e => setFormData({ ...formData, q_recentDental: e.target.value })} /> Yes
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: MEDICAL HISTORY & TRAVEL */}
          {step === 3 && (
            <div>
              <div className="section-label" style={{ marginBottom: '16px' }}>
                <FileText size={14} /> Step 3: Medical Interventions & Travel
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '24px' }}>
                <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <label style={{ display: 'block', fontWeight: '700', fontSize: '14px', color: '#0F172A', marginBottom: '8px' }}>
                    1. Have you undergone major surgery or endoscopy in the past 6 months?
                  </label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: '600' }}>
                      <input type="radio" name="q_majorSurgery" value="no" checked={formData.q_majorSurgery === 'no'} onChange={e => setFormData({ ...formData, q_majorSurgery: e.target.value })} /> No
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: '600' }}>
                      <input type="radio" name="q_majorSurgery" value="yes" checked={formData.q_majorSurgery === 'yes'} onChange={e => setFormData({ ...formData, q_majorSurgery: e.target.value })} /> Yes
                    </label>
                  </div>
                </div>

                <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <label style={{ display: 'block', fontWeight: '700', fontSize: '14px', color: '#0F172A', marginBottom: '8px' }}>
                    2. Have you received any blood transfusion or organ transplant in the past 12 months?
                  </label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: '600' }}>
                      <input type="radio" name="q_bloodTransfusion" value="no" checked={formData.q_bloodTransfusion === 'no'} onChange={e => setFormData({ ...formData, q_bloodTransfusion: e.target.value })} /> No
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: '600' }}>
                      <input type="radio" name="q_bloodTransfusion" value="yes" checked={formData.q_bloodTransfusion === 'yes'} onChange={e => setFormData({ ...formData, q_bloodTransfusion: e.target.value })} /> Yes
                    </label>
                  </div>
                </div>

                <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <label style={{ display: 'block', fontWeight: '700', fontSize: '14px', color: '#0F172A', marginBottom: '8px' }}>
                    3. Have you received permanent tattoos, body piercings, acupuncture, or microblading in the past 6 months?
                  </label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: '600' }}>
                      <input type="radio" name="q_tattooPiercing" value="no" checked={formData.q_tattooPiercing === 'no'} onChange={e => setFormData({ ...formData, q_tattooPiercing: e.target.value })} /> No
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: '600' }}>
                      <input type="radio" name="q_tattooPiercing" value="yes" checked={formData.q_tattooPiercing === 'yes'} onChange={e => setFormData({ ...formData, q_tattooPiercing: e.target.value })} /> Yes
                    </label>
                  </div>
                </div>

                <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <label style={{ display: 'block', fontWeight: '700', fontSize: '14px', color: '#0F172A', marginBottom: '8px' }}>
                    4. Have you traveled to malaria or dengue endemic tropical regions in the past 12 months?
                  </label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: '600' }}>
                      <input type="radio" name="q_malariaTravel" value="no" checked={formData.q_malariaTravel === 'no'} onChange={e => setFormData({ ...formData, q_malariaTravel: e.target.value })} /> No
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: '600' }}>
                      <input type="radio" name="q_malariaTravel" value="yes" checked={formData.q_malariaTravel === 'yes'} onChange={e => setFormData({ ...formData, q_malariaTravel: e.target.value })} /> Yes
                    </label>
                  </div>
                </div>

                {formData.gender === 'female' && (
                  <div style={{ background: '#FFF1F2', padding: '16px', borderRadius: '12px', border: '1px solid #FECDD3' }}>
                    <label style={{ display: 'block', fontWeight: '700', fontSize: '14px', color: '#BE123C', marginBottom: '8px' }}>
                      5. Are you currently pregnant, gave birth, or currently breastfeeding in the past 6 months?
                    </label>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: '600' }}>
                        <input type="radio" name="q_pregnancyLactation" value="no" checked={formData.q_pregnancyLactation === 'no'} onChange={e => setFormData({ ...formData, q_pregnancyLactation: e.target.value })} /> No
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: '600' }}>
                        <input type="radio" name="q_pregnancyLactation" value="yes" checked={formData.q_pregnancyLactation === 'yes'} onChange={e => setFormData({ ...formData, q_pregnancyLactation: e.target.value })} /> Yes
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
            {step > 1 ? (
              <button type="button" onClick={() => setStep(step - 1)} className="secondary-btn">
                <ArrowLeft size={16} /> Back
              </button>
            ) : <div />}

            <button type="button" onClick={handleNextStep} className="primary-btn" style={{ padding: '12px 28px' }}>
              {step === 3 ? (
                <><Sparkles size={16} /> Evaluate Clinical Qualification</>
              ) : (
                <>Next Section <ArrowRight size={16} /></>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* EVALUATION RESULT DISPLAY */
        <div>
          {evaluation.passed ? (
            <div style={{
              background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
              border: '2px solid #4ADE80',
              borderRadius: '20px',
              padding: '32px',
              textAlign: 'center',
              boxShadow: '0 8px 24px rgba(34, 197, 94, 0.15)'
            }}>
              <div style={{
                background: '#22C55E',
                color: '#FFF',
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: '0 6px 20px rgba(34, 197, 94, 0.4)'
              }}>
                <Award size={36} />
              </div>
              <span className="badge badge-success" style={{ fontSize: '13px', marginBottom: '8px' }}>
                <CheckCircle2 size={14} /> CLINICAL PRE-SCREENING PASSED
              </span>
              <h2 style={{ margin: '8px 0 12px', color: '#14532D', fontSize: '26px', fontWeight: '800' }}>
                You Are Eligible To Donate Blood!
              </h2>
              <p style={{ color: '#166534', fontSize: '15px', maxWidth: '600px', margin: '0 auto 24px', lineHeight: 1.6 }}>
                Based on Red Cross and WHO clinical standards, your vital statistics and medical history qualify for voluntary blood donation.
              </p>

              {/* Screening Digital Pass Card */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #BBF7D0',
                padding: '20px',
                maxWidth: '480px',
                margin: '0 auto 24px',
                textAlign: 'left',
                boxShadow: '0 4px 14px rgba(0,0,0,0.05)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #CBD5E1', paddingBottom: '12px', marginBottom: '12px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', fontWeight: '700' }}>Pre-Screening Pass Code</span>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A' }}>{evaluation.refCode}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', fontWeight: '700' }}>Issued Date</span>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#15803D' }}>{evaluation.evaluatedAt}</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px' }}>
                  <div><strong>Age:</strong> {formData.age} yrs</div>
                  <div><strong>Weight:</strong> {formData.weightKg} kg</div>
                  <div><strong>Calculated BMI:</strong> {evaluation.bmi}</div>
                  <div><strong>Status:</strong> Qualified Donor</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button onClick={handleReset} className="secondary-btn">
                  <RefreshCw size={16} /> Retake Screening Test
                </button>
              </div>
            </div>
          ) : (
            <div style={{
              background: '#FFF1F2',
              border: '2px solid #FECDD3',
              borderRadius: '20px',
              padding: '32px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <AlertTriangle size={32} color="#BE123C" />
                <div>
                  <h3 style={{ margin: 0, color: '#9F1239', fontSize: '22px', fontWeight: '800' }}>
                    Temporary Donation Deferral Active
                  </h3>
                  <span style={{ fontSize: '13px', color: '#BE123C', fontWeight: '600' }}>
                    {evaluation.deferrals.length} Clinical Criteria Require Further Medical Review
                  </span>
                </div>
              </div>

              <p style={{ color: '#475569', fontSize: '14px', lineHeight: 1.6, marginBottom: '20px' }}>
                For donor safety and recipient transfusion guidelines, your pre-screening triggered the following clinical waiting periods:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                {evaluation.deferrals.map((def, idx) => (
                  <div key={idx} style={{ background: '#FFFFFF', padding: '14px 18px', borderRadius: '12px', border: '1px solid #FECDD3', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ background: '#FFE4E6', color: '#BE123C', fontWeight: '800', fontSize: '12px', padding: '2px 8px', borderRadius: '6px', flexShrink: 0, marginTop: '2px' }}>
                      {def.rule}
                    </div>
                    <div style={{ fontSize: '14px', color: '#334155', fontWeight: '500' }}>
                      {def.reason}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '16px', border: '1px solid #E2E8F0', fontSize: '13px', color: '#64748B', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Info size={20} color="#0284C7" style={{ flexShrink: 0 }} />
                <div>
                  Most deferrals are temporary. You may retake this screening test after the waiting period elapses or consult with a physician at a local blood bank.
                </div>
              </div>

              <button onClick={handleReset} className="secondary-btn">
                <RefreshCw size={16} /> Retake Screening
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
