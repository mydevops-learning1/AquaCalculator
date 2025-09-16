import React from 'react';
import { motion } from 'framer-motion';
import { Home, Zap } from 'lucide-react';

const FlatCard = ({ flat, readings, onChange }) => {
  const consumption = readings.current && readings.previous 
    ? readings.current - readings.previous 
    : 0;

  const getCardColor = (flat) => {
    if (flat.includes('SOLAR')) return 'from-yellow-100 to-orange-100 border-yellow-300';
    if (flat === 'COMMON') return 'from-purple-100 to-pink-100 border-purple-300';
    if (flat.startsWith('G')) return 'from-green-100 to-emerald-100 border-green-300';
    return 'from-blue-100 to-indigo-100 border-blue-300';
  };

  const getIcon = (flat) => {
    if (flat.includes('SOLAR')) return <Zap size={20} className="text-yellow-600" />;
    return <Home size={20} className="text-indigo-600" />;
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`bg-gradient-to-br ${getCardColor(flat)} border-2 rounded-lg p-4 shadow-md`}
    >
      <div className="flex items-center gap-2 mb-3">
        {getIcon(flat)}
        <h3 className="font-semibold text-gray-800">{flat}</h3>
      </div>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Previous Reading (L)
          </label>
          <input
            type="number"
            value={readings.previous}
            onChange={(e) => onChange('previous', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
            placeholder="Previous month"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current Reading (L)
          </label>
          <input
            type="number"
            value={readings.current}
            onChange={(e) => onChange('current', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
            placeholder="Current month"
          />
        </div>
        
        {consumption > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white bg-opacity-70 rounded-md p-2 text-center"
          >
            <p className="text-sm font-medium text-gray-700">
              Consumption: <span className="text-indigo-600 font-bold">{consumption} L</span>
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default FlatCard;