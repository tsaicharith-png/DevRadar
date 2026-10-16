const express=require('express');

const app=express();



app.use("/charith",(req,res)=>{
  res.send("Hello Charith");
})

app.use("/marks",(req,res)=>{
  res.send("You got 100 marks");
})

app.use("/",(req,res)=>{
  res.send("Hello there");
})

app.listen(3000,()=>{
  console.log("The server is listening form port 3000...");
})