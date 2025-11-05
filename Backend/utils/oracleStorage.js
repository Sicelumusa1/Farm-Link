// // utils/oracleStorage.js
// const { ObjectStorageClient } = require('oci-objectstorage');
// const { common } = require('oci-common');
// const fs = require('fs');
// const path = require('path');

// class OracleStorage {
//   constructor() {
//     this.client = new ObjectStorageClient({
//       authenticationDetailsProvider: new common.ConfigFileAuthenticationDetailsProvider()
//     });
//     this.namespace = process.env.OCI_NAMESPACE;
//     this.bucketName = process.env.OCI_BUCKET_NAME || 'dev-bucket';
//   }

//   async uploadImage(filePath, objectName) {
//     try {
//       const fileStats = fs.statSync(filePath);
//       const fileContent = fs.readFileSync(filePath);
      
//       const putObjectRequest = {
//         namespaceName: this.namespace,
//         bucketName: this.bucketName,
//         objectName: objectName,
//         contentLength: fileStats.size,
//         putObjectBody: fileContent
//       };

//       const response = await this.client.putObject(putObjectRequest);
      
//       // Clean up local file
//       fs.unlinkSync(filePath);
      
//       return {
//         success: true,
//         objectName: objectName,
//         etag: response.etag,
//         opcRequestId: response.opcRequestId
//       };
//     } catch (error) {
//       console.error('Error uploading to OCI:', error);
//       throw error;
//     }
//   }

//   async getImageUrl(objectName) {
//     // For public buckets, construct the URL directly
//     // For private buckets, you'd need to generate pre-signed URLs
//     return `https://objectstorage.${process.env.OCI_REGION}.oraclecloud.com/n/${this.namespace}/b/${this.bucketName}/o/${encodeURIComponent(objectName)}`;
//   }

//   async deleteImage(objectName) {
//     try {
//       const deleteObjectRequest = {
//         namespaceName: this.namespace,
//         bucketName: this.bucketName,
//         objectName: objectName
//       };

//       await this.client.deleteObject(deleteObjectRequest);
//       return { success: true };
//     } catch (error) {
//       console.error('Error deleting from OCI:', error);
//       throw error;
//     }
//   }

//   async listCropImages(cropId) {
//     try {
//       const listObjectsRequest = {
//         namespaceName: this.namespace,
//         bucketName: this.bucketName,
//         prefix: `crops/${cropId}/`
//       };

//       const response = await this.client.listObjects(listObjectsRequest);
//       return response.listObjects.objects || [];
//     } catch (error) {
//       console.error('Error listing crop images:', error);
//       throw error;
//     }
//   }
// }

// module.exports = new OracleStorage();

module.exports = {
  uploadFile: async () => {
    console.log("Oracle file upload temporarily disabled.");
    return null;
  },
  deleteFile: async () => {
    console.log("Oracle file deletion temporarily disabled.");
    return null;
  },
  getFileUrl: async () => {
    console.log("Oracle file retrieval temporarily disabled.");
    return null;
  }
};