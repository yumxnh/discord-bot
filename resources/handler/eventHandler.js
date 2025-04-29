const fs = require('fs')
const path = require('path')

module.exports = (client) => {
    const foldersPath = path.join(__dirname, '..', 'events')
    const eventFolders = fs.readdirSync(foldersPath)

    for (const folder of eventFolders) {
        const eventsPath = path.join(foldersPath, folder)
        const eventFiles = fs.readdirSync(eventsPath)

        for (const eventFile of eventFiles) {
            const eventfilePath = path.join(eventsPath, eventFile)
            const event = require(eventfilePath)
            
            if (event.name&&event.execute) {
                if (event.once) {
                    client.once(event.name, (...args) => event.execute(...args, client))
                } else {
                    client.on(event.name, (...args) => event.execute(...args, client))
                }
            }
        }
    }
}