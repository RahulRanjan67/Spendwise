import {monthkey,monthdate} from "./utils.js"
export function filtertxns(list,filters){
  const {search,type,category,month,sort}=filters
  const term=search.trim().toLowerCase()
  const out=list.filter(t=>{
    const text=(t.description+" "+t.notes).toLowerCase()
    const oksearch=term===""||text.includes(term)
    const oktype=type==="all"||t.type===type
    const okcat=category==="all"||t.category===category
    const okmonth=month==="all"||monthkey(t.date)===month
    return oksearch && oktype && okcat && okmonth
  })
  return sorttxns(out,sort)
}

export function sorttxns(list,sort){
  const out=[...list]
  if(sort==="date-asc") out.sort((a,b)=>new Date(a.date)-new Date(b.date))
  else if(sort==="amount-desc") out.sort((a,b)=>b.amount-a.amount)
  else if(sort==="amount-asc") out.sort((a,b)=>a.amount-b.amount)
  else out.sort((a,b)=>new Date(b.date)-new Date(a.date))
  return out
}

export function getsummary(list,month){
  const t=list.reduce((acc,tx)=>{
    if(tx.type==="income") acc.inc+=tx.amount
    else acc.exp+=tx.amount
    if(monthkey(tx.date)===month){
      if(tx.type==="income") acc.minc+=tx.amount
      else acc.mexp+=tx.amount
    }
    return acc
  },{inc:0,exp:0,minc:0,mexp:0})
  return {balance:t.inc-t.exp,inc:t.inc,exp:t.exp,count:list.length,minc:t.minc,mexp:t.mexp}
}

export function catbreakdown(list,month){
  const exp=list.filter(t=>t.type==="expense"&&monthkey(t.date)===month)
  const total=exp.reduce((sum,t)=>sum+t.amount,0)
  const totals={}
  exp.forEach(t=>{
    totals[t.category]=(totals[t.category]||0)+t.amount
  })
  return Object.entries(totals).map(([category,amount])=>({
    category,
    amount,
    percent:total?Math.round(amount/total*100):0
  })).sort((a,b)=>b.amount-a.amount)
}

export function monthtotals(list,refmonth,back=6){
  const ref=monthdate(refmonth)
  const months=[]
  for(let i=back-1;i>=0;i--){
    const d=new Date(ref.getFullYear(),ref.getMonth()-i,1)
    months.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`)
  }
  return months.map(key=>{
    const sub=list.filter(t=>monthkey(t.date)===key)
    const inc=sub.filter(t=>t.type==="income").reduce((s,t)=>s+t.amount,0)
    const exp=sub.filter(t=>t.type==="expense").reduce((s,t)=>s+t.amount,0)
    return {month:key,inc,exp}
  })
}

export function availmonths(list){
  const months=[...new Set(list.map(t=>monthkey(t.date)))]
  return months.sort((a,b)=>b.localeCompare(a))
}

export function budgetstats(list,budgets,month){
  return budgets.map(b=>{
    const spent=list.filter(t=>t.type==="expense"&&t.category===b.category&&monthkey(t.date)===month).reduce((s,t)=>s+t.amount,0)
    const percent=b.limit?Math.round(spent/b.limit*100):0
    const status=percent>=100?"over":percent>=75?"warning":"normal"
    return {category:b.category,limit:b.limit,spent,remain:b.limit-spent,percent,status}
  }).sort((a,b)=>b.percent-a.percent)
}
