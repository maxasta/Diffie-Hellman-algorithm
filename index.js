import express from 'express';
import path    from 'path';

// 1) Сначала создаём приложение…
const app  = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.resolve();

// 2) …потом настраиваем статику и роуты
app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
);

// 3) И только потом слушаем порт
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
