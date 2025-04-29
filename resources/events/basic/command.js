const {Events, Client, EmbedBuilder} = require('discord.js')
const {devs} = require('../../../config.json')
const client = require('../../../main')
const chalk = require('chalk')
const cooldowns = new Set();
const { useMainPlayer } = require('discord-player')

/**
 * @param {Client} client
 */

const addCooldown = (cmdID, cdSecond) => {
    cooldowns.add(cmdID)
    setTimeout(() => cooldowns.delete(cmdID), cdSecond * 1000)
}

module.exports = {
    name: Events.InteractionCreate,
    execute: async (interaction) => {
        if (!interaction.isChatInputCommand()) return
        const command = client.commands.get(interaction.commandName)
        
        if (!command) return interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setColor(0xDC0000)
                .setTitle("<:warn:1188203073689096284> 指令無效")
                .setDescription("這個指令可能已經被移除或是改名\n若有疑問，請聯絡開發人員")
            ],
            ephemeral: true
        })

        if (command.devs_only&&!devs.includes(interaction.user.id)) return interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setColor(0xDC0000)
                .setTitle("<:warn:1188203073689096284> 沒有權限")
                .setDescription("這個指令僅開放給開發人員使用")
            ],
            ephemeral: true
        })
        
        if (cooldowns.has(interaction.commandId)) return interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setColor(0xDCDC00)
                .setTitle("指令冷卻中")
                .setDescription(`${interaction.commandName}這個指令正在冷卻，請稍後。`)
            ],
            ephemeral: true
        })

        try {
            if (command.music) {
                const player = useMainPlayer()
                const data = {
                    guild: interaction.guild
                }
                await player.context.provide(data, () => command.execute(interaction))
            } else {
                await command.execute(interaction)
            }

            if (command.cooldown) addCooldown(interaction.commandId, command.cooldown)
        } catch (error) {
            console.log(chalk.hex("CC1B00").bold("events/commands.js: 指令執行時發生錯誤"))
            console.log(error)
        }
    }
}