const express = require('express');
const router = express.Router();
const { register, login, getMe, logout } = require('../Controller/authController');
const { protect, restrictTo } = require('../middleware/auth');
const jwt = require('jsonwebtoken');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/logout', protect, logout);

router.get('/admin', protect, restrictTo('admin'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Vous avez accès à la route admin'
  });
});

router.get('/medecin', protect, restrictTo('medecin'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Vous avez accès à la route médecin'
  });
});

router.get('/client', protect, restrictTo('client'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Vous avez accès à la route client'
  });
});

router.get('/verify-token', (req, res) => {
  const authHeader = req.headers.authorization;
  console.log('Authorization Header:', authHeader); 

  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header manquant' });
  }

  const token = authHeader.split(' ')[1];
  console.log('Token reçu:', token);

  if (!token) return res.status(401).json({ message: 'Token manquant' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // 
    console.log('Token décodé:', decoded); 

    return res.status(200).json({ success: true, data: decoded });
  } catch (error) {
    console.error('Erreur de vérification du token:', error.message); 
    return res.status(401).json({ message: 'Token invalide' });
  }
});



module.exports = router;