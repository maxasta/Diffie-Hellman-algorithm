import express from 'express';
import path    from 'path';

const app  = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.resolve();

// 1. Статика из корня проекта
app.use(express.static(__dirname));

// 2. Любой незнакомый маршрут — отдаём root index.html
app.get(/.*/, (req, res) =>
  res.sendFile(path.join(__dirname, 'index.html'))
);

// 3. Запуск
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
