const Company = require('../models/Company');

// @desc    Créer une nouvelle entreprise
// @route   POST /api/companies
// @access  Private
exports.createCompany = async (req, res) => {
  try {
    // Ajouter l'ID utilisateur aux données
    const companyData = {
      ...req.body,
      user: req.user._id
    };
    
    const company = await Company.create(companyData);
    res.status(201).json({
      success: true,
      data: company
    });
  } catch (error) {

    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtenir toutes les entreprises
// @route   GET /api/companies
// @access  Private
exports.getCompanies = async (req, res) => {
  try {
    // Filtrer par utilisateur
    const companies = await Company.find({ user: req.user._id });
    res.status(200).json({
      success: true,
      count: companies.length,
      data: companies
    });
  } catch (error) {

    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtenir une entreprise par ID
// @route   GET /api/companies/:id
// @access  Private
exports.getCompanyById = async (req, res) => {
  try {
    // Filtrer par utilisateur
    const company = await Company.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Entreprise non trouvée'
      });
    }
    
    res.status(200).json({
      success: true,
      data: company
    });
  } catch (error) {

    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Mettre à jour une entreprise
// @route   PUT /api/companies/:id
// @access  Private
exports.updateCompany = async (req, res) => {
  try {
    const company = await Company.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id
      },
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Entreprise non trouvée'
      });
    }
    
    res.status(200).json({
      success: true,
      data: company
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Supprimer une entreprise
// @route   DELETE /api/companies/:id
// @access  Private

// @desc    Supprimer une entreprise
// @route   DELETE /api/companies/:id
// @access  Private
exports.deleteCompany = async (req, res) => {
  try {
    // Filtrer par utilisateur
    const company = await Company.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Entreprise non trouvée'
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