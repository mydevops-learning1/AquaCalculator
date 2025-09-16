import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Trash2 } from 'lucide-react';
import { getAllReadings, deleteReading } from '../utils/storage';

const HistoryView = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const allReadings = getAllReadings();
    const sortedHistory = allReadings.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
    setHistory(sortedHistory);
  };

  const handleDelete = (month, year) => {
    if (window.confirm(`Delete record for ${getMonthName(month)} ${year}?`)) {
      deleteReading(month, year);
      loadHistory();
      setSelectedRecord(null);
    }
  };

  const getMonthName = (month) => {
    return new Date(0, month - 1).toLocaleString('default', { month: 'long' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Form
        </button>
        <h2 className="text-2xl font-bold text-indigo-900">Reading History</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar size={20} />
              Saved Records
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {history.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No records found</p>
              ) : (
                history.map((record) => (
                  <motion.div
                    key={`${record.year}-${record.month}`}
                    whileHover={{ scale: 1.02 }}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedRecord?.month === record.month && selectedRecord?.year === record.year
                        ? 'bg-indigo-50 border-indigo-300'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedRecord(record)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-800">
                          {getMonthName(record.month)} {record.year}
                        </p>
                        <p className="text-sm text-gray-600">
                          Total: ₹{record.totalAmount}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(record.month, record.year);
                        }}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedRecord ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                {getMonthName(selectedRecord.month)} {selectedRecord.year} - Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium">Total Amount Paid</p>
                  <p className="text-2xl font-bold text-blue-800">₹{selectedRecord.totalAmount}</p>
                </div>
                {selectedRecord.summary && (
                  <>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-green-600 font-medium">Total Consumption</p>
                      <p className="text-2xl font-bold text-green-800">{selectedRecord.summary.totalConsumption} L</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-sm text-purple-600 font-medium">Cost per Litre</p>
                      <p className="text-2xl font-bold text-purple-800">₹{selectedRecord.summary.costPerLitre.toFixed(4)}</p>
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-800">Flat-wise Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(selectedRecord.readings).map(([flat, reading]) => {
                    const consumption = reading.current - reading.previous;
                    const charge = selectedRecord.summary?.flatCharges?.[flat] || 0;
                    return (
                      <div key={flat} className="bg-gray-50 p-4 rounded-lg">
                        <h5 className="font-medium text-gray-800 mb-2">{flat}</h5>
                        <div className="text-sm space-y-1">
                          <p>Previous: {reading.previous} L</p>
                          <p>Current: {reading.current} L</p>
                          <p className="font-medium text-indigo-600">Consumption: {consumption} L</p>
                          <p className="font-medium text-green-600">Amount: ₹{charge.toFixed(2)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">Select a record to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryView;