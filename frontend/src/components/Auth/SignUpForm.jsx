import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { registerUser } from "../../services/authServices";

const SignupForm = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("customer");
    const dispatch = useDispatch();

    const handleSubmit = (e) => {
        e.preventDefault();
        registerUser(name, email, password, role, dispatch);
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
            </select>
            <button className="w-full px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600">
                Signup
            </button>
        </form>
    );
};

export default SignupForm;
