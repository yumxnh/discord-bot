const {Events, Client, EmbedBuilder, Message} = require('discord.js')
const config = require('../../../config.json')
const client = require('../../../main')

/**
* @param {Client} client
*/

module.exports = {
    name: Events.UserUpdate,
    execute: async (oldUser, newUser) => {

        let embed = new EmbedBuilder()
        .setAuthor({name: newUser.username, iconURL: newUser.avatarURL()||"https://cdn.discordapp.com/embed/avatars/0.png"})
        .setThumbnail(newUser.avatarURL()||"https://cdn.discordapp.com/embed/avatars/0.png")
        .setTimestamp()
        .setFooter({text: `使用者ID: ${newUser.id}`})

        const channel = client.channels.cache.get(config.channel.record.userUpdate)
        
        // #################################
        // ############ 頭像檢查 ############
        // #################################
        if (oldUser.avatar !== newUser.avatar) {
            embed
            .setDescription(`${newUser} **更換了頭像**`)
            .setColor(config.colour.con_purple)
            .addFields(
                {name: "舊頭像", value: `[舊頭像](${oldUser.avatarURL()})`, inline: true},
                {name: "新頭像", value: `[新頭像](${newUser.avatarURL()})`, inline: true}
            )
            channel.send({embeds: [embed]})
        }

        if (oldUser.username !== newUser.username) {
            embed.setDescription(`${newUser} **更換了使用者名稱**`)
            .setColor(config.colour.con_purple)
            .addFields(
                {name: "舊使用者名稱", value: `\`${oldUser.username}\``, inline: true},
                {name: "新使用者名稱", value: `\`${newUser.username}\``, inline: true}
            )
            channel.send({embeds: [embed]})
        }

        if (oldUser.displayName !== newUser.displayName) {
            embed.setDescription(`${newUser} **更換了顯示名稱**`)
            .setColor(config.colour.con_purple)
            .addFields(
                {name: "舊顯示名稱", value: `\`${oldUser.displayName}\``, inline: true},
                {name: "新顯示名稱", value: `\`${newUser.displayName}\``, inline: true}
            )
            channel.send({embeds: [embed]})
        }
    }
}