import { asyncHandler } from '../../utils/errors/async-handler.js';
import { successResponse } from '../../utils/response/response.js';
import * as messageService from './message.service.js';

// export const getMyMessages = asyncHandler(async (req, res, next) => {
//   const messages = await messageService.getMyMessages(req.message);
//   return successResponse({
//     res,
//     message: 'Messages retrieved successfully',
//     data: { messages },
//   });
// });

export const sendMessage = asyncHandler(async (req, res, next) => {
  await messageService.sendMessage(req);
  return successResponse({
    res,
    message: 'Message sent successfully',
  });
});
