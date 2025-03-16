import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, XCircle } from "lucide-react";
import VendorDetails from "./VendorDetails";
import { adminService } from "../../services/adminServices";

const VendorDropdown = () => {
  const [ratedVendors, setRatedVendors] = useState([]);
  const [unratedVendors, setUnratedVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isRatedOpen, setIsRatedOpen] = useState(false);
  const [isUnratedOpen, setIsUnratedOpen] = useState(false);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const { ratedVendors, unratedVendors } =
          await adminService.getRatedAndUnratedVendors();
        setRatedVendors(ratedVendors);
        setUnratedVendors(unratedVendors);
      } catch (error) {
        console.error("Error fetching vendors:", error);
      }
    };

    fetchVendors();
  }, []);

  return (
    <div className="w-full flex flex-col items-center p-6 bg-gray-100">
      {/* Dropdown Container */}
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-2xl p-4">
        <h2 className="text-xl font-semibold text-center text-gray-800 mb-4">
          Vendor Selection
        </h2>

        <div className="flex justify-around items-center space-x-4">
          {/* Rated Vendors Dropdown */}
          <div className="relative w-1/2">
            <button
              className="w-full flex justify-between items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition"
              onClick={() => setIsRatedOpen(!isRatedOpen)}
            >
              Rated Vendors
              {isRatedOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {isRatedOpen && (
              <div className="absolute w-full left-0 mt-2 bg-white shadow-lg rounded-lg z-10">
                {ratedVendors.length > 0 ? (
                  ratedVendors.map((vendor) => (
                    <div
                      key={vendor.id}
                      className="px-4 py-2 hover:bg-blue-100 cursor-pointer text-gray-800"
                      onClick={() => {
                        setSelectedVendor(vendor.id);
                        setIsRatedOpen(false);
                      }}
                    >
                      {vendor.name}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-500">No vendors found</div>
                )}
              </div>
            )}
          </div>

          {/* Unrated Vendors Dropdown */}
          <div className="relative w-1/2">
            <button
              className="w-full flex justify-between items-center px-4 py-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition"
              onClick={() => setIsUnratedOpen(!isUnratedOpen)}
            >
              Unrated Vendors
              {isUnratedOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {isUnratedOpen && (
              <div className="absolute w-full left-0 mt-2 bg-white shadow-lg rounded-lg z-10">
                {unratedVendors.length > 0 ? (
                  unratedVendors.map((vendor) => (
                    <div
                      key={vendor.id}
                      className="px-4 py-2 hover:bg-red-100 cursor-pointer text-gray-800"
                      onClick={() => {
                        setSelectedVendor(vendor.id);
                        setIsUnratedOpen(false);
                      }}
                    >
                      {vendor.name}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-500">No vendors found</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Vendor Details Section */}
      {selectedVendor && (
        <div className="mt-6 w-full max-w-3xl bg-white shadow-lg rounded-2xl p-6 relative">
          <button
            className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
            onClick={() => setSelectedVendor(null)}
          >
            <XCircle size={24} />
          </button>
          <VendorDetails vendorId={selectedVendor} />
        </div>
      )}
    </div>
  );
};

export default VendorDropdown;
