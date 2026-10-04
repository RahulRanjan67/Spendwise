import {loadstate,savestate} from "./storage.js"
import {acc1,acc2} from "../data/sample-data.js"
import {filtertxns,getsummary,catbreakdown,monthtotals,availmonths,budgetstats} from "./transactions.js"
import {genid,checktxn,checkbudget,tocsv,savefile,checkimport,curmonth} from "./utils.js"
import {state,getcur,switchacct,addtxn,edittxn,deltxn,settxns,setbudgets,upsertbudget,delbudget,setfilter,resetfilters,setmonth,setedit,getedit,seteditbudget,geteditbudget} from "./state.js"
import * as ui from "./ui.js"

const acctnames={acc1:"Personal",acc2:"Family"}
const ads=["Student discount on finance tools - 20% off budgeting apps this month","Sponsored: open a zero fee student savings account today","Track smarter, spend better - try our partner expense planner"]
let adidx=0
let adtimer=null
let adback=null
let pending=null

function persist(){
  savestate({version:1,active:state.acct,data:state.data})
}

function monthopts(list){
  const set=new Set(availmonths(list))
  set.add(curmonth())
  set.add(state.month)
  return [...set].sort((a,b)=>b.localeCompare(a))
}

function render(){
  const acc=getcur()
  const filtered=filtertxns(acc.transactions,state.filters)
  ui.showsummary(getsummary(acc.transactions,state.month))
  ui.showtxns(filtered,acc.transactions.length>0)
  ui.showmonthfilter(availmonths(acc.transactions),state.filters.month)
  ui.showmonthsel(monthopts(acc.transactions),state.month)
  ui.showbudgets(budgetstats(acc.transactions,acc.budgets,state.month))
  ui.showcatbars(catbreakdown(acc.transactions,state.month))
  ui.showmonthbars(monthtotals(acc.transactions,state.month))
}

function formvals(){
  return {
    description:document.getElementById("description").value.trim(),
    amount:document.getElementById("amount").value,
    type:document.getElementById("type").value,
    category:document.getElementById("category").value,
    date:document.getElementById("date").value,
    notes:document.getElementById("notes").value.trim()
  }
}

function onsubmit(e){
  e.preventDefault()
  const vals=formvals()
  const errs=checktxn(vals)
  if(Object.keys(errs).length>0){
    ui.showerrs(errs)
    ui.toast("Please fix the highlighted fields","error")
    return
  }
  const tx={...vals,amount:Number(vals.amount)}
  if(state.editid){
    edittxn(state.editid,tx)
    ui.toast("Transaction updated","success")
  }else{
    addtxn({...tx,id:genid()})
    ui.toast("Transaction added","success")
  }
  persist()
  setedit(null)
  ui.hideform()
  render()
}

function onlistclick(e){
  const btn=e.target.closest("button")
  if(!btn) return
  const card=e.target.closest(".transaction-card")
  const id=card.dataset.id
  if(btn.dataset.action==="edit"){
    setedit(id)
    ui.fillform(getedit())
    ui.showform("edit")
  }else if(btn.dataset.action==="delete"){
    pending={type:"deltxn",id}
    ui.confirm("Delete this transaction? This cannot be undone.")
  }
}

function onbudgetsubmit(e){
  e.preventDefault()
  const vals={category:document.getElementById("budgetcat").value,limit:document.getElementById("budgetlimit").value}
  const errs=checkbudget(vals)
  if(Object.keys(errs).length>0){
    ui.showerrs(errs)
    ui.toast("Please fix the highlighted fields","error")
    return
  }
  upsertbudget({category:vals.category,limit:Number(vals.limit)})
  persist()
  seteditbudget(null)
  ui.hidebform()
  ui.toast("Budget saved","success")
  render()
}

function onbudgetclick(e){
  const btn=e.target.closest("button")
  if(!btn) return
  const row=e.target.closest(".budget-row")
  const category=row.dataset.category
  if(btn.dataset.action==="edit"){
    seteditbudget(category)
    ui.fillbform(geteditbudget())
    ui.showbform("edit")
  }else if(btn.dataset.action==="delete"){
    pending={type:"delbudget",category}
    ui.confirm(`Delete the budget for ${category}? This cannot be undone.`,"Delete")
  }
}

function onconfirm(){
  if(!pending){
    ui.closeconfirm()
    return
  }
  if(pending.type==="deltxn"){
    deltxn(pending.id)
    persist()
    ui.toast("Transaction deleted","success")
  }else if(pending.type==="delbudget"){
    delbudget(pending.category)
    persist()
    ui.toast("Budget deleted","success")
  }else if(pending.type==="clear"){
    settxns([])
    setbudgets([])
    persist()
    ui.toast("Data reset","success")
  }else if(pending.type==="restore"){
    const sample=state.acct==="acc1"?acc1:acc2
    settxns(sample.transactions.map(t=>({...t})))
    setbudgets([])
    persist()
    ui.toast("Sample data restored","success")
  }else if(pending.type==="import"){
    settxns(pending.payload.transactions)
    setbudgets(pending.payload.budgets)
    persist()
    ui.toast("Data imported","success")
  }
  pending=null
  ui.closeconfirm()
  render()
}

function onclearfilters(){
  resetfilters()
  document.getElementById("searchInput").value=""
  document.getElementById("filterType").value="all"
  document.getElementById("filterCategory").value="all"
  document.getElementById("filterSort").value="date-desc"
  render()
}

