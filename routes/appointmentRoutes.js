const express = require('express');
const router = express.Router();
const appointmentController = require('../Controller/appointmentController');
const authMiddleware = require('../middleware/auth');
const Appointment = require('../model/appointmentModel');



router.get('/availability', appointmentController.checkAvailability);
router.use(authMiddleware.protect);
router.post('/', appointmentController.createAppointment);
router.get('/', authMiddleware.restrictTo('admin', 'doctor'), appointmentController.getAllAppointments);
router.get('/me/my-appointments', appointmentController.getUserAppointments);
router.get('/:id', appointmentController.getAppointmentById);
router.put('/:id', appointmentController.updateAppointment);
router.patch('/:id/cancel', appointmentController.cancelAppointment);

router.delete('/:id', authMiddleware.restrictTo('admin', 'doctor'), async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Rendez-vous non trouvé.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Rendez-vous supprimé avec succès.'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression du rendez-vous.',
      error: err.message
    });
  }
});

module.exports = router;
