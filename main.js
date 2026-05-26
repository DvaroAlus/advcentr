/**
 * РЕКЛАМНЫЙ ЦЕНТР — Variant 2: Kinetic Editorial
 * main.js
 */
'use strict';
const $ = (s,c=document)=>c.querySelector(s);
const $$ = (s,c=document)=>[...c.querySelectorAll(s)];

// Year
const yr = $('#year');
if(yr) yr.textContent = new Date().getFullYear();

// Nav scroll + burger
const nav = $('#nav');
const burger = $('#navBurger');
const navLinks = $('#navLinks');
const progressBar = $('#scrollProgress');
const backTop = $('#backTop');

function onScroll(){
  const y = window.scrollY;
  nav.classList.toggle('nav--scrolled', y > 20);
  if(progressBar){
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = (docH > 0 ? (y / docH) * 100 : 0) + '%';
  }
  if(backTop) backTop.classList.toggle('visible', y > 600);
}
window.addEventListener('scroll', onScroll, {passive:true});
onScroll();

backTop?.addEventListener('click',()=>{
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({top:0, behavior: reduced ? 'auto' : 'smooth'});
});

burger?.addEventListener('click',()=>{
  const open = navLinks.classList.toggle('open');
  burger.classList.toggle('open',open);
  burger.setAttribute('aria-expanded',String(open));
  document.body.style.overflow = open?'hidden':'';
});
$$('.nav__link').forEach(l=>l.addEventListener('click',()=>{
  navLinks.classList.remove('open');
  burger?.classList.remove('open');
  burger?.setAttribute('aria-expanded','false');
  document.body.style.overflow='';
}));

// Smart anchor scroll: center short sections, top-align tall ones
function smoothScrollToSection(id){
  const target=document.getElementById(id);
  if(!target) return false;
  const navH=nav?.offsetHeight||80;
  const sectionTop=target.getBoundingClientRect().top+window.scrollY;
  const sectionH=target.offsetHeight;
  const avail=window.innerHeight-navH;
  let y;
  if(sectionH<=avail){
    y=sectionTop-navH-(avail-sectionH)/2;
  } else {
    y=sectionTop-navH;
  }
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({top:Math.max(0,y), behavior:reduced?'auto':'smooth'});
  return true;
}
document.addEventListener('click',e=>{
  const link=e.target.closest('a[href^="#"]');
  if(!link) return;
  const href=link.getAttribute('href')||'';
  if(href===''||href==='#') return;
  let id;
  try { id=decodeURIComponent(href.slice(1)); } catch { id=href.slice(1); }
  if(!document.getElementById(id)) return;
  e.preventDefault();
  smoothScrollToSection(id);
  if(history.replaceState) history.replaceState(null,'',href);
});

// Reveal on scroll
const obs = new IntersectionObserver((entries)=>{
  entries.forEach((entry,i)=>{
    if(entry.isIntersecting){
      const siblings = $$('.reveal-up',entry.target.parentElement);
      const idx = siblings.indexOf(entry.target);
      entry.target.style.transitionDelay = `${idx*100}ms`;
      entry.target.classList.add('visible');
      obs.unobserve(entry.target);
    }
  });
},{threshold:0.1,rootMargin:'0px 0px -40px 0px'});
$$('.reveal-up').forEach(el=>obs.observe(el));

// Also reveal svc-card and works__item
const genObs = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      const siblings = $$('.gen-reveal',e.target.parentElement);
      const idx = siblings.indexOf(e.target);
      e.target.style.transitionDelay = `${idx*60}ms`;
      e.target.style.opacity='1';
      e.target.style.transform='none';
      genObs.unobserve(e.target);
    }
  });
},{threshold:0.08});
['.svc-card','.works__item'].forEach(sel=>{
  $$(sel).forEach(el=>{
    el.classList.add('gen-reveal');
    el.style.opacity='0';
    el.style.transform='translateY(20px)';
    el.style.transition='opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1)';
    genObs.observe(el);
  });
});

