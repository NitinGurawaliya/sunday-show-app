import express from 'express';

const app = express();
const PORT = 4000;

app.use(express.json());

app.get('/api/hello', (_req, res) => {
  res.json({ message: 'Hello from backend' });
});

app.get('/',(req,res)=>{
    res.json({msg:"hello from root"})
})

app.listen(PORT, () => {
  console.log(`Backend is running on http://localhost:${PORT}`);
});
