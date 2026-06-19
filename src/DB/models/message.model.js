import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema(
  {
    public_id: String,
    secure_url: String,
  },
  {
    _id: false,
  }
);

const messageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      min: 6,
      max: 500,
      required: function () {
        return this.attachments && this.attachments.length > 0 ? false : true;
      },
    },
    attachments: [attachmentSchema],
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },

  {
    timestamps: true,
  }
);



export const MessageModel =
  mongoose.model.Message || mongoose.model('Message', messageSchema);

MessageModel.syncIndexes();