// Counter
function countUp(el,target,dur=1600){
  const t0=performance.now();
  const tick=now=>{
    const p=Math.min((now-t0)/dur,1);
    el.textContent=Math.round((1-Math.pow(1-p,3))*target);
    if(p<1)requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
const cObs=new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){countUp(e.target,+e.target.dataset.count);cObs.unobserve(e.target);}
  });
},{threshold:0.5});
$$('[data-count]').forEach(el=>cObs.observe(el));

// Service card → modal → form
const serviceInput=$('#c-service');
const serviceBadge=$('#formService');
const serviceBadgeName=$('#formServiceName');
const serviceBadgeClear=$('#formServiceClear');

function setService(name){
  if(!serviceInput) return;
  serviceInput.value=name||'';
  if(serviceBadge && serviceBadgeName){
    if(name){
      serviceBadgeName.textContent=name;
      serviceBadge.hidden=false;
    } else {
      serviceBadge.hidden=true;
      serviceBadgeName.textContent='';
    }
  }
}

serviceBadgeClear?.addEventListener('click',()=>setService(''));

const SERVICES={
  'Наружная и интерьерная реклама':{
    desc:'Полный цикл работ по наружной и интерьерной рекламе — от эскиза и согласования до монтажа.',
    list:['Световые короба и лайтбоксы','Объёмные буквы с подсветкой и без','Оформление фасадов под ключ','Интерьерные вывески и таблички','Навигация внутри помещений'],
    meta:'Срок изготовления: от 5 рабочих дней'
  },
  'Экспресс полиграфия':{
    desc:'Печать любых полиграфических материалов в сжатые сроки. Работаем с цифровой и офсетной печатью.',
    list:['Визитки от 100 штук','Листовки и флаеры','Буклеты и брошюры','Наклейки и стикеры','Печать день в день при срочных тиражах'],
    meta:'Минимальный срок: от 1 рабочего дня'
  },
  'Широкоформатная печать':{
    desc:'Печать крупных форматов на баннерной ткани, виниле, бумаге и плёнке. Готовим к монтажу.',
    list:['Баннеры любых размеров','Растяжки и перетяжки','Постеры и плакаты','Печать на ткани и плёнке','Установка люверсов и обработка кромки'],
    meta:'Срок: 1–3 рабочих дня'
  },
  'Стенды, указатели, навигация':{
    desc:'Изготовление информационных конструкций для офисов, торговых центров и городской среды.',
    list:['Информационные стенды','Уличные и дорожные указатели','Корпоративная и городская навигация','Стенды для ТЦ и общественных пространств'],
    meta:'Сроки и материалы — индивидуально под объект'
  },
  'Размещение рекламы':{
    desc:'Размещение наружной рекламы на собственных и партнёрских конструкциях в Тосно. Поможем подобрать локации.',
    list:['Билборды 3×6 в проходимых местах','Сити-форматы и пилоны','Городские рекламные конструкции','Подбор локаций под задачу и бюджет'],
    meta:'Бронирование от 1 месяца'
  },
  'Согласование вывесок':{
    desc:'Полное сопровождение согласования наружных вывесок и рекламных конструкций.',
    list:['Подготовка проектной документации','Подача и сопровождение в администрации','Согласование с КГА и собственниками','Работа по Тосно и Ленинградской области'],
    meta:'Берём на себя весь документооборот'
  }
};

const modal=$('#svcModal');
const modalTitle=$('#svcModalTitle');
const modalNum=$('#svcModalNum');
const modalDesc=$('#svcModalDesc');
const modalList=$('#svcModalList');
const modalMeta=$('#svcModalMeta');
const modalOrder=$('#svcModalOrder');
let modalLastFocus=null;
let modalCurrentService='';

function openModal(card){
  if(!modal) return;
  const name=card.dataset.service;
  const data=SERVICES[name]||{desc:'',list:[],meta:''};
  modalCurrentService=name;
  modalLastFocus=card;
  if(modalNum) modalNum.textContent=card.querySelector('.svc-card__num')?.textContent||'';
  if(modalTitle) modalTitle.textContent=name;
  if(modalDesc) modalDesc.textContent=data.desc;
  if(modalList){
    modalList.innerHTML='';
    (data.list||[]).forEach(item=>{
      const li=document.createElement('li');
      li.textContent=item;
      modalList.appendChild(li);
    });
  }
  if(modalMeta) modalMeta.textContent=data.meta||'';
  modal.hidden=false;
  modal.setAttribute('aria-hidden','false');
  document.body.classList.add('modal-open');
  requestAnimationFrame(()=>modal.classList.add('open'));
  setTimeout(()=>$('.svc-modal__close',modal)?.focus(),50);
}

