const STORAGE_KEY = 'waterMeterReadings';

export const saveReading = (month, year, data) => {
  try {
    const existingData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const key = `${year}-${month.toString().padStart(2, '0')}`;
    existingData[key] = data;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existingData));
    return true;
  } catch (error) {
    console.error('Error saving reading:', error);
    return false;
  }
};

export const getReadings = (month, year) => {
  try {
    const existingData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const key = `${year}-${month.toString().padStart(2, '0')}`;
    return existingData[key] || null;
  } catch (error) {
    console.error('Error getting reading:', error);
    return null;
  }
};

export const getAllReadings = () => {
  try {
    const existingData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return Object.values(existingData);
  } catch (error) {
    console.error('Error getting all readings:', error);
    return [];
  }
};

export const deleteReading = (month, year) => {
  try {
    const existingData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const key = `${year}-${month.toString().padStart(2, '0')}`;
    delete existingData[key];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existingData));
    return true;
  } catch (error) {
    console.error('Error deleting reading:', error);
    return false;
  }
};

export const clearAllReadings = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing readings:', error);
    return false;
  }
};