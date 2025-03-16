import { useEffect, useState } from "react";
import { adminService } from "../../services/adminServices";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const VendorDetails = ({ vendorId }) => {
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendorDetails = async () => {
      try {
        const data = await adminService.getVendorDetails(vendorId);
        console.log(data);
        setVendor(data);
      } catch (error) {
        console.error("Error fetching vendor details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVendorDetails();
  }, [vendorId]);

  if (loading) return <p className="text-center text-gray-600">Loading vendor details...</p>;
  if (!vendor) return <p className="text-center text-red-500">Vendor not found</p>;

  // Extract data for Stock Chart
  const stockLabels = vendor.vendorStock.map((item) => item.itemName);
  const stockData = vendor.vendorStock.map((item) => item.quantity);

  // Extract data for Profit Chart
  const profitLabels = vendor.vendorProfit.map((item) => item.itemName);
  const profitData = vendor.vendorProfit.map((item) => item.totalProfit);

  // Stock Chart Data
  const stockChartData = {
    labels: stockLabels,
    datasets: [
      {
        label: "Stock (kg)",
        data: stockData,
        backgroundColor: "#4CAF50",
        borderColor: "#388E3C",
        borderWidth: 1,
      },
    ],
  };

  // Profit Chart Data
  const profitChartData = {
    labels: profitLabels,
    datasets: [
      {
        label: "Profit (₹)",
        data: profitData,
        backgroundColor: "#FFA726",
        borderColor: "#F57C00",
        borderWidth: 1,
      },
    ],
  };

  // Chart.js Options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg space-y-6">
    {/* Vendor Details */}
    <div className="text-center">
      <h3 className="text-2xl font-bold text-gray-700">{vendor.vendorDetails.name}</h3>
      <p className="text-gray-600 text-lg">Rating: {vendor.vendorDetails.rating} / 5</p>
      <p className="text-gray-500 text-sm">Total Ratings: {vendor.vendorDetails.numberOfRatings}</p>
    </div>

    {/* Charts Section */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Stock Chart */}
      <div className="bg-gray-50 p-5 rounded-lg shadow-md">
        <h4 className="text-lg font-semibold text-gray-800 text-center mb-4">Stock Overview</h4>
        <Bar 
          data={stockChartData} 
          options={{ 
            ...chartOptions, 
            plugins: { 
              ...chartOptions.plugins, 
              title: { display: true, text: "Stock Levels" } 
            } 
          }} 
        />
      </div>

      {/* Profit Chart */}
      <div className="bg-gray-50 p-5 rounded-lg shadow-md">
        <h4 className="text-lg font-semibold text-gray-800 text-center mb-4">Profit Overview</h4>
        <Bar 
          data={profitChartData} 
          options={{ 
            ...chartOptions, 
            plugins: { 
              ...chartOptions.plugins, 
              title: { display: true, text: "Total Profit" } 
            } 
          }} 
        />
      </div>
    </div>
  </div>
  );
};

export default VendorDetails;
