const multer = require('multer');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const XLSX = require('xlsx');
const Company = require('../models/Company');
const Offer = require('../models/Offer');
const Application = require('../models/Application');

// Configuration de multer pour l'upload de fichiers
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads/temp');
        // Créer le dossier s'il n'existe pas
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

// Filtrer les types de fichiers acceptés
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Type de fichier non autorisé. Seuls les fichiers CSV et Excel sont acceptés.'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max
    }
}).single('file');

// @desc    Importer des données depuis un fichier
// @route   POST /api/import
// @access  Private
exports.importData = async (req, res) => {
    upload(req, res, async function(err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({
                success: false,
                message: `Erreur lors de l'upload du fichier: ${err.message}`
            });
        } else if (err) {
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }

        // Pas de fichier
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Veuillez fournir un fichier'
            });
        }

        try {
            const filePath = req.file.path;
            const target = req.body.target;

            let data;

            // Détecter le format et parser le fichier
            if (req.file.mimetype === 'text/csv') {
                data = await parseCSV(filePath);
            } else {
                data = await parseExcel(filePath);
            }

            if (!data || data.length === 0) {
                throw new Error('Aucune donnée trouvée dans le fichier');
            }

            // Importer les données en fonction de la cible
            let importResult;

            switch (target) {
                case 'companies':
                    importResult = await importCompanies(data, req.user._id);
                    break;
                case 'offers':
                    importResult = await importOffers(data, req.user._id);
                    break;
                case 'applications':
                    importResult = await importApplications(data, req.user._id);
                    break;
                default:
                    throw new Error('Type de données invalide');
            }

            // Supprimer le fichier temporaire
            fs.unlinkSync(filePath);

            res.status(200).json({
                success: true,
                message: `Importation réussie : ${importResult.created} élément(s) créé(s), ${importResult.updated} élément(s) mis à jour, ${importResult.errors} erreur(s)`,
                data: importResult
            });
        } catch (error) {
            // Nettoyer le fichier en cas d'erreur
            if (req.file && req.file.path && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    });
};

// Parser un fichier CSV
const parseCSV = (filePath) => {
    return new Promise((resolve, reject) => {
        const results = [];

        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => {
                resolve(results);
            })
            .on('error', (error) => {
                reject(error);
            });
    });
};

// Parser un fichier Excel
const parseExcel = (filePath) => {
    try {
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);
        return Promise.resolve(data);
    } catch (error) {
        return Promise.reject(error);
    }
};

// Importer des entreprises
const importCompanies = async (data, userId) => {
    const result = { created: 0, updated: 0, errors: 0 };

    for (const item of data) {
        try {
            // Vérifier si l'entreprise existe déjà (par nom)
            let company = await Company.findOne({ name: item.name });

            // Préparer les données
            const companyData = {
                name: item.name,
                sector: item.sector || 'Non spécifié',
                website: item.website || '',
                notes: item.notes || '',
                address: {
                    street: item.street || '',
                    city: item.city || '',
                    postalCode: item.postalCode || '',
                    country: item.country || 'France'
                },
                tags: item.tags ? (Array.isArray(item.tags) ? item.tags : item.tags.split(',').map(tag => tag.trim())) : []
            };

            // Gérer les contacts s'ils existent
            if (item.contactName || item.contactEmail || item.contactPhone || item.contactRole) {
                companyData.contacts = [{
                    name: item.contactName || 'Contact',
                    email: item.contactEmail || '',
                    phone: item.contactPhone || '',
                    role: item.contactRole || ''
                }];
            }

            if (company) {
                // Mise à jour
                company = await Company.findByIdAndUpdate(
                    company._id,
                    companyData,
                    { new: true }
                );
                result.updated++;
            } else {
                // Création
                company = await Company.create({
                    ...companyData,
                    user: userId
                });
                result.created++;
            }
        } catch (error) {
            console.error(`Erreur lors de l'importation de l'entreprise ${item.name}:`, error);
            result.errors++;
        }
    }

    return result;
};

