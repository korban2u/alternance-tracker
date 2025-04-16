const LetterTemplate = require('../models/LetterTemplate');

// @desc    Créer un nouveau template de lettre de motivation
// @route   POST /api/letter-templates
// @access  Private
exports.createLetterTemplate = async (req, res) => {
  try {
    // Ajouter l'ID de l'utilisateur aux données du template
    const templateData = {
      ...req.body,
      user: req.user._id
    };
    
    const template = await LetterTemplate.create(templateData);
    
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

// @desc    Obtenir tous les templates de lettre de motivation de l'utilisateur
// @route   GET /api/letter-templates
// @access  Private
exports.getLetterTemplates = async (req, res) => {
  try {
    const templates = await LetterTemplate.find({ user: req.user._id });
    
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

// @desc    Obtenir un template de lettre de motivation par ID
// @route   GET /api/letter-templates/:id
// @access  Private
exports.getLetterTemplateById = async (req, res) => {
  try {
    const template = await LetterTemplate.findOne({
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

// @desc    Mettre à jour un template de lettre de motivation
// @route   PUT /api/letter-templates/:id
// @access  Private
exports.updateLetterTemplate = async (req, res) => {
  try {
    const template = await LetterTemplate.findOneAndUpdate(
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

// @desc    Supprimer un template de lettre de motivation
// @route   DELETE /api/letter-templates/:id
// @access  Private
exports.deleteLetterTemplate = async (req, res) => {
  try {
    const template = await LetterTemplate.findOneAndDelete({
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

// @desc    Générer une lettre de motivation à partir d'un template avec des variables
// @route   POST /api/letter-templates/:id/generate
// @access  Private
exports.generateLetterFromTemplate = async (req, res) => {
  try {
    const template = await LetterTemplate.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template non trouvé'
      });
    }
    
    const { variables, company, offer } = req.body;
    
    // Générer le contenu avec les variables
    let content = template.content;
    let header = template.structure.header;
    let introduction = template.structure.introduction;
    let body = template.structure.body;
    let conclusion = template.structure.conclusion;
    let signature = template.structure.signature;
    
    // Remplacer les variables dans toutes les sections
    if (variables) {
      Object.keys(variables).forEach(key => {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        content = content.replace(regex, variables[key]);
        header = header.replace(regex, variables[key]);
        introduction = introduction.replace(regex, variables[key]);
        body = body.replace(regex, variables[key]);
        conclusion = conclusion.replace(regex, variables[key]);
        signature = signature.replace(regex, variables[key]);
      });
    }
    
    // Assembler le document final
    const generatedLetter = {
      content,
      structure: {
        header,
        introduction,
        body,
        conclusion,
        signature
      }
    };
    
    res.status(200).json({
      success: true,
      data: generatedLetter
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};