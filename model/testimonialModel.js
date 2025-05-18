const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  subtitle: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Mise à jour du champ updatedAt avant chaque sauvegarde
testimonialSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Testimonial = mongoose.model('Testimonial', testimonialSchema);

module.exports = Testimonial;