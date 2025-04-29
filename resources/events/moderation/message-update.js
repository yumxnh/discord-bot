const {Events, Client, EmbedBuilder} = require('discord.js')
const config = require('../../../config.json')
const client = require('../../../main')

/**
* @param {Client} client
*/

module.exports = {
    name: Events.MessageUpdate,
    execute: async (oldMessage, newMessage) => {

        if (!oldMessage.content||!newMessage.content) return
        if (oldMessage.content===newMessage.content) return
        if (oldMessage.content.length>=1024||newMessage.content.length>=1024) return
        const msgUser = newMessage.author
        const msgChannel = newMessage.channel
        const channel = client.channels.cache.get("")

        channel.send({embeds: [
            new EmbedBuilder()
            .setColor(0xEFBC21)
            .setAuthor({ name: msgUser.username, iconURL: msgUser.avatarURL()})
            .setDescription(`**${msgUser} 編輯了發送於 ${msgChannel} 的一則訊息**\n${newMessage.url}`)
            .addFields({name: '舊訊息',     value: `${oldMessage.content}`})
            .addFields({name: '新訊息',     value: `${newMessage.content}`})
            .addFields({name: '訊息編號',   value: "```" + `${oldMessage.id}` + "```"})
            .setTimestamp()
            .setFooter({text: "訊息編輯紀錄"})
        ]})
    }
}