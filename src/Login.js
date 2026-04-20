import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import styles from './Login.module.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (event) => {
    event.preventDefault();
    axios.get('http://localhost:9000/getUser', { params: { username, password }})
      .then((res) => {
        if (res.data) {
          alert('Login Successful');
        } else {
          alert('Wrong Credentials');
        }
      })
      .catch((err) => alert('Error in Login'));
  };

  return (
    <div className={styles.page}>
      <form onSubmit={handleLogin} className={styles.form}>

        <h2 className={styles.title}>UA MAPS LOGIN</h2>

        <div className={styles.formContent}>
          <div className={styles.row}>
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
          </div>
          <button type="submit" className={styles.button}>
            LOG IN
          </button>
        </div>

        <p className={styles.footerText}>
          Don't have an account? <Link to="/signup" className={styles.link}>Sign Up</Link>
        </p>

      </form>
    </div>
  );
}