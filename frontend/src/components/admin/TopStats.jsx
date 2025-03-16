import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { adminService } from "../../services/adminServices";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TopStats = () => {
  const [topVendors, setTopVendors] = useState([]);
  const [topItems, setTopItems] = useState([]);

  useEffect(() => {
    adminService.fetchTopVendorEachYear()
      .then((data) => setTopVendors(data))
      .catch((error) => console.error('Error fetching top vendors:', error));

    adminService.fetchTopItemEachYear()
      .then((data) => setTopItems(data))
      .catch((error) => console.error('Error fetching top items:', error));
  }, []);

 // console.log(topVendors, topItems);

  // Extract unique years and sort them
  const years = [...new Set([...topVendors.map(v => v.year), ...topItems.map(i => i.year)])].sort();

  const vendorProfits = years.map(year => {
    const vendor = topVendors.find(v => v.year === year);
    return vendor ? vendor.totalProfit : 0;
  });

  const vendorNames = years.map(year => {
    const vendor = topVendors.find(v => v.year === year);
    return vendor ? vendor.vendorName : "N/A";
  });

  const itemQuantities = years.map(year => {
    const item = topItems.find(i => i.year === year);
    return item ? item.totalSold : 0;
  });

  const topItemNames = years.map(year => {
    const item = topItems.find(i => i.year === year);
    return item ? item.topItem : "N/A";
  });

  // Chart data for Vendors and Items
  const vendorItemChartData = {
    labels: years,
    datasets: [
      {
        label: 'Top Vendor Profit (INR)',
        data: vendorProfits,
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      }
    ],
  };

  // Chart data for Top Items per Year
  const topItemChartData = {
    labels: years,
    datasets: [
      {
        label: 'Top Items Sold Each Year',
        data: itemQuantities,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Top Vendors and Items Sold Each Year' },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            const yearIndex = tooltipItem.dataIndex;
            return `${vendorNames[yearIndex]}: ₹${tooltipItem.raw.toLocaleString()}`;
          },
        },
      },
    },
  };

  const topItemOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Top Items Sold Each Year' },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return `${topItemNames[tooltipItem.dataIndex]}: ${tooltipItem.raw} kg`;
          },
        },
      },
    },
  };

  return (
    <div className="p-4 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-bold mb-4">Top Stats</h2>
      
      {/* Vendors & Items Sold Chart */}
      <Bar data={vendorItemChartData} options={options} />

      {/* Top Items Sold Chart */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Top Items Sold Each Year</h3>
        <Bar data={topItemChartData} options={topItemOptions} />
      </div>
    </div>
  );
};

export default TopStats;
