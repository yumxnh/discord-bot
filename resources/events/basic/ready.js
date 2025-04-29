const { Events, ActivityType } = require('discord.js')
const chalk = require('chalk')
const schedule = require('node-schedule')

// ============================================
// =================== MAIN ===================
// ============================================

module.exports = {
    name: Events.ClientReady,
	execute: (client) => {

        console.log(chalk.hex("#FFBBFD").bold(`${client.user.tag} 已上線✅`))

        // client.user.setActivity({
        //     name: "關於我在無意間被隔壁的天使變成廢柴這件事",
        //     type: ActivityType.Watching
        // })


        // 機器人啟動提示
        const channel = client.channels.cache.get('0214370963139854416')
        channel.send("```" + client.user.tag + "已上線✅```")
    }
}