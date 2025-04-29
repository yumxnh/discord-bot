const {Events, Client, EmbedBuilder, Message, PermissionsBitField} = require('discord.js')
const config = require('../../../config.json')
const client = require('../../../main')
const userVoice = new Map()
/**
* @param {Client} client
*/

const timeoutCheck = async (guild, userID, timestamp) => {
    let member = await guild.members.fetch(userID);

    if (member.user.bot||member.user.system) return
    if (member.permissions.has(PermissionsBitField.Flags.Administrator)) return
    if (!userVoice.has(userID)) {
        userVoice.set(userID, { timestamps: [], lastWarning: null })
    }

    const userData = userVoice.get(userID)
    userData.timestamps.push(timestamp)

    let timestamps = userData.timestamps.filter(time => timestamp - time <= 6 * 1000)
    userData.timestamps = timestamps

    if (timestamps.length >= 4 && (userData.lastWarning === null || timestamp - userData.lastWarning > 30 * 1000)) {
        userData.lastWarning = timestamp
        const channel = client.channels.cache.get(config.channel.system)
        channel.send(`<:warn:1188203073689096284> <@${userID}> 請勿重複進出語音頻道`)
    }
}

module.exports = {
    name: Events.VoiceStateUpdate,
    execute: async (oldState, newState) => {

        // 加入語音頻道
        if (oldState.channelId===null&&newState.channelId!==null) {
            const vcUser = newState.member.user
            const vcChannel = newState.channel
            const channel = client.channels.cache.get(config.channel.record.voice)
            let timestamp = new Date()

            channel.send({embeds: [
                new EmbedBuilder()
                .setColor(config.colour.con_green)
                .setAuthor({ name: vcUser.username, iconURL: vcUser.avatarURL()})
                .setDescription(`使用者: ${vcUser}\n操作: 加入\n頻道: ${vcChannel}`)
                .setTimestamp()
            ]})

            timeoutCheck(newState.guild, vcUser.id, timestamp)
        }

        // 離開語音頻道
        if (oldState.channelId!==null&&newState.channelId===null) {
            const vcUser = oldState.member.user
            const vcChannel = oldState.channel
            const channel = client.channels.cache.get(config.channel.record.voice)
            let timestamp = new Date()

            channel.send({embeds: [
                new EmbedBuilder()
                .setColor(config.colour.con_red)
                .setAuthor({ name: vcUser.username, iconURL: vcUser.avatarURL()})
                .setDescription(`使用者: ${vcUser}\n操作: 退出\n頻道: ${vcChannel}`)
                .setTimestamp()
            ]})

            timeoutCheck(oldState.guild, vcUser.id, timestamp)
        }

        // 切換語音頻道
        if (oldState.channelId!==null&&newState.channelId!==null&&newState.channelId!==oldState.channelId&&(oldState.member.user.id===newState.member.user.id)) {
            const vcUser = oldState.member.user
            const channel = client.channels.cache.get(config.channel.record.voice)
            let timestamp = new Date()

            channel.send({embeds: [
                new EmbedBuilder()
                .setColor(config.colour.con_orange)
                .setAuthor({ name: vcUser.username, iconURL: vcUser.avatarURL()})
                .setDescription(`使用者: ${vcUser}\n操作: 切換\n舊頻道: ${oldState.channel}\n新頻道: ${newState.channel}`)
                .setTimestamp()
            ]})

            timeoutCheck(oldState.guild, vcUser.id, timestamp)
        }
    }
}