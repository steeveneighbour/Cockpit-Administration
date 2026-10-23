'use strict';
(() => {
 const $ = id => document.getElementById(id);
 const allowed = new Set(['txt','eml','csv','pdf','docx','odt']);
 const kinds = {meeting:'Invitation à une réunion',decision:'Notification ou décision',other:'Document à qualifier'};
 const explanations = {
   meeting:'Le texte évoque une réunion. Cockpit propose une action de préparation et une entrée dans l’agenda à confirmer. Aucun courriel n’est envoyé.',
   decision:'Une notification ou décision semble appeler un suivi. Cockpit propose une action, sans prendre de décision réglementaire.',
   other:'La nature reste incertaine : l’agent peut demander une vérification et rattacher le document à un dossier.'
 };
 const state = {docs:[], actions:[], activeId:null, view:'accueil', tab:'kanban', hiddenHelp:false};
 const esc = value => String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 function status(s){$('global-status').textContent=s}
 function nav(view){
   if(!$("view-"+view))view='informatif';
   state.view=view;
   document.querySelectorAll('.view').forEach(el=>el.hidden = el.id!=='view-'+view);
   document.querySelectorAll('[data-view]').forEach(el=>{
    const on=el.dataset.view===view;
    if(el.classList.contains('sidebar-home')||el.closest('.group-items'))el.classList.toggle('active',on);
   });
   render();
   window.scrollTo({top:0,behavior:'auto'});
   $('main').focus({preventScroll:true});
 }
 document.querySelectorAll('[data-view]').forEach(btn=>btn.addEventListener('click',()=>{
   const v=btn.dataset.view;
   if(!['accueil','documents','travail','projets','analyses','agenda'].includes(v)){
     $('info-title').textContent=btn.textContent.trim();
     $('info-subtitle').textContent='Ce module est présent dans Cockpit Windows, mais non simulé dans cet essai limité.';
     nav('informatif');return;
   }
   nav(v);
 }));
 document.querySelectorAll('[data-group]').forEach(b=>b.addEventListener('click',()=>{
   const next=b.getAttribute('aria-expanded')!=='true';
   b.setAttribute('aria-expanded',String(next));
   $('group-'+b.dataset.group).hidden=!next;
   b.lastElementChild.textContent=next?'⌃':'⌄';
 }));
 document.querySelectorAll('[data-tip]').forEach(b=>b.addEventListener('click',()=>{
   const next=b.getAttribute('aria-expanded')!=='true';b.setAttribute('aria-expanded',String(next));$('tip-'+b.dataset.tip).hidden=!next;
 }));
 $('toggle-help').addEventListener('click',()=>{
   state.hiddenHelp=!state.hiddenHelp;
   $('quick-actions').hidden=state.hiddenHelp;
   $('toggle-help').textContent=state.hiddenHelp?'Par où commencer ?':'Masquer ces conseils';
 });
 document.querySelectorAll('[data-tab]').forEach(btn=>btn.addEventListener('click',()=>{
   const tab=btn.dataset.tab;state.tab=tab;
   document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active',b===btn));
   $('kanban-grid').hidden=tab!=='kanban';$('gantt-panel').hidden=tab!=='gantt';$('resources-panel').hidden=tab!=='ressources';
 }));
 function selected(){return state.docs.find(d=>d.id===state.activeId)||null}
 function detect(content,name){const c=(content+' '+name).toLowerCase();if(/réunion|reunion|invitation|comité|comite|convocation/.test(c))return'meeting';if(/notification|décision|decision|arrêté|arrete|délibération/.test(c))return'decision';return'other'}
 function dateLine(text){const m=text.match(/\b([0-3]?\d[\/.\-][01]?\d[\/.\-](?:20)?\d\d)\b.{0,70}?\b([01]?\d|2[0-3])\s*(?:h|:)\s*([0-5]?\d)?\b/i);return m?`Date possible : ${m[1]} à ${m[2]} h ${String(m[3]||'00').padStart(2,'0')}. À vérifier avant création.`:'Aucune date fiable déterminée automatiquement.'}
 function setReviewState(){const d=selected();if(!d)return;
   $('doc-name').textContent=d.name;$('doc-hash').textContent=d.hash?d.hash.slice(0,21)+'…':'Non disponible';
   $('doc-integrity').textContent=`${d.ext.toUpperCase()} · ${Math.ceil(d.size/1024)} Ko · ${d.duplicate?'contenu identique déjà vu':'format autorisé'}`;
   $('nature').value=d.kind;
   $('review-check').checked=d.reviewChecked;
   $('validate').disabled=!d.reviewChecked||d.validated;
   $('review-empty').hidden=true;$('review-ready').hidden=false;
   $('reason').textContent=explanations[d.kind];
   $('proposal-detail').textContent=d.kind==='meeting' ? dateLine(d.preview) : d.readable?'Analyse indicative du nom et du texte de cet exemple.':'Contenu non analysé : seule la nature du fichier et son nom peuvent être pris en compte ici.';
   $('follow-up').hidden=!d.validated;
   $('follow-up-desc').textContent=d.kind==='meeting'?'Préparer une action de coordination et une proposition de réunion, sans envoyer d’invitation.':d.kind==='decision'?'Préparer un suivi de décision à vérifier, sans produire d’acte.':'Préparer une action de qualification manuelle.';
   const hasAction=state.actions.some(a=>a.docId===d.id);
   $('create-work').disabled=hasAction||!d.validated;
   $('follow-up-status').textContent=hasAction?'Action déjà préparée, visible dans Travail / Agenda.':'Validation enregistrée seulement dans cet essai.';
 }
 function renderDocs(){
  $('doc-count').textContent=state.docs.length;
  const list=$('doc-list');list.replaceChildren();
  if(!state.docs.length){const p=document.createElement('p');p.className='empty';p.textContent='Aucun fichier reçu pour le moment.';list.append(p)}
  for(const d of state.docs){const b=document.createElement('button');b.type='button';b.classList.toggle('selected',d.id===state.activeId);
   const a=document.createElement('strong');a.textContent='▤  '+d.name;const details=document.createElement('span');details.textContent=(d.validated?'Qualifié':'À vérifier')+' · '+(d.duplicate?'déjà reconnu':'source locale');b.append(a,details);b.addEventListener('click',()=>{state.activeId=d.id;renderDocs();setReviewState()});list.append(b)}
  if(!selected()){ $('review-ready').hidden=true;$('review-empty').hidden=false; }else setReviewState();
 }
 function changeKind(){const d=selected();if(!d)return;d.kind=$('nature').value;d.validated=false;d.reviewChecked=false;setReviewState();renderHome();}
 $('nature').addEventListener('change',changeKind);
 $('review-check').addEventListener('change',()=>{const d=selected();if(!d)return;d.reviewChecked=$('review-check').checked;$('validate').disabled=!d.reviewChecked||d.validated});
 $('validate').addEventListener('click',()=>{
   const d=selected();if(!d||!d.reviewChecked)return;
   d.validated=true;setReviewState();renderHome();renderDocs();
   $('import-status').textContent='Qualification validée : l’action suivante reste à préparer explicitement.';
   status('Document validé. Cockpit a préparé une proposition, sans décision automatique.');
 });
 $('create-work').addEventListener('click',()=>{
   const d=selected();if(!d||!d.validated||state.actions.some(a=>a.docId===d.id))return;
   const action={id:'A-'+(state.actions.length+1),docId:d.id,kind:d.kind,source:d.name,status:'todo',title:d.kind==='meeting'?'Préparer la réunion de coordination':d.kind==='decision'?'Assurer le suivi de la notification':'Qualifier et rattacher le document'};
   state.actions.push(action);setReviewState();render();status('Action préparée. Retrouvez-la dans Travail, Agenda et les analyses.');
   $('import-status').textContent='Action de démonstration créée : aucune action réelle ni invitation envoyée.';
 });
 function reset(){state.docs=[];state.actions=[];state.activeId=null;state.view='accueil';state.hiddenHelp=false;
   $('quick-actions').hidden=false;$('toggle-help').textContent='Masquer ces conseils';
   $('file-input').value='';$('import-status').textContent='L’import se déroule uniquement dans votre navigateur.';
   render();nav('accueil');status('Démonstration réinitialisée : toutes les données fictives de session ont disparu.');}
 $('reset').addEventListener('click',reset);
 function renderHome(){const pending=state.docs.filter(d=>!d.validated).length;
   $('attention-label').textContent=pending?`${pending} document(s) en attente de qualification.`:'Aucune exception de travail détectée.';
   $('stat-docs').textContent=state.docs.length;$('stat-work').textContent=state.actions.length;$('stat-agenda').textContent=state.actions.filter(a=>a.kind==='meeting').length;
 }
 function card(a){const div=document.createElement('div');div.className='kanban-card';const label=document.createElement('strong');label.textContent=a.title;const sub=document.createElement('small');sub.textContent=`${a.id} · Source : ${a.source}`;div.append(label,sub);
   if(a.status!=='done'){const b=document.createElement('button');b.type='button';b.textContent=a.status==='todo'?'Passer en cours':'Marquer terminé';b.addEventListener('click',()=>{a.status=a.status==='todo'?'doing':'done';render();status('Action mise à jour dans toutes les vues de démonstration.')});div.append(b)}
   if(a.status!=='todo'){const back=document.createElement('button');back.type='button';back.textContent='← Revenir';back.addEventListener('click',()=>{a.status=a.status==='done'?'doing':'todo';render()});div.append(back)}return div}
 function renderWork(){
   const n=state.actions.length;$('work-count').textContent=n+' élément'+(n===1?'':'s');
   for(const [id,kind] of [['kanban-todo','todo'],['kanban-doing','doing'],['kanban-done','done']]){const zone=$(id);zone.replaceChildren();let items=state.actions.filter(a=>a.status===kind);if(!items.length&&kind==='todo'){const p=document.createElement('p');p.className='empty';p.textContent='Aucune action pour le moment.';zone.append(p)}else items.forEach(a=>zone.append(card(a)))}
   ['todo','doing','done'].forEach(k=>$(k+'-count').textContent=state.actions.filter(a=>a.status===k).length);
   const gantt=$('gantt-items');gantt.replaceChildren();if(n===0){const p=document.createElement('p');p.className='empty';p.textContent='Aucune échéance simulée pour le moment.';gantt.append(p)}else for(const a of state.actions){const row=document.createElement('div');row.className='gantt-line';row.textContent=a.title+' · '+(a.status==='done'?'Terminé':a.status==='doing'?'En cours':'À faire')+' · Échéance à confirmer';gantt.append(row)}
 }
 function renderAgenda(){const zone=$('agenda-items');zone.replaceChildren();const meetings=state.actions.filter(a=>a.kind==='meeting');
  if(!meetings.length){const p=document.createElement('p');p.className='empty';p.textContent='Aucune réunion préparée. Déposez d’abord le courriel fictif dans Documents.';zone.append(p)}
  for(const a of meetings){const article=document.createElement('article');const d=document.createElement('div');const title=document.createElement('strong');title.textContent=a.title;const desc=document.createElement('small');desc.textContent='Date, lieu et participants à confirmer par l’agent. Aucune invitation envoyée.';d.append(title,desc);const btn=document.createElement('button');btn.type='button';btn.className='outline';btn.textContent='Voir Travail';btn.addEventListener('click',()=>nav('travail'));article.append(d,btn);zone.append(article)}
 }
 function renderAnalytics(){const n=state.actions.length;const meetings=state.actions.filter(a=>a.kind==='meeting').length;
  $('ana-doc').textContent=state.docs.length;$('ana-work').textContent=n;$('ana-agenda').textContent=meetings;
  $('analysis-status').textContent=state.docs.some(d=>!d.validated)?'Des documents doivent encore être qualifiés.':meetings?'La date et les participants des réunions préparées restent à confirmer.':'Aucun arbitrage en attente dans la simulation.';
  $('project-actions').textContent=n+' action'+(n===1?'':'s')+' préparée'+(n===1?'':'s');
 }
 function render(){renderHome();renderDocs();renderWork();renderAgenda();renderAnalytics()}
 async function importFile(file){if(!file)return;
  const ext=(file.name.split('.').pop()||'').toLowerCase();if(!allowed.has(ext)){status('Format non accepté dans cet essai.');$('import-status').textContent='Format non accepté : utilisez PDF, DOCX, ODT, EML, TXT ou CSV.';return}
  if(file.size>8*1024*1024){status('Fichier trop volumineux.');$('import-status').textContent='Taille maximale de la simulation : 8 Mo.';return}
  try{const bytes=await file.arrayBuffer();let hash='';if(window.crypto&&window.crypto.subtle){const digest=await window.crypto.subtle.digest('SHA-256',bytes);hash=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('')}
   const readable=['txt','eml','csv'].includes(ext);const preview=readable?new TextDecoder('utf-8',{fatal:false}).decode(bytes).slice(0,65536):'';
   const duplicate=Boolean(hash&&state.docs.some(d=>d.hash===hash));
   const doc={id:state.docs.length+1,name:file.name,ext,size:file.size,hash,readable,preview,duplicate,kind:detect(preview,file.name),validated:false,reviewChecked:false};
   state.docs.push(doc);state.activeId=doc.id;nav('documents');
   $('import-status').textContent=duplicate?'Contenu déjà rencontré : doublon signalé. Cette occurrence de source reste visible.':'Format vérifié, empreinte locale calculée, proposition préparée pour contrôle humain.';
   status('Document examiné. Vérifiez la qualification avant de préparer une action.');
  }catch(e){$('import-status').textContent='Impossible de lire ce fichier dans votre navigateur.';status('Échec du contrôle du document. Aucun fichier transmis.')}
 }
 function sample(name,body){importFile(new File([body],name,{type:'text/plain'}))}
 $('sample-mail').addEventListener('click',()=>sample('invitation-coordination-fictive.eml','From: exemple@invalid.local\nSubject: Réunion interservices\n\nBonjour, réunion de coordination le 27/10/2026 à 14h00, salle 2. Merci de préparer un ordre du jour. Données fictives.'));
 $('sample-notice').addEventListener('click',()=>sample('notification-administrative-fictive.txt','Notification de décision fictive. Un suivi administratif doit être préparé et ses échéances déterminées par le service compétent.'));
 $('pick-file').addEventListener('click',()=>$('file-input').click());
 $('file-input').addEventListener('change',e=>{importFile(e.target.files?.[0]);e.target.value=''});
 const drop=$('dropzone');for(const ev of ['dragenter','dragover'])drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.add('dragover')});
 for(const ev of ['dragleave','drop'])drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.remove('dragover')});
 drop.addEventListener('drop',e=>importFile(e.dataTransfer?.files?.[0]));
 render();nav('accueil');
})();
