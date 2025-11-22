import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
} from '@mui/material';
import { Add, VideoLibrary, Folder, Style } from '@mui/icons-material';
import { projectService } from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentProjects();
  }, []);

  const loadRecentProjects = async () => {
    try {
      const data = await projectService.getRecentProjects();
      setRecentProjects(data.projects);
    } catch (error) {
      console.error('Erro ao carregar projetos recentes:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { title: 'Total de Projetos', value: '0', icon: <Folder />, color: '#ff6b35' },
    { title: 'Vídeos Exportados', value: '0', icon: <VideoLibrary />, color: '#4ecdc4' },
    { title: 'Estilos Salvos', value: '0', icon: <Style />, color: '#ffd93d' },
  ];

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight={600}>
          Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/editor')}
        >
          Novo Projeto
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor: stat.color + '20',
                    color: stat.color,
                    display: 'flex',
                  }}
                >
                  {stat.icon}
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {stat.title}
                  </Typography>
                  <Typography variant="h4" fontWeight={600}>
                    {stat.value}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            Projetos Recentes
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : recentProjects.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                Nenhum projeto encontrado
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={() => navigate('/editor')}
                sx={{ mt: 2 }}
              >
                Criar Primeiro Projeto
              </Button>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {recentProjects.map((project) => (
                <Grid item xs={12} sm={6} md={4} key={project._id}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { transform: 'scale(1.02)', transition: '0.2s' },
                    }}
                    onClick={() => navigate(`/editor/${project._id}`)}
                  >
                    <CardContent>
                      <Typography variant="h6" noWrap>
                        {project.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Atualizado em: {new Date(project.updatedAt).toLocaleDateString('pt-BR')}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard;
