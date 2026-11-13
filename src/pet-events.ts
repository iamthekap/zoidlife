/** Zoid Life original animal stories.
 * Each species has two distinct annual situations, three consequences and a
 * truthful pet-level response. Only living, actually adopted pets unlock them.
 */
import {normalizePetHousehold,type PetSpecies} from './pets.ts';
import type {Simulation,Stats,WorldImpact} from './simulation.ts';
type Locale='pt-BR'|'en';
type Text=[string,string];
type Choice={label:Text;result:Text;effects:Partial<Stats>;world:WorldImpact;affection:number;energy:number};
type Seed={species:PetSpecies;chapter:'bond'|'milestone';title:Text;description:Text;choices:[Choice,Choice,Choice]};
const line=(pt:string,en:string):Text=>[pt,en];
const c=(pt:string,en:string,ptResult:string,enResult:string,affection:number,energy:number,
 effects:Partial<Stats>={},world:WorldImpact={}):Choice=>({
 label:line(pt,en),result:line(ptResult,enResult),affection,energy,effects,world
});
const s=(species:PetSpecies,chapter:Seed['chapter'],title:Text,description:Text,
 a:Choice,b:Choice,d:Choice):Seed=>({species,chapter,title,description,choices:[a,b,d]});
const CATALOG:readonly Seed[]=[
 s('dog','bond',line('O parque dos cachorros','The dog park'),
  line('Seu cachorro observa outros animais se divertindo no parque.','Your dog watches other animals playing in the park.'),
  c('Brincar juntos','Play together','Uma tarde divertida fortaleceu a confiança.','A playful afternoon strengthened your bond.',12,-5,{happiness:5},{friends:4}),
  c('Ensinar um comando','Teach a command','Seu cachorro aprendeu algo novo com paciência.','Your dog learned a new command with patience.',8,-9,{smarts:3},{credits:1}),
  c('Voltar para descansar','Head home to rest','Vocês optaram por uma tarde tranquila.','You chose a quiet afternoon together.',3,13,{health:2})),
 s('dog','milestone',line('Um desafio de agilidade','An agility challenge'),
  line('Um grupo oferece uma atividade esportiva para cachorros experientes.','A group hosts a sporting event for experienced dogs.'),
  c('Participar da atividade','Join the course','O treino rendeu aprendizado e novas amizades.','The course brought new skills and friends.',10,-13,{happiness:5},{friends:6,training:3}),
  c('Pedir orientação profissional','Seek expert guidance','Vocês aprenderam técnicas seguras de treinamento.','You learned safer training techniques together.',8,2,{smarts:4},{cash:-450,training:2}),
  c('Acompanhar da arquibancada','Watch the event','Você reconheceu os limites do seu companheiro.','You respected your companion’s limits.',4,8,{health:2},{family:3})),
 s('cat','bond',line('O mistério da janela','The window mystery'),
  line('Seu gato passa horas curioso com os pássaros do lado de fora.','Your cat spends hours watching birds outside.'),
  c('Construir um espaço seguro','Build a safe lookout','Seu gato ganhou um lugar confortável para observar.','Your cat gained a comfortable place to watch.',12,7,{happiness:4},{cash:-120}),
  c('Brincar com brinquedos','Play with toys','A brincadeira trouxe energia e confiança.','Playtime brought energy and confidence.',9,-5,{happiness:5}),
  c('Deixar o gato descansar','Let your cat rest','O descanso deixou a casa mais tranquila.','Rest made the home feel calmer.',3,14,{health:2})),
 s('cat','milestone',line('Uma visita ao veterinário','A visit to the vet'),
  line('Você percebe uma mudança no comportamento do seu gato e precisa decidir como agir.','You notice a change in your cat’s behavior and must decide what to do.'),
  c('Fazer uma consulta','Arrange a check-up','A avaliação ajudou a proteger a saúde do animal.','A check-up helped safeguard your pet’s health.',11,15,{happiness:4},{cash:-400}),
  c('Melhorar a rotina','Improve the routine','A nova rotina reduziu o estresse do gato.','A better routine reduced your cat’s stress.',7,10,{smarts:3},{cash:-90}),
  c('Observar por enquanto','Monitor the situation','Você acompanhou a situação sem tomar medidas imediatas.','You observed the change without immediate action.',-4,-8,{happiness:-3})),
 s('rabbit','bond',line('Um jardim para explorar','A garden to explore'),
  line('Seu coelho encontra um cantinho com plantas e novos cheiros.','Your rabbit discovers a corner filled with plants and new scents.'),
  c('Preparar uma área cercada','Set up a safe enclosure','A exploração aconteceu em segurança.','Exploring stayed safe and comfortable.',10,-4,{happiness:4},{cash:-180}),
  c('Trazer brinquedos','Bring new toys','Seu coelho ficou curioso e animado.','Your rabbit became curious and playful.',9,-9,{happiness:3},{cash:-45}),
  c('Dar espaço e tranquilidade','Offer peace and quiet','Você respeitou o ritmo do animal.','You respected your rabbit’s pace.',5,12,{health:2})),
 s('rabbit','milestone',line('A toca precisa de mudanças','A changing burrow'),
  line('Com o tempo, o espaço do seu coelho precisa ser adaptado.','As your rabbit grows, its living space needs improvements.'),
  c('Ampliar o espaço','Expand the habitat','Seu coelho ganhou liberdade com proteção.','Your rabbit gained safe room to move.',13,14,{happiness:6},{cash:-270}),
  c('Pedir ajuda especializada','Ask for animal care advice','Você aprendeu boas práticas de cuidado.','You learned better ways to care for your rabbit.',9,11,{smarts:5},{cash:-160}),
  c('Reorganizar os brinquedos','Rearrange the toys','A mudança simples trouxe alguma novidade.','A small rearrangement offered something new.',4,4,{happiness:2})),
 s('bird','bond',line('A primeira canção','The first song'),
  line('Seu pássaro começa a emitir sons diferentes ao ouvir música e conversas.','Your bird begins making new sounds when it hears music and conversation.'),
  c('Interagir com calma','Interact gently','A proximidade estimulou novos sons.','Gentle company encouraged new sounds.',12,-4,{happiness:5},{family:3}),
  c('Enriquecer o ambiente','Enrich the habitat','O ambiente ficou mais estimulante.','Your bird’s habitat became more engaging.',10,10,{smarts:3},{cash:-120}),
  c('Manter uma rotina silenciosa','Keep a quiet routine','Você preservou o descanso do pássaro.','You protected your bird’s rest.',5,14,{health:2})),
 s('bird','milestone',line('Um novo espaço de voo','A new flight space'),
  line('Seu pássaro demonstra interesse por voos e movimentos mais amplos.','Your bird shows interest in more room to move and fly.'),
  c('Preparar exercícios supervisionados','Plan supervised exercise','O treinamento aumentou a confiança do pássaro.','Training increased your bird’s confidence.',13,-8,{happiness:5},{cash:-140}),
  c('Montar um espaço melhor','Upgrade the habitat','Você criou um ambiente mais seguro e enriquecedor.','You built a safer, more engaging habitat.',11,15,{smarts:4},{cash:-320}),
  c('Seguir apenas com o espaço atual','Keep the current habitat','O pássaro continuou com sua rotina habitual.','Your bird continued its usual routine.',-2,-5,{happiness:-2}))
];
export type PetStory={id:string;minAge:number;maxAge:number;title:string;description:string;category:string;
 choices:{label:string;result:string;effects:Partial<Stats>;world:WorldImpact}[]};
