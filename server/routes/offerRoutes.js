const express = require('express');
const { 
  createOffer, 
  getOffers, 
  getOfferById, 
  updateOffer, 
  deleteOffer 
} = require('../controllers/offerController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .post(protect, createOffer)
  .get(protect, getOffers);

router.route('/:id')
  .get(protect, getOfferById)
  .put(protect, updateOffer)
  .delete(protect, deleteOffer);

module.exports = router;