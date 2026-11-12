/** Zoid Life character renderer. Explicit life-stage selection; no adult rig for babies. */
import type {CharacterProfile} from './characters.ts';
import {renderPixelBaby} from './pixel-baby-v3.ts';
import {renderMatureCharacter,type MatureStage} from './pixel-character-v3.ts';
export type PixelStage='baby'|MatureStage;
export function renderPixelCharacter(p:CharacterProfile,stage:PixelStage,size='card',seed?:number):string{
 if(stage==='baby')return renderPixelBaby(p,size);
 return renderMatureCharacter(p,stage,size,seed);
}
