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
        profilePicture:null,
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
                    profilePicture: profile.profilePicture||null,
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

    // updated handle submit method .
    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    
    //     console.log("📤 FormData before sending:", formData);
    
    //     const formDataToSend = new FormData();
    
    //     // Append all fields, even if they are empty
    //     Object.entries(formData).forEach(([key, value]) => {
    //         formDataToSend.append(key, value || ""); // ✅ Ensures empty fields are sent
    //     });
    
    //     // Debugging: Check FormData content
    //     for (const pair of formDataToSend.entries()) {
    //         console.log(pair[0], pair[1]); // This should log each field properly
    //     }
    
    //     try {
    //         const updatedProfile = await userService.updateProfile(formDataToSend);
    //         setSuccess(updatedProfile.success);
    //         setError(null);
    //         setUserProfile({ ...userProfile, ...updatedProfile.user });
    //         setIsEditing(false);
    //     } catch (error) {
    //         setError(error.message);
    //         setSuccess(null);
    //     }
    // };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();

        const updatedData = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            updatedData.append(key, value || "");
        });

        try {
            const updatedProfile = await userService.updateProfile(updatedData);
            setSuccess(updatedProfile.success);
            setError(null);
            setUserProfile({ ...userProfile, ...updatedProfile.user });
            setIsEditing(false);
        } catch (error) {
            setError(error.message);
            setSuccess(null);
        }
    };

    const handleProfilePictureUpdate = async (e) => {
        e.preventDefault();

        const pictureData = new FormData();
        pictureData.append('profilePicture', formData.profilePicture);

        try {
            const updatedProfilePic = await userService.updateProfilePicture(pictureData);
            setSuccess(updatedProfilePic.success);
            setError(null);
            setUserProfile({ ...userProfile, profilePicture: updatedProfilePic.user.profilePicture });
        } catch (error) {
            setError(error.message);
            setSuccess(null);
        }
    };

    const handleProfilePicChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, profilePicture: file });
            const fileURL = URL.createObjectURL(file);
            setProfilePicPreview(fileURL);
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

                {/* Profile Picture Upload */}
                <div>
                        {userProfile.profilePicture && (
                            <div className="flex justify-center mb-4">
                                <img 
                                    src={`https://agromart-backend-kbxx.onrender.com${userProfile.profilePicture}`} 
                                    alt="Profile"
                                    className="w-40 h-40 object-cover rounded-full border-4 border-green-300 shadow-md"
                                />
                            </div>
                        )}


                            <div className="flex flex-col items-center">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Profile Picture</label>
                                <input 
                                    type="file" 
                                    name="profilePicture" 
                                    accept="image/*"
                                    onChange={handleProfilePicChange}
                                    className="hidden"
                                    id="fileUpload"
                                />
                                <label 
                                    htmlFor="fileUpload"
                                    className="cursor-pointer bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-300"
                                >
                                    Choose File
                                </label>
                            </div>




                    </div>

                {/* Profile Form */}
                <form onSubmit={handleProfileUpdate} className="p-8 space-y-6">
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
                {/* Profile Picture Update Form */}
                {isEditing && formData.profilePicture && (
                    <div>
                        <form onSubmit={handleProfilePictureUpdate}>
                            <button 
                                type="submit"
                                className="bg-green-500 text-white py-3 rounded-lg w-full mt-4 transition-colors duration-300"
                            >
                                Update Profile Picture
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;