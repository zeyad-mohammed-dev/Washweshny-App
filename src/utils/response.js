import colors from 'colors';

export const asyncHandler = (fn) => {
  return async (req, res, next) => {
    await fn(req, res, next).catch((error) => {
      console.log(colors.red({ error_stack: error.stack }));
      return res
        .status(500)
        .json({ error_message: 'server error', error, message: error.message });
    });
  };
};

export const successHandler = ({
  res,
  message = 'Done',
  status = 200,
  data = {},
} = {}) => {
  return res.status(status).json({ message, data });
};
