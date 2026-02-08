import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [user, setUser] = useState({});

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // LOGOUT
  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    fetchMyTickets();
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const res = await axios.get("http://localhost:5000/api/users/me", {
      headers: { Authorization: `Bearer ${token}` }
    });

    setUser(res.data);
  };

  const fetchMyTickets = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/tickets/my", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTickets(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div style={{ padding: "40px" }}>

      {/* PROFILE HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <b>{user.name}</b><br />
          <small>{user.email}</small>
        </div>

        <button onClick={logout}>Logout</button>
      </div>

      <h2>My Assigned Tickets</h2>

      {tickets.length === 0 && <p>No tickets assigned.</p>}

      {tickets.map((ticket) => (
        <div
          key={ticket._id}
          style={{
            border: "1px solid #ccc",
            padding: 10,
            marginBottom: 10,
            borderRadius: "6px"
          }}
        >
          <h4>{ticket.title}</h4>
          <p>{ticket.description}</p>
          <p>Status: {ticket.status}</p>
        </div>
      ))}
    </div>
  );
}

export default MyTickets;
