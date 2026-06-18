import multer from 'multer';
import { ValidationError } from '../errors/errors.js';

export const allowedMimeTypes = {
  image: ['image/jpeg', 'image/jpg'],
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
};

export const cloudMulter = ({ allowedTypes = [] }) => {
  const storage = multer.diskStorage({});
  const fileFilter = function (req, file, callback) {
    if (allowedTypes.includes(file.mimetype)) {
      return callback(null, true);
    }
    return callback(new ValidationError('Invalid file type'), false);
  };

  return multer({ fileFilter, storage });
};
