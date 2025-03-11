"use client"

import { useState, useEffect } from "react"
import {
  LogOut,
  Plus,
  Users,
  BarChart2,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Settings,
  Package,
  LayoutDashboard,
  ChevronRight,
  Bell,
  Search,
  Menu,
  X,
} from "lucide-react"
import { Bar } from "react-chartjs-2"
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from "chart.js"
import vendorService from "../../services/vendorServices"
import { logout } from "../../redux/authSlice"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"

// Register ChartJS components
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

// Reusable Bento Card Component
// const BentoCard = ({ title, icon: Icon, children, className = "" }) => (
//   <div
//     className={`bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 p-6 flex flex-col ${className}`}
//   >
//     <div className="flex items-center mb-4">
//       <Icon className="mr-3 text-emerald-600 w-6 h-6" />
//       <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
//     </div>
//     {children}
//   </div>
// )

const VendorDashboard = () => {
  const [vendorData, setVendorData] = useState(null)
  const [profitData, setProfitData] = useState({ productNames: [], profits: [] })
  const [productForm, setProductForm] = useState({
    name: "",
    quantity: "",
    pricePerKg: "",
  })
  const [error, setError] = useState(null)
  const [vendorProfile, setVendorProfile] = useState(null)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({
    username: "",
    email: "",
    password: "",
    hno: "",
    street: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
  })
  const [activeTab, setActiveTab] = useState("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  const dispatch = useDispatch()
  const navigate = useNavigate()

  // Check if screen is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024)
      if (window.innerWidth < 1024) {
        setSidebarOpen(false)
      } else {
        setSidebarOpen(true)
      }
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)

    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  const handleLogout = () => {
    dispatch(logout())
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    navigate("/login")
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const vendorResponse = await vendorService.getVendorDashboard()
        const vendorProfileResponse = await vendorService.fetchProfile()
        const profitResponse = await vendorService.getProfitData()

        setVendorData(vendorResponse)
        setVendorProfile(vendorProfileResponse)
        setProfitData(profitResponse)
      } catch (err) {
        setError("Failed to fetch data. Please log in again.")
        console.error(err)
      }
    }

    fetchData()
  }, [])

  const handleProductSubmit = async (e) => {
    e.preventDefault()
    try {
      await vendorService.addProduct(productForm)
      const vendorResponse = await vendorService.getVendorDashboard()
      const profitResponse = await vendorService.getProfitData()

      setVendorData(vendorResponse)
      setProfitData(profitResponse)

      setProductForm({ name: "", quantity: "", pricePerKg: "" })
    } catch (err) {
      setError("Failed to add product")
      console.error(err)
    }
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    try {
      await vendorService.updateProfile(profileForm)
      const updatedProfile = await vendorService.fetchProfile()

      setVendorProfile(updatedProfile)
      setIsEditingProfile(false)
    } catch (err) {
      setError("Failed to update profile")
      console.error(err)
    }
  }

  // Prepare chart data
  const chartData = {
    labels: profitData.productNames,
    datasets: [
      {
        label: "Profit per Product",
        data: profitData.profits,
        backgroundColor: "rgba(16, 185, 129, 0.6)",
        borderColor: "rgba(5, 150, 105, 1)",
        borderWidth: 1,
      },
    ],
  }

  // Navigation items
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "products", label: "Products", icon: Package },
    { id: "profile", label: "Profile", icon: Users },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  // Render loading or error state
  if (error) return <div className="text-red-500 p-6">{error}</div>
  if (!vendorData)
    return (
      <div className="min-h-screen bg-emerald-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-emerald-200 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-emerald-200 rounded mb-3"></div>
          <div className="h-3 w-24 bg-emerald-100 rounded"></div>
        </div>
      </div>
    )

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
                   fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 
                   transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-800">VendorHub</span>
            </div>
            {isMobile && (
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center w-full px-4 py-3 text-left rounded-lg transition-colors ${
                    activeTab === item.id ? "bg-emerald-50 text-emerald-700" : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-3 ${activeTab === item.id ? "text-emerald-500" : "text-gray-500"}`} />
                  <span className="font-medium">{item.label}</span>
                  {activeTab === item.id && <ChevronRight className="w-4 h-4 ml-auto" />}
                </button>
              )
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-6">
          {/* Mobile menu button */}
          {isMobile && (
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-700">
              <Menu className="w-6 h-6" />
            </button>
          )}

          <h1 className="text-xl font-semibold text-gray-800 lg:ml-0 ml-4">
            {navItems.find((item) => item.id === activeTab)?.label}
          </h1>

          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-3 py-1.5">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent border-none focus:outline-none text-sm ml-2 w-40"
              />
            </div>

            {/* Notifications */}
            <button className="relative p-1 rounded-full hover:bg-gray-100">
              <Bell className="w-5 h-5 text-gray-500" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-emerald-500 rounded-full"></span>
            </button>

            {/* User Avatar */}
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <span className="text-sm font-medium text-emerald-700">{vendorProfile?.name?.charAt(0) || "V"}</span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-gray-50">
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6 flex items-center">
                  <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center mr-4">
                    <DollarSign className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-800">
                      ₹{vendorData.products.reduce((total, product) => total + product.profit, 0).toFixed(2)}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-emerald-500 opacity-50 ml-auto" />
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 flex items-center">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mr-4">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Products</p>
                    <p className="text-2xl font-bold text-gray-800">{vendorData.products.length}</p>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 flex items-center">
                  <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mr-4">
                    <ShoppingBag className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Sold</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {vendorData.products.reduce((total, product) => total + product.quantitySold, 0)} kg
                    </p>
                  </div>
                </div>
              </div>

              {/* Chart and Products */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Profit Chart */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center mb-4">
                    <BarChart2 className="mr-3 text-emerald-600 w-5 h-5" />
                    <h2 className="text-lg font-semibold text-gray-800">Profit Distribution</h2>
                  </div>
                  <div className="h-64">
                    <Bar
                      data={chartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: "bottom",
                          },
                        },
                      }}
                    />
                  </div>
                </div>

                {/* Products Sold */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <ShoppingBag className="mr-3 text-emerald-600 w-5 h-5" />
                      <h2 className="text-lg font-semibold text-gray-800">Products Sold</h2>
                    </div>
                    <button className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">View All</button>
                  </div>
                  <div className="max-h-64 overflow-y-auto pr-2">
                    {vendorData.products.map((product, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 rounded-lg p-4 mb-2 flex justify-between items-center hover:bg-emerald-50 transition-colors duration-300"
                      >
                        <div>
                          <p className="font-semibold text-gray-800">{product.itemName}</p>
                          <p className="text-xs text-gray-500">{product.quantitySold} kg</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-emerald-600">₹{product.profit.toFixed(2)}</p>
                          <p className="text-xs text-gray-500">₹{product.pricePerKg.toFixed(2)}/kg</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Add Product Form */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center mb-4">
                  <Plus className="mr-3 text-emerald-600 w-5 h-5" />
                  <h2 className="text-lg font-semibold text-gray-800">Add New Product</h2>
                </div>
                <form onSubmit={handleProductSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="Product Name"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Quantity (kg)"
                      value={productForm.quantity}
                      onChange={(e) => setProductForm({ ...productForm, quantity: e.target.value })}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Price per kg"
                      step="0.01"
                      value={productForm.pricePerKg}
                      onChange={(e) => setProductForm({ ...productForm, pricePerKg: e.target.value })}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full md:w-auto px-6 bg-emerald-500 text-white p-3 rounded-lg hover:bg-emerald-600 transition-colors duration-300 flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center mb-6">
                <Users className="mr-3 text-emerald-600 w-6 h-6" />
                <h2 className="text-xl font-semibold text-gray-800">Vendor Profile</h2>
              </div>

              {isEditingProfile ? (
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-700 mb-4">Account Information</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                          <input
                            type="text"
                            placeholder="Username"
                            value={profileForm.name}
                            onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <input
                            type="email"
                            placeholder="Email"
                            value={profileForm.email}
                            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                          <input
                            type="password"
                            placeholder="Password"
                            value={profileForm.password}
                            onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-700 mb-4">Address Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">House No</label>
                          <input
                            type="text"
                            placeholder="House Number"
                            value={profileForm.hno}
                            onChange={(e) => setProfileForm({ ...profileForm, hno: e.target.value })}
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                        </div>
                        <div className="col-span-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Street</label>
                          <input
                            type="text"
                            placeholder="Street"
                            value={profileForm.street}
                            onChange={(e) => setProfileForm({ ...profileForm, street: e.target.value })}
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                        </div>
                        <div className="col-span-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                          <input
                            type="text"
                            placeholder="City"
                            value={profileForm.city}
                            onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                        </div>
                        <div className="col-span-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                          <input
                            type="text"
                            placeholder="State"
                            value={profileForm.state}
                            onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                        </div>
                        <div className="col-span-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                          <input
                            type="text"
                            placeholder="Country"
                            value={profileForm.country}
                            onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })}
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                        </div>
                        <div className="col-span-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                          <input
                            type="text"
                            placeholder="Zip Code"
                            value={profileForm.zipCode}
                            onChange={(e) => setProfileForm({ ...profileForm, zipCode: e.target.value })}
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button
                      type="submit"
                      className="bg-emerald-500 text-white p-3 rounded-lg flex-1 hover:bg-emerald-600 transition"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="border border-red-500 text-red-500 p-3 rounded-lg flex-1 hover:bg-red-50 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium text-emerald-700 mb-4">Account Information</h3>
                      <div className="space-y-3">
                        <div className="flex">
                          <span className="font-semibold text-gray-700 w-24">Username:</span>
                          <span className="text-gray-700">{vendorProfile.name}</span>
                        </div>
                        <div className="flex">
                          <span className="font-semibold text-gray-700 w-24">Email:</span>
                          <span className="text-gray-700">{vendorProfile.email}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-emerald-700 mb-4">Address Information</h3>
                      <div className="space-y-3">
                        <div className="flex">
                          <span className="font-semibold text-gray-700 w-24">House No:</span>
                          <span className="text-gray-700">{vendorProfile.address.hno || "N/A"}</span>
                        </div>
                        <div className="flex">
                          <span className="font-semibold text-gray-700 w-24">Street:</span>
                          <span className="text-gray-700">{vendorProfile.address.street || "N/A"}</span>
                        </div>
                        <div className="flex">
                          <span className="font-semibold text-gray-700 w-24">City:</span>
                          <span className="text-gray-700">{vendorProfile.address.city || "N/A"}</span>
                        </div>
                        <div className="flex">
                          <span className="font-semibold text-gray-700 w-24">State:</span>
                          <span className="text-gray-700">{vendorProfile.address.state || "N/A"}</span>
                        </div>
                        <div className="flex">
                          <span className="font-semibold text-gray-700 w-24">Country:</span>
                          <span className="text-gray-700">{vendorProfile.address.country || "N/A"}</span>
                        </div>
                        <div className="flex">
                          <span className="font-semibold text-gray-700 w-24">Zip Code:</span>
                          <span className="text-gray-700">{vendorProfile.address.zipCode || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setProfileForm({
                        username: vendorProfile.username,
                        email: vendorProfile.email,
                        password: "",
                        hno: vendorProfile.address?.hno || "",
                        street: vendorProfile.address?.street || "",
                        city: vendorProfile.address?.city || "",
                        state: vendorProfile.address?.state || "",
                        country: vendorProfile.address?.country || "",
                        zipCode: vendorProfile.address?.zipCode || "",
                      })
                      setIsEditingProfile(true)
                    }}
                    className="mt-6 bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 transition shadow-sm"
                  >
                    Update Profile
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "products" && (
            <div className="space-y-6">
              {/* Add Product Form */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center mb-4">
                  <Plus className="mr-3 text-emerald-600 w-5 h-5" />
                  <h2 className="text-lg font-semibold text-gray-800">Add New Product</h2>
                </div>
                <form onSubmit={handleProductSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="Product Name"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Quantity (kg)"
                      value={productForm.quantity}
                      onChange={(e) => setProductForm({ ...productForm, quantity: e.target.value })}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Price per kg"
                      step="0.01"
                      value={productForm.pricePerKg}
                      onChange={(e) => setProductForm({ ...productForm, pricePerKg: e.target.value })}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full md:w-auto px-6 bg-emerald-500 text-white p-3 rounded-lg hover:bg-emerald-600 transition-colors duration-300 flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </button>
                </form>
              </div>

              {/* Products List */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <Package className="mr-3 text-emerald-600 w-5 h-5" />
                    <h2 className="text-lg font-semibold text-gray-800">All Products</h2>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Search products..."
                      className="p-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    <button className="bg-emerald-100 text-emerald-600 p-2 rounded-lg hover:bg-emerald-200">
                      <Search className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Product Name
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Quantity Sold
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Price/kg
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Profit
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {vendorData.products.map((product, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{product.itemName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{product.quantitySold} kg</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">₹{product.pricePerKg.toFixed(2)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-emerald-600">₹{product.profit.toFixed(2)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Active
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center mb-6">
                <Settings className="mr-3 text-emerald-600 w-6 h-6" />
                <h2 className="text-xl font-semibold text-gray-800">Account Settings</h2>
              </div>

              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-medium text-gray-700 mb-4">Notifications</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Email Notifications</p>
                        <p className="text-xs text-gray-500">Receive emails about your account activity</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Order Updates</p>
                        <p className="text-xs text-gray-500">Receive notifications about new orders</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-medium text-gray-700 mb-4">Security</h3>
                  <div className="space-y-4">
                    <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                      Change Password
                    </button>
                    <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                      Enable Two-Factor Authentication
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-4">Danger Zone</h3>
                  <button className="px-4 py-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default VendorDashboard

