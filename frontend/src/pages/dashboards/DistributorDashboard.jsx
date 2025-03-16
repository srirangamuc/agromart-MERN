import { useEffect, useState } from "react"
import { AlertCircle, CheckCircle, Loader2, Star, Truck, Phone, User, LogOut, Edit, Save, MapPin } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { logout } from "../../redux/authSlice" // Adjust this import path as needed

const DistributorDashboard = () => {
  const[profilePicture, setProfilePicture] = useState(null);
  const [distributor, setDistributor] = useState(null)
  const [available, setAvailable] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [updating, setUpdating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [purchases, setPurchases] = useState([])
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [formData, setFormData] = useState({
    contactPhone: "",
    hno: "",
    street: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
  })
  const [formError, setFormError] = useState("")
  const [formSuccess, setFormSuccess] = useState("")

  const navigate = useNavigate()
  const dispatch = useDispatch()

  // Function to format address object to string
  const formatAddress = (addressObj) => {
    if (!addressObj) return ""
    if (typeof addressObj === "string") return addressObj

    // Handle address as object with address fields
    const { hno, street, city, state, country, zipCode } = addressObj
    const parts = []

    if (hno) parts.push(hno)
    if (street) parts.push(street)
    if (city) parts.push(city)
    if (state) parts.push(state)
    if (country) parts.push(country)
    if (zipCode) parts.push(zipCode)

    return parts.join(", ")
  }

  // Function to parse address from string or object to form fields
  const parseAddressToFormData = (address) => {
    if (!address)
      return {
        hno: "",
        street: "",
        city: "",
        state: "",
        country: "",
        zipCode: "",
      }

    // If address is a string, try to parse it as JSON
    if (typeof address === "string") {
      try {
        const addressObj = JSON.parse(address)
        if (typeof addressObj === "object" && addressObj !== null) {
          return {
            hno: addressObj.hno || "",
            street: addressObj.street || "",
            city: addressObj.city || "",
            state: addressObj.state || "",
            country: addressObj.country || "",
            zipCode: addressObj.zipCode || "",
          }
        }
      // eslint-disable-next-line no-unused-vars
      } catch (e) {
        // If parsing fails, return empty fields
        return {
          hno: "",
          street: "",
          city: "",
          state: "",
          country: "",
          zipCode: "",
        }
      }
    }

    // If address is already an object
    if (typeof address === "object" && address !== null) {
      return {
        hno: address.hno || "",
        street: address.street || "",
        city: address.city || "",
        state: address.state || "",
        country: address.country || "",
        zipCode: address.zipCode || "",
      }
    }

    return {
      hno: "",
      street: "",
      city: "",
      state: "",
      country: "",
      zipCode: "",
    }
  }

  useEffect(() => {
    const fetchDistributor = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/distributor", {
                method: "GET",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch distributor details.");
            }

            const data = await response.json();
            // console.log("Fetched Distributor Data:", data);  // ✅ Debugging log

            setDistributor(data);
            setAvailable(data.available);

            // ✅ Safely check if profilePicture exists inside user
            if (data?.user?.profilePicture) {
                setProfilePicture(`http://localhost:5000${data.user.profilePicture}`);
            } else {
                setProfilePicture(null);
            }
        } catch (err) {
            console.error("Fetch Error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    fetchDistributor();
}, []);





  const handleLogout = () => {
    dispatch(logout())
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    navigate("/login")
  }

  const updateAvailability = async () => {
    try {
      setUpdating(true)
      const response = await fetch("http://localhost:5000/api/distributor/update-availability", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available: !available }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to update availability.")
      }

      setAvailable(!available)
    } catch (err) {
      setError(err.message)
    } finally {
      setUpdating(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleUpdateSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setUpdating(true);
    setFormError("");
    setFormSuccess("");

    try {
        const formDataToSend = new FormData();

        // Append contact phone
        formDataToSend.append("contactPhone", formData.contactPhone);

        // Append address as JSON string
        formDataToSend.append("address", JSON.stringify({
            hno: formData.hno,
            street: formData.street,
            city: formData.city,
            state: formData.state,
            country: formData.country,
            zipCode: formData.zipCode
        }));

        // Append profile picture if selected
        if (profilePicture instanceof File) {
            formDataToSend.append("profilePicture", profilePicture);
        }

        const response = await fetch("http://localhost:5000/api/distributor/update-info", {
            method: "POST",
            credentials: "include",
            body: formDataToSend
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Failed to update distributor details.");
        }

        setFormSuccess("Distributor information updated successfully!");
        
        // Update state with new data
        setDistributor((prev) => ({
            ...prev,
            contactPhone: data.contactPhone,
            address: data.address,
            profilePicture: `http://localhost:5000${data.profilePicture}`
        }));

    } catch (err) {
        setFormError(err.message);
    } finally {
        setUpdating(false);
    }
  };
  


  useEffect(() => {
    const fetchAssignedPurchases = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/distributor/assigned-purchases", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        })

        if (!response.ok) throw new Error("Failed to fetch assigned purchases")

        const data = await response.json()
        console.log("Assigned purchases:", data)
        setPurchases(data)
      } catch (error) {
        console.error("Error fetching assigned purchases:", error)
      }
    }

    fetchAssignedPurchases()
  }, [])

  const updateDeliveryStatus = async (purchaseId, newStatus) => {
    try {
      setUpdatingStatus(true)

      const response = await fetch("http://localhost:5000/api/distributor/update-delivery-status", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purchaseId, status: newStatus }),
      })

      if (!response.ok) throw new Error("Failed to update delivery status")

      setPurchases((prevPurchases) =>
        prevPurchases.map((p) =>
          p._id === purchaseId
            ? { ...p, deliveryStatus: newStatus, status: newStatus === "delivered" ? "completed" : p.status }
            : p,
        ),
      )
    } catch (error) {
      console.error("Error updating delivery status:", error)
    } finally {
      setUpdatingStatus(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
        <p className="mt-4 text-lg text-gray-600">Loading your dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="flex items-center justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-center text-gray-800 mb-2">Error</h1>
          <p className="text-center text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!distributor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-xl font-bold text-center text-gray-800 mb-2">No Data Found</h1>
          <p className="text-center text-gray-600">No distributor data found. Please check your account status.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 p-6 text-white">
            <div className="flex flex-col md:flex-row md:items-center">
              <div className="flex items-center mb-4 md:mb-0">
              <div className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-white mr-4 flex items-center justify-center bg-gray-300">
                {distributor?.profilePicture ? (
                  <img
                    src={`http://localhost:5000${distributor.profilePicture}`} // Ensure correct path
                    alt="Profile"
                    className="h-16 w-16 rounded-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/default-profile.png"; // Fallback to default
                    }}
                  />
                ) : (
                  <User className="h-10 w-10 text-gray-500" />
                )}
              </div>




                <div>
                  <h1 className="text-2xl font-bold">Welcome, {distributor.name}!</h1>
                  <div className="flex flex-col mt-1">
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      <span>{distributor.contactPhone || "No phone number"}</span>
                    </div>
                    {distributor.address && (
                      <div className="flex items-center mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{formatAddress(distributor.address)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="md:ml-auto flex flex-col md:flex-row">
                <div
                  className={`px-4 py-2 rounded-full mb-2 md:mb-0 md:mr-4 text-center ${available ? "bg-green-500" : "bg-gray-500"}`}
                >
                  {available ? "Available" : "Unavailable"}
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            <div className="bg-gray-50 rounded-lg p-4 flex items-center">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <Truck className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Deliveries</p>
                <p className="text-2xl font-bold">{distributor.totalDeliveries}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 flex items-center">
              <div className="bg-yellow-100 p-3 rounded-full mr-4">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Average Rating</p>
                <div className="flex items-center">
                  <p className="text-2xl font-bold">{distributor.averageRating}</p>
                  <p className="ml-1 text-gray-500">/ 5</p>
                </div>
              </div>
            </div>
          </div>

          {/* Information Update Form */}
          <div className="p-6 border-t border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Contact Information</h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                {isEditing ? (
                  <>
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit Info
                  </>
                )}
              </button>
            </div>

            {formSuccess && (
              <div className="mb-4 p-2 bg-green-100 text-green-700 rounded-md flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                {formSuccess}
              </div>
            )}

            {formError && (
              <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                {formError}
              </div>
            )}

            {isEditing ? (
              <form onSubmit={handleUpdateSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your contact phone number"
                  />
                </div>


                {/* Profile Picture Upload (New) */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setProfilePicture(e.target.files[0])}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                <div className="mb-6">
                  <h3 className="block text-sm font-medium text-gray-700 mb-3">Address Information</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">House/Building No.</label>
                      <input
                        type="text"
                        name="hno"
                        value={formData.hno}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="House/Building No."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Street</label>
                      <input
                        type="text"
                        name="street"
                        value={formData.street}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Street"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="City"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State/Province</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="State/Province"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Country"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ZIP/Postal Code</label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="ZIP/Postal Code"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={updating}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50 flex items-center"
                >
                  {updating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center mb-3">
                  <Phone className="h-5 w-5 text-gray-500 mr-2" />
                  <p>{distributor.contactPhone || "No phone number added"}</p>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-gray-500 mr-2 mt-1" />
                  <p className="flex-1">{formatAddress(distributor.address) || "No address added"}</p>
                </div>
              </div>
            )}
          </div>

          {/* Availability Toggle */}
          <div className="p-6 border-t border-gray-200">
            <h2 className="text-lg font-semibold mb-4">Availability Status</h2>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <p className="text-gray-600 mb-4 md:mb-0">
                {available
                  ? "You're currently available to receive delivery requests."
                  : "You're currently not receiving any delivery requests."}
              </p>
              <button
                onClick={updateAvailability}
                disabled={updating}
                className={`
                  px-4 py-2 rounded-md flex items-center justify-center
                  ${
                    available
                      ? "bg-red-100 text-red-700 hover:bg-red-200"
                      : "bg-green-100 text-green-700 hover:bg-green-200"
                  }
                  transition-colors disabled:opacity-50
                `}
              >
                {updating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : available ? (
                  <>
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Set as Unavailable
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Set as Available
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Assigned Purchases */}
          <div className="p-6 border-t border-gray-200">
            <h2 className="text-lg font-semibold mb-4">Assigned Purchases</h2>
            {purchases.length === 0 ? (
              <p className="text-gray-500">No assigned purchases.</p>
            ) : (
              <div className="space-y-4">
                {purchases.map((purchase) => (
                  <div key={purchase._id} className="p-4 bg-gray-50 shadow rounded-md">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                      <div className="mb-3 md:mb-0">
                        <p className="font-semibold">Customer: {purchase.user?.name}</p>
                        <p className="text-sm text-gray-500">Total: ${purchase.totalAmount.toFixed(2)}</p>
                        <p className="text-sm text-gray-500">
                          <span
                            className={`inline-block px-2 py-1 rounded ${
                              purchase.deliveryStatus === "delivered"
                                ? "bg-green-100 text-green-800"
                                : purchase.deliveryStatus === "out for delivery"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            Status: {purchase.deliveryStatus}
                          </span>
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {purchase.deliveryStatus !== "delivered" && (
                          <>
                            {purchase.deliveryStatus !== "out for delivery" && (
                              <button
                                className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
                                disabled={updatingStatus}
                                onClick={() => updateDeliveryStatus(purchase._id, "out for delivery")}
                              >
                                {updatingStatus ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  "Mark as Out for Delivery"
                                )}
                              </button>
                            )}
                            <button
                              className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                              disabled={updatingStatus}
                              onClick={() => updateDeliveryStatus(purchase._id, "delivered")}
                            >
                              {updatingStatus ? <Loader2 className="h-4 w-4 animate-spin" /> : "Mark as Delivered"}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DistributorDashboard

