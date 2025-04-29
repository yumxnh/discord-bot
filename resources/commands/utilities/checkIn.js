const { ApplicationCommandType, AttachmentBuilder } = require('discord.js')
const { query } = require('../../database')
const {Role} = require('../../utils/utils')
const config = require('../../../config.json')
const {createCanvas, Image, loadImage} = require('@napi-rs/canvas')

module.exports = {
    name: 'dailycheck',
    description: '每日簽到',
    type: ApplicationCommandType.ChatInput,
    execute: async (interaction) => {
        if (!interaction.inGuild()) return
        await interaction.deferReply()

        let user = interaction.user;
        let userData = (await query('SELECT * FROM checkins WHERE user_id = ?', [user.id]))[0];

        let CheckTime = new Date()  // 當前時間
        let today = new Date(CheckTime.getFullYear(), CheckTime.getMonth(), CheckTime.getDate());  // 今天 00:00 的時間
        let oneDayInMillis = 86400000;  // 一天的毫秒數

        // 使用者是第一次簽到，插入新資料
        if (!userData) {
            await query('INSERT INTO checkins (user_id, total_checkins, streak, last_checkin) VALUES (?, ?, ?, ?)', [user.id, 1, 1, today])
            interaction.editReply('簽到成功! 已連續簽到 1 天')
            return
        }

        let lastCheckTime = new Date(userData.last_checkin);  // 最後一次簽到時間
        let diffTime = today - lastCheckTime  // 今天和上次簽到的時間差，單位是毫秒
        let diffDays = Math.floor(diffTime / oneDayInMillis);  // 計算時間差的天數

        let lastMissTime = (userData.missed) ? new Date(userData.missed) : null // 最後一次補簽的時間
        let missDiffTime = (lastMissTime) ? today - lastMissTime : 29 * oneDayInMillis
        let missDiffDays = Math.floor(missDiffTime / oneDayInMillis)

        if (diffDays === 0) {
            // 今天已經簽到過了，無需再次簽到
            interaction.editReply("你今天已經簽到過了，請明日再來。")
        } 
        
        else if (diffDays === 1) {
            // 正常簽到（昨天簽到）
            await query('UPDATE checkins SET total_checkins = ?, streak = ?, last_checkin = ? WHERE user_id = ?', 
            [userData.total_checkins + 1, userData.streak + 1, today, user.id])
            interaction.editReply(`簽到成功！已連續簽到 ${userData.streak + 1} 天`);
        } 
        
        else if (diffDays <= 5&&missDiffDays>=28&&(Role.has(user.id, config.guildID, config.role.booster)||config.devs.has(user.id))) {
            // 補簽邏輯，最多可以補簽 4 天
            let makeUpDays = diffDays - 1;  // 補簽天數（不包含今天）
            await query('UPDATE checkins SET total_checkins = ?, streak = ?, last_checkin = ?, missed = ? WHERE user_id = ?', 
                        [userData.total_checkins + diffDays, userData.streak + diffDays, today, today, user.id]);
            interaction.editReply(`補簽成功！你已補簽 ${makeUpDays} 天，今日簽到成功，已連續簽到 ${userData.streak + diffDays} 天`);
        } 
        
        else {
            // 超過補簽期限，重置連續簽到天數
            await query('UPDATE checkins SET total_checkins = ?, streak = ?, last_checkin = ? WHERE user_id = ?', 
            [userData.total_checkins + 1, 1, today, user.id]);
            interaction.editReply(`簽到成功，已連續簽到 1 天`);
        }
    }
}
