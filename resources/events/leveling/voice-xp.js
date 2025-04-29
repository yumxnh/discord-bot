const {Events, Client, EmbedBuilder} = require('discord.js')
const {query} = require('../../database')
const config = require('../../../config.json')
const client = require('../../../main')
const {Role, Level} = require('../../utils/utils')

/**
* @param {Client} client
*/

module.exports = {
    name: Events.VoiceStateUpdate,
    execute: async (oldState, newState) => {
        if (newState.member.user.bot || oldState.member.user.bot || oldState.member.user.system || oldState.member.user.system) return

        if (newState.channelId===config.channel.afkVoice) newState.channelId = null
        if (oldState.channelId===config.channel.afkVoice) oldState.channelId = null

        // 加入語音頻道
        if (oldState.channelId===null&&newState.channelId!==null) {
            const vcUser = newState.member.user
            const joinTime = new Date()
            await query(`insert into users (user_id, user_name, vc_status, vc_join_time) VALUES (?, ?, 'join', ?) 
            on duplicate key update user_name = values(user_name), vc_status = values(vc_status), vc_join_time = values(vc_join_time)`, [vcUser.id, vcUser.username, joinTime])
        }

        // 離開語音頻道
        if (oldState.channelId!==null&&newState.channelId===null) {
            const vcUser = oldState.member.user
            const leaveTime = new Date()
            const userData = (await query('select * from users where user_id = ?', [vcUser.id]))[0]

            if (!userData||!userData.hasOwnProperty('vc_join_time')||userData.vc_status!=='join') return

            let stayMinutes = Math.round((leaveTime-userData.vc_join_time) / 60000)
            let multiplier = (await Role.has(vcUser.id, oldState.guild.id, config.role.booster)) ? 1.5 : 1
            let expToGive = Math.round(stayMinutes * 5 * multiplier)

            Level.add(vcUser, userData, expToGive, true)

            await query(`update users set vc_status = 'leave' where user_id = ?`, [vcUser.id])
            await query('insert into user_statistics (user_id, voice_time) values (?, ?) on duplicate key update voice_time = voice_time + values(voice_time)', [vcUser.id, stayMinutes])
            
        }
    }
}