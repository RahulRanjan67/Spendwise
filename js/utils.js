export const cats=["Food","Transport","Education","Entertainment","Shopping","Bills","Health","Other"]

export function genid(){
  return "t"+Date.now().toString(36)+Math.random().toString(36).slice(2,6)
}

export function fmtmoney(amt){
  return new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(amt)
}

export function fmtdate(str){
  const d=new Date(str)
  return new Intl.DateTimeFormat("en-IN",{day:"numeric",month:"short",year:"numeric"}).format(d)
}

export function monthkey(str){
  return str.slice(0,7)
}

export function curmonth(){
  const now=new Date()
  const m=String(now.getMonth()+1).padStart(2,"0")
  return `${now.getFullYear()}-${m}`
}

export function monthdate(key){
  const [y,m]=key.split("-")
  return new Date(Number(y),Number(m)-1,1)
}

export function monthlabel(key){
  return new Intl.DateTimeFormat("en-IN",{month:"long",year:"numeric"}).format(monthdate(key))
}

export function checktxn({description,amount,type,category,date,notes}){
  const errs={}
  const desc=description?description.trim():""
  if(desc.length<2) errs.description="Enter a description with at least 2 characters"
  else if(desc.length>60) errs.description="Keep the description under 60 characters"
  const amt=Number(amount)
  if(amount===""||amount===null||amount===undefined||!Number.isFinite(amt)||amt<=0) errs.amount="Enter an amount greater than 0"
  if(type!=="income"&&type!=="expense") errs.type="Select a valid type"
  if(!cats.includes(category)) errs.category="Select a category"
  if(!date||isNaN(new Date(date).getTime())) errs.date="Select a valid date"
  if(notes&&notes.length>200) errs.notes="Keep notes under 200 characters"
  return errs
}

export function checkbudget({category,limit}){
  const errs={}
  if(!cats.includes(category)) errs.budgetcat="Select a category"
  const num=Number(limit)
  if(limit===""||limit===null||limit===undefined||!Number.isFinite(num)||num<=0) errs.budgetlimit="Enter a monthly limit greater than 0"
  return errs
}

function esc(val){
  const text=String(val==null?"":val)
  if(/[",\n]/.test(text)) return '"'+text.replace(/"/g,'""')+'"'
  return text
}

export function tocsv(list){
  const head=["id","description","amount","type","category","date","notes"]
  const rows=list.map(t=>head.map(k=>esc(t[k])).join(","))
  return [head.join(","),...rows].join("\n")
}

export function savefile(name,content,type){
  const blob=new Blob([content],{type})
  const url=URL.createObjectURL(blob)
  const link=document.createElement("a")
  link.href=url
  link.download=name
  link.click()
  URL.revokeObjectURL(url)
}

export function checkimport(data){
  if(!data||typeof data!=="object") return false
  if(!Array.isArray(data.transactions)) return false
  if(data.budgets!==undefined&&!Array.isArray(data.budgets)) return false
  return data.transactions.every(t=>t&&typeof t.description==="string"&&typeof t.amount==="number"&&(t.type==="income"||t.type==="expense")&&typeof t.category==="string"&&typeof t.date==="string")
}
