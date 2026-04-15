import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
   
    console.log("Logging in:", username);
    navigate('/map'); 
  };
//
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 w-96">
        <h2 className="text-2xl font-bold mb-6 text-slate-900">Sign In</h2>
        <div className="space-y-4">
          <input 
            type="text" 
            placeholder="Username" 
            className="w-full p-3 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-slate-400"
            onChange={(e) => setUsername(e.target.value)} 
            value={username}
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="w-full p-3 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-slate-400"
            onChange={(e) => setPassword(e.target.value)} 
            value={password}
          />
          <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 transition-colors">
            Login
          </button>
        </div>
      </form>
    </div>
  );
} 