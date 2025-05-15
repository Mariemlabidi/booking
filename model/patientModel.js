const mongoose = require('mongoose');

// Définition du schéma pour le modèle Patient
const patientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Veuillez fournir un email valide']
  },
  phone: {
    type: String,
    required: true,
    match: [/^[0-9]{8,15}$/, 'Le numéro de téléphone doit contenir entre 8 et 15 chiffres']
  },
  birthDate: {
    type: Date
  },
  address: {
    type: String
  }
}, {
  timestamps: true
});

// Création du modèle à partir du schéma
const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient;