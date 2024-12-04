import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminServices';

const CustomerAnalysis = () => {
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const data = await adminService.getCustomerAnalysis();
        setAnalysis(data);
      } catch (err) {
        setError('Failed to fetch customer analysis.');
        console.error(err);
      }
    };

    fetchAnalysis();
  }, []);

  if (error) return <div className="text-red-500">{error}</div>;
  if (!analysis) return <div>Loading customer analysis...</div>;

  return (
    <div className="mb-6">
      <div className="grid grid-cols-3 gap-6">
        <div className="p-4 bg-green-100 rounded-lg text-center">
          <h3 className="font-bold">Pro Plus</h3>
          <p>{analysis.proPlusCount}</p>
        </div>
        <div className="p-4 bg-blue-100 rounded-lg text-center">
          <h3 className="font-bold">Pro</h3>
          <p>{analysis.proCount}</p>
        </div>
        <div className="p-4 bg-gray-100 rounded-lg text-center">
          <h3 className="font-bold">Normal</h3>
          <p>{analysis.normalCount}</p>
        </div>
      </div>
    </div>
  );
};

export default CustomerAnalysis;
