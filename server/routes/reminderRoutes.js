const express = require('express');
const { 
  createReminder,
  getReminders,
  getUpcomingReminders,
  getReminderById,
  updateReminder,
  completeReminder,
  deleteReminder
} = require('../controllers/reminderController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protection de toutes les routes
router.use(protect);

router.route('/')
  .post(createReminder)
  .get(getReminders);

router.route('/upcoming')
  .get(getUpcomingReminders);

router.route('/:id')
  .get(getReminderById)
  .put(updateReminder)
  .delete(deleteReminder);

router.route('/:id/complete')
  .put(completeReminder);

module.exports = router;