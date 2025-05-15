
const express = require('express');
const router = express.Router();
const dashboardController = require('../Controller/dashboardController');
const { protect, restrictTo } = require('../middleware/auth.js');


// Routes protégées accessibles seulement aux administrateurs
router.use(protect, restrictTo('admin'));


// Route pour récupérer les statistiques générales
router.get('/stats', dashboardController.getStats);

// Routes pour récupérer les médecins et patients
router.get('/doctors', dashboardController.getDoctors);
router.get('/patients', dashboardController.getPatients);

// Routes pour récupérer les rendez-vous par médecin et patient
router.get('/doctors/:id/appointments', dashboardController.getDoctorAppointments);
router.get('/patients/:id/appointments', dashboardController.getPatientAppointments);

module.exports = router;