/** Zoid Life age-specific character rendering, pixel-art 2nd generation. */
import type {CharacterProfile} from './characters.ts';
import type {FaceMood} from './pixel-character-v3.ts';
import {renderPixelCharacter,type PixelStage} from './pixel-character-v2.ts';
export type LifeStage=PixelStage;
export function lifeStage(age:number):LifeStage{
 const value=Math.max(0,Math.floor(Number.isFinite(age)?age:0));
 return value<3?'baby':value<12?'child':value<18?'teen':value<65?'adult':'senior';
}
export function avatarFingerprint(p:CharacterProfile):string{
 return [p.name,p.gender,p.country,p.skin,p.hair,p.hairColor,p.eyes,p.outfit??'legacy'].join('|');
}
export function moodFromStats(stats:{happiness:number;health:number}):FaceMood{
 if(stats.health<=30||stats.happiness<=30)return 'thoughtful';
 if(stats.happiness>=75&&stats.health>=45)return 'cheerful';
 if(stats.health>=80&&stats.happiness>=50)return 'determined';
 return 'curious';
}
export function portraitLife(p:CharacterProfile,age:number,size='card',mood?:FaceMood):string{
 return renderPixelCharacter(p,lifeStage(age),size,undefined,mood);
}
