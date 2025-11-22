import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Box } from '@mui/material';
import {
  Dashboard as DashboardIcon,
  VideoLibrary,
  Edit,
  Folder,
  Help,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Novo Projeto', icon: <Edit />, path: '/editor' },
  { text: 'Projetos', icon: <Folder />, path: '/projects' },
  { text: 'Biblioteca', icon: <VideoLibrary />, path: '/library' },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#1e1e1e',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        },
      }}
      variant="permanent"
      anchor="left"
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box
          component="span"
          sx={{
            fontSize: '2rem',
            fontWeight: 700,
            background: 'linear-gradient(45deg, #ff6b35 30%, #ff8c5a 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          LenaVS
        </Box>
      </Box>
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'rgba(255, 107, 53, 0.15)',
                  borderLeft: '3px solid #ff6b35',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 107, 53, 0.2)',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ color: location.pathname === item.path ? 'primary.main' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
      <List>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <Help />
            </ListItemIcon>
            <ListItemText primary="Ajuda" />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar;
