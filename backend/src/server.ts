import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import tournamentRoutes from './routes/tournamentRoutes';
import blindStructureRoutes from './routes/blindStructureRoutes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/blind-structure', blindStructureRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 