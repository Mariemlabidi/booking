const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const appointmentRoutes = require('./routes/appointmentRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const testimonialRoutes= require('./routes/testimonialRoutes');


const app = express();
app.use(express.static('uploads'));
// Middleware
app.use(cors());
app.use(express.json());

app.get('/image/:filename', (req, res) => {
  const fileName = req.params.filename;
  res.sendFile(`${__dirname}/uploads/${fileName}`);
});
// Routes
app.use('/api/appointments', appointmentRoutes);
app.use('/api/doctors',doctorRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/verify-token', authRoutes);
app.use('/api/login',authRoutes),
app.use('/api/testimonials' , testimonialRoutes);





// Route de test
app.get('/', (req, res) => {
  res.send('API de gestion des rendez-vous médicaux est opérationnelle');
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée'
  });
});

// Connexion à la base de données
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connexion à la base de données établie');
    
    // Démarrer le serveur
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Serveur démarré sur le port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Erreur de connexion à la base de données:', err.message);
    process.exit(1);
  });