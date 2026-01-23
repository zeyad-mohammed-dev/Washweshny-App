import * as DbService from '../../DB/db.service.js';
import { UserModel } from '../../DB/models/user.model.js';
import { asyncHandler, successHandler } from '../../utils/response.js';

export const signup = asyncHandler(async (req, res, next) => {
  const { fullName, email, password, phone } = req.body;

  const checkUserExist = await DbService.findOne({
    model: UserModel,
    filter: { email },
  });

  if (checkUserExist) {
    return next(new Error('email already exist', { cause: 409 }));
  }
  const [user] = await DbService.create({
    model: UserModel,
    data: [{ fullName, email, password, phone }],
  });
  return successHandler({ res, status: 201, data: { user } });
});

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await DbService.findOne({
    model: UserModel,
    filter: { email, password },
  });

  if (!user) {
    return next(new Error('in-valid email or password', { cause: 404 }));
  }

  return successHandler({ res, data: { user } });
});
