const key="spendwise_state"
export function loadstate(){
  try{
    const raw=localStorage.getItem(key)
    if(!raw) return null
    const parsed=JSON.parse(raw)
    if(!parsed||typeof parsed!=="object") return null
    if(!parsed.data||typeof parsed.data!=="object") return null
    if(!parsed.active||!parsed.data[parsed.active]) return null
    for(const id in parsed.data){
      const acc=parsed.data[id]
      if(!Array.isArray(acc.transactions)) return null
      if(!Array.isArray(acc.budgets)) acc.budgets=[]
    }
    return parsed
  }catch(err){
    return null
  }
}
export function savestate(data){
  try{
    localStorage.setItem(key,JSON.stringify(data))
  }catch(err){
    console.error("could not save data",err)
  }
}
export function clearstate(){
  try{
    localStorage.removeItem(key)
  }catch(err){
    console.error("could not clear data",err)
  }
}
