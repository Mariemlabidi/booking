// dashboard.controller.js
const Doctor = require('../model/doctorModel');
const Patient = require('../model/patientModel');
const Appointment = require('../model/appointmentModel');
const moment = require('moment');
const mongoose = require('mongoose');

// Récupère les statistiques générales
exports.getStats = async (req, res) => {
  try {
    // Nombre total de médecins
    const totalDoctors = await Doctor.countDocuments();
    
    // Nombre total de patients
    const totalPatients = await Patient.countDocuments();
    
    // Nombre total de rendez-vous
    const totalAppointments = await Appointment.countDocuments();
    
    // Nombre de rendez-vous aujourd'hui
    const today = moment().startOf('day').toDate();
    const tomorrow = moment().add(1, 'days').startOf('day').toDate();
    
    const appointmentsToday = await Appointment.countDocuments({
      appointmentDate: {
        $gte: today,
        $lt: tomorrow
      }
    });
    
    res.status(200).json({
      totalDoctors,
      totalPatients,
      totalAppointments,
      appointmentsToday
    });
  } catch (error) {
    console.error('Error in getStats:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques' });
  }
};

// Récupère la liste des médecins
exports.getDoctors = async (req, res) => {
  try {
    // Ajout d'un log pour vérifier si cette méthode est appelée
    console.log('getDoctors called');
    
    const doctors = await Doctor.find({})
      .select('_id name')
      .sort({ name: 1 });
    
    // Log pour voir si des médecins sont trouvés
    console.log(`Found ${doctors.length} doctors`);
    
    res.status(200).json(doctors.map(doctor => ({
      id: doctor._id.toString(), // Conversion explicite de l'ObjectId en string
      name: doctor.name
    })));
  } catch (error) {
    console.error('Error in getDoctors:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des médecins' });
  }
};

// Récupère la liste des patients
exports.getPatients = async (req, res) => {
  try {
    const patients = await Patient.find({})
      .select('_id name')
      .sort({ name: 1 });
    
    res.status(200).json(patients.map(patient => ({
      id: patient._id.toString(), // Conversion explicite de l'ObjectId en string
      name: patient.name
    })));
  } catch (error) {
    console.error('Error in getPatients:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des patients' });
  }
};

// Récupère les rendez-vous pour un médecin spécifique (par jour)
exports.getDoctorAppointments = async (req, res) => {
  try {
    const doctorId = req.params.id;
    
    // Vérifier si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ message: 'ID de médecin invalide' });
    }
    
    // Récupérer les données des 7 derniers jours
    const endDate = moment().endOf('day').toDate();
    const startDate = moment().subtract(6, 'days').startOf('day').toDate();
    
    // Aggrégation pour compter les rendez-vous par jour
    const appointments = await Appointment.aggregate([
      {
        $match: {
          doctorId: new mongoose.Types.ObjectId(doctorId), // Création correcte d'un ObjectId
          appointmentDate: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$appointmentDate" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id": 1 }
      }
    ]);
    
    // Formater les résultats
    const formattedAppointments = [];
    
    // Créer une entrée pour chaque jour, même s'il n'y a pas de rendez-vous
    for (let i = 0; i < 7; i++) {
      const date = moment().subtract(6 - i, 'days').format('YYYY-MM-DD');
      const existingData = appointments.find(item => item._id === date);
      
      formattedAppointments.push({
        date: date,
        count: existingData ? existingData.count : 0
      });
    }
    
    res.status(200).json(formattedAppointments);
  } catch (error) {
    console.error(`Error in getDoctorAppointments for doctorId ${req.params.id}:`, error);
    res.status(500).json({ message: 'Erreur lors de la récupération des rendez-vous du médecin' });
  }
};

// Récupère les rendez-vous pour un patient spécifique (par mois)
exports.getPatientAppointments = async (req, res) => {
  try {
    const patientId = req.params.id;
    
    // Vérifier si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({ message: 'ID de patient invalide' });
    }
    
    const currentYear = moment().year();
    const startOfYear = moment(`${currentYear}-01-01`).startOf('day').toDate();
    const endOfYear = moment(`${currentYear}-12-31`).endOf('day').toDate();
    
    // Aggrégation pour compter les rendez-vous par mois
    const appointments = await Appointment.aggregate([
      {
        $match: {
          patientId: new mongoose.Types.ObjectId(patientId), // Création correcte d'un ObjectId
          appointmentDate: {
            $gte: startOfYear,
            $lte: endOfYear
          }
        }
      },
      {
        $group: {
          _id: { $month: "$appointmentDate" },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id": 1 }
      }
    ]);
    
    // Noms des mois en français
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
    
    // Formater les résultats
    const formattedAppointments = [];
    
    // Créer une entrée pour chaque mois, même s'il n'y a pas de rendez-vous
    for (let i = 0; i < 12; i++) {
      const monthNumber = i + 1;
      const existingData = appointments.find(item => item._id === monthNumber);
      
      formattedAppointments.push({
        month: months[i],
        count: existingData ? existingData.count : 0
      });
    }
    
    res.status(200).json(formattedAppointments);
  } catch (error) {
    console.error(`Error in getPatientAppointments for patientId ${req.params.id}:`, error);
    res.status(500).json({ message: 'Erreur lors de la récupération des rendez-vous du patient' });
  }
};