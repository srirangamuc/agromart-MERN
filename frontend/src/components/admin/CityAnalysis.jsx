import React, { useEffect, useState } from "react";
import { adminService } from "../../services/adminServices";
import { Bar, Pie, Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

const UserStatsGraphs = () => {
  const [userData, setUserData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await adminService.fetchUserCountsByCity();
        setUserData(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchData();
  }, []);
  // console.log(userData)
  const cities = userData.map(entry => entry._id || "Unknown");
  const vendors = userData.map(entry => entry.vendors);
  const customers = userData.map(entry => entry.customers);
  const distributors = userData.map(entry => entry.distributors);

  const barChartData = {
    labels: cities,
    datasets: [
      { label: "Vendors", data: vendors, backgroundColor: "rgba(255, 99, 132, 0.7)" },
      { label: "Customers", data: customers, backgroundColor: "rgba(54, 162, 235, 0.7)" },
      { label: "Distributors", data: distributors, backgroundColor: "rgba(255, 206, 86, 0.7)" },
    ],
  };

  const totalVendors = vendors.reduce((a, b) => a + b, 0);
  const totalCustomers = customers.reduce((a, b) => a + b, 0);
  const totalDistributors = distributors.reduce((a, b) => a + b, 0);
  
  const pieChartData = {
    labels: ["Vendors", "Customers", "Distributors"],
    datasets: [
      {
        data: [totalVendors, totalCustomers, totalDistributors],
        backgroundColor: ["#ff6384", "#36a2eb", "#ffce56"],
      },
    ],
  };



  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-gray-100">
      <h2 className="text-3xl font-semibold text-gray-800 mb-6 bg-white px-4 py-2 rounded-lg shadow-md">
        Admin Dashboard - User Stats
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full px-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-medium text-gray-700 mb-4">User Distribution</h3>
          <Pie data={pieChartData} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md col-span-2">
          <h3 className="text-xl font-medium text-gray-700 mb-4">Users by City</h3>
          <Bar data={barChartData} />
        </div>
        
      </div>
    </div>
  );
};

export default UserStatsGraphs;
