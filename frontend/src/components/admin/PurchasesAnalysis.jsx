import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminServices';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const PurchasesAnalysis = () => {
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const data = await adminService.getPurchasesAnalysis();
        if (!data.itemNames || !data.quantities || data.itemNames.length === 0) {
          throw new Error('No data available for purchases analysis.');
        }
        setAnalysis(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch purchases analysis.');
        console.error(err);
      }
    };

    fetchAnalysis();
  }, []);

  if (error) {
    return (
      <div className="text-red-500 bg-red-100 p-4 rounded-lg shadow">
        {error}
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="text-center p-4 bg-gray-100 rounded-lg shadow">
        Loading purchases analysis...
      </div>
    );
  }

  const data = {
    labels: analysis.itemNames,
    datasets: [
      {
        label: 'Items Sold',
        data: analysis.quantities,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Purchases Analysis',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="container mx-auto my-4">
      <div className="p-4 bg-white rounded-lg shadow">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default PurchasesAnalysis;
