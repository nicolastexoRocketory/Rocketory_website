/** Inline in <head> — runs before hero video can autoplay in WhatsApp/IG WebViews. */
export const IN_APP_GUARD_HEAD_SCRIPT = `(function(){
  var ua=navigator.userAgent||'';
  var ref=document.referrer||'';
  var inApp=/WhatsApp\\/|FBAN|FBAV|FB_IAB|Instagram|Line\\/|Twitter|LinkedInApp|Snapchat|Pinterest|TikTok|BytedanceWebview|MicroMessenger|GSA\\//i.test(ua)
    ||/;\\s*wv\\)/i.test(ua)
    ||/whatsapp|instagram|facebook|fb\\.com/i.test(ref);
  if(!inApp)return;
  document.documentElement.classList.add('is-in-app-browser');
  function stripHeroVideos(){
    document.querySelectorAll('.rk-hero').forEach(function(hero){
      hero.classList.add('rk-hero--static-bg');
      var video=hero.querySelector('video.rk-hero-video');
      if(!video)return;
      video.pause();
      video.removeAttribute('autoplay');
      video.removeAttribute('src');
      video.querySelectorAll('source').forEach(function(s){s.removeAttribute('src');});
      try{video.load();}catch(e){}
    });
    document.querySelectorAll('.rk-home-bento-cell--video').forEach(function(cell){
      cell.classList.add('rk-home-bento--static-bg');
      var video=cell.querySelector('video.rk-home-bento-video');
      if(!video)return;
      video.pause();
      video.removeAttribute('autoplay');
      video.removeAttribute('src');
      video.querySelectorAll('source').forEach(function(s){s.removeAttribute('src');});
      try{video.load();}catch(e){}
    });
  }
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',stripHeroVideos,{once:true});
  }else{
    stripHeroVideos();
  }
})();`

export const IN_APP_UA_RE =
  /WhatsApp\/|FBAN|FBAV|FB_IAB|Instagram|Line\/|Twitter|LinkedInApp|Snapchat|Pinterest|TikTok|BytedanceWebview|MicroMessenger|GSA\/|; wv\)/i
