import { Box, Typography } from '@mui/material';

const Library = () => {
  return (
    <Box>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        Biblioteca
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Seus recursos salvos (músicas, vídeos, imagens, estilos) serão exibidos aqui.
      </Typography>
    </Box>
  );
};

export default Library;
