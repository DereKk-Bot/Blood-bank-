export const RBC_COMPATIBILITY = {
  'O-': { canDonateTo: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], canReceiveFrom: ['O-'] },
  'O+': { canDonateTo: ['O+', 'A+', 'B+', 'AB+'], canReceiveFrom: ['O-', 'O+'] },
  'A-': { canDonateTo: ['A-', 'A+', 'AB-', 'AB+'], canReceiveFrom: ['O-', 'A-'] },
  'A+': { canDonateTo: ['A+', 'AB+'], canReceiveFrom: ['O-', 'O+', 'A-', 'A+'] },
  'B-': { canDonateTo: ['B-', 'B+', 'AB-', 'AB+'], canReceiveFrom: ['O-', 'B-'] },
  'B+': { canDonateTo: ['B+', 'AB+'], canReceiveFrom: ['O-', 'O+', 'B-', 'B+'] },
  'AB-': { canDonateTo: ['AB-', 'AB+'], canReceiveFrom: ['O-', 'A-', 'B-', 'AB-'] },
  'AB+': { canDonateTo: ['AB+'], canReceiveFrom: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'] },
};

export const PLASMA_COMPATIBILITY = {
  'O': { canDonateTo: ['O'], canReceiveFrom: ['O', 'A', 'B', 'AB'] },
  'A': { canDonateTo: ['A', 'O'], canReceiveFrom: ['A', 'AB'] },
  'B': { canDonateTo: ['B', 'O'], canReceiveFrom: ['B', 'AB'] },
  'AB': { canDonateTo: ['AB', 'A', 'B', 'O'], canReceiveFrom: ['AB'] },
};

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
export const BLOOD_COMPONENTS = ['Whole Blood', 'Packed RBC', 'Plasma', 'Platelets'];

export function isRBCCompatible(donorGroup, recipientGroup) {
  if (!RBC_COMPATIBILITY[donorGroup]) return false;
  return RBC_COMPATIBILITY[donorGroup].canDonateTo.includes(recipientGroup);
}

export function isBloodCompatible(donorGroup, recipientGroup) {
  return isRBCCompatible(donorGroup, recipientGroup);
}

export function getBagExpirationStatus(expirationDateString) {
  if (!expirationDateString) return 'UNKNOWN';

  const expDate = new Date(expirationDateString);
  const today = new Date();

  const normalizedExpDate = new Date(expDate.getFullYear(), expDate.getMonth(), expDate.getDate());
  const normalizedToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const diffTime = normalizedExpDate - normalizedToday;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'EXPIRED';
  if (diffDays <= 0) return 'EXPIRED';
  if (diffDays <= 7) return 'EXPIRING_SOON';
  return 'AVAILABLE';
}

export function checkDonorEligibility(lastDonationDateString, configuredDays = 56) {
  if (!lastDonationDateString) return { eligible: true, daysRemaining: 0, reason: 'No prior donation record' };
  const lastDate = new Date(lastDonationDateString);
  const today = new Date();
  const diffTime = today - lastDate;
  const daysSince = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  if (daysSince >= configuredDays) return { eligible: true, daysRemaining: 0, daysSince };
  return { 
    eligible: false, 
    daysRemaining: configuredDays - daysSince, 
    daysSince,
    reason: `Donated ${daysSince} days ago. Standard minimum donation interval is ${configuredDays} days (8 weeks).`
  };
}
