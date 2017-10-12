var aws = require('aws-sdk');
aws.config.loadFromPath('awscredentials.json');
var s3 = new aws.S3();
var s3Bucket = new aws.S3( { params: {Bucket: 'gradbunker'} } );
var fs = require('fs');


module.exports.uploadFiles = function(files,s3BucketPath,callback){
    var mailAttachments=[],filePaths=[];
    var noOfFiles=files.length;
    let fileUploader = function(i,files,s3BucketPath,noOfFiles){
        if(files[i].originalFilename!==''){
            var fileExtension=files[i].originalFilename.split(".");
            fileExtension = fileExtension[fileExtension.length - 1];
            var filename = Date.now()+files[i]['name']+'.'+fileExtension;
            var stream = fs.createReadStream(files[i].path);
            var params = {ACL: "public-read", Bucket: 'gradbunker', Key: s3BucketPath+'/'+filename,
                Body: stream
            };
            s3.upload(params, function(err, data) {
                if(err) console.log(err);
                else{
                    filePaths.push(data.Location);
                    mailAttachments.push({
                        filename: files[i].originalFilename,
                        path: data.Location
                    })
                    if(i<noOfFiles-1)
                        fileUploader(i+1,files,s3BucketPath,noOfFiles);
                    else{
                        callback({
                            mailAttachments: mailAttachments,
                            links: filePaths
                        })
                    }
                }
            });
        }else{
            if(i<noOfFiles-1)
                fileUploader(i+1,files,s3BucketPath,noOfFiles);
            else{
                callback({
                    mailAttachments: mailAttachments,
                    links: filePaths
                })
            }
        }
    }
    fileUploader(0,files,s3BucketPath,noOfFiles);
}