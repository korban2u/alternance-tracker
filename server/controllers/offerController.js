const Offer = require('../models/Offer');

// @desc    Créer une nouvelle offre
// @route   POST /api/offers
// @access  Private
exports.createOffer = async (req, res) => {
  try {
    const offer = await Offer.create(req.body);
    res.status(201).json({
      success: true,
      data: offer
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtenir toutes les offres
// @route   GET /api/offers
// @access  Private
exports.getOffers = async (req, res) => {
  try {
    const offers = await Offer.find({}).populate('company', 'name sector');
    res.status(200).json({
      success: true,
      count: offers.length,
      data: offers
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtenir une offre par ID
// @route   GET /api/offers/:id
// @access  Private
exports.getOfferById = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate('company');
    
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offre non trouvée'
      });
    }
    
    res.status(200).json({
      success: true,
      data: offer
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Mettre à jour une offre
// @route   PUT /api/offers/:id
// @access  Private
exports.updateOffer = async (req, res) => {
  try {
    const offer = await Offer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offre non trouvée'
      });
    }
    
    res.status(200).json({
      success: true,
      data: offer
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Supprimer une offre
// @route   DELETE /api/offers/:id
// @access  Private
exports.deleteOffer = async (req, res) => {
  try {
    const offer = await Offer.findByIdAndDelete(req.params.id);
    
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offre non trouvée'
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