const {Events, Client, EmbedBuilder, Message} = require('discord.js')
const {query} = require('../../database')
const config = require('../../../config.json')
const client = require('../../../main')
const {Role, Level} = require('../../utils/utils')
const cooldowns = new Set()

/**
* @param {Client} client
*/

const getRandomExp = (minExp, maxExp) => {
    return Math.floor(Math.random() * (maxExp - minExp + 1)) + minExp
}

const addCooldown = (userID) => {
    cooldowns.add(userID)
    setTimeout(() => cooldowns.delete(userID), 60 * 1000)
}

module.exports = {
    name: Events.MessageCreate,
    execute: async (message) => {

        if (!message||message.author.bot||message.author.system||!message.inGuild()) return

        const msgUser = message.author
        await query('INSERT INTO user_statistics (user_id, messages_sent) VALUES (?, 1) ON DUPLICATE KEY UPDATE messages_sent = messages_sent + 1', [msgUser.id])
        
        if (cooldowns.has(msgUser.id)) return

        let multiplier = (await Role.has(msgUser.id, message.guild.id, config.role.booster)) ? 2 : 1
        let expToGive = getRandomExp(6, 10) * multiplier

        const userData = (await query('select level, experience, total_experience from users where user_id = ?', [msgUser.id]))[0] || {level: 1, experience: 0, total_experience: 0}

        Level.add(msgUser, userData, expToGive, true)

        addCooldown(msgUser.id)
    }
}