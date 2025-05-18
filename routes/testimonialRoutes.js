const express = require('express');
const router = express.Router();
const testimonialController = require('../Controller/testimonialController');
const authMiddleware = require('../middleware/auth');

// Route pour récupérer tous les témoignages (accessible publiquement)
router.get('/', testimonialController.getAllTestimonials);

// Route pour récupérer un témoignage par son ID (accessible publiquement)
router.get('/:id', testimonialController.getTestimonialById);

// Route pour ajouter un nouveau témoignage
// La vérification d'authentification est optionnelle ici pour permettre
// aux utilisateurs non connectés d'ajouter des témoignages
// Modification: Pas d'authentification requise pour soumettre un témoignage
router.post('/', testimonialController.addTestimonial);

// Routes nécessitant une authentification
router.put('/:id', authMiddleware.verifyToken, testimonialController.updateTestimonial);
router.delete('/:id', authMiddleware.verifyToken, testimonialController.deleteTestimonial);

module.exports = router;