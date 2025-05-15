const express = require('express');
const router = express.Router();
const appointmentController = require('../Controller/appointmentController');
const authMiddleware = require('../middleware/auth');

// Routes publiques
router.get('/availability', appointmentController.checkAvailability);

// Routes protégées (nécessitent authentification)
router.post('/', authMiddleware.protect, appointmentController.createAppointment);
router.get('/', authMiddleware.protect, appointmentController.getAllAppointments);
router.get('/:id', authMiddleware.protect, appointmentController.getAppointmentById);
router.put('/:id', authMiddleware.protect, appointmentController.updateAppointment);
router.patch('/:id/cancel', authMiddleware.protect, appointmentController.cancelAppointment);

module.exports = router;