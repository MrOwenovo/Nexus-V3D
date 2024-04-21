const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const app = express();
const pool = require('./database');  // 引入数据库连接
const cron = require('node-cron');
const lzma = require('lzma-native');  // 确保已经正确引入

const PORT = 3300;
// 假设有一个用来存储已处理记录的简单 JSON 文件
const PROCESSED_FILENAME = path.resolve(__dirname, 'processed.json');
// 读取已处理的记录
function readProcessedRecords() {
    if (fs.existsSync(PROCESSED_FILENAME)) {
        const json = fs.readFileSync(PROCESSED_FILENAME);
        return JSON.parse(json);
    }
    return {};
}
// 写入已处理的记录
function writeProcessedRecords(records) {
    fs.writeFileSync(PROCESSED_FILENAME, JSON.stringify(records));
}


app.use(cors());
app.use(express.json());
const corsOptions = {
    origin: 'http://localhost:3002', // 允许来自这个源的访问
    credentials: true, // 允许跨域请求携带cookie
    optionsSuccessStatus: 200 // 一些旧浏览器(如IE11等)无法处理204状态码
};

app.use(cors(corsOptions));
function parseJsonOrFallback(jsonStr, fallback) {
    try {
        return JSON.parse(jsonStr);
    } catch (e) {
        return fallback ? [fallback] : [];
    }
}

const executeTask=async ()=> {
    console.log('Running a task once on application start');

    const processedRecords = readProcessedRecords();

    try {
        const [rows] = await pool.query('SELECT * FROM merchandise_model');
        for (const merchandiseModel of rows) {
            // 检查是否已经处理过
            if (!processedRecords[merchandiseModel.id]) {
                console.log('Processing new entry:', merchandiseModel.id);

                // 你的逻辑：复制和修改文件，下载文件等
                // 例如复制并修改文件
                const originalIndex = path.resolve(__dirname, 'index.html');
                const newIndexName = `${merchandiseModel.merchandiseName}-index.html`;
                const newIndexPath = path.resolve(__dirname, newIndexName);

                if (!fs.existsSync(newIndexPath)) {
                    const indexContent = fs.readFileSync(originalIndex, 'utf8');
                    const modifiedIndexContent = indexContent.replace('template.html', `${merchandiseModel.merchandiseName}.html`);
                    fs.writeFileSync(newIndexPath, modifiedIndexContent);
                    console.log('Index file copied and modified successfully!');
                }

                const originalTemplate = path.resolve(__dirname, 'template.html');
                const newTemplateName = `${merchandiseModel.merchandiseName}.html`;
                const newTemplatePath = path.resolve(__dirname, newTemplateName);

                if (!fs.existsSync(newTemplatePath)) {
                    const templateContent = fs.readFileSync(originalTemplate, 'utf8');
                    fs.writeFileSync(newTemplatePath, templateContent);
                    console.log('Template file copied successfully!');
                }

                //下载
                // 尝试解析JSON，如果失败则返回默认值
                const modelPaths = parseJsonOrFallback(merchandiseModel.modelPath, merchandiseModel.modelPath);
                const types = parseJsonOrFallback(merchandiseModel.type, merchandiseModel.type);

                for (let i = 0; i < modelPaths.length; i++) {
                    const modelPath = modelPaths[i];
                    const type = types[i] || ''; // 如果类型未定义，则默认为空字符串
                    const fileName = `${merchandiseModel.merchandiseName}.${type}`;
                    const filePath = path.resolve(__dirname, 'model/' + fileName);
                    const compressedFilePath = filePath + '.xz';

                    // 检查文件是否存在
                    console.log('Downloading file...', modelPath);

                    try {
                        const response = await axios({
                            method: 'get',
                            url: modelPath,
                            responseType: 'stream'
                        });

                        const writer = fs.createWriteStream(filePath);
                        const compressor = lzma.createCompressor();
                        const compressedWriter = fs.createWriteStream(compressedFilePath);

                        // 管道流: 下载 -> 保存原始文件和压缩文件
                        response.data.pipe(writer);
                        response.data.pipe(compressor).pipe(compressedWriter);

                        // 等待所有操作完成
                        await Promise.all([
                            new Promise((resolve, reject) => {
                                writer.on('finish', resolve);
                                writer.on('error', reject);
                            }),
                            new Promise((resolve, reject) => {
                                compressedWriter.on('finish', resolve);
                                compressedWriter.on('error', reject);
                            })
                        ]);

                        console.log('Download and compression completed successfully for:', fileName);
                    } catch (error) {
                        console.error('Error downloading or compressing the file:', fileName, error);
                        return;
                    }
                }

                // 更新已处理记录
                processedRecords[merchandiseModel.id] = true;
                writeProcessedRecords(processedRecords);



            }else {
                console.log( merchandiseModel.id+"  已经被处理");

            }
        }
    } catch (error) {
        console.error('Error querying database:', error);
    }
}

