import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function Tickets() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Data States
  const [tickets, setTickets] = useState([]);
  const [project, setProject] = useState({});
  const [users, setUsers] = useState([]);

  // DAY 10 STATES: Search and Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState("All");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [assignedTo, setAssignedTo] = useState("");

  const columns = ["Todo", "In Progress", "Done"];

  // Fetch logic
  const fetchTickets = useCallback(async () => {
    try {
      const res = await axios.get(`https://bug-tracker-api-1uut.onrender.com/api/tickets/project/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTickets(res.data);
    } catch (err) { console.error(err); }
  }, [projectId, token]);

  const fetchProjectDetails = useCallback(async () => {
    try {
      const res = await axios.get(`https://bug-tracker-api-1uut.onrender.com/api/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProject(res.data);
    } catch (err) { console.error(err); }
  }, [projectId, token]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) { console.error(err); }
  }, [token]);

  useEffect(() => {
    if (!token) return navigate("/");
    fetchProjectDetails();
    fetchTickets();
    fetchUsers();
  }, [projectId, token, navigate, fetchProjectDetails, fetchTickets, fetchUsers]);

  // DAY 10 LOGIC: Dynamic Rendering
  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === "All" || t.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) return;

    const ticketId = draggableId;
    const newStatus = destination.droppableId;
    setTickets(tickets.map(t => t._id === ticketId ? { ...t, status: newStatus } : t));

    try {
      await axios.put(`https://bug-tracker-api-1uut.onrender.com/api/tickets/${ticketId}/status`, 
        { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
    } catch (err) { fetchTickets(); }
  };

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <div>
          <h2 style={{ margin: 0 }}>{project.name}</h2>
          <p style={{ color: "#64748b" }}>Manage and track issues</p>
        </div>
        <button onClick={() => setIsFormOpen(!isFormOpen)} style={primaryBtn}>
          {isFormOpen ? "Close Form" : "+ Create Ticket"}
        </button>
      </header>

      {/* DAY 10 UI: Search Bar & Filters */}
      <div style={filterBarContainer}>
        <div style={searchWrapper}>
          <span style={searchIcon}>🔍</span>
          <input 
            placeholder="Search tickets by title..." 
            style={searchInput} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          style={filterSelect} 
          value={filterPriority} 
          onChange={(e) => setFilterPriority(e.target.value)}
        >
          <option value="All">All Priorities</option>
          <option value="High">High Priority</option>
          <option value="Medium">Medium Priority</option>
          <option value="Low">Low Priority</option>
        </select>
      </div>

      

      {/* KANBAN BOARD USING filteredTickets */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div style={gridStyle}>
          {columns.map(col => (
            <Droppable droppableId={col} key={col}>
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} style={columnStyle}>
                  <h3 style={columnHeaderStyle}>{col}</h3>
                  {filteredTickets.filter(t => t.status === col).map((ticket, index) => (
                    <Draggable key={ticket._id} draggableId={ticket._id} index={index}>
                      {(provided) => (
                        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} style={{ ...ticketCard, ...provided.draggableProps.style }}>
                          <span style={getPriorityBadge(ticket.priority)}>{ticket.priority}</span>
                          <h4 style={{ margin: '15px 0 10px 0' }}>{ticket.title}</h4>
                          <div style={cardFooter}>
                             <div style={smallAvatar}>{ticket.assignedTo?.name?.charAt(0) || "?"}</div>
                          </div>
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
    </div>
  );
}

// --- NEW STYLES FOR DAY 10 ---
const filterBarContainer = { display: "flex", gap: "15px", marginBottom: "25px", alignItems: "center" };
const searchWrapper = { position: "relative", flex: 1 };
const searchIcon = { position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" };
const searchInput = { width: "100%", padding: "10px 10px 10px 35px", borderRadius: "8px", border: "1px solid #e2e8f0", outline: "none", fontSize: "14px" };
const filterSelect = { padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#fff", outline: "none", cursor: "pointer", fontSize: "14px" };

// --- EXISTING STYLES ---
const getPriorityBadge = (p) => ({ padding: "4px 10px", borderRadius: "20px", fontSize: "10px", fontWeight: "bold", background: p === "High" ? "#fee2e2" : p === "Medium" ? "#fef3c7" : "#dcfce7", color: p === "High" ? "#ef4444" : p === "Medium" ? "#d97706" : "#16a34a" });
const containerStyle = { padding: "0" };
const headerStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" };
const primaryBtn = { background: "#2563eb", color: "#fff", border: "none", padding: "10px 18px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" };
const gridStyle = { display: "flex", gap: "20px", alignItems: "flex-start" };
const columnStyle = { flex: 1, background: "#f1f5f9", padding: "15px", borderRadius: "12px", minHeight: "500px" };
const columnHeaderStyle = { fontSize: "14px", color: "#64748b", marginBottom: "20px", textTransform: "uppercase" };
const ticketCard = { background: "#fff", padding: "15px", borderRadius: "10px", border: "1px solid #e2e8f0", marginBottom: "15px" };
const cardFooter = { display: "flex", justifyContent: "flex-end" };
const smallAvatar = { width: "24px", height: "24px", borderRadius: "50%", background: "#3b82f6", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px" };