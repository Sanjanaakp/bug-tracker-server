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

  // ✅ SEPARATE FETCH COMMENTS FUNCTION
  const fetchComments = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/comments/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComments(res.data);
    } catch (err) {
      // If you see this in the console, the backend is blocking the assignee
      console.error("Comment Authorization Error:", err.response?.data?.message);
    }
  };

  // ✅ UPDATED USEEFFECT
  useEffect(() => {
    const loadPageData = async () => {
      try {
        // Fetch ticket first to check permissions
        const tRes = await axios.get(`http://localhost:5000/api/tickets/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTicket(tRes.data);

        // Fetch comments using the reusable function
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
      await axios.post("http://localhost:5000/api/comments", 
        { ticketId: id, text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setText("");
      
      // Refresh comments using the reusable function
      await fetchComments();

    } catch (err) {
      alert("Only the assigner (creator) can comment on this ticket.");
    }
  };

  if (loading) return <div style={{ padding: "50px" }}>Loading ticket details...</div>;
  if (!ticket) return <div style={{ padding: "50px" }}>Ticket not found.</div>;

  // ✅ ROBUST CHECK: Convert both to strings to ensure match
  const isCreator = user && ticket.createdBy && (
    String(ticket.createdBy._id || ticket.createdBy) === String(user._id)
  );

  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "auto" }}>
      {/* TICKET INFO HEADER */}
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
        
        {/* ACTION AREA: Input for Creator vs Read-only for Assignee */}
        {isCreator ? (
          <div style={{ marginBottom: "20px" }}>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Assigner: Write instructions or feedback here..."
              style={{ width: "100%", height: "100px", padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
            />
            <button 
              onClick={addComment} 
              style={{ marginTop: "10px", padding: "10px 20px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}
            >
              Post Comment
            </button>
          </div>
        ) : (
          <p style={{ color: "#777", background: "#f8f9fa", padding: "10px", borderRadius: "5px" }}>
            <i>Discussion is read-only for assignees. Only the assigner can add comments.</i>
          </p>
        )}

        {/* COMMENTS LIST AREA */}
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