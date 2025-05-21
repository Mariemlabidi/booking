const express = require('express');
const router = express.Router();
const testimonialController = require('../Controller/testimonialController');
const auth = require('../middleware/auth');

// Route pour récupérer tous les témoignages (accessible publiquement)
router.get('/', testimonialController.getAllTestimonials);

// Route pour récupérer un témoignage par son ID (accessible publiquement)
router.get('/:id', testimonialController.getTestimonialById);

// Route pour ajouter un témoignage (accessible publiquement)
router.post('/', testimonialController.addTestimonial);

// Routes nécessitant une authentification
router.put('/:id', auth.protect, testimonialController.updateTestimonial);
router.delete('/:id', auth.protect, testimonialController.deleteTestimonial);

module.exports = router;