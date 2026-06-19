import * as DbService from '../../db/db.service.js';
import { UserModel } from '../../DB/models/user.model.js';
import { MessageModel } from '../../DB/models/message.model.js';

import {
  NotFoundError,
  ServerError,
  UnprocessableError,
} from '../../utils/errors/errors.js';

import { v2 as cloudinary } from 'cloudinary';
import {
  cloud,
  cloudDeleteFiles,
  cloudUploadFiles,
} from '../../utils/upload/cloudinary.js';

// export const getMyProfile = async (user) => {
//   const userProfile = await DbService.findOne({
//     model: UserModel,
//     filter: { _id: user._id, confirmEmail: { $exists: true } },
//     select: 'firstName lastName email gender phone profileImage coverImages',
//   });
//   return userProfile;
// };

export const sendMessage = async (req) => {
  if (!req.body.content && !req.files?.length) {
    throw new UnprocessableError('Message content or attachments are required');
  }

  const { receiverId } = req.params;
  if (req.user?._id.toString() === receiverId.toString()) {
    throw new UnprocessableError('You cannot send a message to yourself');
  }

  if (
    !(await DbService.findOne({
      model: UserModel,
      filter: {
        _id: receiverId,
        confirmEmail: { $exists: true },
        deletedAt: { $exists: false },
      },
    }))
  ) {
    throw new NotFoundError('receiver user not found');
  }

  let attachedFiles = [];
  if (req.files?.length) {
    attachedFiles = await cloudUploadFiles({
      files: req.files,
      path: `users/${receiverId}/Messages`,
    });
  }

  const message = await DbService.create({
    model: MessageModel,
    data: [
      {
        senderId: req.user?._id,
        receiverId: receiverId,
        content: req.body.content,
        attachments: attachedFiles,
      },
    ],
  });

  if (!message) {
    if (attachedFiles.length) {
      await cloudDeleteFiles({
        publicIds: attachedFiles.map((file) => file.public_id),
      });
    }
    throw new ServerError('Failed to send message');
  }
  return;
};
