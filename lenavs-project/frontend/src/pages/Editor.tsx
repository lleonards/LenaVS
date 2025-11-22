import { Box, Typography } from '@mui/material';

const Editor = () => {
  return (
    <Box>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        Editor de Vídeo Karaokê
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Interface do editor será implementada aqui com os seguintes painéis:
      </Typography>
      <Box component="ul" sx={{ mt: 2 }}>
        <li>Painel 1: Upload de Arquivos</li>
        <li>Painel 2: Editor de Letras</li>
        <li>Painel 3: Preview com Player</li>
        <li>Painel 4: Estilo Global</li>
        <li>Painel 5: Exportação</li>
      </Box>
    </Box>
  );
};

export default Editor;
