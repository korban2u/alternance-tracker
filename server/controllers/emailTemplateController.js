const EmailTemplate = require('../models/EmailTemplate');

// @desc    Créer un nouveau template d'email
// @route   POST /api/email-templates
// @access  Private
exports.createEmailTemplate = async (req, res) => {
  try {
    // Ajouter l'ID de l'utilisateur aux données du template
    const templateData = {
      ...req.body,
      user: req.user._id
    };
    
    const template = await EmailTemplate.create(templateData);
    
    res.status(201).json({
      success: true,
      data: template
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtenir tous les templates d'email de l'utilisateur
// @route   GET /api/email-templates
// @access  Private
exports.getEmailTemplates = async (req, res) => {
  try {
    const templates = await EmailTemplate.find({ user: req.user._id });
    
    res.status(200).json({
      success: true,
      count: templates.length,
      data: templates
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtenir un template d'email par ID
// @route   GET /api/email-templates/:id
// @access  Private
exports.getEmailTemplateById = async (req, res) => {
  try {
    const template = await EmailTemplate.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template non trouvé'
      });
    }
    
    res.status(200).json({
      success: true,
      data: template
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Mettre à jour un template d'email
// @route   PUT /api/email-templates/:id
// @access  Private
exports.updateEmailTemplate = async (req, res) => {
  try {
    const template = await EmailTemplate.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id
      },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template non trouvé'
      });
    }
    
    res.status(200).json({
      success: true,
      data: template
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Supprimer un template d'email
// @route   DELETE /api/email-templates/:id
// @access  Private
exports.deleteEmailTemplate = async (req, res) => {
  try {
    const template = await EmailTemplate.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template non trouvé'
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

// @desc    Générer un email à partir d'un template avec des variables
// @route   POST /api/email-templates/:id/generate
// @access  Private
exports.generateEmailFromTemplate = async (req, res) => {
  try {
    const template = await EmailTemplate.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template non trouvé'
      });
    }
    
    const { variables } = req.body;
    
    // Générer le sujet avec les variables
    let subject = template.subject;
    
    // Générer le contenu avec les variables
    let content = template.content;
    
    // Remplacer les variables dans le sujet et le contenu
    if (variables) {
      Object.keys(variables).forEach(key => {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        subject = subject.replace(regex, variables[key]);
        content = content.replace(regex, variables[key]);
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        subject,
        content
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};