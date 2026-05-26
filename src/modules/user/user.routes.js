import * as userController from './user.controller.js';
import { Router } from 'express';
import {
  authenticationMiddleware,
  authorizationMiddleware,
} from '../../middleware/auth.middleware.js';
import { tokenTypeEnum } from '../../utils/security/token.security.js';
import { endpoints } from './user.authorization.js';
import { validationMiddleware } from '../../middleware/validation.middleware.js';
import * as userSchemas from './user.validation.js';
const router = Router();

router.get(
  '/me',
  authenticationMiddleware(),
  authorizationMiddleware({ allowedRoles: endpoints.getMyProfile }),
  userController.getMyProfile
);

router.get(
  '/:userId',
  validationMiddleware(userSchemas.getProfileByIdSchema),
  userController.getProfileById
);

router.post(
  '/refresh-token',
  authenticationMiddleware({ tokenType: tokenTypeEnum.refresh }),
  userController.refreshToken
);

router.post(
  '/me/logout',
  authenticationMiddleware(),
  validationMiddleware(userSchemas.logoutSchema),
  userController.logout
);

router.patch(
  '/me',
  authenticationMiddleware(),
  validationMiddleware(userSchemas.updateMyProfileSchema),
  userController.updateMyProfile
);

router.patch(
  '/me/password',
  authenticationMiddleware(),
  validationMiddleware(userSchemas.updatePasswordSchema),
  userController.updatePassword
);

router.patch(
  '/:userId/restore-account',
  authenticationMiddleware(),
  authorizationMiddleware({ allowedRoles: endpoints.restoreAccount }),
  validationMiddleware(userSchemas.restoreAccountSchema),
  userController.restoreAccount
);

router.delete(
  '{/:userId}/freeze-account',
  authenticationMiddleware(),
  validationMiddleware(userSchemas.freezeAccountSchema),
  userController.freezeAccount
);

router.delete(
  '/:userId',
  authenticationMiddleware(),
  authorizationMiddleware({ allowedRoles: endpoints.deleteAccount }),
  validationMiddleware(userSchemas.deleteAccountSchema),
  userController.deleteAccount
);

export default router;
