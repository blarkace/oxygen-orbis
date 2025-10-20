const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const app = express();
app.use(cors()); app.use(express.json());
const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'bookings.oxygenorbis@gmail.com';
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
  secure: process.env.SMTP_SECURE === 'true' || false,
  auth: { user: process.env.SMTP_USER || '', pass: process.env.SMTP_PASS || '' }
});
app.post('/api/contact', async (req,res)=>{
  try{
    const {name,email,phone,message} = req.body||{};
    if(!name||!email||!message) return res.status(400).json({error:'Missing fields'});
    const mailOptions = { from:`${name} <${email}>`, to: CONTACT_EMAIL, subject:`Website contact from ${name}`, text:`Name: ${name}\nEmail: ${email}\nPhone: ${phone||'N/A'}\n\nMessage:\n${message}` };
    await transporter.sendMail(mailOptions);
    return res.json({ok:true});
  }catch(err){ console.error(err); return res.status(500).json({error:'Failed to send'}); }
});
const uploadDir = path.join(__dirname,'uploads'); if(!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
const storage = multer.diskStorage({ destination:(req,file,cb)=>cb(null,uploadDir), filename:(req,file,cb)=>cb(null,Date.now()+'-'+file.originalname) });
const upload = multer({storage});
app.post('/api/upload-menu', upload.single('menu'), (req,res)=>{ if(!req.file) return res.status(400).json({error:'No file'}); const type=req.body.type; const mapFile=path.join(uploadDir,'map.json'); let map={}; if(fs.existsSync(mapFile)) map=JSON.parse(fs.readFileSync(mapFile)); map[type]=`/uploads/${req.file.filename}`; fs.writeFileSync(mapFile, JSON.stringify(map,null,2)); return res.json({ok:true,url:map[type]}); });
app.use('/uploads', express.static(path.join(__dirname,'uploads')));
app.get('/api/menus',(req,res)=>{ const mapFile=path.join(__dirname,'uploads','map.json'); if(fs.existsSync(mapFile)) return res.json(JSON.parse(fs.readFileSync(mapFile))); return res.json({}); });
const PORT = process.env.PORT||5000; app.listen(PORT, ()=>console.log('Backend running on', PORT));
