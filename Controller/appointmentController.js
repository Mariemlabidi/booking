const Appointment = require('../model/appointmentModel');

// Créer un nouveau rendez-vous
exports.createAppointment = async (req, res) => {
  try {
    const { appointmentDate, appointmentTime } = req.body;

    
    // Vérifier si le créneau horaire est disponible
    const isAvailable = await Appointment.isTimeSlotAvailable(appointmentDate, appointmentTime);
    
    if (!isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Ce créneau horaire est déjà réservé. Veuillez choisir un autre moment.'
      });
    }
    
    // Créer le rendez-vous
      const appointment = await Appointment.create({
      ...req.body,
      user: req.user.id // ✅ correction ici
    });
    
    res.status(201).json({
      success: true,
      message: 'Rendez-vous créé avec succès',
      data: appointment
    });
  } catch (error) {
    console.error('Erreur lors de la création du rendez-vous:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du rendez-vous',
      error: error.message
    });
  }
};

// Récupérer tous les rendez-vous
exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ appointmentDate: 1, appointmentTime: 1 });
    
    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des rendez-vous:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des rendez-vous',
      error: error.message
    });
  }
};

// Récupérer un rendez-vous par ID
exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Rendez-vous non trouvé'
      });
    }
    
    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du rendez-vous:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du rendez-vous',
      error: error.message
    });
  }
};

// Mettre à jour un rendez-vous
exports.updateAppointment = async (req, res) => {
  try {
    // Vérifier si le nouveau créneau est disponible (si date/heure changées)
    if (req.body.appointmentDate && req.body.appointmentTime) {
      const currentAppointment = await Appointment.findById(req.params.id);
      const isSameDateTime = 
        currentAppointment.appointmentDate.toISOString().split('T')[0] === new Date(req.body.appointmentDate).toISOString().split('T')[0] && 
        currentAppointment.appointmentTime === req.body.appointmentTime;
      
      if (!isSameDateTime) {
        const isAvailable = await Appointment.isTimeSlotAvailable(req.body.appointmentDate, req.body.appointmentTime);
        if (!isAvailable) {
          return res.status(400).json({
            success: false,
            message: 'Ce créneau horaire est déjà réservé. Veuillez choisir un autre moment.'
          });
        }
      }
    }
    
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Rendez-vous non trouvé'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Rendez-vous mis à jour avec succès',
      data: appointment
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du rendez-vous:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du rendez-vous',
      error: error.message
    });
  }
};

// Vérifier la disponibilité des créneaux
exports.checkAvailability = async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'La date est requise pour vérifier la disponibilité'
      });
    }
    
    // Créneaux possibles (exemple)
    const allTimeSlots = [
      '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
    ];
    
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Trouver tous les rendez-vous pour cette date
    const bookedAppointments = await Appointment.find({
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['planifié', 'confirmé'] }
    }).select('appointmentTime');
    
    // Collecter les créneaux déjà réservés
    const bookedTimeSlots = bookedAppointments.map(apt => apt.appointmentTime);
    
    // Déterminer les créneaux disponibles
    const availableTimeSlots = allTimeSlots.filter(timeSlot => !bookedTimeSlots.includes(timeSlot));
    
    res.status(200).json({
      success: true,
      date: date,
      availableTimeSlots,
      bookedTimeSlots
    });
  } catch (error) {
    console.error('Erreur lors de la vérification de disponibilité:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification de disponibilité',
      error: error.message
    });
  }
};
// GET /api/appointments/user
exports.getUserAppointments = async (req, res) => {
  try {
    const userEmail = req.user.email; // L'email de l'utilisateur connecté (supposé injecté par un middleware d'auth)

    const appointments = await Appointment.find({ user: req.user._id }).sort({ appointmentDate: -1 });


    res.status(200).json({
      success: true,
      data: appointments
    });
  } catch (err) {
    console.error('Erreur lors de la récupération des rendez-vous utilisateur :', err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des rendez-vous.'
    });
  }
};
// PUT /api/appointments/:id/cancel
exports.cancelAppointment = async (req, res) => {
  const appointmentId = req.params.id;

  try {
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Rendez-vous introuvable.'
      });
    }

    // Vérifier que le rendez-vous appartient à l'utilisateur ou qu'il est admin
    if (req.user.role === 'client' && appointment.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à annuler ce rendez-vous.'
      });
    }

    appointment.status = 'cancelled'; // ou "annulé" si tu gardes le français
    await appointment.save();

    res.status(200).json({
      success: true,
      message: 'Rendez-vous annulé avec succès.',
      data: appointment
    });
  } catch (err) {
    console.error('Erreur lors de l\'annulation du rendez-vous :', err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l\'annulation du rendez-vous.'
    });
  }
};
