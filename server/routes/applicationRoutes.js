const express = require('express');
const { 
  createApplication, 
  getApplications, 
  getApplicationById, 
  updateApplication, 
  addTimelineEntry,
  deleteApplication 
} = require('../controllers/applicationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .post(protect, createApplication)
  .get(protect, getApplications);

router.route('/:id')
  .get(protect, getApplicationById)
  .put(protect, updateApplication)
  .delete(protect, deleteApplication);

router.route('/:id/timeline')
  .post(protect, addTimelineEntry);

module.exports = router;