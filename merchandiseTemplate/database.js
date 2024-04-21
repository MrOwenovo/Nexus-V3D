const mysql = require('mysql2/promise');

// 创建数据库连接池
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',  // 替换为你的数据库用户名
    password: 'lmq1226lmq',  // 替换为你的数据库密码
    database: 'nexus',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;
