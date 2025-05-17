const jwt = require('jsonwebtoken');
const User = require('../model/userModel');

// Middleware pour protéger les routes et vérifier l'authentification
exports.protect = async (req, res, next) => {
  try {
    // 1. Vérifier si le token existe dans les headers
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Vous n\'êtes pas connecté. Veuillez vous connecter pour accéder à cette ressource.'
      });
    }

    // 2. Vérifier la validité du token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Vérifier si l'utilisateur existe toujours
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: 'L\'utilisateur associé à ce token n\'existe plus.'
      });
    }

    // 4. Optionnel: Vérifier si l'utilisateur a changé de mot de passe après l'émission du token
    // Vérification sécurisée que la méthode existe et est une fonction
    if (typeof currentUser.passwordChangedAfter === 'function' && 
        currentUser.passwordChangedAfter(decoded.iat)) {
      return res.status(401).json({
        success: false,
        message: 'Votre mot de passe a été modifié récemment. Veuillez vous reconnecter.'
      });
    }

    // Accorder l'accès à la route protégée
    req.user = currentUser;
    next();
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    res.status(401).json({
      success: false,
      message: 'Token invalide ou expiré',
      error: error.message
    });
  }
};

// Middleware pour restreindre l'accès selon les rôles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // Vérifie que req.user existe (après le middleware protect)
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'avez pas la permission d\'effectuer cette action'
      });
    }
    next();
  };
};