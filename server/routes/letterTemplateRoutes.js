const express = require('express');
const { 
  createLetterTemplate,
  getLetterTemplates,
  getLetterTemplateById,
  updateLetterTemplate,
  deleteLetterTemplate,
  generateLetterFromTemplate
} = require('../controllers/letterTemplateController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protection de toutes les routes
router.use(protect);

router.route('/')
  .post(createLetterTemplate)
  .get(getLetterTemplates);

router.route('/:id')
  .get(getLetterTemplateById)
  .put(updateLetterTemplate)
  .delete(deleteLetterTemplate);

router.route('/:id/generate')
  .post(generateLetterFromTemplate);

module.exports = router;