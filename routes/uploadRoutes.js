const AWS = require('aws-sdk');
const keys = require('../config/keys');
const uuid = require('uuidv1');
const requireLogin = require('../middlewares/requireLogin');

const s3 = new AWS.S3( { 
    signatureVersion: 'v4',
    region: 'ap-south-1',
    accessKeyId: keys.accessKeyId,
    secretAccessKey: keys.secretAccessKey
 } );

module.exports = app => {
    app.get( '/api/upload', requireLogin, (req, res) => {

        const key = `${req.user.id}/${uuid()}.jpeg`;

        const params = {
            Bucket: 'my-blog-bucket-3',
            ContentType: 'images/jpeg',
            Key: key 
        };
        s3.getSignedUrl( 'putObject', params, (err, url) => res.send( { key, url } ) );

    } );
};