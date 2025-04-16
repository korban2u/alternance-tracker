const express = require('express');
const { 
  createEmailTemplate,
  getEmailTemplates,
  getEmailTemplateById,
  updateEmailTemplate,
  deleteEmailTemplate,
  generateEmailFromTemplate
} = require('../controllers/emailTemplateController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protection de toutes les routes
router.use(protect);

router.route('/')
  .post(createEmailTemplate)
  .get(getEmailTemplates);

router.route('/:id')
  .get(getEmailTemplateById)
  .put(updateEmailTemplate)
  .delete(deleteEmailTemplate);

router.route('/:id/generate')
  .post(generateEmailFromTemplate);

module.exports = router;