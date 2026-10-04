import {cats,fmtmoney,fmtdate,monthlabel} from "./utils.js"

const els={
  bal:document.getElementById("statBalance"),
  inc:document.getElementById("statIncome"),
  exp:document.getElementById("statExpense"),
  cnt:document.getElementById("statCount"),
  minc:document.getElementById("statMonthIncome"),
  mexp:document.getElementById("statMonthExpense"),
  list:document.getElementById("transactionList"),
  empty:document.getElementById("emptyState"),
  fcat:document.getElementById("filterCategory"),
  fmonth:document.getElementById("filterMonth"),
  catsel:document.getElementById("category"),
  budgetcat:document.getElementById("budgetcat"),
  budgetlist:document.getElementById("budgetList"),
  catbars:document.getElementById("categoryBars"),
  monthbars:document.getElementById("monthlyBars"),
  monthsel:document.getElementById("monthsel"),
  acctsel:document.getElementById("acctsel"),
  form:document.getElementById("transactionForm"),
  submitbtn:document.getElementById("submitButton"),
  cancelbtn:document.getElementById("cancelEdit"),
  bform:document.getElementById("budgetform"),
  bsubmitbtn:document.getElementById("budgetsubmit"),
  bcancelbtn:document.getElementById("budgetcancel"),
  toastbox:document.getElementById("toast"),
  modal:document.getElementById("confirmModal"),
  modalmsg:document.getElementById("confirmMessage"),
  modalok:document.getElementById("confirmOk"),
  admsg:document.getElementById("adMessage"),
  adbox:document.getElementById("adSlot")
}

export function showsummary(s){
  els.bal.textContent=fmtmoney(s.balance)
  els.bal.classList.toggle("negative",s.balance<0)
  els.inc.textContent=fmtmoney(s.inc)
  els.exp.textContent=fmtmoney(s.exp)
  els.cnt.textContent=s.count
  els.minc.textContent=fmtmoney(s.minc)
  els.mexp.textContent=fmtmoney(s.mexp)
}

export function fillcats(){
  const targets=[els.catsel,els.fcat,els.budgetcat]
  cats.forEach(c=>{
    targets.forEach(sel=>{
      const opt=document.createElement("option")
      opt.value=c
      opt.textContent=c
      sel.appendChild(opt)
    })
  })
}

export function fillaccts(names,selected){
  Object.entries(names).forEach(([id,label])=>{
    const opt=document.createElement("option")
    opt.value=id
    opt.textContent=label
    els.acctsel.appendChild(opt)
  })
  els.acctsel.value=selected
}

export function showmonthfilter(months,selected){
  els.fmonth.querySelectorAll("option:not(:first-child)").forEach(o=>o.remove())
  months.forEach(m=>{
    const opt=document.createElement("option")
    opt.value=m
    opt.textContent=monthlabel(m)
    els.fmonth.appendChild(opt)
  })
  els.fmonth.value=selected
}

export function showmonthsel(months,selected){
  els.monthsel.innerHTML=""
  months.forEach(m=>{
    const opt=document.createElement("option")
    opt.value=m
    opt.textContent=monthlabel(m)
    els.monthsel.appendChild(opt)
  })
  els.monthsel.value=selected
}

export function showtxns(list,hasany){
  els.list.innerHTML=""
  if(list.length===0){
    els.empty.textContent=hasany?"No transactions match the current filters.":"No transactions yet. Add your first one above."
    els.empty.classList.remove("hidden")
    return
  }
  els.empty.classList.add("hidden")
  list.forEach(t=>{
    const card=document.createElement("article")
    card.className="transaction-card "+t.type
    card.dataset.id=t.id
    card.innerHTML=`
      <div class="transaction-main">
        <p class="transaction-description">${t.description}</p>
        <p class="transaction-meta">${t.category} on ${fmtdate(t.date)}</p>
      </div>
      <div class="transaction-side">
        <span class="transaction-amount">${t.type==="income"?"+":"-"}${fmtmoney(t.amount)}</span>
        <div class="transaction-actions">
          <button type="button" class="icon-button" data-action="edit">Edit</button>
          <button type="button" class="icon-button danger" data-action="delete">Delete</button>
        </div>
      </div>
    `
    els.list.appendChild(card)
  })
}

