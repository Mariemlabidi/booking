const Testimonial = require('../model/testimonialModel');
const User = require('../model/userModel');

// Récupérer tous les témoignages
exports.getAllTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find()
      .sort({ createdAt: -1 }) 
      .lean();

    return res.status(200).json({ success: true, testimonials });
  } catch (error) {
    console.error('Erreur lors de la récupération des témoignages:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération des témoignages'
    });
  }
};

// Ajouter un nouveau témoignage
exports.addTestimonial = async (req, res) => {
  try {
    const { name, subtitle, content } = req.body;

    // Vérification des données obligatoires
    if (!name || !subtitle || !content) {
      return res.status(400).json({ 
        success: false, 
        message: 'Veuillez fournir un nom, un sous-titre et un contenu'
      });
    }

    // Créer un nouvel objet témoignage
    const newTestimonial = new Testimonial({
      name,
      subtitle,
      content
    });

    // Si l'utilisateur est authentifié, associer son ID au témoignage
    if (req.user && req.user._id) {
      newTestimonial.userId = req.user._id;
    }

    // Enregistrer le témoignage dans la base de données
    await newTestimonial.save();

    return res.status(201).json({
      success: true,
      message: 'Témoignage ajouté avec succès',
      testimonial: newTestimonial
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du témoignage:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de l\'ajout du témoignage'
    });
  }
};

// Récupérer un témoignage par son ID
exports.getTestimonialById = async (req, res) => {
  try {
    const { id } = req.params;
    const testimonial = await Testimonial.findById(id).lean();

    if (!testimonial) {
      return res.status(404).json({ 
        success: false, 
        message: 'Témoignage non trouvé'
      });
    }

    return res.status(200).json({ success: true, testimonial });
  } catch (error) {
    console.error('Erreur lors de la récupération du témoignage:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération du témoignage'
    });
  }
};

// Mettre à jour un témoignage
exports.updateTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, subtitle, content } = req.body;

    // Vérification des données obligatoires
    if (!name || !subtitle || !content) {
      return res.status(400).json({ 
        success: false, 
        message: 'Veuillez fournir un nom, un sous-titre et un contenu' 
      });
    }

    // Rechercher le témoignage à mettre à jour
    const testimonial = await Testimonial.findById(id);

    if (!testimonial) {
      return res.status(404).json({ 
        success: false, 
        message: 'Témoignage non trouvé' 
      });
    }

    // Vérifier si l'utilisateur est autorisé à modifier ce témoignage
    // (administrateur ou propriétaire du témoignage)
    if (
      req.user.role !== 'admin' && 
      (!testimonial.userId || !testimonial.userId.equals(req.user._id))
    ) {
      return res.status(403).json({ 
        success: false, 
        message: 'Non autorisé à modifier ce témoignage' 
      });
    }

    // Mettre à jour les données du témoignage
    testimonial.name = name;
    testimonial.subtitle = subtitle;
    testimonial.content = content;
    testimonial.updatedAt = Date.now();

    // Enregistrer les modifications
    await testimonial.save();

    return res.status(200).json({
      success: true,
      message: 'Témoignage mis à jour avec succès',
      testimonial
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du témoignage:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la mise à jour du témoignage' 
    });
  }
};

// Supprimer un témoignage
exports.deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;

    // Rechercher le témoignage à supprimer
    const testimonial = await Testimonial.findById(id);

    if (!testimonial) {
      return res.status(404).json({ 
        success: false, 
        message: 'Témoignage non trouvé' 
      });
    }

    // Vérifier si l'utilisateur est autorisé à supprimer ce témoignage
    // (administrateur ou propriétaire du témoignage)
    if (
      req.user.role !== 'admin' && 
      (!testimonial.userId || !testimonial.userId.equals(req.user._id))
    ) {
      return res.status(403).json({ 
        success: false, 
        message: 'Non autorisé à supprimer ce témoignage' 
      });
    }

    // Supprimer le témoignage
    await Testimonial.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Témoignage supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du témoignage:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la suppression du témoignage' 
    });
  }
};