'use strict';
// Place i_forensic001.png through i_forensic013.png beside index.html.
const filenames = Array.from({length:13}, (_, i) => `i_forensic${String(i + 1).padStart(3, '0')}.png`);
const gallery = document.querySelector('.gallery');
const slides = document.querySelector('.slides');
const pause = document.querySelector('#pause');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let photos = [], current = 0, timer, playing = !reducedMotion.matches;
function stop(){ clearInterval(timer); }
function schedule(){stop();if(playing && !document.hidden && photos.length>1) timer=setInterval(()=>show(current+1),5500);}
function show(index){current=(index+photos.length)%photos.length;slides.replaceChildren(photos[current]);document.querySelector('#counter').textContent=`${String(current+1).padStart(2,'0')} / ${String(photos.length).padStart(2,'0')}`;}
function updatePause(){pause.textContent=playing?'Ⅱ':'▶';pause.setAttribute('aria-label',playing?'Pause slideshow':'Play slideshow');schedule();}
Promise.all(filenames.map((src,i)=>new Promise(resolve=>{const img=new Image();img.alt=`Forensic Science photograph ${i+1}`;img.onload=()=>resolve(img);img.onerror=()=>resolve(null);img.src=src;}))).then(images=>{photos=images.filter(Boolean);if(!photos.length)return;gallery.hidden=false;show(0);document.querySelector('#prev').onclick=()=>{show(current-1);schedule();};document.querySelector('#next').onclick=()=>{show(current+1);schedule();};pause.onclick=()=>{playing=!playing;updatePause();};gallery.addEventListener('mouseenter',stop);gallery.addEventListener('mouseleave',schedule);gallery.addEventListener('focusin',stop);gallery.addEventListener('focusout',e=>{if(!gallery.contains(e.relatedTarget))schedule();});document.addEventListener('visibilitychange',schedule);reducedMotion.addEventListener('change',e=>{playing=!e.matches;updatePause();});updatePause();});
