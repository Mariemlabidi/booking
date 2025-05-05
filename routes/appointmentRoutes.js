const express = require('express');
const router = express.Router();
const appointmentController = require('../Controller/appointmentController');
const { validateAppointment, checkValidationErrors } = require('../middleware/validation');

// Route pour créer un rendez-vous
router.post('/', validateAppointment, checkValidationErrors, appointmentController.createAppointment);

// Route pour récupérer tous les rendez-vous
router.get('/', appointmentController.getAllAppointments);

// Route pour vérifier la disponibilité des créneaux
router.get('/availability', appointmentController.checkAvailability);

// Route pour récupérer un rendez-vous spécifique
router.get('/:id', appointmentController.getAppointmentById);

// Route pour mettre à jour un rendez-vous
router.put('/:id', validateAppointment, checkValidationErrors, appointmentController.updateAppointment);

// Route pour annuler un rendez-vous
router.patch('/:id/cancel', appointmentController.cancelAppointment);

module.exports = router;