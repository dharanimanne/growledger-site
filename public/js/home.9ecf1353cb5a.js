(function(){

  var grid=document.getElementById('cards'),showAll=false;
  function applyFilter(c){[].forEach.call(grid.children,function(card){card.hidden=!(c==='all'||card.getAttribute('data-cat')===c)||(c==='all'&&!showAll&&card.hasAttribute('data-extra'))});document.getElementById('ins-all').parentNode.hidden=(c!=='all'||showAll);}
  document.querySelector('.filters').hidden=false;
  document.querySelectorAll('.filters button').forEach(function(f){f.addEventListener('click',function(){document.querySelectorAll('.filters button').forEach(function(o){o.setAttribute('aria-pressed',o===f?'true':'false')});applyFilter(f.getAttribute('data-f'))})});
  document.getElementById('ins-all').addEventListener('click',function(){showAll=true;applyFilter('all')});applyFilter('all');
  // Preserve old shared article hashes without shipping article bodies on the homepage.
  var legacy=document.getElementById(location.hash.slice(1));if(legacy&&legacy.matches('a.card'))location.replace(legacy.href);
  /* All service content remains readable without JavaScript. */
  document.querySelector('.tabs').setAttribute('role','tablist');
  document.querySelectorAll('[data-tab-button]').forEach(function(t){t.setAttribute('role','tab')});
  document.querySelectorAll('[data-tab-panel]').forEach(function(p){p.setAttribute('role','tabpanel');p.hidden=p.id!=='p-st'});
  /* expertise tabs */
  var tabs=[].slice.call(document.querySelectorAll('.tabs [role="tab"]'));
  tabs.forEach(function(t){t.addEventListener('click',function(){tabs.forEach(function(o){var on=o===t;o.setAttribute('aria-selected',on?'true':'false');o.tabIndex=on?0:-1;document.getElementById(o.getAttribute('aria-controls')).hidden=!on;});});});

  tabs.forEach(function(t,i){t.tabIndex=i===0?0:-1;t.addEventListener('keydown',function(e){var next;if(e.key==='ArrowRight')next=(i+1)%tabs.length;else if(e.key==='ArrowLeft')next=(i+tabs.length-1)%tabs.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=tabs.length-1;else return;e.preventDefault();tabs[next].click();tabs[next].focus()})});
  [].forEach.call(document.querySelectorAll('[role=tabpanel]'),function(panel){panel.tabIndex=0});

  [].forEach.call(document.querySelectorAll('.sv[data-tab]'),function(a){a.addEventListener('click',function(){var t=document.getElementById(a.getAttribute('data-tab')); if(t) t.click();});});

  /* mobile menu */
  var D=document.getElementById('drawer'),mo=document.getElementById('menu-open');
  mo.addEventListener('click',function(){D.hidden=false;mo.setAttribute('aria-expanded','true');document.getElementById('menu-close').focus()});
  function closeD(){D.hidden=true;mo.setAttribute('aria-expanded','false');mo.focus()}
  document.getElementById('menu-close').addEventListener('click',closeD);
  [].forEach.call(D.querySelectorAll('a'),function(a){a.addEventListener('click',closeD)});

  D.addEventListener('keydown',function(e){if(e.key==='Escape'){closeD();return}if(e.key==='Tab'){var nodes=[].slice.call(D.querySelectorAll('button,a[href]')),first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});

  /* copy + contact form */
  function copyText(t,b,label){function done(){b.textContent='Copied';setTimeout(function(){b.textContent=label},1600)} try{navigator.clipboard.writeText(t).then(done,function(){b.textContent='Select to copy'})}catch(e){b.textContent='Select to copy'}}
  [].forEach.call(document.querySelectorAll('.copy'),function(b){b.addEventListener('click',function(){copyText(b.getAttribute('data-copy'),b,'Copy')})});
  var F=document.getElementById('cform'),msg='';
  function v(id){return (document.getElementById(id).value||'').trim()}
  function o(k,x){return x?'\n'+k+': '+x:''}
  F.addEventListener('submit',function(e){
    e.preventDefault(); var err=document.getElementById('c-err'),rd=document.getElementById('c-ready');
    if(!F.reportValidity()) return;
    if(!v('c-name')||!v('c-phone')||!v('c-who')){err.textContent='Please add your name, phone number and who you are.';rd.hidden=true;return;}
    err.textContent='';
    msg='Hello GrowLedger,\n\nName: '+v('c-name')+o('Company',v('c-co'))+'\nPhone: '+v('c-phone')+o('Email',v('c-email'))+'\nI am: '+v('c-who')+o('Need help with',v('c-need'))+o('Message',v('c-msg'));
    document.getElementById('c-wa').href='https://wa.me/918105853262?text='+encodeURIComponent(msg);
    document.getElementById('c-mail').href='mailto:info@growledger.com?subject='+encodeURIComponent('Enquiry from '+v('c-name'))+'&body='+encodeURIComponent(msg);
    if(v('c-hp')) return;
    var btn=document.getElementById('c-send'),sent=document.getElementById('c-sent');
    btn.disabled=true; btn.textContent='Sending…'; rd.hidden=true; sent.hidden=true;
    var data={name:v('c-name'),company:v('c-co'),phone:v('c-phone'),email:v('c-email'),i_am:v('c-who'),need_help_with:v('c-need'),message:v('c-msg'),_subject:'Website enquiry from '+v('c-name'),_template:'table',_captcha:'false'};
    var fail=function(){btn.disabled=false;btn.textContent='Send message';rd.hidden=false;};
    var controller=new AbortController(), timeout=setTimeout(function(){controller.abort()},15000);
    try{
      fetch('https://formsubmit.co/ajax/info@growledger.com',{signal:controller.signal,method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(data)})
      .then(function(r){return r.json().then(function(j){return {ok:r.ok,j:j}})})
      .then(function(x){if(x.ok&&String(x.j.success)==='true'){F.reset();btn.disabled=false;btn.textContent='Send message';sent.hidden=false;sent.focus();window.dispatchEvent(new Event('growledger:enquiry-accepted'));}else{fail();}})
      .catch(fail).finally(function(){clearTimeout(timeout)});
    }catch(e){clearTimeout(timeout);fail();}
  });
  var cc=document.getElementById('c-copy'); cc.addEventListener('click',function(){copyText(msg,cc,'Copy')});
})();
