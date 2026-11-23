'use strict';
// Reproduzierbare fachliche und Interaktions-Regressionstests ohne Bibliotheken.
// DOM-Doppel für die reine Zustands-/Ereignislogik; visuelle Prüfung erfolgt separat im Browser.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'..','neutralisationslabor.html'),'utf8');
const script=source.match(/<script>([\s\S]*?)<\/script>/)[1];
const registry=new Map(),documentListeners={};let activeElement=null;
class Element{
 constructor(tag='div'){this.tagName=tag.toUpperCase();this.attributes={};this.children=[];this.style={};this.dataset={};this.listeners={};this.value='';this.textContent='';this.hidden=false;this.disabled=false;this.checked=false;this.open=false;this.isConnected=true;this.classes=new Set();this.classList={add:v=>this.classes.add(v),remove:v=>this.classes.delete(v),toggle:(v,on)=>{if(on??!this.classes.has(v))this.classes.add(v);else this.classes.delete(v);},contains:v=>this.classes.has(v)};}
 setAttribute(k,v){this.attributes[k]=String(v);if(k==='id')registry.set(String(v),this);if(k.startsWith('data-'))this.dataset[k.slice(5)]=String(v);}
 getAttribute(k){return this.attributes[k]??null;}
 removeAttribute(k){delete this.attributes[k];}
 append(...els){for(const el of els){if(el.parent)el.remove();this.children.push(el);el.parent=this;}}
 prepend(el){if(el.parent)el.remove();this.children.unshift(el);el.parent=this;}
 replaceChildren(...els){for(const el of this.children)el.parent=null;this.children=[];this.append(...els);}
 remove(){if(this.parent)this.parent.children=this.parent.children.filter(c=>c!==this);this.parent=null;}
 addEventListener(type,fn){this.listeners[type]=fn;}
 focus(){activeElement=this;}
 showModal(){this.open=true;}
 close(){this.open=false;}
 scrollIntoView(){}
 closest(){return null;}
 getBoundingClientRect(){return {left:0,top:0,right:900,bottom:800};}
 querySelectorAll(selector){const found=[];const walk=el=>{for(const c of el.children){if(selector==='button'&&c.tagName==='BUTTON')found.push(c);walk(c);}};walk(this);return found;}
 set innerHTML(html){this._html=html;this.replaceChildren();parse(html,this);}
 get innerHTML(){return this._html||'';}
}
function parse(html,parent){for(const match of html.matchAll(/<([a-z][\w-]*)\b([^>]*)>/gi)){const el=new Element(match[1]);for(const a of match[2].matchAll(/([\w-]+)="([^"]*)"/g)){el.setAttribute(a[1],a[2]);if(a[1]==='value')el.value=a[2];}el.hidden=/\bhidden(?:\s|$)/.test(match[2]);el.disabled=/\bdisabled(?:\s|$)/.test(match[2]);if(parent&&(el.getAttribute('id')||el.tagName==='BUTTON'||el.tagName==='CIRCLE'))parent.append(el);}}
parse(source);
const body=new Element('body'),document={body,hidden:false,createElement:t=>new Element(t),createElementNS:(_,t)=>new Element(t),getElementById:id=>registry.get(id)||null,addEventListener:(name,fn)=>{documentListeners[name]=fn;},get activeElement(){return activeElement;},querySelectorAll(selector){if(selector==='[data-phase]')return [...registry.values()].filter(el=>el.dataset.phase);if(selector.includes('name=prediction'))return [{value:'acid'},{value:'water'}];return [];}};
// Nav-Buttons besitzen absichtlich keine IDs; für die Zustandstests werden sie ergänzt.
for(let i=1;i<=4;i++){const el=new Element('button');el.dataset.phase=String(i);registry.set('mock-phase-'+i,el);}
registry.get('acidConcentration').value='0.1';registry.get('baseConcentration').value='0.1';
const context=vm.createContext({document,window:{},matchMedia:()=>({matches:false}),requestAnimationFrame:()=>{},console,Math,Number,Set,Map});
vm.runInContext(script,context,{filename:'neutralisationslabor.html'});
const {Chemistry:C,Experiment:E,Particles:P,Reaction:R,Learning:L,Dialog:D,Chart,state:s}=context.window.NeutralLab;
let checks=0;
function check(ok,message){checks++;assert.ok(ok,message);}
function near(a,b,tolerance,message){check(Math.abs(a-b)<=tolerance,`${message}: ${a} ≠ ${b}`);}
const el=id=>registry.get(id),click=id=>{check(typeof el(id).onclick==='function','Handler '+id);el(id).onclick();};
function close(){if(s.modalKind)D.close();}
function dose(units){check(E.requestDose(units),'Dosierung angenommen '+units);E.animate(10000);}

check(!s.moving&&!s.continuous&&!s.unlocked,'Start pausiert, Lupe verdeckt');
check(el('phValue').textContent==='1,00','Start-pH');check(s.history.length===1,'Nur Anfangsmessung');
for(const [v,p]of [[0,1],[20,1.95424],[25,7],[30,11.958607]])near(C.calculate(v,.1,.1).ph,p,.00001,'Standard-pH bei '+v+' ml');
near(C.calculate(25).total,.05,1e-14,'Additive Volumina');
near(C.calculate(25).nNa,.0025,1e-14,'Natrium bleibt');near(C.calculate(25).nCl,.0025,1e-14,'Chlorid bleibt');
near(C.calculate(25).h,1e-7,1e-19,'Autoprotolyse H');near(C.calculate(25).oh,1e-7,1e-19,'Autoprotolyse OH');
check(C.calculate(6.25,.05,.2).nH===C.calculate(6.25,.05,.2).nOH,'Identische Neutralmengen auch bei Rundungsgrenzen');
check(C.color(1)!==C.color(7)&&C.color(7)!==C.color(12),'Universalindikator drei Farben');
for(const ca of [.05,.1,.2])for(const cb of [.05,.1,.2]){
 s.ca=ca;s.cb=cb;const eq=C.equivalence();near(C.calculate(eq).ph,7,1e-10,'Äquivalenz alle Konzentrationen');
 check(C.maxVolume()>eq,'Überschreiten möglich');check(C.capacity()>25+C.maxVolume(),'Becher nicht überfüllt');
 let previous=-Infinity;
 for(let i=0;i<=100;i++){const m=C.calculate(C.maxVolume()*i/100);check(Number.isFinite(m.ph),'Endlicher pH');check(m.ph>=previous-1e-9,'Monotoner pH');previous=m.ph;near(m.h+m.nNa/m.total,m.oh+m.nCl/m.total,1e-13,'Ladungsbilanz');near(m.h*m.oh,1e-14,1e-27,'Wasserprodukt');}
 for(const delta of [-1e-9,0,1e-9]){const m=C.calculate(eq+delta);check(Number.isFinite(m.ph),'Stabil nahe Äquivalenz');}
}
s.ca=s.cb=.1;E.reset();
L.unlock();dose(100);near(s.units,100,0,'+1,0 ml');dose(10);near(s.units,110,0,'+0,1 ml');
check(s.history.length===3,'Messpunkte nur bei Commit');
check(Number(el('beakerLiquid').getAttribute('height'))>40,'Flüssigkeitsstand steigt');
check(Number(el('buretteLiquid').getAttribute('height'))<162,'Büretteninhalt sinkt');
E.reset();for(let i=0;i<25;i++)dose(100);check(s.units===2500,'25,0 ml exakt erreichbar');near(C.calculate().ph,7,1e-12,'pH am Punkt');
let counts=P.counts(C.calculate());check(counts.H===0&&counts.OH===0&&counts.Na>0&&counts.Cl>0,'Neutrale Teilchenzusammensetzung');
for(let i=0;i<5;i++)dose(100);check(P.counts(C.calculate()).OH>0&&P.counts(C.calculate()).H===0,'Basenüberschuss');
E.reset();for(let i=0;i<10;i++)dose(100);counts=P.counts(C.calculate());check(counts.H>0&&counts.OH===0&&counts.Na>0,'Säureüberschuss');

// Exaktes 6,25-ml-Äquivalent mit zusätzlicher Hundertstel-Dosierung.
s.ca=.05;s.cb=.2;E.reset();for(let i=0;i<6;i++)dose(100);dose(10);dose(10);for(let i=0;i<5;i++)dose(1);check(s.units===625,'6,25 ml erreichbar');near(C.calculate().ph,7,1e-12,'Ungleiche Konzentrationen');
s.ca=.2;s.cb=.05;E.reset();dose(5000);check(Number(el('buretteLiquid').getAttribute('height'))<1e-6,'Bürette nach 50 ml leer');dose(10);check(el('refillNote').textContent.includes('1×'),'Nachfüllen visualisiert');dose(7000);check(s.units===12000,'Maximalvolumen geklemmt');check(!E.requestDose(10),'Keine Überdosierung über Modellbereich');
s.ca=s.cb=.1;E.reset();
click('flowButton');E.animate(500);check(s.units===10&&s.continuous,'Kontinuierliche Zugabe');click('pauseButton');const stopped=s.units;E.animate(5000);check(s.units===stopped&&!s.continuous&&!s.dose&&!s.moving,'Pause ohne verspätete Mutation');
click('flowButton');click('resetButton');E.animate(5000);check(s.units===0&&!s.continuous&&!s.dose,'Reset bricht laufende Dosierung ab');
check(E.requestDose(100),'Dosieren vor Dialog');D.equations();check(!s.dose&&!s.continuous&&s.modalKind==='equations','Dialog und Dosieren exklusiv');check(!E.requestDose(10),'Keine Zugabe bei offenem Dialog');
click('eqNext');check(s.eqStage===1,'Formelgleichung');click('eqNext');check(s.eqStage===2,'Ionengleichung');click('eqMark');check(s.spectatorMode===1,'Zuschauer markieren');click('eqRemove');check(s.spectatorMode===2,'Nettogleichung');click('eqRemove');check(s.spectatorMode===1,'Ionen zurück');click('eqBack');check(s.eqStage===1,'Gleichung zurück');close();

R.open();let atom=el('detail-h-transfer');
for(const t of [0,1/3,.5,2/3,1]){s.reaction.t=t;R.render();check(el('detail-h-transfer')===atom,'Identität übertragenes H bleibt');const g=R.geometry(t);check(Object.values(g).filter(v=>typeof v==='object').length===6,'Sechs Atome im Detailzustand');near(Number(el('bond-old').getAttribute('opacity'))+Number(el('bond-new').getAttribute('opacity')),1,1e-12,'Bindung wechselt kontrolliert');}
s.reaction.t=1;R.render();check(el('rLabel1').textContent==='H₂O'&&el('rLabel2').textContent==='H₂O','Genau zwei Wassermoleküle');check(el('bond-old').getAttribute('opacity')==='0'&&el('bond-new').getAttribute('opacity')==='1','Bindungszustand Produkte');
click('rPrev');near(s.reaction.t,2/3,1e-12,'Vorheriger Schritt');click('rNext');near(s.reaction.t,1,1e-12,'Nächster Schritt');click('rRepeat');check(s.reaction.t===0&&s.reaction.playing,'Wiederholen');R.animate(12000);check(s.reaction.t===1&&!s.reaction.playing,'Abspielende');click('rPlay');R.animate(1000);click('rPause');const rt=s.reaction.t;R.animate(1000);near(s.reaction.t,rt,0,'Reaktionspause');close();

// Modellreaktion erhält bestehende Atome und ändert keine gemessenen Stoffmengen.
E.reset();s.unlocked=true;s.moving=true;const hyd=s.particles.find(p=>p.type==='H'),oldId=hyd.atoms[3].getAttribute('id');P.representativeReaction(hyd,'OH');const event=P.events.at(-1),before=s.units;
P.animate(1801);check(hyd.type==='W'&&event.oh.type==='W','Zwei Wasser im Lösungsausschnitt');check(hyd.atoms.length===3&&event.oh.atoms.length===3,'Je ein O und zwei H');check(event.oh.atoms.some(a=>a.getAttribute('id')===oldId),'H-Atom-ID bei Übertragung erhalten');check(s.units===before,'Animation ersetzt keine Berechnung');
P.select('Na');check(el('particleInfo').textContent.includes('hydratisiert'),'Teilcheninfo');

L.evaluate();el('neutralAnswer').value='acid';el('neutralReason').value='Das pH-Meter zeigt einen Wert unter sieben.';click('checkEvaluation');check(el('evaluationFeedback').textContent.includes('Stoffmengen')||el('evaluationFeedback').textContent.includes('Stöchiometrisch'),'Drei Beobachtungsebenen in Auswertung');close();
L.classify();for(const k of ['H','OH','Na','Cl'])el('class-'+k).value=k==='H'||k==='OH'?'reacts':'spectator';click('checkClassification');check(el('classFeedback').textContent.includes('Zuordnung passt'),'Zuordnung mit Rückmeldung');close();
L.transfer();el('transferA').value='spectator';el('transferB').value='base';el('reasonA').value='Sie reagieren nicht mit.';el('reasonB').value='Es bleibt OH im Überschuss.';click('checkTransfer');check(el('transferFeedback').children.length===3,'Fachliche Transfer-Rückmeldungen');close();
L.prediction();el('revisedPrediction').value='Ein Proton wird übertragen; die Zuschauerionen bleiben.';click('saveRevision');check(s.prediction.revision.includes('Proton'),'Vermutung überarbeiten');close();
D.compare();check(el('dialogBody').innerHTML.includes('Säureüberschuss')&&el('dialogBody').innerHTML.includes('Basenüberschuss'),'Drei Zustände vergleichen');close();
D.explain(true);check(el('dialogBody').innerHTML.includes('Symbolebene'),'Vollständige Erklärung');close();
D.teacher();const historyCount=s.history.length;click('teacherAt');near(C.calculate().ph,7,1e-12,'Lehrkraft Direktzustand');check(s.history.length===historyCount,'Keine fingierten Messpunkte');
D.teacher();click('teacherCurve');check(el('showModel').checked&&el('chartDetails').open,'Lehrkraftkurve');
D.teacher();el('teacherQuestion').value='Welche Ionen bleiben?';click('teacherShowQuestion');check(!el('classQuestion').hidden&&el('classQuestion').textContent==='Welche Ionen bleiben?','Unterrichtsfrage');
D.teacher();click('teacherHideQuestion');check(el('classQuestion').hidden,'Frage ausblenden');
click('freeMode');check(s.mode==='free'&&!el('advancedDetails').hidden,'Freier Modus');click('guidedMode');check(s.mode==='guided','Geführter Modus');
el('reducedMotion').onchange({target:{checked:true}});check(s.reduced&&!s.moving,'Reduzierte Bewegung');
E.reset();
const keyEvent=key=>({key,target:body,preventDefault:()=>{}});
documentListeners.keydown(keyEvent('1'));E.animate(10000);check(s.units===100,'Tastatur +1 ml');
documentListeners.keydown(keyEvent('0'));E.animate(10000);check(s.units===110,'Tastatur +0,1 ml');
documentListeners.keydown({...keyEvent('1'),target:new Element('textarea')});check(!s.dose,'Keine Dosierung während Texteingabe');
documentListeners.keydown(keyEvent(' '));check(!s.moving&&!s.dose,'Leertaste pausiert');
s.moving=true;s.continuous=true;document.hidden=true;documentListeners.visibilitychange();check(!s.moving&&!s.continuous,'Hintergrundwechsel stoppt Zugabe');document.hidden=false;
check(!/<(?:script|img|iframe)\b[^>]*src\s*=/i.test(source)&&!/<link\b[^>]*href\s*=/i.test(source),'Keine externen Laufzeitressourcen');
check(!source.includes('Bromthymolblau'),'Universalindikator durchgehend ersetzt');
check(!/<\/[a-z][\w-]*\s+\w+=/i.test(source),'Keine Attribute an irrtümlichen HTML-Schlusstag-Öffnern');
console.log(`${checks} Prüfungen bestanden. Fachmodell, Ladungsbilanz, Konzentrationsmatrix, Dosierung, Pause, Reset, Detailreaktion, Lernphasen, Dialoge und Offline-Ressourcen geprüft.`);
