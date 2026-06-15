export const validateEmail = email => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return 'Email is required';
  if (!emailRegex.test(email)) return 'Please enter a valid email address';
  return null;
};

export const validatePassword = password => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/(?=.*[a-z])/.test(password)) 
    return 'Password must contain a lowercase letter';
  if (!/(?=.*[A-Z])/.test(password)) 
    return 'Password must contain an uppercase letter';
  if (!/(?=.*[0-9])/.test(password)) 
    return 'Password must contain a number';
  return null;
};

export const validateDisplayName = name => {
  if (!name) return 'Display name is required';
  if (name.length < 2) return 'Name must be at least 2 characters';
  if (name.length > 30) return 'Name must be less than 30 characters';
  return null;
};

export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) return 'Please confirm your password';
  if (password !== confirmPassword) return 'Passwords do not match';
  return null;
};