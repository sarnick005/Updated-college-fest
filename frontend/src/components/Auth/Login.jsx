import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      console.log(email);
      console.log(password);
      const response = await axios.post("/api/v1/users/login", {
        email,
        password,
      });
      console.log(response);
      if (response.data.success) {
        // Fetch posts after successful login
        const postsResponse = await axios.get("/api/v1/posts");
        const posts = postsResponse.data.data.allPosts;
        const sortedPosts = posts.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
        // Pass the sorted posts as state to the Gallery component
        navigate("/gallery");
      }
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <div className="form-body">
      <div className="form-container">
        <h1 className="login-text">Login</h1>
        <form className="form" onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              name="password"
              id="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn">
            Login
          </button>
        </form>
        <div className="register-div">
          <p>
            Don't have an account? <a href="/register">Register</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
