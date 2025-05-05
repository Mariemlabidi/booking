const Doctor = require('../model/doctorModel');

class DoctorController {
  // Récupérer tous les médecins
  static async getAllDoctors(req, res) {
    try {
      const doctors = await Doctor.find();
      res.json(doctors);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des médecins' });
    }
  }

  // Récupérer un médecin par son ID
  static async getDoctorById(req, res) {
    try {
      const id = req.params.id;
      const doctor = await Doctor.findById(id);
      
      if (!doctor) {
        return res.status(404).json({ message: 'Médecin non trouvé' });
      }
      
      res.json(doctor);
    } catch (error) {
      console.error('Error fetching doctor:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération du médecin' });
    }
  }

  // Ajouter un nouveau médecin
  static async createDoctor(req, res) {
    try {
      const { name, title, address } = req.body;
      
      if (!name || !title || !address) {
        return res.status(400).json({ message: 'Tous les champs sont obligatoires' });
      }
      
      // Construire le chemin de l'image
      const PORT = process.env.PORT || 3000;
      const imagePath = req.file
        ? `http://localhost:${PORT}/uploads/${req.file.filename}`
        : 'assets/images/default-doctor.jpg';
      
      const newDoctor = new Doctor({
        name,
        title,
        address,
        image: imagePath
      });
      
      const savedDoctor = await newDoctor.save();
      res.status(201).json(savedDoctor);
    } catch (error) {
      console.error('Error creating doctor:', error);
      res.status(500).json({ message: 'Erreur lors de la création du médecin' });
    }
  }

  // Mettre à jour un médecin
  static async updateDoctor(req, res) {
    try {
      const id = req.params.id;
      const { name, title, address } = req.body;
      
      if (!name || !title || !address) {
        return res.status(400).json({ message: 'Tous les champs sont obligatoires' });
      }
      
      const doctorData = {
        name,
        title,
        address
      };
      
      // Mettre à jour l'image si une nouvelle est téléchargée
      if (req.file) {
        const PORT = process.env.PORT || 3000;
        doctorData.image = `http://localhost:${PORT}/uploads/${req.file.filename}`;
      }
      
      const updatedDoctor = await Doctor.findByIdAndUpdate(
        id, 
        doctorData, 
        { new: true, runValidators: true }
      );
      
      if (!updatedDoctor) {
        return res.status(404).json({ message: 'Médecin non trouvé' });
      }
      
      res.json(updatedDoctor);
    } catch (error) {
      console.error('Error updating doctor:', error);
      res.status(500).json({ message: 'Erreur lors de la mise à jour du médecin' });
    }
  }

  // Supprimer un médecin
  static async deleteDoctor(req, res) {
    try {
      const id = req.params.id;
      const deletedDoctor = await Doctor.findByIdAndDelete(id);
      
      if (!deletedDoctor) {
        return res.status(404).json({ message: 'Médecin non trouvé' });
      }
      
      res.json({ message: 'Médecin supprimé avec succès' });
    } catch (error) {
      console.error('Error deleting doctor:', error);
      res.status(500).json({ message: 'Erreur lors de la suppression du médecin' });
    }
  }
}

module.exports = DoctorController;