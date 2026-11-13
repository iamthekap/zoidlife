/** Independent six-path hobby and talent progression.
 * Progress is earned through real annual player actions; never a passive fake level.
 */
export const HOBBY_IDS=['music','art','coding','sports','writing','volunteering'] as const;
export type HobbyId=typeof HOBBY_IDS[number];
export type HobbySkill={xp:number;awards:number;lastAge:number};
export type HobbyBook=Record<HobbyId,HobbySkill>;
const names:Record<HobbyId,[string,string]>={
 music:['Música','Music'],art:['Artes visuais','Visual arts'],coding:['Programação','Programming'],
 sports:['Esporte','Sports'],writing:['Escrita','Writing'],volunteering:['Voluntariado','Volunteering']
};
const costs:Record<HobbyId,number>={music:250,art:150,coding:200,sports:100,writing:0,volunteering:0};
export const hobbyName=(id:HobbyId,lang:'pt-BR'|'en')=>names[id][lang==='en'?1:0];
export const hobbyCost=(id:HobbyId)=>costs[id];
const cap=(n:unknown,max:number):number=>typeof n==='number'&&Number.isFinite(n)?Math.max(0,Math.min(max,Math.floor(n))):0;
export function createHobbyBook():HobbyBook{
 return Object.fromEntries(HOBBY_IDS.map(id=>[id,{xp:0,awards:0,lastAge:-1}])) as HobbyBook;
}
export function normalizeHobbyBook(raw:unknown):HobbyBook{
 const result=createHobbyBook();
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return result;
 for(const id of HOBBY_IDS){
  const v=(raw as Record<string,unknown>)[id];
  if(!v||typeof v!=='object'||Array.isArray(v))continue;
  const input=v as Record<string,unknown>,xp=cap(input.xp,100);
  const last=typeof input.lastAge==='number'&&Number.isInteger(input.lastAge)&&input.lastAge>=-1&&input.lastAge<=110?
    input.lastAge:-1;
  result[id]={xp,awards:Math.min(Math.floor(xp/25),cap(input.awards,4)),lastAge:last};
 }
 return result;
}
export function canPracticeHobby(book:HobbyBook,age:number,id:HobbyId):boolean{
 if(!HOBBY_IDS.includes(id)||!Number.isInteger(age)||age<6||age>110)return false;
 if(book[id]?.lastAge===age||book[id]?.xp>=100)return false;
 // Two different deep practice sessions per year, not unlimited stat farming.
 return HOBBY_IDS.filter(candidate=>book[candidate]?.lastAge===age).length<2;
}
export function progressHobby(book:HobbyBook,age:number,id:HobbyId):{
 ok:boolean;book:HobbyBook;gain:number;newAwards:number;level:number
}{
 if(!canPracticeHobby(book,age,id))return {ok:false,book,gain:0,newAwards:0,level:book[id]?.xp??0};
 const current=book[id],gain=Math.min(100-current.xp,10+(current.lastAge===age-1?3:0));
 const xp=current.xp+gain,oldAwards=current.awards,nextAwards=Math.floor(xp/25);
 const next={...book,[id]:{xp,awards:nextAwards,lastAge:age}};
 return {ok:true,book:next,gain,newAwards:nextAwards-oldAwards,level:xp};
}
export const hobbyCareer:Partial<Record<HobbyId,readonly string[]>>={
 music:['musician','actor'],art:['designer','photographer','architect'],
 coding:['developer','streamer','engineer'],sports:['footballer','basketballer','athlete','trainer','coach'],
 writing:['journalist','teacher','author','politician'],volunteering:['nurse','paramedic','firefighter','veterinarian']
};
/** Genuine skill may waive non-degree study credits, never licensing or the minimum age. */
export function hobbyCreditAlternative(id:string,book:HobbyBook):boolean{
 return Object.entries(hobbyCareer).some(([hobby,careers])=>
  careers?.includes(id)&&(book[hobby as HobbyId]?.xp??0)>=65);
}
