/** Zoid Life original character models and generated vector portraits. */
export type Gender = 'woman' | 'man' | 'nonbinary';
export type Skin = 'light' | 'tan' | 'brown' | 'deep';
export type Hair = 'short' | 'waves' | 'curls' | 'long';
export type HairColor = 'black' | 'brown' | 'blonde' | 'red';
export type Eye = 'brown' | 'blue' | 'green';
export type Outfit = 'blue' | 'red' | 'mint' | 'ochre' | 'purple' | 'rose';
export type Origin = 'generated' | 'custom';
export type Nature = 'human' | 'vampire' | 'werewolf' | 'mage';
export type Country = 'BR' | 'US' | 'PT' | 'UK' | 'CA';
export type CharacterProfile = {
  name: string;
  gender: Gender;
  country: Country;
  city: string;
  skin: Skin;
  hair: Hair;
  hairColor: HairColor;
  eyes: Eye;
  /** Optional to retain stable appearance of saves created before the outfit selector. */
  outfit?: Outfit;
  origin?: Origin;
  nature?: Nature;
  birthday: number;
  birthMonth: number;
};
export const CITIES: Record<Country, readonly string[]> = {
  BR: ['Recife', 'São Paulo', 'Rio de Janeiro', 'Salvador', 'Curitiba', 'Belo Horizonte'],
  US: ['New York', 'Los Angeles', 'Chicago', 'Austin', 'Seattle'],
  PT: ['Lisboa', 'Porto', 'Coimbra'],
  UK: ['London', 'Manchester', 'Bristol'],
  CA: ['Toronto', 'Vancouver', 'Montréal']
};
export const COUNTRIES: Country[] = ['BR', 'US', 'PT', 'UK', 'CA'];
export const SKINS: Skin[] = ['light', 'tan', 'brown', 'deep'];
export const HAIRS: Hair[] = ['short', 'waves', 'curls', 'long'];
export const HAIR_COLORS: HairColor[] = ['black', 'brown', 'blonde', 'red'];
export const EYES: Eye[] = ['brown', 'blue', 'green'];
export const OUTFITS: Outfit[]=['blue','red','mint','ochre','purple','rose'];
export const NATURES: Nature[]=['human','vampire','werewolf','mage'];
export const GENDERS: Gender[] = ['woman', 'man', 'nonbinary'];
const firstNames: Record<Gender, string[]> = {
  woman: ['Luiza','Luna','Marina','Camila','Bianca','Sofia','Elisa','Isabela','Nina','Cecília'],
  man: ['Caio','Theo','Ravi','Miguel','André','Arthur','Gabriel','Noah','Davi','Lucas'],
  nonbinary: ['Alex','Ariel','Dani','Sam','Robin','Nico','Sol','Jules','Val','Charlie']
};
const surnames = ['Moura','Costa','Silva','Almeida','Rocha','Lima','Nogueira','Ribeiro','Ferreira','Oliveira'];
const pick = <T>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)];
const isOneOf = <T extends string>(v: unknown, values: readonly T[]): v is T => typeof v === 'string' && values.includes(v as T);
export function randomCharacter(): CharacterProfile {
  const gender=pick(GENDERS);
  const country=pick(COUNTRIES);
  return { name: pick(firstNames[gender]) + ' ' + pick(surnames), gender,
    country, city: pick(CITIES[country]), skin: pick(SKINS), hair: pick(HAIRS),
    hairColor: pick(HAIR_COLORS), eyes: pick(EYES), outfit:pick(OUTFITS),origin:'generated',nature:'human',
    birthday: 1 + Math.floor(Math.random()*28), birthMonth: 1 + Math.floor(Math.random()*12) };
}
export function randomCandidates(count = 3): CharacterProfile[] {
  const total=Math.min(8,Math.max(1,Math.floor(Number.isFinite(count)?count:3)));
  const names=new Set<string>();
  const result:CharacterProfile[]=[];
  // Every trio begins with three different skin tones and hairstyles;
  // player appearance, gender, city and eye color remain independently generated.
  const shuffle=<T>(arr:readonly T[]):T[]=>{
    const copy=[...arr];
    for(let i=copy.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]];
    }
    return copy;
  };
  const skinOrder=shuffle(SKINS),hairOrder=shuffle(HAIRS),colors=shuffle(HAIR_COLORS),outfitOrder=shuffle(OUTFITS);
  for(let i=0;i<total;i++){
    let candidate=randomCharacter();
    for(let tries=0;names.has(candidate.name)&&tries<50;tries++)candidate=randomCharacter();
    if(names.has(candidate.name))candidate={...candidate,name:candidate.name+' '+(i+1)};
    const profile={...candidate,skin:skinOrder[i%skinOrder.length],
      hair:hairOrder[i%hairOrder.length],hairColor:colors[i%colors.length],outfit:outfitOrder[i%outfitOrder.length]};
    names.add(profile.name);
    result.push(profile);
  }
  return result;
}
export function normalizeProfile(raw: unknown, fallbackName='Pessoa'): CharacterProfile {
  const defaults = randomCharacter();
  if (!raw || typeof raw !== 'object') return {...defaults, name:fallbackName};
  const r=raw as Partial<CharacterProfile>;
  const country = isOneOf(r.country, COUNTRIES) ? r.country : defaults.country;
  return {
    name: typeof r.name === 'string' && r.name.trim() ? r.name.trim().slice(0,52) : fallbackName,
    gender: isOneOf(r.gender,GENDERS) ? r.gender : defaults.gender,
    country, city: typeof r.city === 'string' && CITIES[country].includes(r.city) ? r.city : CITIES[country][0],
    skin: isOneOf(r.skin,SKINS) ? r.skin : defaults.skin,
    hair: isOneOf(r.hair,HAIRS) ? r.hair : defaults.hair,
    hairColor: isOneOf(r.hairColor, HAIR_COLORS) ? r.hairColor : defaults.hairColor,
    eyes: isOneOf(r.eyes,EYES) ? r.eyes : defaults.eyes,
    ...(isOneOf(r.outfit,OUTFITS)?{outfit:r.outfit}:{}),
    origin:r.origin==='custom'?'custom':'generated',
    nature:r.origin==='custom'&&isOneOf(r.nature,NATURES)?r.nature:'human',
    birthday: typeof r.birthday === 'number' && r.birthday >= 1 && r.birthday <= 28 ? Math.floor(r.birthday) : defaults.birthday,
    birthMonth: typeof r.birthMonth === 'number' && r.birthMonth >= 1 && r.birthMonth <= 12 ? Math.floor(r.birthMonth) : defaults.birthMonth
  };
}
/** Safe SVG output: all colors, shapes and attributes are drawn from fixed palettes. */
/** Original generative pixel-art portrait. Grid = 128x144; the entire upper body remains visible. */
export function portraitSvg(p: CharacterProfile, size='medium'): string {
  const tones = {
    light: ['#f1c7a1','#d79876','#aa735b'],
    tan: ['#dca077','#ae704f','#80523e'],
    brown: ['#a66e51','#784730','#56372a'],
    deep: ['#714635','#523122','#39221a']
  } as const;
  const hairColors={black:'#20212b',brown:'#49342c',blonde:'#d6a151',red:'#9a5340'} as const;
  const eyes={brown:'#44332c',blue:'#315e9c',green:'#347153'} as const;
  const [skin,shade,shadow]=tones[p.skin];
  const hair=hairColors[p.hairColor], eye=eyes[p.eyes];
  const backgrounds=['#d8e7f8','#d8e9eb','#e0e6f5','#dcdff0','#e7e5f3'];
  const seed=[...p.name+p.city+p.hair+p.hairColor+p.gender].reduce((a,ch)=>(Math.imul(a,31)+ch.charCodeAt(0))>>>0,2166136261);
  const bg=backgrounds[seed%backgrounds.length];
  const shirt=['#345e94','#a86157','#557c86','#876b5b','#516d9c'][seed%5];
  const shirtShade=['#264c7e','#85473f','#3d6069','#675243','#3e5783'][seed%5];
  const jacket=seed%3===0;
  const glasses=seed%7===0;
  const rect=(x:number,y:number,w:number,h:number,fill:string,more='')=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+fill+'"'+more+'/>';
  const chunks:string[]=[];
  // Framed backdrop and a minimal stippled accent.
  chunks.push(rect(0,0,128,144,bg),rect(8,9,112,127,'#ffffff', ' opacity=".24"'));
  for(let i=0;i<14;i++){
    const x=(17+i*23)%115, y=20+(i*31)%102;
    chunks.push(rect(x,y,2,2,'#ffffff',' opacity=".18"'));
  }
  // Long and curly hair behind shoulders, so the head is a separate layer.
  if(p.hair==='long'||p.hair==='curls'){
    chunks.push(rect(34,36,60,80,hair),rect(30,54,13,80,hair),rect(88,54,12,80,hair));
    if(p.hair==='curls')for(const [x,y] of [[30,43],[32,57],[31,72],[90,41],[91,59],[92,74]])chunks.push(rect(x,y,9,13,hair));
  }
  // Arms and torso show from the mid-chest down to the waist.
  chunks.push(rect(36,100,55,44,shirt),rect(25,111,18,33,shirtShade),rect(86,111,18,33,shirtShade));
  chunks.push(rect(38,97,52,12,shade),rect(48,102,32,42,shirt));
  if(jacket) {
    chunks.push(rect(31,107,16,37,shirtShade),rect(81,107,16,37,shirtShade));
    chunks.push(rect(45,107,7,37,'#e7e5df'),rect(76,107,7,37,'#e7e5df'));
  } else if(seed%2===0) {
    for(let y=115;y<145;y+=11)chunks.push(rect(48,y,32,3,shirtShade));
  } else {
    chunks.push(rect(60,112,7,32,shirtShade));
    for(let y=119;y<145;y+=10)chunks.push(rect(63,y,2,2,'#ecdfc4'));
  }
  chunks.push(rect(28,114,4,30,'#263b59'),rect(97,114,4,30,'#263b59'));
  // Neck and stepped face silhouette, without rounded smooth vector gradients.
  chunks.push(rect(57,94,17,18,skin),rect(56,104,20,5,shade));
  chunks.push(rect(43,49,43,43,skin),rect(47,40,35,57,skin),rect(39,60,8,25,skin),rect(82,59,8,26,skin));
  chunks.push(rect(45,83,5,11,shade),rect(50,93,31,8,skin),rect(78,82,6,11,shade));
  chunks.push(rect(36,68,7,13,shade),rect(85,68,7,13,shade));
  // Face shading and expression are pixel bounded.
  chunks.push(rect(50,78,8,3,'#d17772',' opacity=".22"'),rect(71,78,8,3,'#d17772',' opacity=".22"'));
  chunks.push(rect(56,84,15,2,shadow),rect(59,86,9,2,'#b46d64'));
  chunks.push(rect(63,70,3,10,shade),rect(61,80,7,2,shade));
  // Two expressive pixel eyes with irises and highlights.
  for(const ex of [49,73]){
    chunks.push(rect(ex,64,9,3,hair),rect(ex,69,9,6,'#fff4e9'),rect(ex+3,69,4,6,eye),rect(ex+4,70,1,2,'#fff'));
  }
  if(glasses){
    chunks.push(rect(46,65,15,2,'#394050'),rect(69,65,15,2,'#394050'),rect(46,65,2,14,'#394050'),rect(59,65,2,14,'#394050'),rect(69,65,2,14,'#394050'),rect(82,65,2,14,'#394050'),rect(61,67,8,2,'#394050'));
  }
  if(p.gender==='man' && seed%3===0){
    chunks.push(rect(50,88,8,3,shadow),rect(70,88,8,3,shadow),rect(57,93,15,5,shadow));
  }
  // Hair silhouette: 4 distinct shapes using grid-aligned blocks, with volume.
  const h=(x:number,y:number,w:number,h:number)=>chunks.push(rect(x,y,w,h,hair));
  if(p.hair==='short'){
    h(41,39,46,12);h(37,48,12,16);h(80,47,10,13);h(44,34,34,8);
    h(49,49,27,5);
  }else if(p.hair==='waves'){
    h(39,43,50,10);h(42,35,37,11);h(45,30,19,8);h(66,31,15,10);
    h(35,52,13,16);h(81,48,12,19);h(47,52,27,5);h(33,61,8,12);
  }else if(p.hair==='curls'){
    for(const [x,y,w] of [[40,38,18],[54,30,22],[74,33,17],[35,49,13],[82,46,14],[43,47,31],[34,61,9],[87,60,11]] as [number,number,number][])h(x,y,w,12);
    h(41,55,12,9);h(78,54,10,11);
  }else{
    h(38,40,52,12);h(42,33,37,11);h(35,53,14,45);h(82,51,14,47);
    h(43,49,42,7);h(35,85,11,35);h(87,84,10,36);
  }
  // Hair highlights are deterministic and subtle.
  chunks.push(rect(51,40,15,3,'#ffffff',' opacity=".11"'));
  const format=['large','card','medium','tiny'].includes(size)?size:'medium';
  return '<svg class="portrait portrait-'+format+'" viewBox="0 0 128 144" role="img" '+
    'aria-label="Retrato pixelado original" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">'+
    chunks.join('')+'</svg>';
}
