export const calculateTotals = (readings) => {
  let totalConsumption = 0;
  const flatConsumptions = {};
  
  Object.entries(readings).forEach(([flat, reading]) => {
    const previous = parseFloat(reading.previous) || 0;
    const current = parseFloat(reading.current) || 0;
    const consumption = Math.max(0, current - previous);
    
    flatConsumptions[flat] = consumption;
    totalConsumption += consumption;
  });
  
  return {
    totalConsumption,
    flatConsumptions
  };
};

export const calculateFlatCharges = (readings, costPerLitre) => {
  const flatCharges = {};
  
  Object.entries(readings).forEach(([flat, reading]) => {
    const previous = parseFloat(reading.previous) || 0;
    const current = parseFloat(reading.current) || 0;
    const consumption = Math.max(0, current - previous);
    
    flatCharges[flat] = consumption * costPerLitre;
  });
  
  return flatCharges;
};

export const validateReadings = (readings) => {
  const errors = {};
  
  Object.entries(readings).forEach(([flat, reading]) => {
    const previous = parseFloat(reading.previous);
    const current = parseFloat(reading.current);
    
    if (isNaN(previous) || previous < 0) {
      errors[flat] = errors[flat] || [];
      errors[flat].push('Previous reading must be a valid positive number');
    }
    
    if (isNaN(current) || current < 0) {
      errors[flat] = errors[flat] || [];
      errors[flat].push('Current reading must be a valid positive number');
    }
    
    if (!isNaN(previous) && !isNaN(current) && current < previous) {
      errors[flat] = errors[flat] || [];
      errors[flat].push('Current reading cannot be less than previous reading');
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatLitres = (litres) => {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(litres) + ' L';
};