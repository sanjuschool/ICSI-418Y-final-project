import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignup = (e) => {
    e.preventDefault();
    console.log("Account created for:", email);
    
    navigate('/map'); 
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <form onSubmit={handleSignup} className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 w-96">
        <h2 className="text-2xl font-bold mb-2 text-slate-900">Create Account</h2>
        <p className="text-sm text-slate-500 mb-6">Join the campus community</p>
        
        <div className="space-y-4">
          <input 
            type="email" 
            placeholder="Email Address" 
            className="w-full p-3 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-slate-400"
            onChange={(e) => setEmail(e.target.value)} 
            value={email}
            required
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="w-full p-3 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-slate-400"
            onChange={(e) => setPassword(e.target.value)} 
            value={password}
            required
          />
          <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 transition-colors">
            Sign Up
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link to="/" className="text-slate-900 font-bold hover:underline">Log In</Link>
        </p>
      </form>
    </div>
  );
}