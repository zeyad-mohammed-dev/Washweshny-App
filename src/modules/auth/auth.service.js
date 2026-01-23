import { UserModel } from '../../DB/models/user.model.js';
import { asyncHandler } from '../../utils/response.js';

export const signup = asyncHandler(async (req, res, next) => {
  const { fullName, email, password, phone } = req.body;

  const checkUserExist = await UserModel.findOne({ email });

  if (checkUserExist) {
    return res.status(409).json({ message: 'email already exist' });
  }
  const [user] = await UserModel.create([{ fullName, email, password, phone }]);
  return res.status(201).json({ message: 'Done', user });
});

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await UserModel.findOne({ email, password });

  if (!user) {
    return res.status(404).json({ message: 'in-valid email or password' });
  }

  return res.status(200).json({ message: 'Done', user });
});
