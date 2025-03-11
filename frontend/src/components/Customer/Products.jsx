import { useEffect, useState, useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import { ShoppingCart, Info, Search, Minus, Plus } from "lucide-react"
import { addToCart } from "../../redux/productSlice"
import { productsService } from "../../services/productServices"

const ProductsPage = () => {
  const dispatch = useDispatch()
  useSelector((state) => state.auth)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredProducts, setFilteredProducts] = useState([])
  const [quantities, setQuantities] = useState({})
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    {
      image: "./summer-vegetables.jpg",
      title: "Summer Special Offers",
      description: "Get up to 50% off on fresh fruits",
    },
    {
      image: "./summer-vegetables.jpg",
      title: "New Organic Collection",
      description: "Explore our new range of organic products",
    },
    {
      image: "./summer-vegetables.jpg",
      title: "Free Delivery",
      description: "On orders above $50",
    },
  ]

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productsService.fetchProducts()
        if (Array.isArray(data.items)) {
          setProducts(data.items)
          setFilteredProducts(data.items)
          const initialQuantities = {}
          data.items.forEach((product) => {
            initialQuantities[product._id] = 1
          })
          setQuantities(initialQuantities)
        } else {
          throw new Error("Fetched data is not an array")
        }
      } catch (error) {
        console.error("Error fetching products:", error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Debounced search function
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId
      return (searchValue) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          const filtered = products.filter((product) => product.name.toLowerCase().includes(searchValue.toLowerCase()))
          setFilteredProducts(filtered)
        }, 400)
      }
    })(),
    [products],
  )

  // Handle search input changes
  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    debouncedSearch(value)
  }

  const handleAddToCart = async (itemId) => {
    try {
      const quantity = 0.5 * quantities[itemId]
      await productsService.addToCart(itemId, quantity)
      dispatch(addToCart(itemId, quantity))
    } catch (error) {
      console.error("Error adding item to cart:", error)
      setError(error.message)
    }
  }

  const handleQuantityChange = (itemId, value) => {
    const product = products.find((p) => p._id === itemId)
    if (!product) return

    if (value === "" || isNaN(value)) {
      setQuantities((prev) => ({
        ...prev,
        [itemId]: value,
      }))
      return
    }

    const numericValue = Number.parseInt(value, 10)

    if (numericValue > product.quantity) {
      alert(`Error: Only ${product.quantity} kg available for ${product.name}.`)
      return
    }

    if (numericValue >= 1) {
      setQuantities((prev) => ({
        ...prev,
        [itemId]: numericValue,
      }))
    }
  }

  const incrementQuantity = (itemId) => {
    const product = products.find((p) => p._id === itemId)
    if (!product) return

    const currentValue = quantities[itemId]
    const newValue = Number.parseInt(currentValue, 10) + 1

    if (newValue <= product.quantity) {
      setQuantities((prev) => ({
        ...prev,
        [itemId]: newValue,
      }))
    } else {
      alert(`Error: Only ${product.quantity} kg available for ${product.name}.`)
    }
  }

  const decrementQuantity = (itemId) => {
    const currentValue = quantities[itemId]
    const newValue = Number.parseInt(currentValue, 10) - 1

    if (newValue >= 1) {
      setQuantities((prev) => ({
        ...prev,
        [itemId]: newValue,
      }))
    }
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-pulse text-2xl font-semibold text-gray-600">Loading products...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-red-50">
        <div className="text-red-600 text-2xl font-semibold flex items-center space-x-2">
          <Info className="w-8 h-8" />
          <span>Error: {error}</span>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Hero Slider */}
      <div className="relative w-[80%] h-[400px] md:h-[500px] overflow-hidden mx-auto px-4 mt-6 mb-8 rounded-2xl bg-transperant">
        <div
          className="flex gap-5 h-full transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div key={index} className="w-full h-full flex-shrink-0 relative">
              <img src={slide.image || "/placeholder.svg"} alt={slide.title} className="w-full h-full rounded-2xl" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20 rounded-2xl flex flex-col gap-3 justify-end items-center text-white pb-16">
                <h2 className="text-3xl md:text-5xl font-bold mb-3 text-center px-4">{slide.title}</h2>
                <p className="text-lg md:text-xl text-center px-4 max-w-2xl">{slide.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Slider Controls */}
        <button
          onClick={prevSlide}
          className="absolute left-8 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full shadow-lg hover:bg-white transition-colors"
          aria-label="Previous slide"
        >
          <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-8 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full shadow-lg hover:bg-white transition-colors"
          aria-label="Next slide"
        >
          <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all transform ${
                currentSlide === index ? "bg-white scale-100" : "bg-white/50 scale-90 hover:scale-95 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="h-full flex flex-col bg-transperant">
        {/* Search Header */}
        <div className="bg-transperant p-4">
          <div className="w-full mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-800">Veggies</h1>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full sm:w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Products Grid - REDESIGNED */}
        <div className="flex-1 overflow-auto p-4 sm:p-6">
          {filteredProducts.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <div className="text-center text-gray-500 text-xl">No products found</div>
            </div>
          ) : (
            <div className="w-full mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product._id}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 border border-gray-100 group"
                >
                  <div className="relative p-4 flex justify-center items-center h-48 bg-gradient-to-b from-emerald-50 to-white">
                    <img
                      src={`src/assets/images/resized_images/${product.name}.png`}
                      alt={product.name}
                      className="h-36 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                    {product.quantity <= 0 && (
                      <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        Sold Out
                      </div>
                    )}
                    {product.quantity > 0 && product.quantity < 5 && (
                      <div className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        Low Stock
                      </div>
                    )}
                  </div>

                  <div className="p-4 border-t border-gray-100">
                    <div className="flex justify-between items-start mb-2">
                      <h2 className="text-lg font-semibold text-gray-800 group-hover:text-emerald-600 transition-colors">
                        {product.name}
                      </h2>
                      <span className="text-lg font-bold text-emerald-600">₹{product.pricePerKg * 1.5}/kg</span>
                    </div>

                    <div className="text-sm text-gray-500 mb-4 flex items-center">
                      <div
                        className={`w-2 h-2 rounded-full mr-2 ${
                          product.quantity > 5 ? "bg-emerald-500" : product.quantity > 0 ? "bg-amber-500" : "bg-red-500"
                        }`}
                      ></div>
                      {product.quantity} kg available
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => decrementQuantity(product._id)}
                          disabled={quantities[product._id] <= 1 || product.quantity <= 0}
                          className="p-2 bg-gray-50 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <input
                          type="text"
                          value={quantities[product._id]}
                          onChange={(e) => handleQuantityChange(product._id, e.target.value)}
                          className="w-12 text-center py-1 border-x border-gray-200 focus:outline-none"
                        />
                        <button
                          onClick={() => incrementQuantity(product._id)}
                          disabled={quantities[product._id] >= product.quantity || product.quantity <= 0}
                          className="p-2 bg-gray-50 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => handleAddToCart(product._id)}
                        disabled={product.quantity <= 0}
                        className={`
                          flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg
                          ${
                            product.quantity > 0
                              ? "bg-emerald-500 text-white hover:bg-emerald-600 active:scale-95"
                              : "bg-gray-200 text-gray-400 cursor-not-allowed"
                          }
                          transition-all duration-300
                        `}
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default ProductsPage

