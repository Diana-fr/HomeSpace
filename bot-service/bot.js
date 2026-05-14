// bot-service/bot.js
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();
console.log('🔍 Переменные окружения:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***установлен***' : 'ОТСУТСТВУЕТ');
const config = {
    db: {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'homespace family organizer'
    },
    botUserId: '00000000-0000-0000-0000-000000000001',
    botName: '🤖 Бот-помощник',
    botAvatar: '🤖',
    checkInterval: 10000
};

let db = null;
let lastCheckTime = new Date();
let botInterval = null;

async function connectDB() {
    try {
        db = await mysql.createConnection(config.db);
        console.log('✅ [БОТ] Подключен к базе данных');
        return true;
    } catch (error) {
        console.error('❌ [БОТ] Ошибка подключения к БД:', error.message);
        return false;
    }
}

async function ensureBotExists() {
    try {
        const [existing] = await db.query('SELECT id FROM users WHERE id = ?', [config.botUserId]);
        if (existing.length === 0) {
            await db.query(`
                INSERT INTO users (id, email, password_hash, name, avatar, role, family_id, bonuses, created_at)
                VALUES (?, 'bot@homespace.local', '', ?, ?, 'bot', NULL, 0, NOW())
            `, [config.botUserId, config.botName, config.botAvatar]);
            console.log('✅ [БОТ] Виртуальный пользователь создан');
        } else {
            console.log('✅ [БОТ] Пользователь уже существует');
        }
    } catch (error) {
        console.error('❌ [БОТ] Ошибка создания бота:', error.message);
    }
}

async function getNewEvents() {
    const events = [];
    try {
        const [newTasks] = await db.query(`
            SELECT t.id, t.title, t.bonus, t.family_id, t.assigned_to, 
                   u.name as assigned_name, c.name as created_name
            FROM tasks t
            JOIN users u ON t.assigned_to = u.id
            JOIN users c ON t.created_by = c.id
            WHERE t.created_at > ? AND t.assigned_to IS NOT NULL 
              AND t.created_by != t.assigned_to
        `, [lastCheckTime]);
        
        for (const task of newTasks) {
            events.push({
                familyId: task.family_id,
                userId: task.assigned_to,
                message: `${task.created_name} создал(а) задание "${task.title}" для ${task.assigned_name}\n💰 Награда: ${task.bonus} бонусов`
            });
        }
        
        const [completedTasks] = await db.query(`
            SELECT t.id, t.title, t.bonus, t.family_id,
                   u.name as assigned_name, c.name as completed_name
            FROM tasks t
            JOIN users u ON t.assigned_to = u.id
            JOIN users c ON t.completed_by = c.id
            WHERE t.completed_at > ? AND t.status = 'completed'
        `, [lastCheckTime]);
        
        for (const task of completedTasks) {
            events.push({
                familyId: task.family_id,
                userId: task.assigned_to,
                message: `${task.completed_name} выполнил(а) "${task.title}" и получил(а) ${task.bonus} бонусов! 🎉`
            });
        }
        
        const [pendingWishes] = await db.query(`
            SELECT w.id, w.title, w.price, w.family_id, u.name as created_name
            FROM wishes w
            JOIN users u ON w.created_by = u.id
            WHERE w.created_at > ? AND w.status = 'pending'
        `, [lastCheckTime]);
        
        for (const wish of pendingWishes) {
            const [parents] = await db.query(`SELECT id FROM users WHERE family_id = ? AND role = 'parent'`, [wish.family_id]);
            for (const parent of parents) {
                events.push({
                    familyId: wish.family_id,
                    userId: parent.id,
                    message: `🎁 ${wish.created_name} хочет: "${wish.title}"\n💰 Цена: ${wish.price} бонусов\n⏳ Требуется одобрение`
                });
            }
        }
        
    } catch (error) {
        console.error('❌ [БОТ] Ошибка получения событий:', error.message);
    }
    return events;
}

async function sendBotMessage(event) {
    try {
        const messageId = uuidv4();
        await db.query(`
            INSERT INTO chat_messages (id, family_id, user_id, user_name, user_avatar, message, type, recipient_id, is_read, message_type, created_at)
            VALUES (?, ?, ?, ?, ?, ?, 'private', ?, 0, 'text', NOW())
        `, [messageId, event.familyId, null, config.botName, config.botAvatar, event.message, event.userId]);
        console.log(`📨 [БОТ] Сообщение отправлено пользователю ${event.userId}`);
    } catch (error) {
        console.error('❌ [БОТ] Ошибка отправки:', error.message);
    }
}

async function checkAndProcessEvents() {
    const events = await getNewEvents();
    if (events.length > 0) {
        console.log(`📬 [БОТ] Найдено ${events.length} событий`);
        for (const event of events) {
            await sendBotMessage(event);
        }
    }
    lastCheckTime = new Date();
}

async function startBot() {
    console.log('==========================================');
    console.log('🤖 Семейный бот-помощник HomeSpace');
    console.log('==========================================');
    
    const connected = await connectDB();
    if (!connected) {
        console.error('❌ Не удалось подключиться к БД, выход...');
        process.exit(1);
    }
    
    await ensureBotExists();
    await checkAndProcessEvents();
    
    botInterval = setInterval(checkAndProcessEvents, config.checkInterval);
    console.log(`🔄 Бот работает, интервал: ${config.checkInterval / 1000} сек`);
}

// ЗАПУСК
startBot().catch(error => {
    console.error('❌ Ошибка запуска бота:', error);
    process.exit(1);
});