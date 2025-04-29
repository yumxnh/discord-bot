const { Events, EmbedBuilder } = require('discord.js')
const chalk = require('chalk')
const {query} = require('../../database')
const schedule = require('node-schedule')

// ============================================
// =================== MAIN ===================
// ============================================

module.exports = {
    name: Events.ClientReady,
	execute: async (client) => {

        // function executeTask() {
        //     console.log('任務執行，現在時間是' + new Date().toLocaleString());

        //     const testChannel = client.channels.cache.get("")
        //     testChannel.send(`排程測試: 現在是 ${new Date().toLocaleString()}`)

        // }
        
        // const times = ['10 19 * * *', '9 19 * * *', '8 19 * * *', '7 19 * * *'];
        
        // times.forEach(time => {
        //     schedule.scheduleJob(time, executeTask)
        // })
        
        // console.log('任務已安排!')

    //     let embed = new EmbedBuilder().setTitle(":confetti_ball: 等級排行榜").setColor(0xDBBE00)

    //     const usersData = (await query('select * from users order by total_experience desc limit 10', []))

    //     if (usersData.length <= 0) return

    //     let rankField = ""
    //     let userField = ""
    //     let levelField = ""
    //     usersData.forEach(({user_id, level, total_experience}, index) => {
    //         rankField        +=  `${index+1}\n`
    //         userField        +=  `<@${user_id}>\n`
    //         levelField       += `${level}\n`
    //     })

    //     embed.addFields(
    //         {name: "排名", value: rankField, inline: true},
    //         {name: "成員", value: userField, inline: true},
    //         {name: "等級", value: levelField, inline: true}
    //     )

    //     const testChannel = client.channels.cache.get("")
    //     testChannel.send({embeds: [embed]})
    }
}