export function showbudgets(list){
  els.budgetlist.innerHTML=""
  if(list.length===0){
    els.budgetlist.innerHTML=`<p class="empty-state">No budgets yet. Add one to start tracking a category.</p>`
    return
  }
  list.forEach(b=>{
    const row=document.createElement("div")
    row.className="budget-row"
    row.dataset.category=b.category
    const remaintext=b.remain<0?`Over by ${fmtmoney(Math.abs(b.remain))}`:`Remaining ${fmtmoney(b.remain)}`
    row.innerHTML=`
      <div class="budget-row-head">
        <span class="budget-category">${b.category}</span>
        <span class="budget-limit">Limit ${fmtmoney(b.limit)}</span>
      </div>
      <div class="budget-stats">
        <span>Spent ${fmtmoney(b.spent)}</span>
        <span>${remaintext}</span>
        <span>${b.percent}%</span>
      </div>
      <div class="progress-track">
        <div class="progress-fill ${b.status}" style="width:${Math.min(b.percent,100)}%"></div>
      </div>
      <div class="budget-row-actions">
        <button type="button" class="icon-button" data-action="edit">Edit</button>
        <button type="button" class="icon-button danger" data-action="delete">Delete</button>
      </div>
    `
    els.budgetlist.appendChild(row)
  })
}

export function showcatbars(list){
  els.catbars.innerHTML=""
  if(list.length===0){
    els.catbars.innerHTML=`<p class="empty-state">No expenses in this month yet.</p>`
    return
  }
  list.forEach(item=>{
    const bar=document.createElement("div")
    bar.className="h-bar-row"
    bar.innerHTML=`
      <span class="h-bar-label">${item.category}</span>
      <div class="h-bar-track">
        <div class="h-bar-fill" style="width:${item.percent}%"></div>
      </div>
      <span class="h-bar-value">${item.percent}%</span>
    `
    els.catbars.appendChild(bar)
  })
}

export function showmonthbars(list){
  els.monthbars.innerHTML=""
  const max=Math.max(...list.map(m=>Math.max(m.inc,m.exp)),1)
  list.forEach(item=>{
    const col=document.createElement("div")
    col.className="month-bar-column"
    const ih=Math.round(item.inc/max*100)
    const eh=Math.round(item.exp/max*100)
    col.innerHTML=`
      <div class="month-bar-pair">
        <div class="month-bar income" style="height:${ih}%" title="Income ${fmtmoney(item.inc)}"></div>
        <div class="month-bar expense" style="height:${eh}%" title="Expense ${fmtmoney(item.exp)}"></div>
      </div>
      <span class="month-bar-label">${monthlabel(item.month).split(" ")[0]}</span>
    `
    els.monthbars.appendChild(col)
  })
}

export function showform(mode){
  els.form.classList.remove("hidden")
  els.submitbtn.textContent=mode==="edit"?"Save changes":"Add transaction"
  els.cancelbtn.classList.toggle("hidden",mode!=="edit")
  els.form.scrollIntoView({behavior:"smooth",block:"center"})
}

export function hideform(){
  els.form.classList.add("hidden")
  els.form.reset()
  clearerrs()
}

export function fillform(t){
  document.getElementById("description").value=t.description
  document.getElementById("amount").value=t.amount
  document.getElementById("type").value=t.type
  document.getElementById("category").value=t.category
  document.getElementById("date").value=t.date
  document.getElementById("notes").value=t.notes
}

export function showbform(mode){
  els.bform.classList.remove("hidden")
  els.bsubmitbtn.textContent=mode==="edit"?"Save changes":"Add budget"
  els.bcancelbtn.classList.toggle("hidden",mode!=="edit")
  els.bform.scrollIntoView({behavior:"smooth",block:"center"})
}

export function hidebform(){
  els.bform.classList.add("hidden")
  els.bform.reset()
  clearerrs()
}

export function fillbform(b){
  document.getElementById("budgetcat").value=b.category
  document.getElementById("budgetlimit").value=b.limit
}

export function showerrs(errs){
  clearerrs()
  Object.entries(errs).forEach(([field,msg])=>{
    const el=document.getElementById("error-"+field)
    if(el) el.textContent=msg
  })
}

export function clearerrs(){
  document.querySelectorAll(".field-error").forEach(el=>el.textContent="")
}

let toasttimer=null
export function toast(msg,type="info"){
  els.toastbox.textContent=msg
  els.toastbox.className="toast "+type
  els.toastbox.classList.remove("hidden")
  clearTimeout(toasttimer)
  toasttimer=setTimeout(()=>els.toastbox.classList.add("hidden"),3000)
}

export function confirm(msg,label="Delete"){
  els.modalmsg.textContent=msg
  els.modalok.textContent=label
  els.modal.classList.remove("hidden")
}

export function closeconfirm(){
  els.modal.classList.add("hidden")
}

export function setad(msg){
  els.admsg.textContent=msg
}

export function hidead(){
  els.adbox.classList.add("hidden")
}

export function showad(){
  els.adbox.classList.remove("hidden")
}