function closeModal(){
  if(!modal||modal.hidden) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden','true');
  document.body.classList.remove('modal-open');
  setTimeout(()=>{ modal.hidden=true; modalLastFocus?.focus(); },250);
}

$$('.svc-card[data-service]').forEach(card=>{
  card.addEventListener('click',()=>openModal(card));
  card.addEventListener('keydown',e=>{
    if(e.key==='Enter'||e.key===' '){
      e.preventDefault();
      openModal(card);
    }
  });
});

modal?.addEventListener('click',e=>{
  if(e.target.closest('[data-close]')) closeModal();
});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&modal&&!modal.hidden) closeModal();
});
modalOrder?.addEventListener('click',()=>{
  setService(modalCurrentService);
  closeModal();
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  setTimeout(()=>{
    if(smoothScrollToSection('заявка')){
      setTimeout(()=>$('#c-name')?.focus({preventScroll:true}), reduced?0:600);
    }
  },260);
});

// Form
const form=$('#contactForm');
const submitBtn=$('#submitBtn');
const formOk=$('#formOk');

function validate(field){
  const err=field.closest('.form-group')?.querySelector('.form-err')
         ?? field.closest('.form-check-row')?.querySelector('.form-err');
  let msg='';
  if(field.type==='checkbox'){msg=field.checked?'':'Необходимо согласие';}
  else if(!field.value.trim()){msg='Обязательное поле';}
  else if(field.type==='tel'&&field.value.replace(/\D/g,'').length<10){msg='Введите корректный номер';}
  field.classList.toggle('error',!!msg);
  if(err)err.textContent=msg;
  return!msg;
}

if(form){
  form.querySelectorAll('[required]').forEach(f=>{
    f.addEventListener('blur',()=>validate(f));
    f.addEventListener('input',()=>{if(f.classList.contains('error'))validate(f);});
  });
  form.addEventListener('submit',e=>{
    e.preventDefault();
    const ok=[...form.querySelectorAll('[required]')].every(f=>validate(f));
    if(!ok)return;
    const bt=submitBtn.querySelector('.btn-t');
    const bl=submitBtn.querySelector('.btn-l');
    submitBtn.disabled=true;
    if(bt)bt.hidden=true;
    if(bl){bl.hidden=false;bl.style.display='inline';}
    setTimeout(()=>{submitBtn.hidden=true;if(formOk)formOk.hidden=false;form.reset();setService('');},1400);
  });
}

// Phone mask
const ph=$('#c-phone');
if(ph){ph.addEventListener('input',function(){
  let v=this.value.replace(/\D/g,'');
  if(v.startsWith('8'))v='7'+v.slice(1);
  if(!v.startsWith('7'))v='7'+v;
  v=v.slice(0,11);
  let f='+7';
  if(v.length>1)f+=' ('+v.slice(1,4);
  if(v.length>=4)f+=') '+v.slice(4,7);
  if(v.length>=7)f+='-'+v.slice(7,9);
  if(v.length>=9)f+='-'+v.slice(9,11);
  this.value=f;
});}

// Active nav link
const sections=$$('section[id]');
const navEls=$$('.nav__link');
function hrefMatchesId(href,id){
  if(!href) return false;
  const raw=href.startsWith('#')?href.slice(1):href;
  try{ return raw===id||decodeURIComponent(raw)===id; }catch{ return raw===id; }
}
const secObs=new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      navEls.forEach(l=>l.classList.remove('active'));
      navEls.find(l=>hrefMatchesId(l.getAttribute('href'),e.target.id))?.classList.add('active');
    }
  });
},{rootMargin:'-30% 0px -60% 0px',threshold:0});
sections.forEach(s=>secObs.observe(s));
