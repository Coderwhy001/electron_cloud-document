const QiniuManager = require('./src/utils/QiniuManager')
const path = require('path')
const accessKey = 'oYW_e6ioEkvT4ol5-0ChevOaskKGUF-Y_PQRJrJ1';
const secretKey = '6vLUmsHFfejP6lRqsmnIvxvTyLOsEtVNbhj4alH-';
const localFile = "C:\\Users\\xiao\\Desktop\\cloud_doc\\name1.md";
const key='name1.md';
const downloadPath = path.join(__dirname, key)
const manager = new QiniuManager(accessKey, secretKey, 'cloud--doc')
manager.uploadFile(key, localFile).then((data, err) => {
  console.log('上传成功', data)
})
// manager.generateDownloadLink(key).then(data => {
//   console.log(data)
//   return manager.generateDownloadLink('first.md')
// }).then(data => {
//   console.log(data)
// })
// manager.deleteFile(key)
// const publicBucketDomain = 'http://cdn.blogwuyue.com';
// 公开空间访问链接
// manager.downloadFile(key, downloadPath).then(() => {
//   console.log('下载写入完毕')
// })