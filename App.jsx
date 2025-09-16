import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import WaterMeterForm from './components/WaterMeterForm';
import HistoryView from './components/HistoryView';
import { motion } from 'framer-motion';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="container mx-auto px-4 py-8 max-w-7xl"
        >
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-indigo-900 mb-2">Water Meter Reading</h1>
            <p className="text-indigo-600">Residential Complex Management System</p>
          </header>
          
          <Routes>
            <Route path="/" element={<WaterMeterForm />} />
            <Route path="/history" element={<HistoryView />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </motion.div>
      </div>
    </Router>
  );
}

export default App;