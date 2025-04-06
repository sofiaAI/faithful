"use client";

import { useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false); // Track whether user is registering or logging in
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const endpoint = isRegistering ? "/register" : "/login";
      const response = await api.post(endpoint, { email, password });
      if (response.status === 200 || response.status === 201) {
        localStorage.setItem('token', response.data.token);
        router.push("/journal"); // Redirect to journal on successful login/registration
      }
    } catch (err) {
      setError(isRegistering ? "Registration failed! Please try again." : "Login failed! Please check your credentials.");
    }
    };
    
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">{isRegistering ? "Register" : "Login"}</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 max-w-md mx-auto">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="border p-2 rounded"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="border p-2 rounded"
          required
        />
        <button type="submit" className="bg-blue-600 text-white p-2 rounded mt-4">
          {isRegistering ? "Register" : "Login"}
        </button>
        {error && <p className="text-red-600 mt-2">{error}</p>}
      </form>
      
      {/* Toggle between login and register */}
      <p className="text-center mt-4">
        {isRegistering ? (
          <>
            Already have an account?{" "}
            <button
              onClick={() => setIsRegistering(false)}
              className="text-blue-600"
            >
              Login here
            </button>
          </>
        ) : (
          <>
            Don't have an account?{" "}
            <button
              onClick={() => setIsRegistering(true)}
              className="text-blue-600"
            >
              Register here
            </button>
          </>
        )}
      </p>
    </div>
  );
}
