import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import 'multer';

@Injectable()
export class UploadService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'ecommerce/products',
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder }, (error, result) => {
          if (error || !result) reject(error || new Error('Upload failed'));
          else resolve(result.secure_url);
        })
        .end(file.buffer);
    });
  }

  async deleteImage(imageUrl: string): Promise<void> {
    // extract public_id from the Cloudinary URL
    // URL looks like: https://res.cloudinary.com/dsxo1ymso/image/upload/v1234567890/ecommerce/products/abc123.png
    // public_id is: ecommerce/products/abc123
    const urlParts = imageUrl.split('/');
    const fileWithExtension = urlParts[urlParts.length - 1]; // abc123.png
    const fileName = fileWithExtension.split('.')[0]; // abc123
    const folder = urlParts.slice(-3, -1).join('/'); // ecommerce/products
    const publicId = `${folder}/${fileName}`; // ecommerce/products/abc123

    await cloudinary.uploader.destroy(publicId);
  }
}
