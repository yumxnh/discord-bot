const {Events, Client, EmbedBuilder, Attachment, Embed} = require('discord.js')
const config = require('../../../config.json')
const client = require('../../../main')

/**
* @param {Client} client
*/

module.exports = {
    name: Events.MessageDelete,
    execute: async (message) => {

        if (!message.author||message.author.bot||message.author.system) return
        if (message.content&&message.content.length>=1204) return
        const msgUser = message.author
        const msgChannel = message.channel
        const channel = client.channels.cache.get("")

        let embed = new EmbedBuilder()
        .setColor(0xEFBC21)
        .setAuthor({ name: msgUser.username, iconURL: msgUser.avatarURL()})
        .setDescription(`**一則來自 ${msgUser} 的訊息遭到刪除**`)
        .addFields({name: '頻道',       value: `${msgChannel}`})
        .setTimestamp()

        if (message.content) {
            embed.addFields({name: '文字內容',   value: `${message.content}`})
        }

        if (message.attachments) {
            for (let [k, v] of message.attachments) {
                embed.addFields({name: '附件',   value: `${v.url}`})
            }
        }

        embed.addFields({name: '訊息編號',   value: "```" + `${message.id}` + "```"})

        channel.send({embeds: [embed]})
    }
}