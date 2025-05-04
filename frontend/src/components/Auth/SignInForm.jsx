import { useState } from "react";
import { useDispatch } from "react-redux";
import { loginUser } from "../../services/authServices";

const LoginForm = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const dispatch = useDispatch();

    const handleSubmit = (e) => {
        e.preventDefault();
        loginUser(email, password, dispatch);
    };

    return (
        <form onSubmit={handleSubmit} className="p-8 bg-white rounded shadow-md">
            <h1 className="text-2xl font-bold mb-4">Login</h1>
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
            <button className="w-full px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600">
                Login
            </button>
        </form>
    );
};

export default LoginForm;
