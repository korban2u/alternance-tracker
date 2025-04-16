const Application = require('../models/Application');

// @desc    Créer une nouvelle candidature
// @route   POST /api/applications
// @access  Private
exports.createApplication = async (req, res) => {
  try {
    const application = await Application.create(req.body);
    res.status(201).json({
      success: true,
      data: application
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtenir toutes les candidatures
// @route   GET /api/applications
// @access  Private
exports.getApplications = async (req, res) => {
  try {
    const applications = await Application.find({})
      .populate('company', 'name sector')
      .populate('offer', 'title location');
      
    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtenir une candidature par ID
// @route   GET /api/applications/:id
// @access  Private
exports.getApplicationById = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('company')
      .populate('offer');
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Candidature non trouvée'
      });
    }
    
    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Mettre à jour une candidature
// @route   PUT /api/applications/:id
// @access  Private
exports.updateApplication = async (req, res) => {
  try {
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Candidature non trouvée'
      });
    }
    
    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Ajouter une entrée dans la timeline d'une candidature
// @route   POST /api/applications/:id/timeline
// @access  Private
exports.addTimelineEntry = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Candidature non trouvée'
      });
    }
    
    application.timeline.push(req.body);
    await application.save();
    
    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Supprimer une candidature
// @route   DELETE /api/applications/:id
// @access  Private
exports.deleteApplication = async (req, res) => {
  try {
    const application = await Application.findByIdAndDelete(req.params.id);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Candidature non trouvée'
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