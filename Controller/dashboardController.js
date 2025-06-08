const Doctor = require('../model/doctorModel');
const Patient = require('../model/patientModel');
const Appointment = require('../model/appointmentModel');
const User = require('../model/userModel');
const moment = require('moment');
const mongoose = require('mongoose');

// Récupère les statistiques générales
exports.getStats = async (req, res) => {
  try {
    const totalDoctors = await Doctor.countDocuments();
    const totalPatients = await Patient.countDocuments();
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
    const doctors = await Doctor.find({})
      .select('_id name')
      .sort({ name: 1 });
    
    res.status(200).json(doctors.map(doctor => ({
      id: doctor._id.toString(),
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
      id: patient._id.toString(),
      name: patient.name
    })));
  } catch (error) {
    console.error('Error in getPatients:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des patients' });
  }
};

exports.getDoctorAppointments = async (req, res) => {
  try {
    const doctorId = req.params.id;
    console.log('=== DEBUG getDoctorAppointments ===');
    console.log('DoctorId reçu:', doctorId);
    
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      console.log('ID invalide:', doctorId);
      return res.status(400).json({ message: 'ID de médecin invalide' });
    }
    
    // ✅ CORRIGÉ : Période élargie pour inclure les dates futures
    // Récupérer les données des 3 derniers jours + aujourd'hui + 3 prochains jours
    const startDate = moment().subtract(3, 'days').startOf('day').toDate();
    const endDate = moment().add(3, 'days').endOf('day').toDate();
    
    console.log('Période de recherche élargie:', { 
      startDate: moment(startDate).format('YYYY-MM-DD'), 
      endDate: moment(endDate).format('YYYY-MM-DD') 
    });
    
    // Vérifier d'abord combien de rendez-vous ce médecin a au total
    const totalAppointmentsForDoctor = await Appointment.countDocuments({ 
      doctor: new mongoose.Types.ObjectId(doctorId) 
    });
    console.log(`Total rendez-vous pour ce médecin: ${totalAppointmentsForDoctor}`);
    
    // Vérifier les rendez-vous dans la période
    const appointmentsInPeriod = await Appointment.find({
      doctor: new mongoose.Types.ObjectId(doctorId),
      appointmentDate: {
        $gte: startDate,
        $lte: endDate
      }
    });
    console.log(`Rendez-vous dans la période: ${appointmentsInPeriod.length}`);
    console.log('Détails des rendez-vous:', appointmentsInPeriod.map(apt => ({
      date: moment(apt.appointmentDate).format('YYYY-MM-DD'),
      patientName: apt.patientName,
      time: apt.appointmentTime
    })));
    
    // Agrégation pour grouper par date
    const appointments = await Appointment.aggregate([
      {
        $match: {
          doctor: new mongoose.Types.ObjectId(doctorId), 
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
    
    console.log('Résultats de l\'agrégation:', appointments);
    
    // Formater les résultats pour 7 jours (3 passés + aujourd'hui + 3 futurs)
    const formattedAppointments = [];
    
    for (let i = -3; i <= 3; i++) {
      const date = moment().add(i, 'days').format('YYYY-MM-DD');
      const existingData = appointments.find(item => item._id === date);
      
      formattedAppointments.push({
        date: date,
        count: existingData ? existingData.count : 0
      });
    }
    
    console.log('Données formatées envoyées:', formattedAppointments);
    console.log('=== FIN DEBUG getDoctorAppointments ===');
    
    res.status(200).json(formattedAppointments);
  } catch (error) {
    console.error(`Error in getDoctorAppointments for doctorId ${req.params.id}:`, error);
    res.status(500).json({ message: 'Erreur lors de la récupération des rendez-vous du médecin' });
  }
};

exports.getPatientAppointments = async (req, res) => {
  try {
    const patientId = req.params.id;
    console.log('=== DEBUG getPatientAppointments ===');
    console.log('PatientId reçu:', patientId);
    
    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      console.log('ID invalide:', patientId);
      return res.status(400).json({ message: 'ID de patient invalide' });
    }
    
    // Récupérer le nom du patient
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient non trouvé' });
    }
    
    console.log('Patient trouvé:', patient.name);
    
    const currentYear = moment().year();
    const startOfYear = moment(`${currentYear}-01-01`).startOf('day').toDate();
    const endOfYear = moment(`${currentYear}-12-31`).endOf('day').toDate();
    
    // Chercher par nom de patient dans les rendez-vous
    const appointments = await Appointment.aggregate([
      {
        $match: {
          patientName: patient.name,
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
    
    console.log('Résultats de l\'agrégation patient:', appointments);
    
    // Noms des mois en français
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
    
    // Formater les résultats
    const formattedAppointments = [];
    
    for (let i = 0; i < 12; i++) {
      const monthNumber = i + 1;
      const existingData = appointments.find(item => item._id === monthNumber);
      
      formattedAppointments.push({
        month: months[i],
        count: existingData ? existingData.count : 0
      });
    }
    
    console.log('Données formatées patient envoyées:', formattedAppointments);
    console.log('=== FIN DEBUG getPatientAppointments ===');
    
    res.status(200).json(formattedAppointments);
  } catch (error) {
    console.error(`Error in getPatientAppointments for patientId ${req.params.id}:`, error);
    res.status(500).json({ message: 'Erreur lors de la récupération des rendez-vous du patient' });
  }
};