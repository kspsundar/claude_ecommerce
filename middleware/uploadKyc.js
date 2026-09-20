const path = require('path');
const fs = require('fs');
const multer = require('multer');

// KYC documents contain personal identity/bank details, so they are stored
// outside the `public/` tree and can only be reached through an authenticated
// download route (see sellerController.downloadOwnDocument / adminController.downloadSellerDocument).
const kycUploadDir = path.join(__dirname, '..', 'uploads', 'kyc');
if (!fs.existsSync(kycUploadDir)) fs.mkdirSync(kycUploadDir, { recursive: true });

const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.doc', '.docx'];
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, kycUploadDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname).toLowerCase()}`;
    cb(null, unique);
  }
});

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_EXTENSIONS.includes(ext) && ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(null, true);
  }
  cb(new Error('KYC document must be a PDF, JPG or Word document (.doc/.docx).'));
}

const uploadKycDocument = multer({
  storage,
  fileFilter,
  limits: { fileSize: 8 * 1024 * 1024 } // 8MB
});

// Wraps the multer middleware so invalid files/oversized uploads redirect
// back to the onboarding form with a flash message instead of crashing to
// the generic 500 page.
function uploadKycOrFlash(req, res, next) {
  uploadKycDocument.single('document')(req, res, (err) => {
    if (err) {
      const message =
        err.code === 'LIMIT_FILE_SIZE' ? 'KYC document must be smaller than 8MB.' : err.message || 'Could not upload document.';
      req.flash('error', message);
      return res.redirect('/seller/onboarding');
    }
    next();
  });
}

module.exports = { uploadKycDocument, uploadKycOrFlash, kycUploadDir, ALLOWED_EXTENSIONS };
