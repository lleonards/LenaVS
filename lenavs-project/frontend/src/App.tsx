import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Editor from './pages/Editor';
import Library from './pages/Library';
import Projects from './pages/Projects';
import Login from './pages/Login';
import Register from './pages/Register';
import { useAuthStore } from './stores/authStore';

function App() {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/editor/:projectId?" element={<Editor />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/library" element={<Library />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Box>
      </Box>
    </Box>
  );
}

export default App;
