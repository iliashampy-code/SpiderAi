const $ = id => document.getElementById(id);
const KEY = "spiderai-chats-v1";
let chats = loadChats(), activeId = chats[0]?.id || null, busy = false, toastTimer;
function loadChats(){try{return JSON.parse(localStorage.getItem(KEY)||"[]")}catch{return []}}
function save(){localStorage.setItem(KEY,JSON.stringify(chats))}
function toast(s){const t=$("toast");t.textContent=s;t.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove("show"),2300)}
function active(){return chats.find(c=>c.id===activeId)}
function newChat(){const c={id:crypto.randomUUID?.()||String(Date.now()),title:"Новый чат",messages:[]};chats.unshift(c);activeId=c.id;save();render();$("input").focus();$("sidebar").classList.remove("open")}
function renderHistory(){const root=$("history");root.innerHTML="";chats.slice(0,30).forEach(c=>{const b=document.createElement("button");b.className="history-item"+(c.id===activeId?" active":"");b.textContent="◦  "+c.title;b.title=c.title;b.onclick=()=>{activeId=c.id;render();$("sidebar").classList.remove("open")};root.appendChild(b)})}
function renderMessages(){const c=active(),root=$("messages");root.innerHTML="";const has=!!c?.messages.length;root.classList.toggle("active",has);$("welcome").style.display=has?"none":"block";if(!has)return;c.messages.forEach(m=>{const row=document.createElement("div");row.className="message "+m.role;if(m.role==="assistant"){const icon=document.createElement("div");icon.className="bot-avatar";icon.textContent="✳";row.appendChild(icon)}const bubble=document.createElement("div");bubble.className="bubble";bubble.textContent=m.content;row.appendChild(bubble);root.appendChild(row)});$("conversation").scrollTop=$("conversation").scrollHeight}
function render(){renderHistory();renderMessages()}
function add(role,content){active().messages.push({role,content});save();renderMessages()}
async function send(raw){const text=(raw??$("input").value).trim();if(!text||busy)return;if(!active())newChat();const c=active();if(!c.messages.length)c.title=text.slice(0,36);add("user",text);$("input").value="";$("input").style.height="auto";renderHistory();busy=true;$("send").disabled=true;const pending=document.createElement("div");pending.className="message";pending.innerHTML='<div class="bot-avatar">✳</div><div class="bubble">SpiderAI думает…</div>';$("messages").appendChild(pending);
try{const r=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:c.messages})});if(!r.ok)throw new Error("API не настроен");const data=await r.json();pending.remove();add("assistant",data.reply||"Не удалось получить ответ.");$("status").textContent="ИИ подключён"}
catch{pending.remove();add("assistant","Я получил твоё сообщение, но пока работаю в демо-режиме. Чтобы я мог генерировать настоящие ответы, нужно запустить сервер и подключить API языковой модели. API-ключ хранится только на сервере, не в браузере.");$("status").textContent="Демо-режим"}
finally{busy=false;$("send").disabled=false;$("input").focus()}}
$("form").addEventListener("submit",e=>{e.preventDefault();send()});
$("input").addEventListener("input",()=>{const el=$("input");el.style.height="auto";el.style.height=Math.min(el.scrollHeight,140)+"px"});
$("input").addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();$("form").requestSubmit()}});
document.querySelectorAll("[data-prompt]").forEach(b=>b.addEventListener("click",()=>send(b.dataset.prompt)));
$("newChat").onclick=newChat;$("menuButton").onclick=()=>$("sidebar").classList.toggle("open");$("closeSidebar").onclick=()=>$("sidebar").classList.remove("open");
$("clearHistory").onclick=()=>{if(!chats.length){toast("История уже пуста");return}if(confirm("Удалить все сохранённые чаты?")){chats=[];activeId=null;save();render();toast("История очищена")}};
$("theme").onclick=()=>toast("Светлая тема появится в следующей версии.");
if(!chats.length){const c={id:String(Date.now()),title:"Новый чат",messages:[]};chats=[c];activeId=c.id;save()}render();
