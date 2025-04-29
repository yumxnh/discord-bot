const {Events, Client, EmbedBuilder, Embed} = require('discord.js')
const config = require('../../../config.json')
const client = require('../../../main')

/**
* @param {Client} client
*/

module.exports = {
    name: Events.GuildBanRemove,
    execute: async (unban) => {
        const channel = client.channels.cache.get(config.channel.record.moderation)
        
        // ##########################
        // ########## 封鎖 ##########
        // ##########################
        channel.send({
            embeds: [
                new EmbedBuilder()
                .setColor(config.colour.green)
                .setDescription(`**${unban.user} 的停權被解除。**`)
                .setAuthor({name: unban.user.username, iconURL: unban.user.avatarURL()||"https://cdn.discordapp.com/embed/avatars/0.png"})
                .setThumbnail(unban.user.avatarURL()||"https://cdn.discordapp.com/embed/avatars/0.png")
                .setTimestamp()
                .setFooter({text: `使用者ID: ${unban.user.id}`})
            ]
        })
        
    }
}