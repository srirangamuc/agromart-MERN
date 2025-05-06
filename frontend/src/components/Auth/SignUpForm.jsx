/*import { useState } from "react";
import { useDispatch } from "react-redux";
import { registerUser } from "../../services/authServices";
import { useNavigate } from "react-router-dom";

const SignupForm = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("customer");
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await registerUser(name, email, password, role, dispatch);
        if (result.success && result.shouldRedirect) {
            navigate('/login');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-8 bg-white rounded shadow-md">
            <h1 className="text-2xl font-bold mb-4">Signup</h1>
            <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 mb-4 border rounded"
            />
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 mb-4 border rounded"
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 mb-4 border rounded"
            />
            <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2 mb-4 border rounded"
            >
                <option value="customer">Customer</option>
                <option value="vendor">Vendor</option>
                <option value="distributor">Distributor</option>
            </select>
            <button className="w-full px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600">
                Signup
            </button>
        </form>
    );
};

export default SignupForm;*/


import { useState } from "react";
import { useDispatch } from "react-redux";
import { registerUser } from "../../services/authServices";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify"; // Import toast

// Make sure to import the CSS for react-toastify in your main app file (e.g., App.js)
import 'react-toastify/dist/ReactToastify.css';

const SignupForm = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("customer");

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check if password is valid
        if (!passwordRegex.test(password)) {
            // Show toast notification if password is invalid
            toast.error("Password must be at least 8 characters, contain 1 uppercase letter, 1 number, and 1 special character.");
            return; // Block the form submission
        }

        // Proceed with registration if password is valid
        const result = await registerUser(name, email, password, role, dispatch);
        if (result.success && result.shouldRedirect) {
            navigate('/login');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-8 bg-white rounded shadow-md">
            <h1 className="text-2xl font-bold mb-4">Signup</h1>
            <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 mb-4 border rounded"
            />
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 mb-4 border rounded"
            />
            <input
                type="password"
                placeholder="Password (Min 8 chars, 1 uppercase, 1 number, 1 special)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 mb-1 border rounded"
            />
            <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2 mb-4 border rounded"
            >
                <option value="customer">Customer</option>
                <option value="vendor">Vendor</option>
                <option value="distributor">Distributor</option>
            </select>
            <button className="w-full px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600">
                Signup
            </button>
        </form>
    );
};

export default SignupForm;
