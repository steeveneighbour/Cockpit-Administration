'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const allowed = new Set(['eml','txt','csv','pdf','docx','odt']);
  let record = null;
  let validated = false;
  let lastKind = null;
  let nextId = 0;
  const hashes = new Set();

  function text(id, value) { $(id).textContent = String(value); }
  function status(message, error = false) {
    text('status', message);
    $('status').classList.toggle('error', error);
  }
  function step(n) {
    for (let i = 1; i <= 4; i++) $('st-' + i).classList.toggle('current', i === n);
  }
  function detection(s, ext) {
    const c = s.toLocaleLowerCase('fr');
    if (/réunion|reunion|invitation|comité|comite|rendez-vous|convocation/.test(c)) return 'meeting';
    if (/notification|décision|decision|arrêté|arrete|délibération|deliberation/.test(c)) return 'decision';
    return ext === 'eml' ? 'other' : 'other';
  }
  const labels = {meeting:'Invitation à une réunion', decision:'Décision ou notification', other:'Document à qualifier'};
  const proposals = {
    meeting:'Préparer une fiche de réunion et une action de préparation. La date, le lieu, les participants et la création réelle doivent être confirmés par l’agent.',
    decision:'Préparer une tâche de suivi de la décision, à vérifier par l’agent avant toute conséquence métier.',
    other:'Proposer un classement et un rattachement manuel. Aucune interprétation métier du contenu n’est certaine.'
  };
  function inferDate(content) {
    const found = content.match(/\b([0-3]?\d[/.\-][01]?\d[/.\-](?:20)?\d\d)\b.{0,35}?\b([01]?\d|2[0-3])\s*(?:h|:)\s*([0-5]?\d)?\b/i);
    return found ? `Date mentionnée : ${found[1]} à ${found[2]} h ${String(found[3] || '00').padStart(2,'0')} — à confirmer.` : 'Date non déterminée automatiquement.';
  }
  function updateKind() {
    if (!record) return;
    lastKind = $('category').value;
    text('kind', labels[lastKind]);
    text('reason', proposals[lastKind]);
    text('details', lastKind === 'meeting' ? inferDate(record.preview) : (record.contentRead ? 'Examen indicatif du texte et du nom de fichier.' : 'Contenu non analysé : qualification fondée uniquement sur le nom et le type de fichier.'));
    validated = false;
    $('confirm').checked = false;
    $('validate').disabled = true;
    $('apply').disabled = true;
    text('draft', 'Aucune action préparée. Confirmez d’abord la qualification.');
    step(2);
  }
  async function analyze(file) {
    if (!file) return;
    const ext = (file.name.split('.').pop() || '').toLocaleLowerCase('en');
    if (!allowed.has(ext)) return status('Format non pris en charge. Utilisez PDF, DOCX, ODT, EML, TXT ou CSV.', true);
    if (file.size > 8 * 1024 * 1024) return status('Fichier trop volumineux pour cet essai (maximum 8 Mo).', true);
    status('Contrôle local du fichier…');
    try {
      const bytes = await file.arrayBuffer();
      let fingerprint = 'Non disponible';
      if (crypto.subtle) {
        const digest = await crypto.subtle.digest('SHA-256', bytes);
        fingerprint = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2,'0')).join('');
      }
      const duplicate = fingerprint !== 'Non disponible' && hashes.has(fingerprint);
      if (fingerprint !== 'Non disponible') hashes.add(fingerprint);
      const contentRead = ['eml','txt','csv'].includes(ext);
      const preview = contentRead ? new TextDecoder('utf-8', {fatal:false}).decode(bytes).slice(0,65536) : '';
      record = {name:file.name,ext,bytes:file.size,fingerprint,contentRead,preview};
      text('fn', record.name);
      text('fmt', `${ext.toUpperCase()} · ${Math.round(file.size/1024)} Ko · format autorisé${duplicate ? ' · déjà rencontré dans cette session' : ''}`);
      text('sha', fingerprint === 'Non disponible' ? fingerprint : fingerprint.slice(0,18) + '…');
      $('category').value = detection((preview || '') + ' ' + file.name, ext);
      $('analysis').hidden = false;
      $('empty').hidden = true;
      updateKind();
      status('Fichier examiné localement. ' + (duplicate ? 'Empreinte déjà reconnue dans cet essai. ' : '') + 'Contrôlez la qualification avant de poursuivre.');
    } catch (e) {
      record = null;
      status('Lecture impossible dans ce navigateur. Aucun fichier n’a été transmis.',true);
    }
  }
  function sample(name, content) {
    const bytes = new Blob([content], {type:'text/plain'});
    const file = new File([bytes], name, {type:'text/plain'});
    analyze(file);
  }
  $('sample-meeting').addEventListener('click', () => sample('invitation-coordination-fictive.eml',
    'From: exemple@invalid.local\nSubject: Invitation à la réunion de coordination\n\nBonjour, réunion de coordination le 27/10/2026 à 14h00. Merci de préparer l’ordre du jour. (Données fictives.)'));
  $('sample-decision').addEventListener('click', () => sample('notification-fictive.txt',
    'Notification d’une décision fictive : préparer une action de suivi administratif, identifier les échéances et conserver la traçabilité. Aucune décision réelle.'));
  $('pick').addEventListener('click', () => $('file').click());
  $('file').addEventListener('change', e => { analyze(e.target.files?.[0]); e.target.value = ''; });
  for (const ev of ['dragenter','dragover']) $('drop').addEventListener(ev, e => {e.preventDefault();$('drop').classList.add('dragover');});
  for (const ev of ['dragleave','drop']) $('drop').addEventListener(ev, e => {e.preventDefault();$('drop').classList.remove('dragover');});
  $('drop').addEventListener('drop', e => analyze(e.dataTransfer?.files?.[0]));
  $('category').addEventListener('change', updateKind);
  $('confirm').addEventListener('change', e => { $('validate').disabled = !e.target.checked; });
  $('validate').addEventListener('click', () => {
    if (!record || !$('confirm').checked) return;
    validated = true;
    lastKind = $('category').value;
    text('draft', lastKind === 'meeting'
      ? `Réunion fictive à préparer : ${record.name}. ${inferDate(record.preview)} Aucune date ni invitation envoyée.`
      : lastKind === 'decision'
        ? `Suivi fictif à préparer : ${record.name}. Retrouver la notification, définir l'échéance après examen.`
        : `Qualification à compléter pour ${record.name}. Rattachement à un dossier à confirmer.`);
    $('apply').disabled = false;
    status('Qualification validée dans cette simulation. La proposition peut maintenant être préparée.');
    step(3);
  });
  $('apply').addEventListener('click', () => {
    if (!record || !validated) return;
    const item = document.createElement('li');
    const prefix = lastKind === 'meeting' ? 'Préparer une réunion' : lastKind === 'decision' ? 'Suivre une décision' : 'Qualifier un document';
    item.textContent = `${++nextId}. ${prefix} — ${record.name} (simulation, non transmis)`;
    $('no-actions')?.remove();
    $('actions').appendChild(item);
    $('apply').disabled = true;
    step(4);
    status('Une action fictive est visible dans la vue Travail / Agenda de cette page. Aucune modification réelle n’a été effectuée.');
  });
  $('reset').addEventListener('click', () => {
    record = null;validated = false;nextId = 0;hashes.clear();lastKind = null;
    $('analysis').hidden=true;$('empty').hidden=false;$('confirm').checked=false;$('validate').disabled=true;$('apply').disabled=true;
    $('actions').replaceChildren();const li=document.createElement('li');li.id='no-actions';li.className='muted';li.textContent='Aucune action créée dans cet essai.';$('actions').appendChild(li);
    text('draft', 'Validez d’abord un document. Aucune opération n’est lancée automatiquement.');
    status('Essai réinitialisé. Les informations précédentes ont été effacées de cette page.');step(1);
  });
})();
