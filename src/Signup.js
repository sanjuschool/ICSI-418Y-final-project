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
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <form onSubmit={handleSignup} className="bg-white p-8 rounded-3xl shadow-2xl border-t-8 border-[#46166b] w-full max-w-md flex flex-col items-center">
        <h2 className="text-3xl font-black mb-2 text-[#46166b] uppercase tracking-tight">Create Account</h2>
        <p className="text-sm text-slate-500 mb-8 font-medium">Join the Great Dane Community</p>
        
        <div className="space-y-4 w-full">
          <input 
            type="email" 
            placeholder="Email Address" 
            className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-[#eeb211] transition-all"
            onChange={(e) => setEmail(e.target.value)} 
            value={email}
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
            SIGN UP
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link to="/" className="text-[#46166b] font-bold hover:underline">Log In</Link>
        </p>
      </form>
    </div>
  );
}