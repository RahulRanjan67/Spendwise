export const state={
  acct:"acc1",
  data:{},
  filters:{search:"",type:"all",category:"all",month:"all",sort:"date-desc"},
  month:"",
  editid:null,
  editcat:null
}

function cur(){
  return state.data[state.acct]
}

export function getcur(){
  return cur()
}

export function switchacct(id){
  state.acct=id
  state.editid=null
  state.editcat=null
  state.filters={search:"",type:"all",category:"all",month:"all",sort:"date-desc"}
}

export function addtxn(t){
  cur().transactions=[t,...cur().transactions]
}

export function edittxn(id,updates){
  cur().transactions=cur().transactions.map(t=>t.id===id?{...t,...updates}:t)
}

export function deltxn(id){
  cur().transactions=cur().transactions.filter(t=>t.id!==id)
}

export function settxns(list){
  cur().transactions=list
}

export function setbudgets(list){
  cur().budgets=list
}

export function upsertbudget(b){
  const list=cur().budgets
  const exists=list.some(x=>x.category===b.category)
  cur().budgets=exists?list.map(x=>x.category===b.category?{...x,...b}:x):[...list,b]
}

export function delbudget(category){
  cur().budgets=cur().budgets.filter(b=>b.category!==category)
}

export function setfilter(key,val){
  state.filters={...state.filters,[key]:val}
}

export function resetfilters(){
  state.filters={search:"",type:"all",category:"all",month:"all",sort:"date-desc"}
}

export function setmonth(m){
  state.month=m
}

export function setedit(id){
  state.editid=id
}

export function getedit(){
  return cur().transactions.find(t=>t.id===state.editid)
}

export function seteditbudget(category){
  state.editcat=category
}

export function geteditbudget(){
  return cur().budgets.find(b=>b.category===state.editcat)
}
