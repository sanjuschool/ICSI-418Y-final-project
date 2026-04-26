import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from 'axios';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (event) => {
    event.preventDefault(); // Stops page refresh
    
    axios.get('http://localhost:9000/getUser', { params: { username, password }})
      .then((res) => {
        if (res.data) {
          alert('Login Successful');
          localStorage.setItem("user", JSON.stringify(res.data));
          navigate('/map');
        } else {
          alert('Wrong Credentials');
        }
      })
      .catch((err) => alert('Error in Login'));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-3xl shadow-2xl border-t-8 border-[#46166b] w-full max-w-md flex flex-col items-center">
        <h2 className="text-3xl font-black mb-8 text-[#46166b] uppercase tracking-tight">Log In</h2>
        
        <div className="space-y-4 w-full">
          <input 
            type="text" 
            placeholder="Username" 
            className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-[#eeb211] transition-all"
            onChange={(e) => setUsername(e.target.value)} 
            value={username}
            required
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-[#eeb211] transition-all"
            onChange={(e) => setPassword(e.target.value)} 
            value={password}
            required
          />
          <button type="submit" className="w-full bg-[#46166b] text-[#eeb211] py-4 rounded-xl font-bold text-lg hover:bg-[#341050] transform active:scale-95 transition-all shadow-lg">
            LOGIN
          </button>
        </div>
        
        <p className="mt-8 text-center text-sm text-slate-600">
          Don't have an account?{" "}
          <Link to="/signup" className="text-[#46166b] font-bold hover:underline">Sign Up</Link>
        </p>
      </form>
    </div>
  );
}