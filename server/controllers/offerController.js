const Offer = require('../models/Offer');

// @desc    Créer une nouvelle offre
// @route   POST /api/offers
// @access  Private
exports.createOffer = async (req, res) => {
  try {
    // Ajouter l'ID utilisateur aux données
    const offerData = {
      ...req.body,
      user: req.user._id
    };
    
    const offer = await Offer.create(offerData);
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
    // Filtrer par utilisateur
    const offers = await Offer.find({ user: req.user._id }).populate('company', 'name sector');
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
    // Filtrer par utilisateur
    const offer = await Offer.findOne({ 
      _id: req.params.id,
      user: req.user._id
    }).populate('company');
    
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
    const offer = await Offer.findOneAndUpdate(
        {
          _id: req.params.id,
          user: req.user._id
        },
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
    const offer = await Offer.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

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