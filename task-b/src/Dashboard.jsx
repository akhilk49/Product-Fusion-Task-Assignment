import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

// Mock API for sales data
const fetchSalesData = async (startDate, endDate, category) => {
  // Simulating API request delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Generate mock data based on parameters
  const startTimestamp = startDate ? new Date(startDate).getTime() : new Date('2023-01-01').getTime();
  const endTimestamp = endDate ? new Date(endDate).getTime() : new Date().getTime();
  
  const days = Math.floor((endTimestamp - startTimestamp) / (1000 * 60 * 60 * 24));
  const data = [];
  
  const categories = ['Electronics', 'Clothing', 'Food', 'Books'];
  const selectedCategories = category ? [category] : categories;
  
  for (let i = 0; i <= days; i++) {
    const date = new Date(startTimestamp + i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    
    const dataPoint = { date: dateStr };
    
    selectedCategories.forEach(cat => {
      // Generate consistent but semi-random sales values based on date and category
      const baseValue = (date.getDay() + 1) * 100; // Higher sales on weekends
      const multiplier = categories.indexOf(cat) + 1;
      const randomFactor = ((date.getDate() + categories.indexOf(cat)) % 3) * 0.2 + 0.8;
      
      dataPoint[cat] = Math.round(baseValue * multiplier * randomFactor);
    });
    
    data.push(dataPoint);
  }
  
  return data;
};

const Dashboard = () => {
  const [salesData, setSalesData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [startDate, setStartDate] = useState('2023-01-01');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    fetchSalesData(startDate, endDate, selectedCategory)
      .then(data => {
        setSalesData(data);
        setFilteredData(data);
        const uniqueCategories = [...new Set(data.flatMap(item => Object.keys(item).filter(key => key !== 'date')))];
        setCategories(uniqueCategories);
        setIsLoading(false);
      })
      .catch(err => {
        setError('Failed to load sales data');
        setIsLoading(false);
        console.error(err);
      });
  }, [startDate, endDate, selectedCategory]);

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };

  const renderChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={filteredData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        {categories.map(category => (
          <Line key={category} type="monotone" dataKey={category} stroke="#8884d8" />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );

  const renderTable = () => (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Date</th>
            {categories.map(category => (
              <th key={category}>{category}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredData.map((dataPoint, index) => (
            <tr key={index}>
              <td>{dataPoint.date}</td>
              {categories.map(category => (
                <td key={category}>{dataPoint[category]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderSummary = () => (
    <div className="summary-container">
      {categories.map(category => {
        const totalSales = filteredData.reduce((sum, dataPoint) => sum + (dataPoint[category] || 0), 0);
        return (
          <div className="summary-card" key={category}>
            <h3>{category}</h3>
            <p>${totalSales.toFixed(2)}</p>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="dashboard-container">
      <h1>Sales Dashboard</h1>
      <div className="filters-container">
        <input type="date" value={startDate} onChange={handleStartDateChange} />
        <input type="date" value={endDate} onChange={handleEndDateChange} />
        <select value={selectedCategory} onChange={handleCategoryChange}>
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>
      {isLoading && <div className="loading">Loading...</div>}
      {error && <div className="error">{error}</div>}
      {!isLoading && !error && (
        <>
          {renderChart()}
          {renderTable()}
          {renderSummary()}
        </>
      )}
    </div>
  );
};

export default Dashboard;
