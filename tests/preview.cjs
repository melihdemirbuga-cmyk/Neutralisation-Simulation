'use strict';
// Vorschau nur für dieses Artefakt, nur an der lokalen Loopback-Adresse.
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const file=path.join(__dirname,'..','neutralisationslabor.html');
http.createServer((req,res)=>{
  if(req.url!=='/'&&req.url!=='/neutralisationslabor.html') {res.writeHead(404);res.end('Not found');return;}
  res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});
  res.end(fs.readFileSync(file));
}).listen(8765,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:8765/neutralisationslabor.html'));
