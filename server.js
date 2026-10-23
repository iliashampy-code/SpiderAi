import express from "express";
import dotenv from "dotenv";
dotenv.config();
const app=express();
app.use(express.json({limit:"1mb"}));
app.use(express.static("."));
app.post("/api/chat",async(req,res)=>{
  try{
    const {AI_API_KEY,AI_BASE_URL,AI_MODEL}=process.env;
    if(!AI_API_KEY||!AI_BASE_URL||!AI_MODEL)return res.status(503).json({error:"Model API is not configured"});
    const response=await fetch(`${AI_BASE_URL.replace(/\\/$/,"")}/chat/completions`,{
      method:"POST",headers:{"Authorization":`Bearer ${AI_API_KEY}`,"Content-Type":"application/json"},
      body:JSON.stringify({model:AI_MODEL,messages:[{role:"system",content:"Ты SpiderAI — дружелюбный, полезный ИИ-ассистент. Отвечай ясно и на языке пользователя."},...(Array.isArray(req.body.messages)?req.body.messages:[])],temperature:0.7})
    });
    if(!response.ok){console.error("Provider returned",response.status);return res.status(502).json({error:"Model provider error"});}
    const data=await response.json();res.json({reply:data.choices?.[0]?.message?.content||"Модель не вернула ответ."});
  }catch(e){console.error(e);res.status(500).json({error:"Could not reach model provider"});}
});
const port=process.env.PORT||3000;
app.listen(port,()=>console.log(`SpiderAI is running on http://localhost:${port}`));
