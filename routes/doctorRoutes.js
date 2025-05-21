// routes/doctor.routes.js
const express = require('express');
const router = express.Router();
const DoctorController = require('../Controller/doctorController');
const upload = require('../config/upload.config.js');

// Route GET pour récupérer tous les médecins
router.get('/', DoctorController.getAllDoctors);



// Route GET pour récupérer un médecin par son ID
router.get('/:id', DoctorController.getDoctorById);

// Route POST pour ajouter un nouveau médecin
router.post('/', upload.single('image'), DoctorController.createDoctor);

// Route PUT pour mettre à jour un médecin
router.put('/:id', upload.single('image'), DoctorController.updateDoctor);

// Route DELETE pour supprimer un médecin
router.delete('/:id', DoctorController.deleteDoctor);


module.exports = router;