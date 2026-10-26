(function(){
  var top=document.querySelector('.top'),mb=document.querySelector('.menu-btn');
  function setMenu(open){top.classList.toggle('open',open);mb.setAttribute('aria-expanded',String(open));mb.textContent=open?'Close':'Menu'}
  mb.addEventListener('click',function(){setMenu(!top.classList.contains('open'))});
  [].forEach.call(document.querySelectorAll('.mnav a'),function(a){a.addEventListener('click',function(){setMenu(false)})});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&top.classList.contains('open')){setMenu(false);mb.focus()}});
  document.getElementById('yr').textContent=new Date().getFullYear();

  function copyText(t,b,label){
    function done(){b.textContent='Copied';setTimeout(function(){b.textContent=label},1600)}
    try{navigator.clipboard.writeText(t).then(done,function(){b.textContent='Select to copy'})}catch(e){b.textContent='Select to copy'}
  }
  [].forEach.call(document.querySelectorAll('.copy'),function(b){
    b.addEventListener('click',function(){copyText(b.getAttribute('data-copy'),b,'Copy')});
  });
  var f=document.getElementById('join-form'),msg='';
  function v(id){return (document.getElementById(id).value||'').trim()}
  function o(k,x){return x?'\n'+k+': '+x:''}
  f.addEventListener('submit',function(e){
    e.preventDefault();
    var err=document.getElementById('j-err'),ready=document.getElementById('j-ready');
    if(!v('j-name')||!v('j-role')||!v('j-city')||!v('j-phone')){
      err.textContent='Please add your name, qualification, city and phone number.';ready.hidden=true;return;
    }
    if(v('j-email')&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v('j-email'))){
      err.textContent='Please check your email address.';ready.hidden=true;return;
    }
    err.textContent='';
    msg='Application to GrowLedger Advisors\n\nName: '+v('j-name')+o('Firm',v('j-firm'))+'\nQualification: '+v('j-role')+o('Experience',v('j-exp'))+o('Practice area',v('j-grow'))+'\nCity: '+v('j-city')+'\nPhone: '+v('j-phone')+o('Email',v('j-email'))+o('LinkedIn',v('j-link'));
    document.getElementById('j-wa').href='https://wa.me/918105853262?text='+encodeURIComponent(msg);
    document.getElementById('j-mail').href='mailto:info@growledger.com?subject='+encodeURIComponent('Application: '+v('j-name'))+'&body='+encodeURIComponent(msg);
    ready.hidden=false;
  });
  var cb=document.getElementById('j-copy');
  cb.addEventListener('click',function(){copyText(msg,cb,'Copy')});
})();