export const PET_STORY_COUNT=CATALOG.length;
const idFor=(id:string,chapter:Seed['chapter'])=>'pet-story-'+id+'-'+chapter;
export function petStoryEvents(language:Locale,simulation:Simulation,age:number):PetStory[]{
 if(!Number.isInteger(age)||age<9||age>105)return [];
 const lang=language==='en'?1:0,house=normalizePetHousehold(simulation.pets);
 return house.pets.filter(p=>p.alive&&p.adoptedAt<age&&p.lastUpdatedAge<=age)
  .flatMap(p=>CATALOG.filter(seed=>seed.species===p.species&&
    (seed.chapter==='bond'?p.ageYears>=1&&p.affection>=30:p.ageYears>=3&&p.affection>=45))
  .map(seed=>({
   id:idFor(p.id,seed.chapter),minAge:age,maxAge:age,category:'family',
   title:seed.title[lang],description:p.name+': '+seed.description[lang],
   choices:seed.choices.map(ch=>({label:ch.label[lang],result:ch.result[lang],
     effects:{...ch.effects},world:{...ch.world}}))
  })));
}
/** Atomic owner-state change. Imported event names never grant an animal reward. */
export function applyPetStoryChoice(simulation:Simulation,age:number,eventId:string,index:number):
 {ok:boolean;state:Simulation;note:string}{
 const match=/^pet-story-(pet-[1-9][0-9]{0,4})-(bond|milestone)$/.exec(eventId);
 if(!match||!Number.isInteger(index)||index<0||index>2||
   !petStoryEvents('pt-BR',simulation,age).some(e=>e.id===eventId))
  return {ok:false,state:simulation,note:''};
 const petId=match[1],chapter=match[2],pet=simulation.pets.pets.find(p=>p.id===petId&&p.alive);
 if(!pet)return {ok:false,state:simulation,note:''};
 const seed=CATALOG.find(s=>s.species===pet.species&&s.chapter===chapter);
 if(!seed)return {ok:false,state:simulation,note:''};
 const chosen=seed.choices[index],house=normalizePetHousehold(simulation.pets);
 const pets=house.pets.map(p=>p.id===petId?{...p,
   affection:Math.max(0,Math.min(100,p.affection+chosen.affection)),
   energy:Math.max(0,Math.min(100,p.energy+chosen.energy))}:p);
 return {ok:true,state:{...simulation,pets:{...house,pets}},note:'pet-story:'+petId+':'+chapter};
}
