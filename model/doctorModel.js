const mongoose = require('mongoose');

// Définition du schéma pour le modèle Doctor
const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: 'assets/images/default-doctor.jpg'
  },
  address: {
    type: String,
    required: true
  }
}, {
  timestamps: true // Ajoute automatiquement createdAt et updatedAt
});

// Création du modèle à partir du schéma
const Doctor = mongoose.model('Doctor', doctorSchema);

module.exports = Doctor;