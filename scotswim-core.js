// Pure helpers lifted out of ScotSwim.dc.html: formatting, date maths,
// chart ticks, and the error-message tables. Nothing here reads component
// state, the DOM, or Firestore — every one takes arguments and returns a
// value, which is exactly why they could leave the component at all.
//
// The component keeps methods of the same names that delegate here, so
// call sites everywhere else are unchanged.
(function (root) {
  const ScotSwimCore = {
  fmt(t){if(t>=60){const m=Math.floor(t/60);const s=t-m*60;return m+':'+s.toFixed(2).padStart(5,'0')}return t.toFixed(2)},
  ptsOf(s){
    // Real SwimCloud season points (2025-26)
    const R={'Andrew Barrett':494.15,'Cody Benkovsky':496.25,'Rayane Debbarh':273.45,
      'Ryan Fowler':452.55,'Brett Gaff':381.10,'Anthony Kulka':415.95,'Colin Moran':552.20,
      'Noah Newman':452.20,'Max Nielsen':469.00,'Colton Ralko':433.85,'Morrison Wood':474.20,
      'Zoe Barringer':460.00,'Anya Drewnicki':371.35,'Sofia Floros':493.85,'Marie Halligan':320.85,
      'Aubrey Hawks':373.60,'Emma Hoy':466.60,'Katelyn Lamphere':378.90,'Grace Ludema':558.20,'Isabel Lyshol':213.00,
      'Maddie McGuire':180.65,'Sarah Rabbideau':478.25,'Heidi Ragainis':394.75,'Sierra Scott':483.45,
      'Abi Spitzley':448.85,'Hannah Sullivan':492.85,'Valerie Vinci':441.15,'Delilah Zingelewicz':506.00};
    return R[s.id]??null;
  },
  teamProgressionOf(gender){
    const seasons=['2016-2017','2017-2018','2018-2019','2019-2020','2020-2021','2021-2022','2022-2023','2023-2024','2024-2025','2025-2026'];
    const shorts=['16-17','17-18','18-19','19-20','20-21','21-22','22-23','23-24','24-25','25-26'];
    const men=[332,430,478,464,496,488,524,520,502,532];
    const women=[471,467,525,502,493,505,520,528,506,500];
    const pts=gender==='W'?women:men;
    return seasons.map((season,i)=>({season,short:shorts[i],pts:pts[i]}));
  },
  // Is this scheduled session a lift? The LIFT tag is the intended
  // marker, but coaches routinely put lifts on the schedule under
  // another tag — "Team Lift in Sherm" tagged DRY, say — and then the
  // athletes get no Mark done button and their lift count stays at 0.
  // So the session's name counts as well: any standalone "lift" word
  // ("Lift — team", "Team lift in Sherman", "Lifting", "Lifts") makes it
  // a lift regardless of tag. \b before the l keeps "uplifting" out, and
  // the optional suffixes stop short of "deadlift"/"lift-off" since the
  // \b at the front already requires lift to start the word.
  isLiftSession(s){
    if(!s)return false;
    if(String(s.tag||'').trim().toUpperCase()==='LIFT')return true;
    return /\blift(s|ed|ing)?\b/i.test(String(s.n||''));
  },
  // What a coach changed when they tapped Done on a meet lineup, so the
  // notification can say it ("added 2 pics", "updated the note") instead
  // of a generic "updated the lineup". A lineup is {pics:[img], pdf:
  // {name,pages:[img]}|null, notes}. before is null for a first post.
  // Pics are compared by content, so a reorder shows up as a change to
  // the pics without being mistaken for adding or removing any.
  lineupChange(before,after){
    const first=!before;
    const b=before||{pics:[],pdf:null,notes:''},a=after||{pics:[],pdf:null,notes:''};
    const bp=b.pics||[],ap=a.pics||[];
    const picsAdded=ap.filter(x=>!bp.includes(x)).length;
    const picsRemoved=bp.filter(x=>!ap.includes(x)).length;
    const reordered=!picsAdded&&!picsRemoved&&bp.some((x,i)=>x!==ap[i]);
    const pics=picsAdded&&!picsRemoved?'added':picsRemoved&&!picsAdded?'removed'
      :(picsAdded||picsRemoved||reordered)?'updated':null;
    const hasPdf=p=>!!(p&&p.pages&&p.pages.length);
    const pb=hasPdf(b.pdf)?b.pdf:null,pa=hasPdf(a.pdf)?a.pdf:null;
    const pdf=!pb&&pa?'added':pb&&!pa?'removed'
      :pb&&pa&&(pb.name!==pa.name||pb.pages.length!==pa.pages.length||pb.pages.some((x,i)=>x!==pa.pages[i]))?'replaced':null;
    const nb=(b.notes||'').trim(),na=(a.notes||'').trim();
    const note=!nb&&na?'added':nb&&!na?'removed':nb!==na?'updated':null;
    const empty=!ap.length&&!pa&&!na;
    return {first,pics,picsAdded,picsRemoved,pdf,note,empty,changed:first||!!(pics||pdf||note)};
  },
  lineupChangeMessage(ch,who,meet){
    if(!ch||!ch.changed)return null;
    const L=' the lineup for '+meet;
    if(ch.first)return who+' posted'+L;
    const n=x=>x===1?'a pic':x+' pics';
    const join=l=>l.length===2?l.join(' and '):l.slice(0,-1).join(', ')+' and '+l[l.length-1];
    const kinds=['pics','pdf','note'].filter(k=>ch[k]);
    if(kinds.length>1){
      // When every change is the same kind, say which: "removed the PDF
      // and the note" is more use to an athlete than "updated" them.
      const verbs=new Set(kinds.map(k=>ch[k]));
      if(verbs.size===1&&verbs.has('removed'))
        return who+' removed '+join(kinds.map(k=>k==='pics'?n(ch.picsRemoved):k==='pdf'?'the PDF':'the note'))+' from'+L;
      if(verbs.size===1&&verbs.has('added'))
        return who+' added '+join(kinds.map(k=>k==='pics'?n(ch.picsAdded):k==='pdf'?'a PDF':'a note'))+' to'+L;
      return who+' updated '+join(kinds.map(k=>k==='pics'?'the pics':k==='pdf'?'the PDF':'the note'))+' on'+L;
    }
    const say={
      pics:{added:'added '+n(ch.picsAdded)+' to',removed:'removed '+n(ch.picsRemoved)+' from',updated:'updated the pics on'},
      pdf:{added:'added a PDF to',replaced:'replaced the PDF on',removed:'removed the PDF from'},
      note:{added:'added a note to',updated:'updated the note on',removed:'removed the note from'},
    };
    for(const k of ['pics','pdf','note'])if(ch[k])return who+' '+say[k][ch[k]]+L;
    return null;
  },
  // Full posted-at stamp for an announcement — day of week, exact date and
  // time, not just "Sep 23". A coach may post more than one thing in a
  // day, and athletes reading it later want to know how recent it is.
  fmtAnnDate(ms){
    const d=new Date(ms);
    const day=d.toLocaleDateString('en-US',{weekday:'short'});
    const date=d.toLocaleDateString('en-US',{month:'short',day:'numeric'});
    const time=d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});
    return day+', '+date+' · '+time;
  },
  // The coach's target time/height for an event, from the athlete's
  // current personal best plus whatever adjustment ("delta") the coach
  // dialed in — the same formula the goal-progress bar uses (mkGoals +
  // goalOf in the app), factored out here so a before/after comparison
  // (did this edit just cross the goal?) can call it with an explicit pb
  // rather than the live, already-mutated roster object.
  goalTarget(pb,delta,isDive){
    const baseline=isDive?Math.round(pb*1.05*10)/10:Math.round(pb*(pb<60?0.988:0.991)*100)/100;
    return Math.round(baseline*2)/2+(delta||0);
  },
  // Whether a personal best of `pb` meets a `target` — lower is better for
  // swimming, higher for diving.
  goalReached(pb,target,isDive){
    return isDive?pb>=target:pb<=target;
  },
  // Whether `newBest` is a genuine improvement on `prevBest` — null/undefined
  // on either side means there was nothing to compare (a brand new event
  // with no prior record isn't "beating" anything).
  isNewPB(prevBest,newBest,isDive){
    if(prevBest==null||newBest==null)return false;
    return isDive?newBest>prevBest:newBest<prevBest;
  },
  meetDateParts(startISO,endISO){
    const MON=['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
    const WD=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const cap=s=>s[0]+s.slice(1).toLowerCase();
    const parse=iso=>{const [y,mo,d]=iso.split('-').map(Number);return new Date(y,mo-1,d)};
    const s=parse(startISO);
    const d1=MON[s.getMonth()];
    if(!endISO||endISO===startISO){
      return {d1,d2:String(s.getDate()),d:WD[s.getDay()]+', '+cap(d1)+' '+s.getDate()+', '+s.getFullYear()};
    }
    const e=parse(endISO);
    const sameMonth=s.getMonth()===e.getMonth()&&s.getFullYear()===e.getFullYear();
    if(sameMonth){
      return {d1,d2:s.getDate()+'–'+e.getDate(),d:cap(d1)+' '+s.getDate()+'–'+e.getDate()+', '+s.getFullYear()};
    }
    const eMon=MON[e.getMonth()];
    return {d1,d2:String(s.getDate()),d:cap(d1)+' '+s.getDate()+' – '+cap(eMon)+' '+e.getDate()+', '+e.getFullYear()};
  },
  fmtDuration(totalMin){
    const m=Math.round(totalMin);
    if(m<=0)return '0m';
    const h=Math.floor(m/60),rem=m%60;
    return h>0?(h+'h '+rem+'m'):(rem+'m');
  },
  niceTicks(min,max,targetCount,forceStep){
    const range=(max-min)||1;
    let niceStep;
    if(forceStep){
      niceStep=forceStep;
    }else{
      const rawStep=range/targetCount;
      const magnitude=Math.pow(10,Math.floor(Math.log10(rawStep)));
      const norm=rawStep/magnitude;
      niceStep=(norm<=1?1:norm<=2?2:norm<=2.5?2.5:norm<=5?5:10)*magnitude;
    }
    const niceMin=Math.floor(min/niceStep)*niceStep;
    const niceMax=Math.ceil(max/niceStep)*niceStep;
    const ticks=[];
    for(let v=niceMin;v<=niceMax+niceStep*0.001;v+=niceStep)ticks.push(Math.round(v*1000)/1000);
    return ticks;
  },
  ymd(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')},
  attStateOf(v){
    if(v==='excused')return 'excused';
    if(v===false||v==='unexcused')return 'unexcused';
    return 'present';
  },
  parseEntryDate(raw){
    const s=(raw||'').trim();if(!s)return null;
    let m;
    if((m=s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/))){
      let yr=m[3];yr=yr.length===2?'20'+yr:yr;
      const d=new Date(+yr,+m[1]-1,+m[2]);
      return isNaN(d.getTime())?null:d;
    }
    if((m=s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/))){
      const d=new Date(+m[1],+m[2]-1,+m[3]);
      return isNaN(d.getTime())?null:d;
    }
    // Falls back to the browser's own date parser for anything typed (or
    // auto-filled) in a recognizable but non-slash form — a phone
    // keyboard's date-suggestion chip inserts text like "Oct 25, 2025"
    // instead of the mm/dd/yyyy the placeholder asks for, and the strict
    // patterns above don't match that, which was silently leaving the
    // progression chart's x-axis blank for anyone who typed a date that
    // way instead of with slashes.
    const fallback=new Date(s);
    return isNaN(fallback.getTime())?null:fallback;
  },
  fmtEntryDate(d){
    return String(d.getMonth()+1).padStart(2,'0')+'/'+String(d.getDate()).padStart(2,'0')+'/'+d.getFullYear();
  },
  fmtEntryDateParts(d){
    const MO=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return [MO[d.getMonth()]+' '+d.getDate()+',',String(d.getFullYear())];
  },
  seasonStartYear(dateObj){
    const mo=dateObj.getMonth();
    return mo>=7?dateObj.getFullYear():dateObj.getFullYear()-1;
  },
  fmtImp(s,imp){
    const pct=(s.diver?imp.frac:-imp.frac)*100;
    return (pct>=0?'+':'−')+Math.abs(pct).toFixed(1)+'%';
  },
  isTransient(code){
    return ['unavailable','deadline-exceeded','internal','resource-exhausted','aborted','cancelled',
      'auth/network-request-failed','auth/internal-error','auth/timeout'].indexOf(code)>=0;
  },
  agoLabel(ts){
    const mins=Math.floor((Date.now()-ts)/60000);
    if(mins<1)return 'just now';
    if(mins<60)return mins+'m ago';
    const hrs=Math.floor(mins/60);
    if(hrs<24)return hrs+'h ago';
    const days=Math.floor(hrs/24);
    if(days===1)return 'yesterday';
    if(days<7)return days+'d ago';
    return new Date(ts).toLocaleDateString(undefined,{month:'short',day:'numeric'});
  },
  authErrMsg(err){
    const m={'auth/invalid-email':"That email doesn't look right.",'auth/user-not-found':'No account found for that email.','auth/wrong-password':'Wrong password.','auth/invalid-credential':'Email or password is incorrect.','auth/invalid-login-credentials':'Email or password is incorrect.','auth/too-many-requests':'Too many attempts — try again in a bit.','auth/email-already-in-use':'An account already exists for that email — try signing in instead.','auth/weak-password':'Password needs to be at least 6 characters.',
      // Without these, a dropped connection fell through to the generic
      // message below, which reads as "your password is wrong" when the
      // credentials were fine all along.
      'auth/network-request-failed':'No connection — check your internet and try again.',
      'auth/timeout':'That took too long — check your connection and try again.',
      'auth/internal-error':'Sign-in is having trouble right now — try again in a moment.',
      'auth/user-disabled':'That account has been turned off — ask your coach.',
      'unavailable':'No connection — check your internet and try again.',
      'deadline-exceeded':'That took too long — check your connection and try again.',
      'permission-denied':'That account isn’t set up to sign in — ask your coach.'};
    return m[err&&err.code]||'Something went wrong — try again.';
  }
  };
  // Browser: attaches to window (globalThis is window there), which is how
  // the component reaches it. Node: also exported, so these can be tested
  // directly without booting the app in a browser.
  root.ScotSwimCore = ScotSwimCore;
  if (typeof module !== 'undefined' && module.exports) module.exports = ScotSwimCore;
})(typeof globalThis !== 'undefined' ? globalThis : window);
