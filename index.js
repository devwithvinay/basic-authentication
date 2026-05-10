import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import db from "./utils/db.js"

const app =express()
dotenv.config({
  path: "./.env",
});
const PORT = process.env.PORT || 8000;
app.use(express.json());

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
db();
app.listen(process.env.PORT, () => {
  console.log(`app listening in port ${PORT}`);
});
