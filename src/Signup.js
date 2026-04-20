import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from 'axios';
import styles from './Signup.module.css'; 

export default function Signup() {
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignup = (event) => {
    event.preventDefault();
    
    axios.post('http://localhost:9000/createUser', { username, password })
      .then((res) => {
        alert('Signup Successful!');
        navigate('/'); 
      })
      .catch((err) => {
        alert('Error: ' + (err.response?.data || 'Server Error'));
      });
  };

  return (
    <div className={styles.page}>
      <form onSubmit={handleSignup} className={styles.form}>
        <h2 className={styles.title}>CREATE ACCOUNT</h2>
        <p className={styles.subtitle}>Join the Great Dane Community</p>
        
        <div className={styles.formContent}>
          <input 
            type="text" 
            placeholder="Username" 
            className={styles.input}
            onChange={(e) => setUsername(e.target.value)} 
            value={username}
            required
          />
          <input 
            type="password" 
            placeholder="Password" 
            className={styles.input}
            onChange={(e) => setPassword(e.target.value)} 
            value={password}
            required
          />
          <button type="submit" className={styles.button}>
            SIGN UP
          </button>
        </div>

        <p className={styles.footerText}>
          Already have an account?{" "}
          <Link to="/" className={styles.link}>Log In</Link>
        </p>
      </form>
    </div>
  );
}