// Importer des offres
const importOffers = async (data, userId) => {
    const result = { created: 0, updated: 0, errors: 0 };

    for (const item of data) {
        try {
            // Rechercher l'entreprise associée
            let company;

            if (item.companyId) {
                company = await Company.findById(item.companyId);
            } else if (item.companyName) {
                company = await Company.findOne({ name: item.companyName });

                // Si l'entreprise n'existe pas, la créer
                if (!company) {
                    company = await Company.create({
                        name: item.companyName,
                        sector: item.companySector || 'Non spécifié',
                        user: userId
                    });
                }
            } else {
                throw new Error('Entreprise non spécifiée');
            }

            // Vérifier si l'offre existe déjà (par titre et entreprise)
            let offer = await Offer.findOne({
                title: item.title,
                company: company._id
            });

            // Préparer les données
            const offerData = {
                title: item.title,
                company: company._id,
                description: item.description || '',
                location: item.location || 'Non spécifiée',
                technologies: item.technologies ? (Array.isArray(item.technologies) ? item.technologies : item.technologies.split(',').map(tech => tech.trim())) : [],
                duration: item.duration || 'Non spécifiée',
                salary: item.salary || '',
                interestLevel: item.interestLevel || 'intéressant',
                status: item.status || 'active',
                sourceUrl: item.sourceUrl || '',
                dates: {
                    publication: item.publicationDate ? new Date(item.publicationDate) : new Date(),
                    deadline: item.deadlineDate ? new Date(item.deadlineDate) : null
                }
            };

            if (offer) {
                // Mise à jour
                offer = await Offer.findByIdAndUpdate(
                    offer._id,
                    offerData,
                    { new: true }
                );
                result.updated++;
            } else {
                // Création
                offer = await Offer.create({
                    ...offerData,
                    user: userId
                });
                result.created++;
            }
        } catch (error) {
            console.error(`Erreur lors de l'importation de l'offre ${item.title}:`, error);
            result.errors++;
        }
    }

    return result;
};

// Importer des candidatures
const importApplications = async (data, userId) => {
    const result = { created: 0, updated: 0, errors: 0 };

    for (const item of data) {
        try {
            // Rechercher l'entreprise associée
            let company;

            if (item.companyId) {
                company = await Company.findById(item.companyId);
            } else if (item.companyName) {
                company = await Company.findOne({ name: item.companyName });

                // Si l'entreprise n'existe pas, la créer
                if (!company) {
                    company = await Company.create({
                        name: item.companyName,
                        sector: item.companySector || 'Non spécifié',
                        user: userId
                    });
                }
            } else {
                throw new Error('Entreprise non spécifiée');
            }

            // Rechercher l'offre associée si applicable
            let offer = null;

            if (item.type === 'offre') {
                if (item.offerId) {
                    offer = await Offer.findById(item.offerId);
                } else if (item.offerTitle) {
                    offer = await Offer.findOne({
                        title: item.offerTitle,
                        company: company._id
                    });

                    // Si l'offre n'existe pas, la créer
                    if (!offer) {
                        offer = await Offer.create({
                            title: item.offerTitle,
                            company: company._id,
                            description: item.offerDescription || 'Importée automatiquement',
                            location: item.offerLocation || 'Non spécifiée',
                            duration: item.offerDuration || 'Non spécifiée',
                            user: userId
                        });
                    }
                }
            }

            // Préparer les données de la candidature
            const applicationData = {
                type: item.type || 'spontanée',
                company: company._id,
                status: item.status || 'à envoyer',
                documents: {
                    cv: {
                        version: item.cvVersion || '',
                        sent: item.cvSent === 'true' || item.cvSent === true,
                        fileName: item.cvFileName || ''
                    },
                    coverLetter: {
                        version: item.coverLetterVersion || '',
                        sent: item.coverLetterSent === 'true' || item.coverLetterSent === true,
                        fileName: item.coverLetterFileName || ''
                    }
                },
                nextAction: item.nextAction || '',
                nextActionDate: item.nextActionDate ? new Date(item.nextActionDate) : null,
                notes: item.notes || ''
            };

            // Ajouter l'offre si présente
            if (offer) {
                applicationData.offer = offer._id;
            }

            // Ajouter les entrées de timeline si présentes
            if (item.timeline && Array.isArray(item.timeline)) {
                applicationData.timeline = item.timeline;
            } else {
                applicationData.timeline = [{
                    date: new Date(),
                    action: 'Importation de la candidature',
                    notes: 'Candidature importée automatiquement'
                }];
            }

            // Vérifier si la candidature existe déjà
            let application;

            if (item.id) {
                application = await Application.findById(item.id);
            } else {
                // Rechercher par entreprise et offre (si offre présente)
                const searchCriteria = {
                    company: company._id,
                    type: applicationData.type
                };

                if (offer) {
                    searchCriteria.offer = offer._id;
                }

                application = await Application.findOne(searchCriteria);
            }

            if (application) {
                // Mise à jour
                application = await Application.findByIdAndUpdate(
                    application._id,
                    applicationData,
                    { new: true }
                );
                result.updated++;
            } else {
                // Création
                application = await Application.create({
                    ...applicationData,
                    user: userId
                });
                result.created++;
            }
        } catch (error) {
            console.error(`Erreur lors de l'importation de la candidature:`, error);
            result.errors++;
        }
    }

    return result;
};