// 在应用程序启动时执行一次任务
executeTask().then(r => console.log(r));
// 定义定时任务，每分钟检查一次
cron.schedule('* * * * *', async () => {
    console.log('Running a task every minute');

    const processedRecords = readProcessedRecords();

    try {
        const [rows] = await pool.query('SELECT * FROM merchandise_model');
        for (const merchandiseModel of rows) {
            // 检查是否已经处理过
            if (!processedRecords[merchandiseModel.id]) {
                console.log('Processing new entry:', merchandiseModel.id);

                // 你的逻辑：复制和修改文件，下载文件等
                // 例如复制并修改文件
                const originalIndex = path.resolve(__dirname, 'index.html');
                const newIndexName = `${merchandiseModel.merchandiseName}-index.html`;
                const newIndexPath = path.resolve(__dirname, newIndexName);

                if (!fs.existsSync(newIndexPath)) {
                    const indexContent = fs.readFileSync(originalIndex, 'utf8');
                    const modifiedIndexContent = indexContent.replace('template.html', `${merchandiseModel.merchandiseName}.html`);
                    fs.writeFileSync(newIndexPath, modifiedIndexContent);
                    console.log('Index file copied and modified successfully!');
                }

                const originalTemplate = path.resolve(__dirname, 'template.html');
                const newTemplateName = `${merchandiseModel.merchandiseName}.html`;
                const newTemplatePath = path.resolve(__dirname, newTemplateName);

                if (!fs.existsSync(newTemplatePath)) {
                    const templateContent = fs.readFileSync(originalTemplate, 'utf8');
                    fs.writeFileSync(newTemplatePath, templateContent);
                    console.log('Template file copied successfully!');
                }

                //下载
                // 尝试解析JSON，如果失败则返回默认值
                const modelPaths = parseJsonOrFallback(merchandiseModel.modelPath, merchandiseModel.modelPath);
                const types = parseJsonOrFallback(merchandiseModel.type, merchandiseModel.type);

                for (let i = 0; i < modelPaths.length; i++) {
                    const modelPath = modelPaths[i];
                    const type = types[i] || ''; // 如果类型未定义，则默认为空字符串
                    const fileName = `${merchandiseModel.merchandiseName}.${type}`;
                    const filePath = path.resolve(__dirname, 'model/' + fileName);
                    const compressedFilePath = filePath + '.xz';

                    // 检查文件是否存在
                    console.log('Downloading file...', modelPath);

                    try {
                        const response = await axios({
                            method: 'get',
                            url: modelPath,
                            responseType: 'stream'
                        });

                        const writer = fs.createWriteStream(filePath);
                        const compressor = lzma.createCompressor();
                        const compressedWriter = fs.createWriteStream(compressedFilePath);

                        // 管道流: 下载 -> 保存原始文件和压缩文件
                        response.data.pipe(writer);
                        response.data.pipe(compressor).pipe(compressedWriter);

                        // 等待所有操作完成
                        await Promise.all([
                            new Promise((resolve, reject) => {
                                writer.on('finish', resolve);
                                writer.on('error', reject);
                            }),
                            new Promise((resolve, reject) => {
                                compressedWriter.on('finish', resolve);
                                compressedWriter.on('error', reject);
                            })
                        ]);

                        console.log('Download and compression completed successfully for:', fileName);
                    } catch (error) {
                        console.error('Error downloading or compressing the file:', fileName, error);
                        return;
                    }
                }

                // 更新已处理记录
                processedRecords[merchandiseModel.id] = true;
                writeProcessedRecords(processedRecords);



            }else {
                console.log( merchandiseModel.id+"  已经被处理");

            }
        }
    } catch (error) {
        console.error('Error querying database:', error);
    }
});
app.post('/receive-id', async (req, res) => {
    const { id, name } = req.body;
    console.log('Received ID:', id, 'and Name:', name);


    try {
        const [rows] = await pool.query('SELECT * FROM merchandise_model WHERE id = ?', [id]);
        if (rows.length > 0) {
            const merchandiseModel = rows[0];

            const originalFile = path.resolve(__dirname, 'recliner.js'); // 原始文件路径
            const newFileName = `${name}.js`; // 新文件名称
            const newFilePath = path.resolve(__dirname, newFileName); // 新文件路径

            // 复制和修改文件内容
            const fileContent = fs.readFileSync(originalFile, 'utf8');
            const modifiedContent = fileContent.replace("recliner.gltf", `${name}.gltf`);

            fs.writeFileSync(newFilePath, modifiedContent);

            console.log('File copied and modified successfully!');

            const fileName = merchandiseModel.merchandiseName + merchandiseModel.type;
            const filePath = path.resolve(__dirname, fileName); // 构建完整的文件路径

            // 检查文件是否存在
            if (fs.existsSync(filePath)) {
                console.log('File already exists, skipping download:', fileName);
                res.json({
                    message: `File already exists, no need to download again.`,
                    filePath: filePath,
                    merchandiseModel
                });
            } else {
                console.log('Downloading file...');

                const response = await axios({
                    method: 'get',
                    url: merchandiseModel.modelPath,
                    responseType: 'stream'
                });

                const writer = fs.createWriteStream(filePath);
                response.data.pipe(writer);

                await new Promise((resolve, reject) => {
                    writer.on('finish', resolve);
                    writer.on('error', reject);
                });

                console.log('Download completed successfully!');
                res.json({
                    message: `ID ${id} received successfully and file downloaded!`,
                    filePath: filePath,
                    merchandiseModel
                });
            }
        } else {
            res.status(404).json({ message: 'Model not found' });
        }
    } catch (error) {
        console.error('Database query error or download error:', error);
        res.status(500).json({ message: 'Error accessing the database or downloading the file' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