function onexportjson(){
  const acc=getcur()
  const payload={version:1,transactions:acc.transactions,budgets:acc.budgets}
  savefile("spendwise-"+state.acct+".json",JSON.stringify(payload,null,2),"application/json")
  ui.toast("Data exported","success")
}

function onexportcsv(){
  const acc=getcur()
  if(acc.transactions.length===0){
    ui.toast("No transactions to export","error")
    return
  }
  savefile("spendwise-"+state.acct+".csv",tocsv(acc.transactions),"text/csv")
  ui.toast("Data exported","success")
}

async function onimportfile(e){
  const file=e.target.files[0]
  e.target.value=""
  if(!file) return
  if(file.size===0){
    ui.toast("Import failed: the file is empty","error")
    return
  }
  let parsed
  try{
    const text=await file.text()
    if(!text.trim()){
      ui.toast("Import failed: the file is empty","error")
      return
    }
    parsed=JSON.parse(text)
  }catch(err){
    ui.toast("Import failed: not a valid JSON file","error")
    return
  }
  if(!checkimport(parsed)){
    ui.toast("Import failed: unexpected file structure","error")
    return
  }
  pending={type:"import",payload:{transactions:parsed.transactions,budgets:Array.isArray(parsed.budgets)?parsed.budgets:[]}}
  ui.confirm("Importing will replace all data for the current account. Continue?","Import")
}

function onclear(){
  pending={type:"clear"}
  ui.confirm("Clear all transactions and budgets for this account? This cannot be undone.","Clear data")
}

function onrestore(){
  pending={type:"restore"}
  ui.confirm("Replace current data with the original sample transactions? This cannot be undone.","Restore")
}

function onacct(e){
  switchacct(e.target.value)
  ui.hideform()
  ui.hidebform()
  render()
}

function onmonth(e){
  setmonth(e.target.value)
  render()
}

function startads(){
  ui.setad(ads[adidx])
  adtimer=setInterval(()=>{
    adidx=(adidx+1)%ads.length
    ui.setad(ads[adidx])
  },6000)
}

function dismissad(){
  ui.hidead()
  clearInterval(adtimer)
  adback=setTimeout(()=>{
    adidx=(adidx+1)%ads.length
    ui.setad(ads[adidx])
    ui.showad()
    startads()
  },15000)
}

function bind(){
  document.getElementById("openAddForm").addEventListener("click",()=>{
    setedit(null)
    ui.showform("add")
  })
  document.getElementById("cancelEdit").addEventListener("click",()=>{
    setedit(null)
    ui.hideform()
  })
  document.getElementById("transactionForm").addEventListener("submit",onsubmit)
  document.getElementById("transactionList").addEventListener("click",onlistclick)
  document.getElementById("confirmOk").addEventListener("click",onconfirm)
  document.getElementById("confirmCancel").addEventListener("click",()=>{
    pending=null
    ui.closeconfirm()
  })
  document.getElementById("searchInput").addEventListener("input",e=>{
    setfilter("search",e.target.value)
    render()
  })
  document.getElementById("filterType").addEventListener("change",e=>{
    setfilter("type",e.target.value)
    render()
  })
  document.getElementById("filterCategory").addEventListener("change",e=>{
    setfilter("category",e.target.value)
    render()
  })
  document.getElementById("filterMonth").addEventListener("change",e=>{
    setfilter("month",e.target.value)
    render()
  })
  document.getElementById("filterSort").addEventListener("change",e=>{
    setfilter("sort",e.target.value)
    render()
  })
  document.getElementById("clearFilters").addEventListener("click",onclearfilters)
  document.getElementById("adDismiss").addEventListener("click",dismissad)
  document.getElementById("mobileNavToggle").addEventListener("click",()=>{
    const nav=document.getElementById("mainNav")
    const open=nav.classList.toggle("open")
    document.getElementById("mobileNavToggle").setAttribute("aria-expanded",open)
  })
  document.getElementById("mainNav").addEventListener("click",e=>{
    if(e.target.tagName==="A") document.getElementById("mainNav").classList.remove("open")
  })
  document.getElementById("openbudget").addEventListener("click",()=>{
    seteditbudget(null)
    ui.showbform("add")
  })
  document.getElementById("budgetcancel").addEventListener("click",()=>{
    seteditbudget(null)
    ui.hidebform()
  })
  document.getElementById("budgetform").addEventListener("submit",onbudgetsubmit)
  document.getElementById("budgetList").addEventListener("click",onbudgetclick)
  document.getElementById("exportjson").addEventListener("click",onexportjson)
  document.getElementById("exportcsv").addEventListener("click",onexportcsv)
  document.getElementById("importjson").addEventListener("click",()=>document.getElementById("importfile").click())
  document.getElementById("importfile").addEventListener("change",onimportfile)
  document.getElementById("cleardata").addEventListener("click",onclear)
  document.getElementById("restoresample").addEventListener("click",onrestore)
  document.getElementById("acctsel").addEventListener("change",onacct)
  document.getElementById("monthsel").addEventListener("change",onmonth)
}

function freshdata(){
  return {
    acc1:{transactions:acc1.transactions.map(t=>({...t})),budgets:acc1.budgets.map(b=>({...b}))},
    acc2:{transactions:acc2.transactions.map(t=>({...t})),budgets:acc2.budgets.map(b=>({...b}))}
  }
}

function init(){
  const stored=loadstate()
  if(stored){
    state.data=stored.data
    state.acct=stored.active
  }else{
    state.data=freshdata()
    state.acct="acc1"
  }
  state.month=curmonth()
  ui.fillcats()
  ui.fillaccts(acctnames,state.acct)
  bind()
  startads()
  persist()
  render()
}
init()
