
(function(){
  const body=document.body;
  const sidebar=document.getElementById('sidebar');
  const overlay=document.querySelector('.overlay');
  const openSidebar=()=>{sidebar?.classList.add('open');overlay?.classList.add('show');body.classList.add('menu-open');};
  const closeSidebar=()=>{sidebar?.classList.remove('open');overlay?.classList.remove('show');body.classList.remove('menu-open');};
  document.querySelectorAll('[data-open-sidebar]').forEach(btn=>btn.addEventListener('click',openSidebar));
  document.querySelectorAll('[data-close-sidebar]').forEach(btn=>btn.addEventListener('click',closeSidebar));

  // media tabs
  document.querySelectorAll('.media-tab').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const target=btn.dataset.tabTarget;
      btn.parentElement.querySelectorAll('.media-tab').forEach(b=>b.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(pane=>pane.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(target)?.classList.add('active');
    });
  });

  // notes panel
  const notesPanel=document.getElementById('notesPanel');
  const notesArea=document.getElementById('notesArea');
  const pageKey=document.body.dataset.page || 'pagina';
  const storageKey='eco-leopardi-note-' + pageKey;
  if(notesArea){ notesArea.value=localStorage.getItem(storageKey) || ''; }
  document.getElementById('openNotes')?.addEventListener('click',()=>notesPanel?.classList.add('show'));
  document.getElementById('closeNotes')?.addEventListener('click',()=>notesPanel?.classList.remove('show'));
  document.getElementById('saveNotes')?.addEventListener('click',()=>{
    if(!notesArea) return;
    localStorage.setItem(storageKey, notesArea.value);
    const blob=new Blob([notesArea.value],{type:'text/plain;charset=utf-8'});
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    a.download=(pageKey || 'appunti') + '.txt';
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(a.href);
  });
  notesArea?.addEventListener('input',()=>localStorage.setItem(storageKey, notesArea.value));

  // draggable notes
  if(notesPanel){
    const header=notesPanel.querySelector('.notes-header');
    let drag=false, startX=0,startY=0,initialX=0,initialY=0;
    header?.addEventListener('pointerdown',e=>{
      drag=true;
      const rect=notesPanel.getBoundingClientRect();
      startX=e.clientX; startY=e.clientY; initialX=rect.left; initialY=rect.top;
      notesPanel.style.left=rect.left+'px'; notesPanel.style.top=rect.top+'px';
      notesPanel.style.right='auto'; notesPanel.style.bottom='auto';
      header.setPointerCapture?.(e.pointerId);
    });
    header?.addEventListener('pointermove',e=>{
      if(!drag) return;
      notesPanel.style.left=Math.max(8, initialX + (e.clientX-startX))+'px';
      notesPanel.style.top=Math.max(8, initialY + (e.clientY-startY))+'px';
    });
    header?.addEventListener('pointerup',()=>{drag=false;});
  }

  // completion tracker
  const lessons=(window.LESSON_ORDER||[]).map(x=>x.file);
  if(lessons.includes(pageKey + '.html')) localStorage.setItem('eco-leopardi-complete-' + pageKey, '1');
  const completed=lessons.filter(f=>localStorage.getItem('eco-leopardi-complete-' + f.replace('.html',''))==='1').length;
  const progress=document.getElementById('courseProgress');
  const progressText=document.getElementById('courseProgressText');
  if(progress){ progress.style.width=(lessons.length ? (completed/lessons.length*100) : 0)+'%'; }
  if(progressText){ progressText.textContent=`${completed} di ${lessons.length} lezioni visitate`; }

  // image modal
  const imageModal=document.getElementById('imageModal');
  const imageModalImg=document.getElementById('imageModalImg');
  const imageModalCaption=document.getElementById('imageModalCaption');
  document.querySelectorAll('.zoomable').forEach(img=>{
    img.addEventListener('click',()=>{
      if(!imageModal) return;
      imageModalImg.src=img.currentSrc || img.src;
      imageModalImg.alt=img.alt || '';
      imageModalCaption.textContent=img.closest('figure')?.querySelector('figcaption')?.textContent || img.alt || '';
      imageModal.classList.add('show');
    });
  });
  document.querySelectorAll('[data-close-image]').forEach(btn=>btn.addEventListener('click',()=>imageModal?.classList.remove('show')));
  imageModal?.addEventListener('click',e=>{if(e.target===imageModal) imageModal.classList.remove('show');});

  // glossary
  const glossary=window.LEOPARDI_GLOSSARY || {};
  const lessonArticle=document.querySelector('.lesson-article');
  let currentTerm=null;
  function escapeRegExp(s){ return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); }
  function wrapTerms(root){
    if(!root || !Object.keys(glossary).length) return;
    const terms=Object.keys(glossary).sort((a,b)=>b.length-a.length);
    const walker=document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node){
        if(!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        const parent=node.parentElement;
        if(parent && parent.closest('script,style,textarea,a,button,h1,h2,h3,h4,h5,h6,.glossary-term')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const textNodes=[]; while(walker.nextNode()) textNodes.push(walker.currentNode);
    textNodes.forEach(node=>{
      let replaced=node.nodeValue, changed=false;
      terms.forEach(term=>{
        const re=new RegExp(`(^|[^\\p{L}])(${escapeRegExp(term)})(?=[^\\p{L}]|$)`,'giu');
        if(re.test(replaced)){
          replaced=replaced.replace(re, (_,prefix,match)=>`${prefix}<span class="glossary-term" data-term="${term}">${match}</span>`);
          changed=true;
        }
      });
      if(changed){
        const span=document.createElement('span');
        span.innerHTML=replaced;
        node.replaceWith(...span.childNodes);
      }
    });
  }
  wrapTerms(lessonArticle);
  const glossaryModal=document.getElementById('glossaryModal');
  const glossaryTitle=document.getElementById('glossaryTitle');
  const glossaryDef=document.getElementById('glossaryDef');
  const glossaryQuote=document.getElementById('glossaryQuote');
  const glossaryLinks=document.getElementById('glossaryLinks');
  lessonArticle?.addEventListener('click',e=>{
    const termEl=e.target.closest('.glossary-term');
    if(!termEl) return;
    currentTerm=termEl.dataset.term;
    const item=glossary[currentTerm];
    if(!item || !glossaryModal) return;
    glossaryTitle.textContent=currentTerm;
    glossaryDef.textContent=item.def;
    glossaryQuote.textContent=item.quote;
    glossaryLinks.innerHTML='';
    (item.links||[]).forEach(link=>{
      const a=document.createElement('a'); a.href=link;
      const found=(window.LESSON_ORDER||[]).find(x=>x.file===link);
      a.textContent=found ? found.title : link.replace('.html','');
      glossaryLinks.appendChild(a);
    });
    glossaryModal.classList.add('show');
  });
  document.getElementById('closeGlossary')?.addEventListener('click',()=>glossaryModal?.classList.remove('show'));
  glossaryModal?.addEventListener('click',e=>{if(e.target===glossaryModal) glossaryModal.classList.remove('show');});
  document.getElementById('highlightOccurrences')?.addEventListener('click',()=>{
    if(!lessonArticle || !currentTerm) return;
    lessonArticle.querySelectorAll('.highlighted-occurrence').forEach(x=>x.classList.remove('highlighted-occurrence'));
    lessonArticle.querySelectorAll('.glossary-term').forEach(x=>{if(x.dataset.term===currentTerm) x.classList.add('highlighted-occurrence');});
    lessonArticle.querySelector('.highlighted-occurrence')?.scrollIntoView({behavior:'smooth', block:'center'});
    glossaryModal?.classList.remove('show');
  });

  // home intro switch
  document.getElementById('playIntro')?.addEventListener('click',()=>{
    const cover=document.getElementById('coverBox');
    if(!cover) return;
    cover.innerHTML=`<div class="media-frame video-frame"><iframe width="560" height="315" src="https://www.youtube.com/embed/iN_rSsKyAQc?si=saT8Hkunlpt6uKHv" title="Video introduttivo" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>`;
  });

  // service worker
  if('serviceWorker' in navigator){
    window.addEventListener('load',()=>navigator.serviceWorker.register('service-worker.js').catch(()=>{}));
  }
})();
