export function isNonEmpty(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
}

export function validateName(value) {
  return isNonEmpty(value) && value.trim().length >= 2;
}

export function validateEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function validatePassword(value) {
  return value.length >= 6;
}

export function validatePhone(value) {
  return /^\+?[0-9\s\-()]{7,15}$/.test(value.trim());
}

export function validateNumber(value, min = 0) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue >= min;
}

export function validateDateNotFuture(value) {
  if (!isNonEmpty(value)) return false;
  const selectedDate = new Date(value);
  const today = new Date();
  selectedDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return selectedDate <= today;
}

export function validateMinimumAge(value, minAge = 18) {
  if (!isNonEmpty(value)) return false;
  const birthDate = new Date(value);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age >= minAge;
}
