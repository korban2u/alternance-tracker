const Document = require('../models/Document');
const Application = require('../models/Application');
const fs = require('fs');
const path = require('path');

// @desc    Créer/Uploader un nouveau document
// @route   POST /api/documents
// @access  Private
exports.uploadDocument = async (req, res) => {
  try {
    // Vérifier si un fichier a été fourni
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir un fichier'
      });
    }

    // Créer le document en base de données
    const document = await Document.create({
      name: req.body.name,
      type: req.body.type,
      fileName: req.file.filename,
      filePath: req.file.path,
      fileSize: req.file.size,
      fileType: req.file.mimetype,
      version: req.body.version || '1.0',
      versionNote: req.body.versionNote,
      tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : [],
      company: req.body.company || null,
      user: req.user._id
    });

    // Si une application est spécifiée, mettre à jour les références
    if (req.body.application) {
      // Ajouter l'application à la liste des applications liées au document
      document.applications.push(req.body.application);
      await document.save();

      // Mettre à jour les informations du document dans l'application
      const application = await Application.findById(req.body.application);
      
      if (application) {
        if (document.type === 'cv') {
          application.documents.cv = {
            version: document.version,
            sent: req.body.sent === 'true',
            fileName: document.fileName
          };
        } else if (document.type === 'lettre_de_motivation') {
          application.documents.coverLetter = {
            version: document.version,
            sent: req.body.sent === 'true',
            fileName: document.fileName
          };
        } else {
          // Autres types de documents
          if (!application.documents.other) {
            application.documents.other = [];
          }
          
          application.documents.other.push({
            name: document.name,
            sent: req.body.sent === 'true',
            fileName: document.fileName,
            version: document.version
          });
        }
        
        await application.save();
      }
    }

    res.status(201).json({
      success: true,
      data: document
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtenir tous les documents de l'utilisateur
// @route   GET /api/documents
// @access  Private
exports.getDocuments = async (req, res) => {
  try {
    // Construction de la requête
    let query = { user: req.user._id };
    
    // Filtrer par type si fourni
    if (req.query.type) {
      query.type = req.query.type;
    }
    
    // Filtrer par tag si fourni
    if (req.query.tag) {
      query.tags = req.query.tag;
    }
    
    // Filtrer par statut (actif ou non)
    if (req.query.active) {
      query.isActive = req.query.active === 'true';
    }
    
    // Récupérer les documents
    const documents = await Document.find(query)
      .populate('applications', 'type status')
      .populate('company', 'name')
      .sort({ updatedAt: -1 });
    
    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtenir toutes les versions d'un document
// @route   GET /api/documents/versions
// @access  Private
exports.getDocumentVersions = async (req, res) => {
  try {
    const { name, type } = req.query;
    
    if (!name || !type) {
      return res.status(400).json({
        success: false,
        message: 'Le nom et le type du document sont requis'
      });
    }
    
    const versions = await Document.getVersions(name, type, req.user._id);
    
    res.status(200).json({
      success: true,
      count: versions.length,
      data: versions
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtenir un document par ID
// @route   GET /api/documents/:id
// @access  Private
exports.getDocumentById = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      user: req.user._id
    })
      .populate('applications')
      .populate('company');
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document non trouvé'
      });
    }
    
    res.status(200).json({
      success: true,
      data: document
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Télécharger un document
// @route   GET /api/documents/:id/download
// @access  Private
exports.downloadDocument = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document non trouvé'
      });
    }
    
    const filePath = path.resolve(document.filePath);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Fichier non trouvé sur le serveur'
      });
    }
    
    res.download(filePath, document.fileName);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Mettre à jour un document
// @route   PUT /api/documents/:id
// @access  Private
exports.updateDocument = async (req, res) => {
  try {
    const document = await Document.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id
      },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document non trouvé'
      });
    }
    
    res.status(200).json({
      success: true,
      data: document
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Supprimer un document
// @route   DELETE /api/documents/:id
// @access  Private
exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document non trouvé'
      });
    }
    
    // Supprimer le fichier du serveur
    const filePath = path.resolve(document.filePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Supprimer le document de la base de données
    await document.remove();
    
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