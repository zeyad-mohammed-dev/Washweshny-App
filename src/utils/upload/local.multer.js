import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { ValidationError } from '../errors/errors.js';

export const localMulter = ({ customPath = 'general', allowedTypes = [] }) => {
  let relativePath = `uploads/${customPath}`;

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      if (
        req.user?._id &&
        !relativePath.split('/').includes(req.user._id.toString())
      ) {
        relativePath += `/${req.user._id}`;
      }
      const absolutePath = path.resolve(`./${relativePath}`);

      if (!fs.existsSync(absolutePath)) {
        fs.mkdirSync(absolutePath, { recursive: true });
      }
      cb(null, absolutePath);
    },
    filename: function (req, file, cb) {
      const uniqueFileName =
        Date.now() +
        '-' +
        Math.round(Math.random() * 1e9) +
        '-' +
        file.originalname;
      file.finalPath = `${relativePath}/${uniqueFileName}`;

      cb(null, uniqueFileName);
    },
  });

  const fileFilter = function (req, file, callback) {
    if (allowedTypes.includes(file.mimetype)) {
      return callback(null, true);
    }
    return callback(new ValidationError('Invalid file type'), false);
  };

  return multer({ fileFilter, storage: storage });
};
