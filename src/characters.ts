/** Zoid Life original character models and generated vector portraits. */
export type Gender = 'woman' | 'man' | 'nonbinary';
export type Skin = 'light' | 'tan' | 'brown' | 'deep';
export type Hair = 'short' | 'waves' | 'curls' | 'long';
export type HairColor = 'black' | 'brown' | 'blonde' | 'red';
export type Eye = 'brown' | 'blue' | 'green';
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
    hairColor: pick(HAIR_COLORS), eyes: pick(EYES),
    birthday: 1 + Math.floor(Math.random()*28), birthMonth: 1 + Math.floor(Math.random()*12) };
}
export function randomCandidates(count = 3): CharacterProfile[] {
  const names = new Set<string>();
  const result: CharacterProfile[] = [];
  while(result.length < Math.min(8, Math.max(1, count))) {
    const candidate = randomCharacter();
    if (!names.has(candidate.name)) { names.add(candidate.name); result.push(candidate); }
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
    birthday: typeof r.birthday === 'number' && r.birthday >= 1 && r.birthday <= 28 ? Math.floor(r.birthday) : defaults.birthday,
    birthMonth: typeof r.birthMonth === 'number' && r.birthMonth >= 1 && r.birthMonth <= 12 ? Math.floor(r.birthMonth) : defaults.birthMonth
  };
}
/** Safe SVG output: all colors, shapes and attributes are drawn from fixed palettes. */
export function portraitSvg(p: CharacterProfile, size='md'): string {
  const skin = ({light:'#f3c99e',tan:'#d9a16f',brown:'#98654a',deep:'#633b2e'} as const)[p.skin];
  const shade = ({light:'#d99c72',tan:'#aa754f',brown:'#77432f',deep:'#4e2a20'} as const)[p.skin];
  const hair = ({black:'#1e2532',brown:'#593e33',blonde:'#bb8e47',red:'#8c4635'} as const)[p.hairColor];
  const eye = ({brown:'#604536',blue:'#316a9c',green:'#467d64'} as const)[p.eyes];
  const bg = ({light:'#e4ecfa',tan:'#dfecf2',brown:'#e3eafe',deep:'#deedfa'} as const)[p.skin];
  const back = p.hair === 'long' || p.hair === 'curls'
    ? '<ellipse cx="100" cy="119" rx="59" ry="83" fill="'+hair+'"/>' : '';
  const fringe = ({
    short:'<path d="M52 99 Q46 52 80 47 Q116 29 144 61 Q153 74 148 98 Q139 72 121 69 Q94 79 73 72 Q62 84 52 99Z"/>',
    waves:'<path d="M49 100 Q37 79 52 60 Q49 41 71 44 Q83 27 104 40 Q129 28 140 49 Q165 58 149 97 Q135 73 121 71 Q105 77 89 65 Q66 75 49 100Z"/>',
    curls:'<path d="M48 101 Q30 94 39 77 Q27 55 51 53 Q51 29 74 40 Q90 24 105 38 Q123 23 135 47 Q161 41 153 65 Q170 85 150 101 Q142 69 121 72 Q98 60 78 74 Q61 71 48 101Z"/>',
    long:'<path d="M50 113 Q44 73 57 51 Q79 25 117 38 Q150 42 154 80 L152 121 Q140 86 134 70 Q111 63 91 76 Q69 74 50 113Z"/>'
  } as const)[p.hair];
  const fringeDecor = p.hair === 'curls'
    ? '<circle cx="59" cy="55" r="15" fill="'+hair+'"/><circle cx="83" cy="49" r="14" fill="'+hair+'"/><circle cx="114" cy="45" r="17" fill="'+hair+'"/><circle cx="139" cy="60" r="15" fill="'+hair+'"/>'
    : '';
  const facialHair = p.gender==='man' && p.hair==='short'
    ? '<path d="M85 141 Q100 147 115 141" stroke="'+shade+'" stroke-width="1.6" opacity=".38" fill="none"/>' : '';
  return [
    '<svg class="portrait portrait-'+size+'" viewBox="0 0 200 220" role="img" aria-label="Retrato ilustrado de personagem" xmlns="http://www.w3.org/2000/svg">',
    '<rect width="200" height="220" rx="26" fill="'+bg+'"/>',
    '<circle cx="100" cy="80" r="82" fill="#fff" opacity=".34"/>',
    '<path d="M29 220 Q34 174 74 170 L126 170 Q166 176 171 220Z" fill="#2457a6"/>',
    '<path d="M75 173 L91 198 L100 184 L109 198 L125 173" fill="#fff" opacity=".82"/>',
    back,
    '<rect x="89" y="156" width="22" height="28" rx="9" fill="'+skin+'"/>',
    '<ellipse cx="53" cy="120" rx="9" ry="15" fill="'+shade+'"/>',
    '<ellipse cx="147" cy="120" rx="9" ry="15" fill="'+shade+'"/>',
    '<path d="M53 102 Q53 64 100 62 Q147 62 147 102 L143 141 Q131 170 100 174 Q68 170 57 141Z" fill="'+skin+'"/>',
    '<path d="M66 111 Q78 105 90 111 M110 111 Q122 105 134 111" stroke="'+hair+'" stroke-width="3" stroke-linecap="round" fill="none" opacity=".68"/>',
    '<ellipse cx="79" cy="120" rx="8" ry="5.5" fill="#fff"/><ellipse cx="121" cy="120" rx="8" ry="5.5" fill="#fff"/>',
    '<circle cx="79" cy="120" r="4" fill="'+eye+'"/><circle cx="121" cy="120" r="4" fill="'+eye+'"/>',
    '<circle cx="80" cy="119" r="1.3" fill="#fff"/><circle cx="122" cy="119" r="1.3" fill="#fff"/>',
    '<path d="M100 122 L95 139 Q100 143 105 139" stroke="'+shade+'" stroke-width="2" stroke-linecap="round" fill="none"/>',
    '<path d="M86 152 Q100 160 114 152" fill="none" stroke="#9d5758" stroke-width="2.5" stroke-linecap="round"/>',
    facialHair, '<g fill="'+hair+'">'+fringe+'</g>',fringeDecor,
    '</svg>'
  ].join('');
}
