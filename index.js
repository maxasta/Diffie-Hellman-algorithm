import express from 'express';
import path    from 'path';

const app  = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.resolve();

// 1) Раздаём статику из папки public
app.use(express.static(path.join(__dirname, 'public')));

// 2) На любые «ненайденные» запросы отдаем index.html
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 3) Запуск
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
