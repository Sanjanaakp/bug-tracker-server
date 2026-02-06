import { useState, useEffect } from "react";
import axios from "axios";

export default function Settings() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  // Inside client/src/pages/Settings.js
useEffect(() => {
  const savedUser = localStorage.getItem("user");
  if (savedUser) {
    try {
      const parsedUser = JSON.parse(savedUser);
      setName(parsedUser.name || "");
      setEmail(parsedUser.email || "");
    } catch (err) {
      console.error("Error parsing user from localStorage", err);
    }
  }
}, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        "https://bug-tracker-api-1uut.onrender.com/api/users/profile",
        { name, email, password },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local storage with new name/email
      localStorage.setItem("user", JSON.stringify(res.data));
      setMessage("Profile updated successfully!");
      setPassword(""); // Clear password field
    } catch (err) {
      setMessage("Error updating profile");
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "500px", margin: "auto" }}>
      <div style={formContainer}>
        <h2>Account Settings</h2>
        {message && <p style={{ color: "green" }}>{message}</p>}
        
        <form onSubmit={handleUpdate}>
          <label>Full Name</label>
          <input 
            style={inputStyle}
            value={name} 
            onChange={(e) => setName(e.target.value)} 
          />

          <label>Email Address</label>
          <input 
            style={inputStyle}
            type="email" 
            value={email} 
            disabled // Keep email unique/static for now
          />

          <label>New Password (leave blank to keep current)</label>
          <input 
            style={inputStyle}
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="********"
          />

          <button type="submit" style={btnStyle}>Save Changes</button>
        </form>
      </div>
    </div>
  );
}

const formContainer = { background: "#fff", padding: "30px", borderRadius: "15px", boxShadow: "0 4px 15px rgba(0,0,0,0.1)" };
const inputStyle = { width: "100%", padding: "10px", margin: "10px 0 20px 0", borderRadius: "5px", border: "1px solid #ddd" };
const btnStyle = { width: "100%", padding: "12px", background: "#3182ce", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" };