import { v2 as cloudinary } from 'cloudinary';

export const cloud = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  return cloudinary;
};

export const cloudUploadFile = async ({ file = {}, path = 'general' }) => {
  return await cloud().uploader.upload(file.path, {
    folder: `${process.env.APP_NAME}/${path}`,
  });
};

export const cloudUploadFiles = async ({ files = [], path = 'general' }) => {
  const attachments = [];
  for (const file of files) {
    const { public_id, secure_url } = await cloudUploadFile({ file, path });
    attachments.push({ public_id, secure_url });
  }
  return attachments;
};

export const cloudDeleteFile = async ({ publicId = '' }) => {
  return await cloud().uploader.destroy(publicId);
};

export const cloudDeleteFiles = async ({
  publicIds = [],
  options = { type: 'upload', resource_type: 'image' },
}) => {
  return await cloud().api.delete_resources(publicIds, options);
};

export const cloudDeleteUserAssets = async ({
  folderPath = '',
  options = {
    resource_type: 'image',
    type: 'upload',
    invalidate: true,
  },
}) => {
  return await cloud().api.delete_resources_by_prefix(
    `${process.env.APP_NAME}/${folderPath}`,
    options
  );
};
