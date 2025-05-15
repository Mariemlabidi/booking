const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom du médecin est obligatoire']
  },
  title: {
    type: String,
    required: [true, 'Le titre/spécialité du médecin est obligatoire']
  },
  image: {
    type: String,
    default: 'assets/images/default-doctor.jpg'
  },
  address: {
    type: String,
    required: [true, 'L\'adresse du médecin est obligatoire']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Doctor', doctorSchema);