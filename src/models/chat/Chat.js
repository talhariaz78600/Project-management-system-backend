const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSettingsSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  hasUserDeletedChat: { type: Boolean, default: false },
  lastChatDeletedAt: { type: Date, default: new Date(0) },
  isDeletedFrom2Reple: { type: Boolean, default: false },
});

const chatSchema = new Schema(
  {
    chatType: {
      type: String,
      enum: ['chat', 'task'],
      // required: true
    },
    taskId: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: function() {
        return this.chatType === 'task';
      }
    },
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
      }
    ],
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: 'Message'
    },
    lastMessageSentAt: {
      type: Date
    },
    userSettings: [userSettingsSchema]
  },
  { timestamps: true, versionKey: false }
);

chatSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

chatSchema.index({ participants: 1 });

const Chat = mongoose.model('chats', chatSchema);

module.exports = Chat;
