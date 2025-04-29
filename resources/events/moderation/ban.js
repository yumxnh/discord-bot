const {Events, Client, EmbedBuilder, Embed} = require('discord.js')
const config = require('../../../config.json')
const client = require('../../../main')

/**
* @param {Client} client
*/

module.exports = {
    name: Events.GuildBanAdd,
    execute: async (ban) => {
        const channel = client.channels.cache.get(config.channel.record.moderation)

        const fetchBan = await ban.guild.bans.fetch(ban.user.id)
        const reason = fetchBan?.reason

        // ##########################
        // ########## 封鎖 ##########
        // ##########################
        channel.send({
            embeds: [
                new EmbedBuilder()
                .setColor(config.colour.red)
                .setDescription(`**${ban.user} 遭到停權。**`)
                .setAuthor({name: ban.user.username, iconURL: ban.user.avatarURL()||"https://cdn.discordapp.com/embed/avatars/0.png"})
                .addFields({name: "原因", value: `${reason || "無"}`})
                .setThumbnail(ban.user.avatarURL()||"https://cdn.discordapp.com/embed/avatars/0.png")
                .setTimestamp()
                .setFooter({text: `使用者ID: ${ban.user.id}`})
            ]
        })
        
    }
}