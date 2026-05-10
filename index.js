import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import db from "./utils/db.js"
import userRouter from "./routes/user.routes.js"

const app =express();
app.use(express.json());

dotenv.config({
  path: "./.env",
});
const PORT = process.env.PORT || 8000;


app.get("/vinay", (req, res) => {
  res.send("vinay");
});
app.use(
  cors({
    origin: process.env.BASE_URL,
    credentials: true,
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
  }),
);
// user routes
app.use("/api/v1/user",userRouter)
// connected with database
db();

app.listen(PORT, () => {
  console.log(`app listening in port ${PORT}`);
});
