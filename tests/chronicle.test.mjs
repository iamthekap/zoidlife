import test from 'node:test';
import assert from 'node:assert/strict';
import {readHistoryEntry,livedHistory,normalizeChronicle} from '../src/chronicle.ts';

test('chronicle excludes future history without destroying the saved life',()=>{
 const history=['Você nasceu em Recife.','3: Foi para a escola.','24: Virou médico(a).','4: Brincou com amigos.'];
 const visible=livedHistory(history,4);
 assert.deepEqual(visible.map(x=>x.text),['Você nasceu em Recife.','Foi para a escola.','Brincou com amigos.']);
 assert.equal(history.length,4);
 assert.equal(livedHistory(history,24).length,4);
});
test('history parser handles old births and refuses invalid ages',()=>{
 assert.deepEqual(readHistoryEntry('0: Nasceu.',0),{historyIndex:0,age:0,text:'Nasceu.'});
 assert.deepEqual(readHistoryEntry('Nasceu.',1),{historyIndex:1,age:0,text:'Nasceu.'});
 assert.equal(readHistoryEntry('111: Futuro.',2),null);
 assert.equal(readHistoryEntry('24:  ',2),null);
});
test('scenario cards require a real matching chronological history entry',()=>{
 const history=['0: Nascimento.','7: Você ganhou um amigo.','8: Um segundo ano.'];
 const valid={historyIndex:1,age:7,eventId:'school-friend',title:'Primeira amizade',
   description:'Na escola',choice:'Falar com alguém',result:'Você ganhou um amigo.',category:'school'};
 assert.deepEqual(normalizeChronicle([valid],history,7),[valid]);
 assert.equal(normalizeChronicle([valid],history,6).length,0);
 assert.equal(normalizeChronicle([{...valid,result:'História inventada'}],history,7).length,0);
 assert.equal(normalizeChronicle([{...valid,historyIndex:0}],history,7).length,0);
 assert.equal(normalizeChronicle([{...valid,eventId:'<script>'}],history,7).length,0);
 assert.equal(normalizeChronicle([valid,valid],history,7).length,1);
});
