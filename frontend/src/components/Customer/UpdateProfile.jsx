import React, { useState, useEffect } from 'react';
import { 
    User, 
    Mail, 
    Lock, 
    MapPin, 
    Pencil 
} from 'lucide-react';
import { userService } from '../../services/userServices';

const ProfilePage = () => {
    const [userProfile, setUserProfile] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        hno: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const profile = await userService.fetchProfile();
                setUserProfile(profile);
                setFormData({
                    name: profile.name,
                    email: profile.email,
                    password: '',
                    hno: profile.address.hno,
                    street: profile.address.street,
                    city: profile.address.city,
                    state: profile.address.state,
                    zipCode: profile.address.zipCode,
                    country: profile.address.country,
                });
            } catch (error) {
                setError(error.message);
            }
        };
        fetchProfileData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const updatedProfile = await userService.updateProfile(formData);
            setSuccess(updatedProfile.success);
            setError(null);
            setIsEditing(false);
        } catch (error) {
            setError(error.message);
            setSuccess(null);
        }
    };

    if (!userProfile) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden">
                {/* Header */}
                <div className="text-green-600 px-6 py-8 flex justify-between items-center">
                    <div className="flex items-center">
                        <User className="w-10 h-10 mr-4 text-green-500" />
                        <h2 className="text-3xl font-extrabold text-green-500">Profile Settings</h2>
                    </div>
                    <button 
                        onClick={() => setIsEditing(!isEditing)}
                        className="transition-colors duration-300 p-3 rounded-full"
                    >
                        {isEditing ? <Lock className="w-6 h-6" /> : <Pencil className="w-6 h-6" />}
                    </button>
                </div>

                {/* Notifications */}
                {(error || success) && (
                    <div className="px-6 py-4">
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                                <p className="text-red-700">{error}</p>
                            </div>
                        )}
                        {success && (
                            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
                                <p className="text-green-700">{success}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Profile Form */}
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {/* Personal Information */}
                    <div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <User className="w-6 h-6 mr-3 text-green-500" />
                            Personal Information
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className={`w-full px-4 py-3 rounded-lg border ${
                                        isEditing 
                                        ? 'border-green-300 focus:ring-2 focus:ring-green-500' 
                                        : 'border-gray-200 bg-gray-100'
                                    }`}
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className={`w-full px-4 py-3 rounded-lg border ${
                                        isEditing 
                                        ? 'border-green-300 focus:ring-2 focus:ring-green-500' 
                                        : 'border-gray-200 bg-gray-100'
                                    }`}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <Lock className="w-6 h-6 mr-3 text-green-500" />
                            Security
                        </h3>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                            <input
                                type="password"
                                name="password"
                                id="password"
                                placeholder="Leave blank if not changing"
                                value={formData.password}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className={`w-full px-4 py-3 rounded-lg border ${
                                    isEditing 
                                    ? 'border-green-300 focus:ring-2 focus:ring-green-500' 
                                    : 'border-gray-200 bg-gray-100'
                                }`}
                            />
                        </div>
                    </div>

                    {/* Address */}
                    <div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <MapPin className="w-6 h-6 mr-3 text-green-500" />
                            Address Information
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="hno" className="block text-sm font-medium text-gray-700 mb-2">House No</label>
                                <input
                                    type="text"
                                    name="hno"
                                    id="hno"
                                    value={formData.hno}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className={`w-full px-4 py-3 rounded-lg border ${
                                        isEditing 
                                        ? 'border-green-300 focus:ring-2 focus:ring-green-500' 
                                        : 'border-gray-200 bg-gray-100'
                                    }`}
                                />
                            </div>
                            <div>
                                <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-2">Street</label>
                                <input
                                    type="text"
                                    name="street"
                                    id="street"
                                    value={formData.street}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className={`w-full px-4 py-3 rounded-lg border ${
                                        isEditing 
                                        ? 'border-green-300 focus:ring-2 focus:ring-green-500' 
                                        : 'border-gray-200 bg-gray-100'
                                    }`}
                                />
                            </div>
                            <div>
                                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">City</label>
                                <input
                                    type="text"
                                    name="city"
                                    id="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className={`w-full px-4 py-3 rounded-lg border ${
                                        isEditing 
                                        ? 'border-green-300 focus:ring-2 focus:ring-green-500' 
                                        : 'border-gray-200 bg-gray-100'
                                    }`}
                                />
                            </div>
                            <div>
                                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">State</label>
                                <input
                                    type="text"
                                    name="state"
                                    id="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className={`w-full px-4 py-3 rounded-lg border ${
                                        isEditing 
                                        ? 'border-green-300 focus:ring-2 focus:ring-green-500' 
                                        : 'border-gray-200 bg-gray-100'
                                    }`}
                                />
                            </div>
                            <div>
                                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                                <input
                                    type="text"
                                    name="country"
                                    id="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className={`w-full px-4 py-3 rounded-lg border ${
                                        isEditing 
                                        ? 'border-green-300 focus:ring-2 focus:ring-green-500' 
                                        : 'border-gray-200 bg-gray-100'
                                    }`}
                                />
                            </div>
                            <div>
                                <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-2">Zip Code</label>
                                <input
                                    type="text"
                                    name="zipCode"
                                    id="zipCode"
                                    value={formData.zipCode}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className={`w-full px-4 py-3 rounded-lg border ${
                                        isEditing 
                                        ? 'border-green-300 focus:ring-2 focus:ring-green-500' 
                                        : 'border-gray-200 bg-gray-100'
                                    }`}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    {isEditing && (
                        <div className="mt-8">
                            <button
                                type="submit"
                                className="w-full text-black border-green-300 py-3 rounded-lg transition-colors duration-300 flex items-center justify-center"
                            >
                                <Pencil className="mr-2 w-5 h-5 text-green-500" />
                                Update Profile
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;