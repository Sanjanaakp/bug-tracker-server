import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function TicketDetails() {
  const { id } = useParams();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const API_BASE = "https://bug-tracker-api-1uut.onrender.com/api";

  const fetchComments = async () => {
    try {
      const res = await axios.get(`${API_BASE}/comments/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComments(res.data);
    } catch (err) {
      console.error("Comment Fetch Error:", err.response?.data?.message);
    }
  };

  useEffect(() => {
    const loadPageData = async () => {
      try {
        const tRes = await axios.get(`${API_BASE}/tickets/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTicket(tRes.data);
        await fetchComments();
      } catch (err) {
        console.error("Access denied or ticket not found");
      } finally {
        setLoading(false);
      }
    };
    if (id && token) loadPageData();
  }, [id, token]);

  const addComment = async () => {
    if (!text.trim()) return;
    try {
      await axios.post(`${API_BASE}/comments`, 
        { ticketId: id, text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setText("");
      await fetchComments();
    } catch (err) {
      // ✅ Updated error message to reflect that permissions have changed
      alert(err.response?.data?.message || "Failed to post comment.");
    }
  };

  if (loading) return <div style={{ padding: "50px" }}>Loading ticket details...</div>;
  if (!ticket) return <div style={{ padding: "50px" }}>Ticket not found.</div>;

  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "auto" }}>
      <div style={{ border: "1px solid #ddd", padding: "20px", borderRadius: "8px", background: "#fff" }}>
        <h1 style={{ marginTop: 0 }}>{ticket.title}</h1>
        <div style={{ display: "flex", gap: "20px", borderTop: "1px solid #eee", paddingTop: "15px" }}>
          <span>Status: <b>{ticket.status}</b></span>
          <span>Priority: <b>{ticket.priority}</b></span>
          <span>Assignee: <b>{ticket.assignedTo?.name || "Unassigned"}</b></span>
        </div>
      </div>

      <div style={{ marginTop: "40px" }}>
        <h3>Discussion Thread</h3>
        
        {/* ✅ REMOVED the isCreator check so the form shows for everyone */}
        <div style={{ marginBottom: "20px" }}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a comment or update..."
            style={{ width: "100%", height: "100px", padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
          />
          <button 
            onClick={addComment} 
            style={{ marginTop: "10px", padding: "10px 20px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}
          >
            Post Comment
          </button>
        </div>

        <div style={{ marginTop: "20px" }}>
          {comments && comments.length > 0 ? (
            comments.map((c) => (
              <div key={c._id} style={{ background: "#f3f4f6", padding: "15px", margin: "10px 0", borderRadius: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                  <span style={{ fontWeight: "bold" }}>{c.user?.name}</span>
                  <small style={{ color: "#888" }}>{new Date(c.createdAt).toLocaleDateString()}</small>
                </div>
                <p style={{ margin: 0 }}>{c.text}</p>
              </div>
            ))
          ) : (
            <p style={{ color: "#999" }}>No comments yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}