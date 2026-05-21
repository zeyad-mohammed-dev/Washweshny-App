import { roleEnum } from '../../DB/models/user.model.js';

export const endpoints = {
  getMyProfile: [roleEnum.admin, roleEnum.user],
  updateUser: [roleEnum.admin, roleEnum.user],
  deleteUser: [roleEnum.admin],
  restoreAccount: [roleEnum.admin],
  deleteAccount: [roleEnum.admin],
};
