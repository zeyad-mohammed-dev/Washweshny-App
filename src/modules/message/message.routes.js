import * as messageController from './message.controller.js';
import { Router } from 'express';
import {
  authenticationMiddleware,
  authorizationMiddleware,
} from '../../middleware/auth.middleware.js';
import { tokenTypeEnum } from '../../utils/security/token.security.js';
import { endpoints } from './message.authorization.js';
import { validationMiddleware } from '../../middleware/validation.middleware.js';
import * as messageSchemas from './message.validation.js';

import {
  allowedMimeTypes,
  cloudMulter,
} from '../../utils/upload/cloud.multer.js';

const router = Router();

router.post(
  '/:receiverId',
  cloudMulter({
    allowedTypes: allowedMimeTypes.image,
  }).array('attachments', 2),
  validationMiddleware(messageSchemas.sendMessageSchema),
  messageController.sendMessage
);

router.post(
  '/:receiverId/sender',
  authenticationMiddleware(),
  cloudMulter({
    allowedTypes: allowedMimeTypes.image,
  }).array('attachments', 2),
  validationMiddleware(messageSchemas.sendMessageSchema),
  messageController.sendMessage
);

export default router;
