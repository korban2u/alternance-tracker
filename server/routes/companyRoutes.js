const express = require('express');
const { 
  createCompany, 
  getCompanies, 
  getCompanyById, 
  updateCompany, 
  deleteCompany 
} = require('../controllers/companyController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .post(protect, createCompany)
  .get(protect, getCompanies);

router.route('/:id')
  .get(protect, getCompanyById)
  .put(protect, updateCompany)
  .delete(protect, deleteCompany);

module.exports = router;