import express from 'express'
 
import path from 'path';
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, 'public')));
const app = express()

app.get('/', (req, res) => {
  res.send('Hello World')
})

app.listen(3000)
