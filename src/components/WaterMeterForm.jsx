import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, History, Calculator } from 'lucide-react';
import FlatCard from './FlatCard';
import SummaryCard from './SummaryCard';
import { saveReading, getReadings } from '../utils/storage';
import { calculateTotals, calculateFlatCharges } from '../utils/calculations';

const FLATS = ['G01', 'G01 SOLAR', '101', '101 SOLAR', '201', '301', '202', '302', 'COMMON'];

const WaterMeterForm = () => {
  const navigate = useNavigate();
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [totalAmount, setTotalAmount] = useState('');
  const [readings, setReadings] = useState({});
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    loadPreviousReadings();
  }, [month, year]);

  const loadPreviousReadings = () => {
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const prevData = getReadings(prevMonth, prevYear);
    
    const newReadings = {};
    FLATS.forEach(flat => {
      newReadings[flat] = {
        previous: prevData?.readings?.[flat]?.current || '',
        current: ''
      };
    });
    setReadings(newReadings);
  };

  const handleReadingChange = (flat, type, value) => {
    setReadings(prev => ({
      ...prev,
      [flat]: {
        ...prev[flat],
        [type]: value
      }
    }));
  };

  const calculateSummary = () => {
    const totals = calculateTotals(readings);
    const costPerLitre = totalAmount ? parseFloat(totalAmount) / totals.totalConsumption : 0;
    const flatCharges = calculateFlatCharges(readings, costPerLitre);
    
    setSummary({
      totalConsumption: totals.totalConsumption,
      costPerLitre: costPerLitre,
      flatCharges: flatCharges
    });
  };

  const handleSave = () => {
    if (!totalAmount) {
      alert('Please enter total amount paid');
      return;
    }
    
    const data = {
      month,
      year,
      totalAmount: parseFloat(totalAmount),
      readings,
      summary
    };
    
    saveReading(month, year, data);
    alert('Data saved successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
            <select 
              value={month} 
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {Array.from({length: 12}, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-24"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount (₹)</label>
            <input
              type="number"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              placeholder="Enter total amount"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-40"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={calculateSummary}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Calculator size={16} />
            Calculate
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Save size={16} />
            Save
          </button>
          <button
            onClick={() => navigate('/history')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <History size={16} />
            History
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {FLATS.map((flat, index) => (
          <motion.div
            key={flat}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <FlatCard
              flat={flat}
              readings={readings[flat] || { previous: '', current: '' }}
              onChange={(type, value) => handleReadingChange(flat, type, value)}
            />
          </motion.div>
        ))}
      </div>

      {summary && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-8"
        >
          <SummaryCard summary={summary} />
        </motion.div>
      )}
    </div>
  );
};

export default WaterMeterForm;