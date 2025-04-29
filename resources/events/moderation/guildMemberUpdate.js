const {Events, Client, EmbedBuilder, Attachment, Embed, Collection} = require('discord.js')
const config = require('../../../config.json')
const client = require('../../../main')

/**
* @param {Client} client
* @param {Member} oldMember
* @param {Member} newMember
*/

module.exports = {
    name: Events.GuildMemberUpdate,
    execute: async (oldMember, newMember) => {

        let embed = new EmbedBuilder()
        .setAuthor({name: newMember.user.username, iconURL: newMember.user.avatarURL()||"https://cdn.discordapp.com/embed/avatars/0.png"})
        .setThumbnail(newMember.user.avatarURL()||"https://cdn.discordapp.com/embed/avatars/0.png")

        const channel = client.channels.cache.get(config.channel.record.userUpdate)
        
        // #######################
        // ###### 身分組檢查 ######
        // #######################
        let oldRole = oldMember.roles.cache
        let newRole = newMember.roles.cache

        let oldDifferent = []
        oldRole.forEach((role) => {
            if (!newRole.has(role.id)) oldDifferent.push({id: role.id, name: role.name})
        })

        let newDifferent = []
        newRole.forEach((role) => {
            if (!oldRole.has(role.id)) newDifferent.push({id: role.id, name: role.name})
        })

        if (oldDifferent.length>0||newDifferent.length>0) {
            embed.setDescription(`**${newMember.user} 身分組變更**`)
            
            if (oldDifferent.length>0) {
                embed.addFields({
                    name: "⛔️ 移除身分組",
                    value: oldDifferent.map(role => `\`${role.name} (${role.id})\``).join("\n")
                }).setColor(config.colour.con_red)
            }
            if (newDifferent.length>0) {
                embed.addFields({
                    name: "✅ 新增身分組",
                    value: newDifferent.map(role => `\`${role.name} (${role.id})\``).join("\n")
                }).setColor(config.colour.con_green)
            }

            channel.send({embeds: [embed]})
        }

        // #####################
        // ###### 暱稱檢查 ######
        // #####################
        if (oldMember.nickname!==newMember.nickname) {
            embed.setDescription(`**${newMember.user} 暱稱變更**`)
            .setColor(config.colour.con_light_blue)

            embed.addFields(
                {
                    name: "舊暱稱",
                    value: `\`${oldMember.nickname || oldMember.user.username}\``,
                    inline: true
                },
                {
                    name: "新暱稱",
                    value: `\`${newMember.nickname || newMember.user.username}\``,
                    inline: true
                }
            )

            channel.send({embeds: [embed]})
        }


    }
}