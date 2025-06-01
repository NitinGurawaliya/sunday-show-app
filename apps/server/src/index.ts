import express from 'express';
import cors from 'cors'
import userRouter from './router/user.router';

const app = express();
const PORT = 4000;

app.use(express.json());
app.use(cors())

app.use("/api/v1/user",userRouter)



app.listen(PORT, () => {
  console.log(`Backend is running on http://localhost:${PORT}`);
});
