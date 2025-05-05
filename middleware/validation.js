const { body, validationResult } = require('express-validator');

// Validation des données de rendez-vous
const validateAppointment = [
  body('patientName')
    .notEmpty().withMessage('Le nom du patient est requis')
    .isString().withMessage('Le nom doit être une chaîne de caractères'),
  
  body('email')
    .notEmpty().withMessage('L\'email est requis')
    .isEmail().withMessage('Format d\'email invalide'),
  
  body('phone')
    .notEmpty().withMessage('Le numéro de téléphone est requis')
    .matches(/^[0-9]{8,15}$/).withMessage('Le numéro de téléphone doit contenir entre 8 et 15 chiffres'),
  
  body('appointmentDate')
    .notEmpty().withMessage('La date du rendez-vous est requise')
    .isISO8601().withMessage('Format de date invalide')
    .custom(value => {
      const date = new Date(value);
      const now = new Date();
      if (date < now) {
        throw new Error('La date du rendez-vous ne peut pas être dans le passé');
      }
      return true;
    }),
  
  body('appointmentTime')
    .notEmpty().withMessage('L\'heure du rendez-vous est requise'),
  
  body('reason')
    .notEmpty().withMessage('La raison du rendez-vous est requise')
];

// Middleware pour vérifier les erreurs de validation
const checkValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

module.exports = {
  validateAppointment,
  checkValidationErrors
};