/** Skill-unlocked, original bilingual story events.
 * Twelve distinct decisions × three meaningful branches, earned from real practice.
 */
import {HOBBY_IDS,normalizeHobbyBook,type HobbyId} from './hobbies.ts';
import type {Stats,WorldImpact,Simulation} from './simulation.ts';
type Txt=[string,string];
type SeedChoice={label:Txt;result:Txt;effects:Partial<Stats>;world:WorldImpact};
type Seed={hobby:HobbyId;tier:1|2;title:Txt;description:Txt;category:string;choices:[SeedChoice,SeedChoice,SeedChoice]};
const t=(pt:string,en:string):Txt=>[pt,en];
const ch=(pt:string,en:string,ptResult:string,enResult:string,
 effects:Partial<Stats>={},world:WorldImpact={}):SeedChoice=>({label:t(pt,en),result:t(ptResult,enResult),effects,world});
const e=(hobby:HobbyId,tier:1|2,pt:string,en:string,ptDescription:string,enDescription:string,category:string,
 a:SeedChoice,b:SeedChoice,c:SeedChoice):Seed=>
 ({hobby,tier,title:t(pt,en),description:t(ptDescription,enDescription),category,choices:[a,b,c]});
const STORIES:Seed[]=[
e('music',1,'A primeira apresentação','Your first live performance','Uma praça convida novos músicos a tocar para a comunidade.','A local square invites emerging musicians to perform.','leisure',
 ch('Tocar ao vivo','Play live','O público aplaudiu sua primeira apresentação.','The audience applauded your first performance.',{happiness:6},{friends:8,experience:1}),
 ch('Convidar amigos para tocar','Invite friends to perform','Vocês formaram uma pequena banda.','You formed a small band.',{happiness:4},{friends:12}),
 ch('Gravar uma música em casa','Record from home','Você aperfeiçoou uma composição e aprendeu a gravar.','You polished a song and learned to record.',{smarts:5},{credits:2})),
e('music',2,'Uma proposta de gravação','A recording opportunity','Seu repertório chamou a atenção de um pequeno estúdio independente.','Your repertoire catches the attention of an independent studio.','work',
 ch('Assinar por um projeto','Sign for a project','Seu trabalho recebeu uma remuneração e novos ouvintes.','Your music earned a fee and reached new listeners.',{happiness:6},{cash:2600,careerMomentum:5}),
 ch('Negociar royalties','Negotiate royalties','Você aprendeu mais sobre a parte comercial da música.','You learned about the business side of music.',{smarts:6},{cash:1100,experience:2}),
 ch('Continuar independente','Stay independent','Você manteve liberdade total para criar.','You kept full freedom to create.',{happiness:5},{friends:8})),
e('art',1,'Uma exposição no bairro','A neighborhood exhibition','Um centro cultural abre espaço para trabalhos de novos artistas.','A community center offers space to emerging artists.','leisure',
 ch('Expor sua obra','Exhibit your work','Suas criações despertaram interesse dos visitantes.','Visitors took an interest in your work.',{happiness:6},{friends:9}),
 ch('Criar uma oficina','Run a workshop','Você ensinou técnicas e fez novos contatos.','You taught techniques and met new people.',{smarts:4},{family:4,friends:5}),
 ch('Estudar outras técnicas','Explore another technique','Você desenvolveu um estilo diferente.','You developed a different style.',{looks:3,smarts:4},{credits:2})),
e('art',2,'Sua primeira encomenda','Your first commission','Uma pessoa pede uma obra original para um projeto especial.','Someone commissions an original work for a special project.','work',
 ch('Aceitar a encomenda','Take the commission','Você concluiu a obra e recebeu pelo seu talento.','You completed the piece and were paid.',{happiness:5},{cash:2100,experience:2}),
 ch('Criar uma coleção','Create a collection','Você expandiu sua produção para uma série de trabalhos.','You expanded into a series of works.',{smarts:5},{careerMomentum:7}),
 ch('Doar uma obra','Donate an artwork','Sua criação ajudou um projeto social.','Your work supported a community project.',{happiness:7},{family:8,friends:5})),
e('coding',1,'Um desafio de programação','A coding challenge','Uma comunidade de tecnologia organiza um evento para criar soluções reais.','A tech community hosts an event to build practical solutions.','school',
 ch('Criar uma ferramenta útil','Build a useful tool','Sua solução ajudou outras pessoas.','Your tool helped other people.',{smarts:6},{credits:3,friends:6}),
 ch('Montar uma equipe','Form a team','Seu time entregou um protótipo funcional.','Your team delivered a functional prototype.',{happiness:5},{friends:9,experience:1}),
 ch('Estudar segurança','Study security','Você descobriu maneiras melhores de proteger usuários.','You learned better ways to protect users.',{smarts:7},{credits:4})),
e('coding',2,'Uma ideia vira produto','An idea becomes a product','Você tem a chance de transformar um protótipo em algo usado por outras pessoas.','You can turn your prototype into a product others will use.','work',
 ch('Publicar a primeira versão','Ship the first version','O projeto ganhou seus primeiros usuários.','The project gained its first users.',{happiness:7},{experience:3,careerMomentum:8}),
 ch('Validar com usuários','Test with real users','Você corrigiu problemas antes de publicar.','You fixed issues before the release.',{smarts:6},{credits:5,friends:4}),
 ch('Vender a solução','Sell the solution','Uma pequena organização comprou seu produto.','A small organization purchased your product.',{happiness:4},{cash:3200,experience:2})),
e('sports',1,'Sua primeira competição','Your first competition','Você foi convidado para participar de uma disputa esportiva local.','You are invited to compete in a local sports event.','health',
 ch('Competir com foco','Compete seriously','Seu preparo trouxe uma boa colocação.','Your preparation earned a strong result.',{health:3,happiness:6},{training:6,friends:4}),
 ch('Incentivar o time','Encourage the team','O espírito de equipe fez a diferença.','Team spirit made the difference.',{happiness:5},{friends:11,training:3}),
 ch('Priorizar segurança','Focus on safety','Você evitou excessos e aprendeu com a experiência.','You avoided overtraining and learned from the event.',{health:5},{training:4})),
e('sports',2,'Uma seletiva mais difícil','A tougher tryout','Um clube oferece uma seletiva com competidores experientes.','A club offers a tryout with experienced competitors.','health',
 ch('Participar da seletiva','Attend the tryout','Você evoluiu enfrentando um nível mais alto.','You grew by facing stronger competitors.',{health:3,happiness:6},{training:9,experience:2}),
 ch('Buscar um treinador','Find a coach','A orientação melhorou sua técnica.','Coaching improved your technique.',{smarts:5},{training:7,cash:-450}),
 ch('Treinar no seu ritmo','Train at your pace','Você manteve uma rotina sustentável.','You kept a sustainable routine.',{health:6},{training:5})),
e('writing',1,'Uma história encontra leitores','Your writing finds readers','Uma biblioteca local convida novos autores a apresentar textos.','A local library invites new authors to share their work.','leisure',
 ch('Ler em público','Read to an audience','O público se conectou com suas palavras.','The audience connected with your words.',{happiness:6},{friends:7}),
 ch('Entrar em um grupo de escrita','Join a writing circle','Você aprendeu muito trocando críticas construtivas.','Constructive feedback helped you improve.',{smarts:6},{credits:3}),
 ch('Revisar seu manuscrito','Revise your manuscript','Seu texto ganhou profundidade e clareza.','Your text gained depth and clarity.',{smarts:7},{experience:1})),
e('writing',2,'Uma publicação independente','An independent publication','Uma editora pequena oferece apoio para lançar um texto seu.','A small publisher offers to help release your writing.','work',
 ch('Publicar seu trabalho','Publish your work','Seu texto chegou a novos leitores.','Your work reached new readers.',{happiness:7},{cash:1700,friends:5}),
 ch('Negociar seus direitos','Negotiate your rights','Você fechou um acordo mais consciente.','You reached a more informed agreement.',{smarts:7},{cash:950,experience:2}),
 ch('Distribuir gratuitamente','Share it for free','Seu trabalho circulou pela comunidade.','Your work circulated in the community.',{happiness:5},{friends:10})),
e('volunteering',1,'Um projeto comunitário','A community project','Moradores se organizam para melhorar um espaço coletivo.','Neighbors organize to improve a shared space.','family',
 ch('Coordenar voluntários','Coordinate volunteers','O grupo concluiu a primeira etapa do projeto.','The group completed the first stage.',{happiness:6},{family:9,friends:7}),
 ch('Conseguir materiais','Source materials','Você ajudou a reduzir os custos da iniciativa.','You helped reduce the initiative’s costs.',{smarts:4},{family:6,experience:1}),
 ch('Convidar mais pessoas','Invite others','Novos moradores passaram a participar.','New neighbors joined the effort.',{happiness:5},{friends:12})),
e('volunteering',2,'A comunidade amplia o projeto','The community expands the project','O trabalho anterior inspirou uma nova iniciativa coletiva.','Your previous work inspires a new community initiative.','family',
 ch('Organizar uma campanha','Organize a campaign','Você ajudou muitas pessoas a trabalharem juntas.','You helped many people work together.',{happiness:7},{family:12,friends:8}),
 ch('Ensinar uma habilidade','Teach a skill','O conhecimento foi compartilhado com a comunidade.','You shared skills with the community.',{smarts:5},{family:8,experience:2}),
 ch('Apoiar nos bastidores','Help behind the scenes','Seu esforço discreto manteve o projeto avançando.','Your quiet support kept the project moving.',{health:-1,happiness:5},{family:10}))
];
export type HobbyStory={id:string;title:string;description:string;category:string;
 minAge:number;maxAge:number;choices:{label:string;result:string;effects:Partial<Stats>;world:WorldImpact}[]};
export const HOBBY_STORY_COUNT=STORIES.length;
export function hobbyEvents(language:'pt-BR'|'en',simulation:Simulation):HobbyStory[]{
 const book=normalizeHobbyBook(simulation.hobbies),l=language==='en'?1:0;
 return STORIES.filter(seed=>book[seed.hobby].xp>=(seed.tier===1?25:60))
  .map(seed=>({
   id:'hobby-story-'+seed.hobby+'-'+seed.tier,
   minAge:seed.tier===1?12:16,maxAge:105,
   title:seed.title[l],description:seed.description[l],category:seed.category,
   choices:seed.choices.map(c=>({label:c.label[l],result:c.result[l],
    effects:{...c.effects},world:{...c.world}}))
  }));
}
