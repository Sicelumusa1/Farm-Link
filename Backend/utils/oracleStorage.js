const common = require('oci-common');
const objectStorage = require('oci-objectstorage');
const fs = require('fs');
const path = require('path');

// Create authentication provider from OCI config file (~/.oci/config)
const provider = new common.ConfigFileAuthenticationDetailsProvider();

// Initialize Object Storage client
const client = new objectStorage.ObjectStorageClient({
  authenticationDetailsProvider: provider,
});

// Set your namespace and bucket name
const namespaceName = process.env.OCI_NAMESPACE;
const bucketName = process.env.OCI_BUCKET;

// Upload image to Oracle Object Storage
async function uploadImageToOracle(filePath, fileName) {
  try {
    const putObjectRequest = {
      namespaceName,
      bucketName,
      objectName: fileName,
      putObjectBody: fs.createReadStream(filePath),
      contentType: 'image/jpeg',
    };

    await client.putObject(putObjectRequest);
    return `https://objectstorage.${process.env.OCI_REGION}.oraclecloud.com/n/${namespaceName}/b/${bucketName}/o/${fileName}`;
  } catch (error) {
    console.error('Oracle upload error:', error);
    throw new Error('Failed to upload image to Oracle Object Storage');
  }
}

module.exports = { uploadImageToOracle };

