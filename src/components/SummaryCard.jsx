import React from 'react';
import { motion } from 'framer-motion';
import { Calculator, DollarSign, Droplets } from 'lucide-react';

const SummaryCard = ({ summary }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Calculator className="text-indigo-600" />
        Calculation Summary
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-blue-50 p-4 rounded-lg text-center"
        >
          <Droplets className="mx-auto text-blue-600 mb-2" size={24} />
          <p className="text-sm text-blue-600 font-medium">Total Consumption</p>
          <p className="text-2xl font-bold text-blue-800">{summary.totalConsumption} L</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-green-50 p-4 rounded-lg text-center"
        >
          <DollarSign className="mx-auto text-green-600 mb-2" size={24} />
          <p className="text-sm text-green-600 font-medium">Cost per Litre</p>
          <p className="text-2xl font-bold text-green-800">₹{summary.costPerLitre.toFixed(4)}</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-purple-50 p-4 rounded-lg text-center"
        >
          <Calculator className="mx-auto text-purple-600 mb-2" size={24} />
          <p className="text-sm text-purple-600 font-medium">Total Flats</p>
          <p className="text-2xl font-bold text-purple-800">{Object.keys(summary.flatCharges).length}</p>
        </motion.div>
      </div>
      
      <div>
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Individual Flat Charges</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(summary.flatCharges).map(([flat, charge], index) => (
            <motion.div
              key={flat}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-gray-50 p-3 rounded-lg flex justify-between items-center"
            >
              <span className="font-medium text-gray-700">{flat}</span>
              <span className="font-bold text-indigo-600">₹{charge.toFixed(2)}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;