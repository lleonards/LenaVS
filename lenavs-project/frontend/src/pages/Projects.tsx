import { Box, Typography } from '@mui/material';

const Projects = () => {
  return (
    <Box>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        Meus Projetos
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Lista de todos os projetos criados será exibida aqui.
      </Typography>
    </Box>
  );
};

export default Projects;
