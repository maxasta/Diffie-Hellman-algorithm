import express from 'express';
import path    from 'path';

const app  = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.resolve();

// 1) Раздаём статику
app.use(express.static(path.join(__dirname, 'public')));

// 2) Фоллбэк на любой путь — тут обязательно '/*', а не '*'
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 3) Запускаем сервер
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
