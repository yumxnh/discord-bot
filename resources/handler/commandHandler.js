const fs = require('fs')
const path = require('path')
const chalk = require("chalk")
const {REST, Routes } = require('discord.js')
const {token, clientID} = require('../../config.json')

module.exports = async (client) => {
    const commands = commandsHandling(client)
    const rest = new REST({version: '10'}).setToken(token)

    try {
        const data = await rest.put(Routes.applicationCommands(clientID),{body: commands})
        console.log(chalk.hex("#0088F0").bold(`${data.length} 個指令已註冊成功✅`))
    } catch (error) {
        console.log(chalk.hex("#DC0000").bold(`指令註冊失敗`))
        console.log(error)
    }
}

const commandsHandling = (client) => {
    const commands = []
    let localCommands = getLocalCommands()
    for (const command of localCommands) {
        
        const data = {
            name:           command.name,
            description:    command.description     || null,
            options:        command.options         || null,
            dm_permission:  command.dm_permission   || false,
            devs_only:       command.devs_only      || false,
            cooldown:       command.cooldown        || null,
            type:           command.type            || 1,
            music:          command.music           || false,
            default_member_permissions: (command.default_member_permissions) ? toFormattedHexString(command.default_member_permissions) : null,
        }

        client.commands.set(command.name, {...data, execute: command.execute})
        commands.push(data)
    }
    return commands
}

const getLocalCommands = () => {
    const commands = []
    const foldersPath = path.join(__dirname, '..', 'commands')
    const commandFolders = fs.readdirSync(foldersPath)

    for (const folder of commandFolders) {
        const commandsPath = path.join(foldersPath, folder)
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))
        
        for (const commandfile of commandFiles) {
            const commandfilePath = path.join(commandsPath, commandfile)
            const command = require(commandfilePath)
            if (command.name&&command.execute&&!command.delete)
            commands.push(command)
        }
    }
    return commands
}

function toFormattedHexString(bigintValue) {
    return Number.parseInt('0x' + bigintValue.toString(16).padStart(16, '0'))
  }
