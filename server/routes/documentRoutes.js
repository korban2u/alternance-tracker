const express = require('express');
const { 
  uploadDocument,
  getDocuments,
  getDocumentVersions,
  getDocumentById,
  downloadDocument,
  updateDocument,
  deleteDocument
} = require('../controllers/documentController');
const { protect } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configuration de multer pour l'upload de fichiers
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// Filtrer les types de fichiers acceptés
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.oasis.opendocument.text',
    'text/plain'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non autorisé. Seuls les fichiers PDF, DOC, DOCX, ODT et TXT sont acceptés.'), false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  }
});

const router = express.Router();

// Protection de toutes les routes
router.use(protect);

router.route('/')
  .post(upload.single('file'), uploadDocument)
  .get(getDocuments);

router.route('/versions')
  .get(getDocumentVersions);

router.route('/:id')
  .get(getDocumentById)
  .put(updateDocument)
  .delete(deleteDocument);

router.route('/:id/download')
  .get(downloadDocument);

module.exports = router;