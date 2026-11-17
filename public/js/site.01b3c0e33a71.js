(function(){
  var wa=document.querySelector('.wa-f'), scheduled=false;
  function showWhatsApp(){scheduled=false;if(wa)wa.classList.toggle('show',scrollY>500)}
  if(wa){addEventListener('scroll',function(){if(!scheduled){scheduled=true;requestAnimationFrame(showWhatsApp)}},{passive:true});showWhatsApp()}
  // Contact measurements deliberately contain only an event name and canonical page path.
  var allowed=new Set(['whatsapp_click','phone_click','email_click','primary_cta_click','enquiry_success']);
  function emit(name){if(!allowed.has(name))return;var canonical=document.querySelector('link[rel="canonical"]');var path=canonical?new URL(canonical.href).pathname:location.pathname;window.dispatchEvent(new CustomEvent('growledger:conversion',{detail:{name:name,path:path}}))}
  document.addEventListener('click',function(e){var a=e.target.closest('a[href]');if(!a)return;var href=a.getAttribute('href');if(href.startsWith('https://wa.me/'))emit('whatsapp_click');else if(href.startsWith('tel:'))emit('phone_click');else if(href.startsWith('mailto:'))emit('email_click');else if(href==='#contact'||href==='/#contact')emit('primary_cta_click')});
  window.addEventListener('growledger:enquiry-accepted',function(){emit('enquiry_success')});
})();
