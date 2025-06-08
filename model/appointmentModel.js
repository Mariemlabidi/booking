const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  patientName: {
    type: String,
    required: [true, 'Le nom du patient est requis']
  },
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Veuillez fournir un email valide']
  },
  phone: {
    type: String,
    required: [true, 'Le numéro de téléphone est requis'],
    match: [/^[0-9]{8,15}$/, 'Le numéro de téléphone doit contenir entre 8 et 15 chiffres']
  },
  appointmentDate: {
    type: Date,
    required: [true, 'La date du rendez-vous est requise']
  },
  appointmentTime: {
    type: String,
    required: [true, 'L\'heure du rendez-vous est requise']
  },
  reason: {
    type: String,
    required: [true, 'La raison du rendez-vous est requise']
  },
  status: {
    type: String,
    enum: ['planifié', 'confirmé', 'annulé', 'terminé'],
    default: 'planifié'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// ✅ Définition de la méthode statique
appointmentSchema.statics.isTimeSlotAvailable = async function (date, time) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const existing = await this.findOne({
    appointmentDate: { $gte: startOfDay, $lte: endOfDay },
    appointmentTime: time,
    status: { $in: ['planifié', 'confirmé'] }
  });

  return !existing;
};

const Appointment = mongoose.model('Appointment', appointmentSchema);
module.exports = Appointment;
