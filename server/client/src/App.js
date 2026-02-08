import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Tickets from "./pages/Tickets";
import TicketDetails from "./pages/TicketDetails";
import Team from "./pages/Team";
import Settings from "./pages/Settings";
import Layout from "./components/Layout";

function App() {
  // Retrieve user data from localStorage to pass to the Layout
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* PROTECTED ROUTES WRAPPED WITH LAYOUT */}
      <Route
        path="/dashboard"
        element={
          <Layout user={user}>
            <Dashboard />
          </Layout>
        }
      />
      
      <Route
        path="/projects"
        element={
          <Layout user={user}>
            <Projects />
          </Layout>
        }
      />

      <Route
        path="/projects/:projectId"
        element={
          <Layout user={user}>
            <Tickets />
          </Layout>
        }
      />

      <Route
        path="/tickets/:id"
        element={
          <Layout user={user}>
            <TicketDetails />
          </Layout>
        }
      />

      <Route
        path="/team"
        element={
          <Layout user={user}>
            <Team />
          </Layout>
        }
      />

      <Route
        path="/settings"
        element={
          <Layout user={user}>
            <Settings />
          </Layout>
        }
      />
    </Routes>
  );
}

export default App;