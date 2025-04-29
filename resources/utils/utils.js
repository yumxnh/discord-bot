const client = require('../../main')
const config = require('../../config.json')
const {query} = require('../database')

class Role {
    static has = async (userID, guildID, role) => {
        const guild = await client.guilds.fetch(guildID)
        const member = await guild.members.fetch(userID)
        return member.roles.cache.has(role)
    }

    static add = async (userID, guildID, role) => {
        const guild = await client.guilds.fetch(guildID)
        const member = await guild.members.fetch(userID)
        member.roles.add(role)
    }

    static remove = async (userID, guildID, role) => {
        const guild = await client.guilds.fetch(guildID)
        const member = await guild.members.fetch(userID)
        member.roles.remove(role)
    }
}

class Level {
    static required = (level) => {
        return Math.round(100 * level  * 1.327 + level**2)
    }

    static add = async (user, levelData, expAdd, notification) => {
        
        let intialLevel = levelData.level

        levelData.experience += expAdd
        levelData.total_experience += expAdd
        while (levelData.experience >= Level.required(levelData.level)) {
            levelData.experience -= Level.required(levelData.level)
            levelData.level += 1
        }

        if (notification) {
            if (levelData.level>intialLevel) {
                const systemChannel = client.channels.cache.get(config.channel.system)
                systemChannel.send(`恭喜 <@${user.id}>，你已升級至${levelData.level}等!`)
            }
        }

        await query(`update users set user_name = ?, level = ?, experience = ?, total_experience = ? where user_id = ?`, [user.username, levelData.level, levelData.experience, levelData.total_experience, user.id])
    }
}


module.exports = {Role, Level}