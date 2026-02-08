import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function Tickets() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const [tickets, setTickets] = useState([]);
  const [project, setProject] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState("All");
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Edit States
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  // Form States
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");

  const columns = ["Todo", "In Progress", "Done"];
  const API_BASE = "https://bug-tracker-api-1uut.onrender.com/api";

  const fetchTickets = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/tickets/project/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTickets(res.data);
    } catch (err) { console.error("Ticket Fetch Error:", err); }
  }, [projectId, token, API_BASE]);

  const fetchProjectDetails = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProject(res.data);
    } catch (err) { console.error("Project Fetch Error:", err); }
  }, [projectId, token, API_BASE]);

  useEffect(() => {
    if (!token) return navigate("/");
    fetchProjectDetails();
    fetchTickets();
  }, [projectId, token, navigate, fetchProjectDetails, fetchTickets]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newTicket = { title, description, priority, projectId, status: "Todo" };
    try {
      await axios.post(`${API_BASE}/tickets`, newTicket, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTitle(""); setDescription(""); setIsFormOpen(false);
      fetchTickets();
    } catch (err) { alert(`Error: ${err.response?.data?.message || "Check console"}`); }
  };

  const handleDelete = async (ticketId) => {
    if (window.confirm("Are you sure you want to delete this ticket?")) {
      try {
        await axios.delete(`${API_BASE}/tickets/${ticketId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchTickets();
      } catch (err) { alert(err.response?.data?.message || "Delete failed"); }
    }
  };

  const handleUpdate = async (ticketId) => {
    try {
      await axios.put(`${API_BASE}/tickets/${ticketId}`, 
        { title: editTitle }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingId(null);
      fetchTickets();
    } catch (err) { alert(err.response?.data?.message || "Update failed"); }
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) return;
    const ticketId = draggableId;
    const newStatus = destination.droppableId;
    setTickets(prev => prev.map(t => t._id === ticketId ? { ...t, status: newStatus } : t));
    try {
      await axios.put(`${API_BASE}/tickets/${ticketId}/status`, { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
    } catch (err) { fetchTickets(); }
  };

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === "All" || t.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  return (
    <div style={{ padding: "20px" }}>
      <header style={headerStyle}>
        <div>
          <h2>{project.name || "Loading Project..."}</h2>
          <p style={{ color: "#64748b" }}>Manage and track issues</p>
        </div>
        <button onClick={() => setIsFormOpen(!isFormOpen)} style={isFormOpen ? closeBtn : primaryBtn}>
          {isFormOpen ? "Close Form" : "+ Create Ticket"}
        </button>
      </header>

      {isFormOpen && (
        <form onSubmit={handleSubmit} style={formStyle}>
          <input placeholder="Ticket Title" value={title} onChange={(e) => setTitle(e.target.value)} required style={inputStyle} />
          <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} style={inputStyle} />
          <div style={{ display: 'flex', gap: '10px' }}>
            <select value={priority} onChange={(e) => setPriority(e.target.value)} style={selectStyle}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
          <button type="submit" style={primaryBtn}>Save Ticket</button>
        </form>
      )}

      {/* --- KANBAN BOARD --- */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div style={gridStyle}>
          {columns.map(col => (
            <Droppable droppableId={col} key={col}>
              {(provided, snapshot) => (
                <div {...provided.droppableProps} ref={provided.innerRef} style={{ ...columnStyle, backgroundColor: snapshot.isDraggingOver ? "#e2e8f0" : "#f1f5f9" }}>
                  <h3 style={columnHeaderStyle}>{col}</h3>
                  {filteredTickets.filter(t => t.status === col).map((ticket, index) => (
                    <Draggable key={ticket._id} draggableId={ticket._id} index={index}>
                      {(provided) => (
                        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} style={{ ...ticketCard, ...provided.draggableProps.style }}>
                          {editingId === ticket._id ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <input style={inputStyle} value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                              <div style={{ display: 'flex', gap: '5px' }}>
                                <button onClick={() => handleUpdate(ticket._id)} style={saveBtn}>Save</button>
                                <button onClick={() => setEditingId(null)} style={cancelBtn}>Cancel</button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <span style={getPriorityBadge(ticket.priority)}>{ticket.priority}</span>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <button onClick={() => { setEditingId(ticket._id); setEditTitle(ticket.title); }} style={iconBtn}>✏️</button>
                                  <button onClick={() => handleDelete(ticket._id)} style={iconBtn}>🗑️</button>
                                </div>
                              </div>
                              <h4 style={{ margin: '10px 0' }}>{ticket.title}</h4>
                            </>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {/* --- SEPARATOR --- */}
      <div style={{ margin: '50px 0', borderBottom: '1px solid #e2e8f0' }} />

      {/* --- TICKET DIRECTORY --- */}
      <div style={{ paddingBottom: '40px' }}>
        <h3 style={{ marginBottom: '20px', color: '#1e293b' }}>Ticket Directory (Click to Comment)</h3>
        <div style={listContainer}>
          {filteredTickets.map(ticket => (
            <div key={ticket._id} style={listItemStyle} onClick={() => navigate(`/tickets/${ticket._id}`)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={getPriorityBadge(ticket.priority)}>{ticket.priority}</span>
                <span style={{ fontWeight: 'bold' }}>{ticket.title}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <span style={statusBadgeStyle(ticket.status)}>{ticket.status}</span>
                <div style={{ color: "#64748b", fontSize: "13px", textAlign: 'right' }}>
                  {/*<div>Assignee: {ticket.assignedTo?.name || "Self"}</div>*/}
                  <div style={{ fontSize: '11px' }}>Created by: {ticket.createdBy?.name || "User"}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- STYLES ---
const headerStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" };
const primaryBtn = { background: "#2563eb", color: "#fff", border: "none", padding: "10px 18px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" };
const closeBtn = { background: "#64748b", color: "#fff", border: "none", padding: "10px 18px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" };
const columnHeaderStyle = { fontSize: "14px", color: "#64748b", marginBottom: "20px", textTransform: "uppercase" };
const getPriorityBadge = (p) => ({ padding: "4px 10px", borderRadius: "20px", fontSize: "10px", fontWeight: "bold", background: p === "High" ? "#fee2e2" : p === "Medium" ? "#fef3c7" : "#dcfce7", color: p === "High" ? "#ef4444" : p === "Medium" ? "#d97706" : "#16a34a" });
const gridStyle = { display: "flex", gap: "20px", overflowX: "auto", paddingBottom: "20px" };
const columnStyle = { flex: "1 1 300px", background: "#f1f5f9", padding: "15px", borderRadius: "12px", minHeight: "400px", display: "flex", flexDirection: "column" };
const ticketCard = { background: "#fff", padding: "15px", borderRadius: "10px", border: "1px solid #e2e8f0", marginBottom: "15px" };
const formStyle = { background: "#fff", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "30px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" };
const inputStyle = { width: "100%", padding: "12px", marginBottom: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none" };
const selectStyle = { padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" };
const iconBtn = { background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', padding: 0 };
const saveBtn = { background: '#22c55e', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' };
const cancelBtn = { background: '#94a3b8', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' };
const listContainer = { display: "flex", flexDirection: "column", gap: "12px" };
const listItemStyle = { background: "#fff", padding: "15px 20px", borderRadius: "12px", border: "1px solid #e2e8f0", cursor: "pointer", display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const statusBadgeStyle = (status) => ({
  padding: "4px 10px",
  borderRadius: "6px",
  fontSize: "12px",
  fontWeight: "600",
  background: status === "Done" ? "#dcfce7" : status === "In Progress" ? "#fef3c7" : "#f1f5f9",
  color: status === "Done" ? "#16a34a" : status === "In Progress" ? "#d97706" : "#475569"
});