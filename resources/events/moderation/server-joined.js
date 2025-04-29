const {Events, Client, EmbedBuilder, Message} = require('discord.js')
const config = require('../../../config.json')
const client = require('../../../main')

/**
* @param {Client} client
*/

module.exports = {
    name: Events.GuildMemberAdd,
    execute: async (event) => {
        const channel = client.channels.cache.get(config.channel.record.joinedServer)
        
        let joinTimeDate = new Date(event.joinedTimestamp)
        const year = joinTimeDate.getFullYear()
        const month = String(joinTimeDate.getMonth()+1).padStart(2, '0')
        const day = String(joinTimeDate.getDate()).padStart(2, '0')
        const hour = String(joinTimeDate.getHours()).padStart(2, '0')
        const minute = String(joinTimeDate.getMinutes()).padStart(2, '0')
        const joinTime = `${year}-${month}-${day} ${hour}:${minute}`

        channel.send({
            embeds: [
                new EmbedBuilder()
                .setColor(config.colour.green)
                .setTitle(`${event.user.globalName} 加入了伺服器`)
                .setThumbnail(event.user.displayAvatarURL())
                .addFields(
                    {name: "使用者" ,        value: `${event.user}`,                         inline: false},
                    {name: "顯示名稱" ,      value: "`" + (event.user.globalName||event.user.username) + "`",       inline: true},
                    {name: "使用者名稱" ,    value: "`" + event.user.username + "`",         inline: false},
                    {name: "使用者ID" ,      value: "`" + event.user.id + "`",               inline: true},
                    {name: "加入日期" ,      value: "`" + joinTime + "`",                    inline: false},
                    {name: "是機器人" ,      value: (event.user.bot) ? "是" : "否",          inline: true},
                    {name: "是系統" ,        value: (event.user.system) ? "是" : "否",       inline: false}                   
                )
            ]
        })
    }
}