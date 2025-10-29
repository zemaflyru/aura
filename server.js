import express from 'express';
import fetch from 'node-fetch';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
const PORT = 3000;

// 🔹 Настройки Telegram
const TELEGRAM_BOT_TOKEN = '8429627150:AAFYGR0V1ILpN-cpzoLlydnLECU4c6lssIg';
const CHAT_ID = '-1002529850803'; // новый чат для заказов

app.use(cors());
app.use(bodyParser.json());

// 🔹 Генерация трек-номера формата XXXX-XXXX-XXXX
function generateTrackNumber() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let track = '';
  for (let i = 0; i < 12; i++) {
    track += chars[Math.floor(Math.random() * chars.length)];
  }
  return track.match(/.{1,4}/g).join('-');
}

// === Отправка нового заказа ===
app.post('/send-order', async (req, res) => {
  const { name, phone, email, cart, total } = req.body;

  const trackNumber = generateTrackNumber();

  // 💬 Формируем аккуратное Telegram-сообщение
  const message = `
<b>🧾 Новый заказ в AURA CLUB</b>\n
👤 <b>Имя:</b> ${name}
📞 <b>Телефон:</b> ${phone}
📧 <b>Email:</b> ${email || '-'}\n
🛍️ <b>Товары:</b>
${cart.map(i => `• ${i.name} — <b>${i.price} ₽</b>`).join('\n')}\n
💰 <b>Итого:</b> <b>${total} ₽</b>\n
🚚 <b>Трек-номер:</b> <code>${trackNumber}</code>
`;

  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'HTML' // ✅ Обязательно!
      })
    });

    res.json({ status: 'ok', trackNumber });
  } catch (err) {
    console.error('Ошибка при отправке в Telegram:', err);
    res.status(500).json({ status: 'error', error: err.message });
  }
});

app.listen(PORT, () => console.log(`✅ Сервер запущен на порту ${PORT}`));
