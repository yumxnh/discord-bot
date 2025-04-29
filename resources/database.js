const mysql = require('mysql')
const chalk = require('chalk')

const connect = () => {
    return new Promise((resolve, reject) => {
        db = mysql.createConnection({
            host: "127.0.0.1",
            user: "root",
            password: "",
            database: "discord"
        })

        db.connect(err => {
            if (err) {
                console.log(chalk.hex('#DC0000').bold('┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓'))
                console.log(chalk.hex('#DC0000').bold('┃         資料庫連線發生錯誤         ┃'))
                console.log(chalk.hex('#DC0000').bold('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛'))
                reject(err)
                process.exit()
            } else {
                console.log(chalk.hex('#00D15B').bold('┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓'))
                console.log(chalk.hex('#00D15B').bold('┃           成功連線至資料庫           ┃'))
                console.log(chalk.hex('#00D15B').bold('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛'))
                resolve(db)
            }
        })
    })
}

const query = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.query(query, params, (err, results) => {
            if (err) {
                reject(err)
            } else {
                resolve(results)
            }
        })
    })
}

module.exports = {connect, query}