const Reminder = require('../models/Reminder');
const Application = require('../models/Application');

// @desc    Créer un nouveau rappel
// @route   POST /api/reminders
// @access  Private
exports.createReminder = async (req, res) => {
  try {
    // Ajouter l'ID de l'utilisateur aux données du rappel
    const reminderData = {
      ...req.body,
      user: req.user._id
    };
    
    const reminder = await Reminder.create(reminderData);
    
    // Si le rappel est lié à une candidature, mettre à jour la prochaine action
    if (reminder.application) {
      await Application.findByIdAndUpdate(
        reminder.application,
        {
          nextAction: reminder.title,
          nextActionDate: reminder.date
        }
      );
    }
    
    res.status(201).json({
      success: true,
      data: reminder
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtenir tous les rappels de l'utilisateur
// @route   GET /api/reminders
// @access  Private
exports.getReminders = async (req, res) => {
  try {
    // Construction de la requête
    let query = { user: req.user._id };
    
    // Filtrer par type si fourni
    if (req.query.type) {
      query.type = req.query.type;
    }
    
    // Filtrer par statut (complété ou non)
    if (req.query.completed) {
      query.isCompleted = req.query.completed === 'true';
    }
    
    // Filtrer par date (période)
    if (req.query.startDate && req.query.endDate) {
      query.date = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    } else if (req.query.startDate) {
      query.date = { $gte: new Date(req.query.startDate) };
    } else if (req.query.endDate) {
      query.date = { $lte: new Date(req.query.endDate) };
    }
    
    // Récupérer les rappels avec population des références
    const reminders = await Reminder.find(query)
      .populate('application', 'type status')
      .populate('company', 'name')
      .populate('offer', 'title')
      .sort({ date: 1 });
    
    res.status(200).json({
      success: true,
      count: reminders.length,
      data: reminders
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtenir les rappels à venir
// @route   GET /api/reminders/upcoming
// @access  Private
exports.getUpcomingReminders = async (req, res) => {
  try {
    const now = new Date();
    const endDate = new Date();
    endDate.setDate(now.getDate() + (req.query.days ? parseInt(req.query.days) : 7));
    
    const reminders = await Reminder.find({
      user: req.user._id,
      isCompleted: false,
      date: {
        $gte: now,
        $lte: endDate
      }
    })
      .populate('application', 'type status')
      .populate('company', 'name')
      .populate('offer', 'title')
      .sort({ date: 1 });
    
    res.status(200).json({
      success: true,
      count: reminders.length,
      data: reminders
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtenir un rappel par ID
// @route   GET /api/reminders/:id
// @access  Private
exports.getReminderById = async (req, res) => {
  try {
    const reminder = await Reminder.findOne({
      _id: req.params.id,
      user: req.user._id
    })
      .populate('application')
      .populate('company')
      .populate('offer')
      .populate('emailTemplate');
    
    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Rappel non trouvé'
      });
    }
    
    res.status(200).json({
      success: true,
      data: reminder
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Mettre à jour un rappel
// @route   PUT /api/reminders/:id
// @access  Private
exports.updateReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id
      },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Rappel non trouvé'
      });
    }
    
    // Si le statut est passé à complété, mettre à jour la candidature si nécessaire
    if (reminder.isCompleted && reminder.application) {
      await Application.findByIdAndUpdate(
        reminder.application,
        {
          $push: {
            timeline: {
              date: new Date(),
              action: `Rappel effectué: ${reminder.title}`,
              notes: reminder.description
            }
          }
        }
      );
    }
    
    res.status(200).json({
      success: true,
      data: reminder
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Marquer un rappel comme complété
// @route   PUT /api/reminders/:id/complete
// @access  Private
exports.completeReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id
      },
      {
        isCompleted: true,
        updatedAt: Date.now()
      },
      { new: true }
    );
    
    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Rappel non trouvé'
      });
    }
    
    // Ajouter une entrée dans la timeline de la candidature si applicable
    if (reminder.application) {
      await Application.findByIdAndUpdate(
        reminder.application,
        {
          $push: {
            timeline: {
              date: new Date(),
              action: `Rappel effectué: ${reminder.title}`,
              notes: reminder.description
            }
          }
        }
      );
    }
    
    res.status(200).json({
      success: true,
      data: reminder
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Supprimer un rappel
// @route   DELETE /api/reminders/:id
// @access  Private
exports.deleteReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Rappel non trouvé'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};