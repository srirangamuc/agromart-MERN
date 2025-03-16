import React, { useEffect, useState } from "react";
import { Pie, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { adminService } from "../../services/adminServices"; // Import service

ChartJS.register(ArcElement, Tooltip, Legend);

const COLORS = ["#FF5733", "#FFA233", "#FFD133", "#8BC34A", "#4CAF50"]; // Warm to Cool Colors

// Chart Plugin to Display Average in Center
const centerTextPlugin = {
  id: "centerText",
  beforeDraw: (chart) => {
    const { width, height, ctx } = chart;
    ctx.restore();
    const fontSize = (height / 114).toFixed(2);
    ctx.font = `${fontSize}em sans-serif`;
    ctx.textBaseline = "middle";

    const text = chart.config.options.plugins.centerText.text;
    const textX = Math.round((width - ctx.measureText(text).width) / 2);
    const textY = height / 2;
    
    ctx.fillStyle = "#333"; // Dark gray for visibility
    ctx.fillText(text, textX, textY);
    ctx.save();
  },
};

const RatingsDonutChart = ({ title, ratings, average }) => {
  if (!ratings) return <p>Loading {title}...</p>;
  const formattedAverage = !isNaN(Number(average)) ? Number(average).toFixed(1) : "N/A";

  const data = {
    labels: Object.keys(ratings),
    datasets: [
      {
        data: Object.values(ratings),
        backgroundColor: COLORS.slice(0, Object.keys(ratings).length),
        hoverBackgroundColor: COLORS.slice(0, Object.keys(ratings).length),
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    cutout: "70%", // Creates the donut effect
    plugins: {
      legend: {
        position: "bottom",
        labels: { font: { size: 14 } },
      },
      centerText: {
        text: formattedAverage,
      },
    },
  };

  return (
    <div className="flex flex-col items-center w-72">
      <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
      <div className="relative w-64 h-64">
        <Doughnut data={data} options={options} plugins={[centerTextPlugin]} />
      </div>
    </div>
  );
};

const RatingsDashboard = () => {
  const [ratingsData, setRatingsData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await adminService.fetchRatingsData();
        setRatingsData(data);
      } catch (error) {
        console.error("Error fetching ratings data:", error);
      }
    };
    fetchData();
  }, []);

  if (!ratingsData) return <p className="text-center text-gray-500">Loading ratings data...</p>;

  return (
    <div className="flex flex-wrap justify-center gap-12 p-6 bg-gray-100 rounded-lg shadow-md">
      <RatingsDonutChart title="Vendor Ratings" ratings={ratingsData.vendorRatings} average={ratingsData.vendorAvg} />
      <RatingsDonutChart title="Delivery Ratings" ratings={ratingsData.deliveryRatings} average={ratingsData.deliveryAvg} />
    </div>
  );
};

export default RatingsDashboard;
