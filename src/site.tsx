import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "./supabase";
import { useSeo } from "./useSeo";
import { Aperture, ArrowLeft, Award, BadgeCheck, BadgePercent, Banknote, BookOpen, BriefcaseBusiness, Building2, Calendar, CalendarDays, Camera, ChartNoAxesCombined, ChartPie, Check, ChevronLeft, ChevronRight, CircleAlert, CircleCheckBig, Circle as CircleHelp, Clock3, CreditCard, Crown, Eye, Factory, Feather, FileImage, FileText, FileUp, Gem, Gift, Globe as Globe2, GraduationCap, HandHeart, Handshake, Headphones, HeartHandshake, HeartPulse, Landmark, LayoutDashboard, LayoutGrid, LibraryBig, Lightbulb, Menu, Megaphone, MonitorCheck, Music2, Network, Newspaper, MessageCircle, Info, LockKeyhole, Mail, MapPin, Paperclip, Percent, Phone, QrCode, ReceiptText, Palette, Pill, CirclePlay as PlayCircle, RefreshCw, ScanFace, Search, Settings2, Share2, Shield, ShieldCheck, Stethoscope, Send, ShoppingCart, Sparkles, Sprout, Store, Tags, Target, TrendingUp, Trophy, Truck, Upload, UserCheck, UserPlus, UserRound, UsersRound, Video, WalletCards, X } from "lucide-react";

type InternalKey = "services" | "initiatives" | "news" | "library";
type PageKey = "home" | "about" | "social" | "education" | "health" | "investment" | "culture" | InternalKey | "membership" | "register" | "photo" | "payment" | "success" | "contact" | "events" | "news-detail" | "events-detail" | "inv-sector" | "inv-opportunity" | "culture-event-detail" | "culture-news-detail" | "culture-artist-detail" | "culture-initiative-detail" | "culture-media-detail" | "culture-art-detail" | "culture-association-detail" | "social-initiative-detail" | "social-service-detail";
type PortalKey = "social" | "education" | "health" | "investment" | "culture";

const MARKET_URL="https://sudan-market.com/";
const TRAINING_URL="https://ebhar-dvvm.bolt.host/";

const routeMap: Record<string, PageKey> = {
  home:"home", about:"about", social:"social", education:"education", health:"health", investment:"investment", culture:"culture",
  services:"services", initiatives:"initiatives", news:"news", library:"library",
  membership:"membership", register:"register", photo:"photo", payment:"payment", success:"success", contact:"contact",
  events:"events", "news-detail":"news-detail", "events-detail":"events-detail",
  "culture-event-detail":"culture-event-detail","culture-news-detail":"culture-news-detail",
  "culture-artist-detail":"culture-artist-detail","culture-initiative-detail":"culture-initiative-detail",
  "culture-media-detail":"culture-media-detail",
  "culture-art-detail":"culture-art-detail",
  "culture-association-detail":"culture-association-detail",
  "inv-sector":"inv-sector", "inv-opportunity":"inv-opportunity",
  "social-initiative-detail":"social-initiative-detail",
  "social-service-detail":"social-service-detail",
};

const nav = [["/","الرئيسية"],["/about","عن الرابطة"],["/social","الخدمات"],["/investment","المبادرات"],["/culture","الثقافة"],["/education","التعليم"],["/contact","تواصل معنا"]];
const homeNav = [["/","الرئيسية"],["/about","عن الرابطة"],["/education","التعليم"],["/health","الصحة"],["/social","الاجتماعية"],["/culture","الثقافية"],[MARKET_URL,"السوق السوداني"],["/investment","الاستثمار"],["/news","الأخبار"],["/events","الفعاليات"],["/contact","تواصل معنا"]];
const socialNav = [["/","الرئيسية"],["/about","عن الرابطة"],["/social","الخدمات"],["/investment","المبادرات"],["/culture","الأخبار والفعاليات"],["/education","المكتبة الرقمية"],["/contact","تواصل معنا"]];

const info: Record<PortalKey, {title:string; accent:string; lead:string; hero:string; icon:string; tabs:string[]; stats:[string,string][]; cards:{title:string;text:string;image?:string;icon:string}[]; section:string}> = {
  social:{title:"الخدمات الاجتماعية",accent:"معاً.. نرعى ونساند",lead:"نقدم برامج ومبادرات اجتماعية وإنسانية تهدف إلى دعم أبناء مجتمعنا في مختلف الظروف، لبناء مجتمع متماسك ومتكافل.",hero:"/assets/social-hero-hq.webp",icon:"♡",tabs:["حالات إنسانية","تواصل مباشر","استشارة اجتماعية","برامج ومبادرات","دعم المحتاجين"],stats:[["12,680+","مستفيد من خدماتنا"],["3,250+","أسرة مستفيدة"],["1,850+","حالة إنسانية"],["650+","فرصة دعم"]],section:"مبادراتنا الحالية",cards:[{title:"صندوق العلاج",text:"مساعدة المرضى في تغطية تكاليف العلاج والأدوية",image:"/assets/social-medical-hq.webp",icon:"✚"},{title:"مشروع ترميم المنازل",text:"ترميم المنازل المتضررة وتحسين بيئة السكن",image:"/assets/social-renovation-hq.webp",icon:"⌂"},{title:"دعم التعليم",text:"دعم الرسوم والاحتياجات التعليمية لأبناء الأسر",image:"/assets/social-education-hq.webp",icon:"✦"},{title:"سلة الخير الرمضانية",text:"توزيع سلات غذائية على الأسر المحتاجة",image:"/assets/social-basket-hq.webp",icon:"♡"}]},
  education:{title:"التعليم",accent:"استثمار في المستقبل",lead:"نقدم بيئة تعليمية رقمية متكاملة تدعم الطلاب والمعلمين، وتوفر محتوى تعليمياً متطوراً لتلبية احتياجات التعليم في مكان وزمان يناسب الجميع.",hero:"/assets/education-hero-hq.webp",icon:"▣",tabs:["مدرسة نهر النيل الإلكترونية","الدورات وكورسات التقوية","المنح الدراسية","المكتبة الرقمية","الاختبارات والامتحانات","النتائج والتقارير","الاستشارات التعليمية","الأخبار والفعاليات التعليمية"],stats:[["12,680","طالب وطالبة"],["65","معلماً ومعلمة"],["156","مادة افتراضية"],["420","دورة تدريبية"]],section:"الدورات وكورسات التقوية",cards:[{title:"إدارة المشاريع",text:"دورة عملية لتطوير المهارات الإدارية",image:"/assets/course-project-hq.webp",icon:"◫"},{title:"اللغة الإنجليزية",text:"مسار متدرج لجميع المستويات",image:"/assets/course-english-hq.webp",icon:"A"},{title:"تصميم الجرافيك",text:"أساسيات التصميم للمهتمين",image:"/assets/course-design-hq.webp",icon:"✎"},{title:"أساسيات البرمجة للمبتدئين",text:"مدخل عملي للعالم الرقمي",image:"/assets/course-code-hq.webp",icon:"⌘"}]},
  health:{title:"الصحة",accent:"معاً من أجل صحة أفضل",lead:"خدمات صحية متكاملة لأبناء ولاية نهر النيل في الداخل والخارج، برعاية رابطة الولاية الرقمية.",hero:"/assets/health-hero-hq.webp",icon:"✚",tabs:["الاستشارات الطبية","العيادة الإلكترونية","التأمين الطبي","الصيدلية الخيرية","طلب المساعدة والتواصل مع الرابطة"],stats:[["24/7","خدمة مستمرة"],["40+","طبيب معتمد"],["12","تخصصاً طبياً"],["98%","رضا المستفيدين"]],section:"خدماتنا الصحية",cards:[{title:"الاستشارات الطبية",text:"استشارات مع نخبة من الأطباء في مختلف التخصصات",image:"/assets/health-consult-hq.webp",icon:"☏"},{title:"العيادة الإلكترونية",text:"استشر الطبيب المناسب عبر الإنترنت من أي مكان",image:"/assets/health-clinic-hq.webp",icon:"▣"},{title:"التأمين الطبي",text:"باقات تأمين ميسرة لأعضاء الرابطة وأسرهم",image:"/assets/health-insurance-hq.webp",icon:"♢"},{title:"الصيدلية الخيرية",text:"توفير الأدوية للمحتاجين بأسعار رمزية",image:"/assets/health-pharmacy-hq.webp",icon:"✚"}]},
  investment:{title:"الاستثمار في ولاية نهر النيل",accent:"فرص واعدة.. مستقبل مستدام",lead:"بيئة استثمارية جاذبة بموارد طبيعية غنية وموقع استراتيجي يدعم التنمية ويحقق عوائد مجزية للمستثمرين.",hero:"/assets/investment-hero-hq.webp",icon:"↗",tabs:["فرص الاستثمار","القطاعات الاستثمارية","الحوافز والتسهيلات","دليل المستثمر","قصص نجاح"],stats:[["2.9 مليون+","هكتار زراعي"],["500 ألف","هكتار مروي"],["11+","مجمعات صناعية"],["850 كم","من نهر النيل"]],section:"القطاعات الاستثمارية",cards:[{title:"السياحة والضيافة",text:"مواقع أثرية وطبيعية وفنادق ومنتجعات",image:"/assets/invest-tourism-hq.webp",icon:"⌁"},{title:"التعدين والمحاجر",text:"ذهب ومعادن ومحاجر متنوعة",image:"/assets/invest-mining-hq.webp",icon:"◆"},{title:"الصناعة التحويلية",text:"مواد غذائية وصناعات هندسية",image:"/assets/invest-industry-hq.webp",icon:"▦"},{title:"الثروة الحيوانية",text:"ثروة حيوانية ومشروعات متكاملة",image:"/assets/invest-livestock-hq.webp",icon:"♧"}]},
  culture:{title:"الثقافة",accent:"هوية وإبداع.. نصون تراثنا ونبدع لمستقبلنا",lead:"منصة ثقافية رقمية شاملة تهدف إلى إبراز التراث السوداني الأصيل ودعم المواهب والإبداع في جميع المجالات الثقافية والفنية.",hero:"/assets/culture-hero-hq.webp",icon:"◈",tabs:["الفعاليات والأنشطة","الأخبار الثقافية","المكتبة الرقمية","الفنون والأدب","التراث والتاريخ"],stats:[["35","فرقة وجمعية"],["650+","عضو فني"],["120","مبادرة ثقافية"],["85","فعالية ثقافية"]],section:"الفعاليات والأنشطة الثقافية",cards:[{title:"ندوة دور الثقافة",text:"ندوة حول الثقافة في بناء المجتمع",image:"/assets/culture-seminar-hq.webp",icon:"♙"},{title:"معرض الفنون",text:"معرض الفنون التشكيلية السنوي",image:"/assets/culture-gallery-hq.webp",icon:"▥"},{title:"أمسية شعرية",text:"أمسية للشعراء والشباب",image:"/assets/culture-poetry-hq.webp",icon:"♩"},{title:"مهرجان تراث النيل",text:"مهرجان تراثي يحتفي بالهوية",image:"/assets/culture-folk-hq.webp",icon:"◈"}]},
};

function Brand({light=false}:{light?:boolean}){return <a href="/" className={`brand ${light?"light":""}`} aria-label="رابطة ولاية نهر النيل الرقمية"><img src="/assets/ChatGPT_Image_Jul_21,_2026,_05_25_20_PM.png" alt="رابطة ولاية نهر النيل الرقمية"/></a>}

function Header({active}:{active:PageKey}){
  const [open,setOpen]=useState(false);
  return <header className="topbar dark home-topbar"><div className="topbar-inner"><Brand light/><nav className={open?"open":""}>{homeNav.map(([href,label])=>{const external=href.startsWith("http");return <a key={`${href}-${label}`} href={href} target={external?"_blank":undefined} rel={external?"noopener noreferrer":undefined} className={(href==="/"&&active==="home")||(href.startsWith("/")&&href.slice(1)===active)?"current":""}>{label}{external&&<span className="external-mark" aria-hidden>↗</span>}</a>})}</nav><div className="header-tools"><button className="search-btn" aria-label="البحث"><Search size={19}/></button><div className="hdr-panel-btns"><a className="hdr-panel-btn admin" href="/admin"><Settings2 size={15}/><span>لوحة التحكم</span></a><a className="hdr-panel-btn portal" href="/portal"><UserRound size={15}/><span>لوحة المستخدم</span></a></div><a className="primary compact" href="/membership"><UserRound size={16}/><span>انضم الآن</span></a><button className="mobile-menu" onClick={()=>setOpen(!open)} aria-label="فتح القائمة">{open?<X size={21}/>:<Menu size={21}/>}</button></div></div></header>
}

function Footer(){return <footer className="site-footer"><div className="footer-inner"><div className="footer-brand"><Brand light/><p>منصة رقمية شاملة لخدمة أبناء ولاية نهر النيل في الداخل والخارج.</p></div><div><h4>تواصل معنا</h4><p>☎ +249 912 345 678</p><p>✉ info@nilenile.org</p><p>⌖ ولاية نهر النيل - السودان</p></div><div><h4>الدعم والمساعدة</h4><a href="/contact">الأسئلة الشائعة</a><a href="/contact">سياسة الخصوصية</a><a href="/contact">الشروط والأحكام</a><a href="/news">الأخبار والفعاليات</a></div><div><h4>خدمات الرابطة</h4><a href="/services">جميع الخدمات</a><a href="/education">التعليم</a><a href="/health">الصحة</a><a href="/investment">الاستثمار</a><a href="/culture">الثقافة</a></div><div><h4>روابط سريعة</h4><a href="/">الرئيسية</a><a href="/about">عن الرابطة</a><a href="/initiatives">المبادرات</a><a href="/library">المكتبة الرقمية</a><a href={TRAINING_URL} target="_blank" rel="noopener noreferrer">مركز التدريب ↗</a><a href={MARKET_URL} target="_blank" rel="noopener noreferrer">السوق السوداني ↗</a></div></div><div className="footer-bottom"><span>جميع الحقوق محفوظة © 2026</span><span className="socials"><b>f</b><b>𝕏</b><b>▶</b><b>◎</b><b>in</b></span></div></footer>}

function Motion(){
  useEffect(()=>{
    const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const main=document.querySelector("main");
    if(!main)return;
    const about=main.querySelector(".about-redesign");
    const sections=Array.from(main.querySelectorAll<HTMLElement>("section")).filter(section=>!section.closest(".about-redesign"));
    const items=Array.from(main.querySelectorAll<HTMLElement>(".motion")).filter(item=>!item.closest(".about-redesign"));
    if(about&&sections.length===0&&items.length===0)return;
    const hero=sections[0];
    const heroImage=hero?.querySelector<HTMLElement>("img");
    const heroParts=hero?Array.from(hero.children).filter((child):child is HTMLElement=>child instanceof HTMLElement):[];
    const heroText=hero?Array.from(hero.querySelectorAll<HTMLElement>("h1,h2,h3,p,blockquote,.home-eyebrow")).filter(node=>node.closest("section")===hero):[];
    const largeMedia=Array.from(main.querySelectorAll<HTMLImageElement>("section img")).filter(image=>{
      if(image.closest(".about-redesign")||image.closest("section")===hero)return false;
      const rect=image.getBoundingClientRect();
      return rect.width>210&&rect.height>115;
    });
    const settleTimers:number[]=[];

    main.classList.add("site-motion-ready");
    sections.forEach((section,index)=>{
      section.classList.add(index===0?"site-hero-motion":"site-section-motion");
      section.style.setProperty("--site-shift",`${index%2===0?52:-52}px`);
    });
    items.forEach((item,index)=>{
      const rect=item.getBoundingClientRect();
      const center=rect.left+rect.width/2;
      const direction=Math.abs(center-window.innerWidth/2)<window.innerWidth*.12?(index%2===0?-1:1):(center<window.innerWidth/2?-1:1);
      item.classList.add("site-directional");
      item.style.setProperty("--site-item-x",`${direction*72}px`);
      item.style.setProperty("--site-item-delay",`${Math.min(index%4,3)*.07}s`);
    });
    heroParts.forEach((part,index)=>{
      const rect=part.getBoundingClientRect();
      const center=rect.left+rect.width/2;
      const direction=Math.abs(center-window.innerWidth/2)<window.innerWidth*.1?(index%2===0?-1:1):(center<window.innerWidth/2?-1:1);
      part.classList.add("site-hero-part");
      part.style.setProperty("--site-part-x",`${direction*96}px`);
      part.style.setProperty("--site-part-delay",`${.06+index*.12}s`);
    });
    heroText.forEach((node,index)=>{
      node.classList.add("site-text-line");
      node.style.setProperty("--site-text-delay",`${.2+index*.105}s`);
    });
    largeMedia.forEach((image,index)=>{
      const rect=image.getBoundingClientRect();
      const direction=rect.left+rect.width/2<window.innerWidth/2?-1:1;
      image.classList.add("site-fly-media");
      image.style.setProperty("--site-media-x",`${direction*78}px`);
      image.style.setProperty("--site-media-delay",`${.1+(index%3)*.08}s`);
    });
    if(heroImage){
      heroImage.classList.add("site-hero-parallax");
      heroImage.style.setProperty("--site-media-delay",".08s");
    }

    if(reduced){
      sections.forEach(section=>section.classList.add("site-section-in","site-settled"));
      items.forEach(item=>item.classList.add("in","site-settled"));
      return;
    }

    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      const target=entry.target as HTMLElement;
      if(target.classList.contains("site-hero-motion")||target.classList.contains("site-section-motion"))target.classList.add("site-section-in");
      if(target.classList.contains("motion"))target.classList.add("in");
      const settleDelay=target===hero?1550:target.classList.contains("motion")?980:1150;
      settleTimers.push(window.setTimeout(()=>target.classList.add("site-settled"),settleDelay));
      observer.unobserve(target);
    }),{threshold:.055,rootMargin:"0px 0px 8%"});
    sections.forEach(section=>observer.observe(section));
    items.forEach(item=>observer.observe(item));

    requestAnimationFrame(()=>{
      if(hero&&!hero.classList.contains("site-section-in")){
        hero.classList.add("site-section-in");
        settleTimers.push(window.setTimeout(()=>hero.classList.add("site-settled"),1550));
      }
      heroParts.forEach(part=>{if(!part.classList.contains("in"))part.classList.add("in")});
      heroText.forEach(node=>{if(!node.classList.contains("in"))node.classList.add("in")});
      if(heroImage&&!heroImage.classList.contains("in"))heroImage.classList.add("in");
    });

    const fallbackTimer=window.setTimeout(()=>{
      const vh=window.innerHeight;
      sections.forEach(section=>{
        if(!section.classList.contains("site-section-in")){
          const r=section.getBoundingClientRect();
          if(r.top<vh+100&&r.bottom>-100)section.classList.add("site-section-in","site-settled");
        }
      });
      items.forEach(item=>{
        if(!item.classList.contains("in")){
          const r=item.getBoundingClientRect();
          if(r.top<vh+100&&r.bottom>-100)item.classList.add("in","site-settled");
        }
      });
    },300);

    const moveHero=(event:PointerEvent)=>{
      if(!hero||event.pointerType==="touch")return;
      const rect=hero.getBoundingClientRect();
      const x=((event.clientX-rect.left)/rect.width-.5)*-10;
      const y=((event.clientY-rect.top)/rect.height-.5)*-6;
      hero.style.setProperty("--site-hero-x",`${x.toFixed(2)}px`);
      hero.style.setProperty("--site-hero-y",`${y.toFixed(2)}px`);
    };
    const resetHero=()=>{hero?.style.setProperty("--site-hero-x","0px");hero?.style.setProperty("--site-hero-y","0px")};
    hero?.addEventListener("pointermove",moveHero);
    hero?.addEventListener("pointerleave",resetHero);

    const interactives=Array.from(main.querySelectorAll<HTMLElement>("article, a, button")).filter(item=>!item.closest(".about-redesign"));
    const enter=(event:PointerEvent)=>{if(event.pointerType!=="touch")(event.currentTarget as HTMLElement).classList.add("site-pointer")};
    const leave=(event:PointerEvent)=>(event.currentTarget as HTMLElement).classList.remove("site-pointer");
    interactives.forEach(item=>{item.addEventListener("pointermove",enter);item.addEventListener("pointerleave",leave)});

    return()=>{
      observer.disconnect();
      settleTimers.forEach(timer=>window.clearTimeout(timer));
      window.clearTimeout(fallbackTimer);
      hero?.removeEventListener("pointermove",moveHero);
      hero?.removeEventListener("pointerleave",resetHero);
      interactives.forEach(item=>{item.removeEventListener("pointermove",enter);item.removeEventListener("pointerleave",leave)});
      main.classList.remove("site-motion-ready");
      if(about)about.classList.remove("site-page-motion");
    };
  },[]);
  return null;
}
function SectionTitle({children,mini}:{children:React.ReactNode;mini?:string}){return <div className="section-heading motion">{mini&&<span>{mini}</span>}<h2>{children}</h2></div>}
function Arrow(){return <ArrowLeft size={15} aria-hidden/>}

declare global { interface Window { __hhcOpenModal?: (name: string) => void } }

function HhcComingSoonModal() {
  const [open, setOpen] = useState(false);
  const [svc, setSvc] = useState("");
  useEffect(() => {
    window.__hhcOpenModal = (name: string) => { setSvc(name); setOpen(true); };
    return () => { delete window.__hhcOpenModal; };
  }, []);
  if (!open) return null;
  return (
    <div className="hhc-modal-overlay" onClick={() => setOpen(false)}>
      <div className="hhc-modal" onClick={e => e.stopPropagation()}>
        <button className="hhc-modal-close" onClick={() => setOpen(false)}><X size={20}/></button>
        <div className="hhc-modal-icon"><Clock3 size={36}/></div>
        <h2>قريباً</h2>
        <p>خدمة <strong>{svc}</strong> قيد الإعداد وستكون متاحة قريباً.</p>
        <p className="hhc-modal-sub">نعمل على إطلاق هذه الخدمة في أقرب وقت ممكن، ترقّبونا!</p>
        <button className="hhc-modal-btn" onClick={() => setOpen(false)}>حسناً</button>
      </div>
    </div>
  );
}

function CountUp({raw}:{raw:string}){
  const ref=useRef<HTMLElement>(null);
  const [val,setVal]=useState("0");
  useEffect(()=>{
    const m=raw.match(/^([\d.]+)([A-Za-z]*)([+]?)$/);
    if(!m){setVal(raw);return;}
    const target=parseFloat(m[1]),unit=m[2]||"",plus=m[3]||"";
    let active=true;
    const obs=new IntersectionObserver(entries=>{
      if(!entries[0].isIntersecting)return;
      obs.disconnect();
      const dur=1700;
      const t0=performance.now();
      const tick=(now:number)=>{
        if(!active)return;
        const p=Math.min((now-t0)/dur,1);
        const e=p===1?1:(1-Math.pow(2,-10*p));
        setVal((p<1?Math.floor(e*target):target)+unit+plus);
        if(p<1)requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    },{threshold:.25});
    if(ref.current)obs.observe(ref.current);
    return()=>{active=false;obs.disconnect();};
  },[raw]);
  return <b ref={ref}>{val}</b>;
}

function Home(){
  const heroBenefits=[
    {title:"منصة رقمية واحدة",text:"لكل أبناء الولاية",icon:UsersRound},
    {title:"خدمات رقمية",text:"سريعة وآمنة",icon:MonitorCheck},
    {title:"عائلة واحدة",text:"هدف واحد",icon:ShieldCheck},
    {title:"مستقبل أفضل",text:"لأبناء الولاية",icon:ChartNoAxesCombined},
  ];
  const metrics=[
    {number:"200+",label:"المبادرات والبرامج",icon:HeartHandshake},
    {number:"35K+",label:"المستفيدون الحاليون",icon:UsersRound},
    {number:"120+",label:"الخدمات المقدمة",icon:LayoutGrid},
    {number:"45+",label:"دولة حول العالم",icon:Globe2},
    {number:"850K+",label:"أبناء الولاية حول العالم",icon:Network},
  ];
  const services=[
    {title:"الثقافة",icon:Landmark,items:["التراث","الفعاليات الثقافية","الشخصيات","الإعلام"],href:"/culture",tone:"cyan",button:"الدخول للثقافة"},
    {title:"التعليم",icon:GraduationCap,items:["مدرسة نهر النيل الإلكترونية","المنح الدراسية","الدورات التدريبية","المكتبة الرقمية"],href:"/education",tone:"blue",button:"الدخول للتعليم"},
    {title:"الاستثمار",icon:ChartNoAxesCombined,items:["الفرص الاستثمارية","المشروعات التنموية","الاستثمار الزراعي","دليل المستثمر"],href:"/investment",tone:"orange",button:"الدخول للاستثمار"},
    {title:"السوق السوداني الإلكتروني",icon:ShoppingCart,items:["المنتجات","الخدمات","الوظائف","الشركات"],href:MARKET_URL,tone:"purple",button:"الدخول للسوق"},
    {title:"الخدمات الاجتماعية",icon:HandHeart,items:["طلب المساعدة","التكافل الاجتماعي","دعم المرضى","رعاية الأيتام والأرامل"],href:"/social",tone:"green",button:"الدخول للخدمة"},
  ];
  const staticNews=[
    {title:"مشروع التنمية المستدامة",date:"02 مايو",image:"/assets/investment-hero-hq.webp",text:"مشروع رائد للتنمية المستدامة في الولاية"},
    {title:"دورات تدريبية متخصصة",date:"10 مايو",image:"/assets/course-project-hq.webp",text:"دورات للشباب في مجالات متعددة داخل الولاية"},
    {title:"مبادرة دعم المدارس",date:"18 مايو",image:"/assets/social-education-hq.webp",text:"مبادرة لدعم وتطوير المدارس وبيئة التعليم"},
    {title:"ملتقى شباب نهر النيل 2025",date:"25 مايو",image:"/assets/culture-seminar-hq.webp",text:"ملتقى شبابي يجمع أبناء الولاية للحوار وتبادل الخبرات"},
  ];
  const [dbNews, setDbNews] = useState<{title:string;date:string;image:string;text:string}[]>([]);
  const [dbEvents, setDbEvents] = useState<{title:string;date:string;month:string;excerpt:string}[]>([]);
  const [dbSectors, setDbSectors] = useState<{icon:string;name:string}[]>([]);
  useEffect(()=>{
    supabase.from("news").select("title,excerpt,image_url,published_at").eq("published",true).order("published_at",{ascending:false}).limit(4).then(({data})=>{
      if(data&&data.length>0) setDbNews(data.map(n=>({
        title:n.title,
        date:n.published_at?new Date(n.published_at).getDate().toString().padStart(2,"0"):"",
        month:n.published_at?new Date(n.published_at).toLocaleDateString("ar-EG",{month:"short"}):"",
        image:n.image_url||"/assets/investment-hero-hq.webp",
        text:n.excerpt||n.title,
      })));
    });
    supabase.from("events").select("title,excerpt,event_date").eq("published",true).order("event_date",{ascending:true}).limit(4).then(({data})=>{
      if(data&&data.length>0) setDbEvents(data.map(e=>({
        title:e.title,
        date:e.event_date?new Date(e.event_date).getDate().toString().padStart(2,"0"):"",
        month:e.event_date?new Date(e.event_date).toLocaleDateString("ar-EG",{month:"short"}):"",
        excerpt:e.excerpt||e.title,
      })));
    });
    supabase.from("investment_sectors").select("icon,name").eq("published",true).order("sort_order").limit(4).then(({data})=>{
      if(data&&data.length>0) setDbSectors(data);
    });
  },[]);
  const news = dbNews.length > 0
    ? dbNews.map(n=>({...n, date:`${n.date} ${(n as {month?:string}).month||""}`}))
    : staticNews;
  const staticEvents=[
    {title:"ملتقى شباب نهر النيل",date:"05",month:"أغس",excerpt:"ملتقى شبابي سنوي يجمع أبناء الولاية"},
    {title:"ورشة ريادة الأعمال",date:"20",month:"أغس",excerpt:"ورشة تدريبية في الاستثمار والأعمال"},
    {title:"مباراة خيرية",date:"15",month:"أغس",excerpt:"مباراة كرة القدم الخيرية لدعم المحتاجين"},
  ];
  const homeEvents = dbEvents.length > 0 ? dbEvents : staticEvents;
  const sectors4 = dbSectors.length > 0
    ? dbSectors.map(s=>({icon:s.icon, label:s.name.split(" ")[0]}))
    : [{icon:"Building2",label:"سكني"},{icon:"Sprout",label:"زراعي"},{icon:"Factory",label:"صناعي"},{icon:"Gem",label:"تعديني"}];
  return <div className="home-redesign">
    <section className="home-master-hero">
      <div className="home-hero-copy motion">
        <span className="home-eyebrow">رابطة ولاية</span>
        <h1>نهر النيل الرقمية</h1>
        <h2>منصة رقمية شاملة تربط أبناء ولاية نهر النيل</h2>
        <p>في الداخل والخارج</p>
        <div className="home-values">
          <b><UsersRound/><small>تواصل</small></b>
          <b><Share2/><small>تفاعل</small></b>
          <b><Settings2/><small>تنمية</small></b>
          <b><Network/><small>تطوير</small></b>
        </div>
        <div className="home-hero-actions">
          <a className="home-primary" href="#services">استكشف المنصة <ChevronLeft/></a>
          <a className="home-outline" href="/services">تعرّف على خدماتنا <LayoutGrid/></a>
        </div>
      </div>
      <div className="home-hero-stage motion">
        <img src="/assets/home-hero-reference-v2%20copy.webp" alt="نهر النيل والجسور في ولاية نهر النيل"/>
        <div className="home-image-fade" aria-hidden/>
        <aside className="home-benefit-panel">
          {heroBenefits.map(item=>{const Icon=item.icon;return <div key={item.title}><Icon/><span><b>{item.title}</b><small>{item.text}</small></span></div>})}
        </aside>
      </div>
    </section>

    <section className="home-metrics page-width motion">
      {metrics.map(item=>{const Icon=item.icon;return <div key={item.label}><Icon/><span><CountUp raw={item.number}/><small>{item.label}</small></span></div>})}
    </section>

    <section className="home-join page-width motion">
      <div className="home-member-card">
        <img src="/assets/ChatGPT_Image_Jul_21,_2026,_05_25_20_PM.png" alt="رابطة ولاية نهر النيل الرقمية"/>
        <div><span>عضو في</span><strong>رابطة ولاية نهر النيل الرقمية</strong><small>معاً.. لنبني المستقبل</small></div>
        <footer><b>0001</b><span>عضوية</span></footer>
      </div>
      <div className="home-join-copy">
        <span>انضم الآن إلى</span>
        <h2>رابطة ولاية نهر النيل الرقمية</h2>
        <p>كن جزءاً من أكبر تجمع رقمي لأبناء ولاية نهر النيل واستفد من جميع الخدمات والمبادرات والفرص المتاحة.</p>
      </div>
      <a className="home-join-cta" href="/membership"><UsersRound/><b>اضغط هنا<br/>للانضمام الآن</b><span><ArrowLeft/></span></a>
    </section>

    <section id="services" className="home-services page-width">
      <div className="home-section-title motion"><span/><h2>ابدأ رحلتك من هنا</h2><span/></div>
      <div className="home-service-grid">
        {services.map(service=>{const Icon=service.icon;return <article className={"home-service-card motion "+service.tone} key={service.title}>
          <div className="service-icon"><Icon/></div>
          <h3>{service.title}</h3>
          <ul>{service.items.map(item=><li key={item}>{item}</li>)}</ul>
          <a href={service.href} target={service.href.startsWith("http")?"_blank":undefined} rel={service.href.startsWith("http")?"noopener noreferrer":undefined}>{service.button}{service.href.startsWith("http")?<span aria-hidden>↗</span>:<ArrowLeft/>}</a>
        </article>})}
      </div>
    </section>

    <section className="home-investment page-width motion">
      <img className="investment-bg" src="/assets/home-investment-banner-v2.webp" alt="القطاع الصناعي والزراعة في ولاية نهر النيل"/>
      <div className="investment-center">
        <h2>الاستثمار في ولاية نهر النيل</h2>
        <p>فرص استثمارية واعدة في القطاعات الصناعية والزراعية والسكنية</p>
        <div>
          {sectors4.map(s=><b key={s.icon+s.label}><DynIcon name={s.icon} fallback={Sprout}/><small>{s.label}</small></b>)}
        </div>
      </div>
      <a href="/investment">استكشف الفرص الاستثمارية <ArrowLeft/></a>
    </section>

    <section className="home-programs page-width">
      <article className="home-program school motion">
        <div className="program-copy">
          <h2>مدرسة نهر النيل الإلكترونية</h2>
          <h4>تعليم رقمي متكامل من المرحلة الابتدائية حتى الثانوية</h4>
          <ul><li>فصول افتراضية تفاعلية</li><li>واجبات واختبارات إلكترونية</li><li>متابعة مع ولي الأمر</li><li>شهادات وتقارير دورية</li><li>منصة تعليمية متاحة على مدار الساعة</li></ul>
          <a href="/education">الدخول إلى المدرسة <ArrowLeft/></a>
        </div>
        <img src="/assets/home-school-hq.webp" alt="طالبة في مدرسة نهر النيل الإلكترونية"/>
        <div className="program-features">
          <b><Clock3/><small>متاحة 24/7</small></b><b><BookOpen/><small>اختبارات دورية</small></b><b><Video/><small>فصول مباشرة</small></b><b><BadgeCheck/><small>تقارير متابعة</small></b>
        </div>
      </article>
      <article className="home-program institute motion">
        <div className="program-copy">
          <h2>معهد نهر النيل الإلكتروني</h2>
          <h4>التدريب المهني والتطوير المستمر</h4>
          <ul><li>دورات مهنية معتمدة</li><li>شهادات احترافية</li><li>لقاءات وتدريب مباشر</li><li>زيادة المهارات</li><li>تعلم في أي وقت ومن أي مكان</li></ul>
          <a href={TRAINING_URL} target="_blank" rel="noopener noreferrer">الدخول إلى مركز التدريب <span aria-hidden>↗</span></a>
        </div>
        <img src="/assets/home-training-hq.webp" alt="التدريب في معهد نهر النيل الإلكتروني"/>
        <div className="program-features">
          <b><Clock3/><small>تعلم مرن</small></b><b><Award/><small>مدربون متخصصون</small></b><b><UsersRound/><small>شهادات معتمدة</small></b><b><BadgeCheck/><small>دورات مهنية</small></b>
        </div>
      </article>
    </section>

    <section className="home-opportunity page-width motion">
      <Megaphone/>
      <div><h2>مساحتك مميزة لعرض خدماتك ومنتجاتك</h2><p>تواصل مع آلاف المستفيدين من أبناء ولاية نهر النيل.</p></div>
      <a href="/contact">استكشف الفرص الاستثمارية <ArrowLeft/></a>
    </section>

    <section id="market" className="home-market page-width motion">
      <img src="/assets/home-market-hq.webp" alt="السوق السوداني الإلكتروني"/>
      <div className="market-copy">
        <span>السوق السوداني الإلكتروني</span>
        <h2>منصة آمنة لبيع وشراء المنتجات والخدمات السودانية</h2>
        <p>ادعم المنتج السوداني وكن جزءاً من تنمية الاقتصاد الوطني.</p>
        <div><b><Tags/><small>عروض وخصومات مميزة</small></b><b><Truck/><small>توصيل سريع داخل السودان وخارجه</small></b><b><ShieldCheck/><small>دفع آمن وسهل</small></b><b><Store/><small>منتجات موثوقة من تجار سودانيين</small></b></div>
      </div>
      <a href={MARKET_URL} target="_blank" rel="noopener noreferrer"><ShoppingCart/> تصفح السوق الآن <span aria-hidden>↗</span></a>
    </section>

    <HhcComingSoonModal/>
    <section className="home-health-cards page-width">
      {/* بطاقة العيادة أونلاين */}
      <div className="hhc-card motion" onClick={()=>window.__hhcOpenModal?.("عيادة أونلاين")} style={{cursor:"pointer"}}>
        <div className="hhc-img-wrap">
          <span className="hhc-badge"><Stethoscope size={13}/> الأكثر استخداماً</span>
          <img src="/assets/ChatGPT_Image_Jul_21,_2026,_05_47_35_PM.png" alt="عيادة أونلاين"/>
        </div>
        <div className="hhc-body">
          <div className="hhc-title-row">
            <h3>عيادة أونلاين</h3>
            <span className="hhc-icon-circle"><MonitorCheck size={20}/></span>
          </div>
          <p>استشر الأطباء المختصين عبر الإنترنت من أي مكان وفي أي وقت</p>
          <div className="hhc-tags">
            <span><CalendarDays size={13}/> مواعيد إلكترونية</span>
            <span><Video size={13}/> كشف عن بعد</span>
          </div>
          <button className="hhc-cta-primary" type="button"><MonitorCheck size={15}/> ابدأ الاستشارة الآن <ChevronLeft size={13}/></button>
        </div>
      </div>

      {/* بطاقة الصيدلية الخيرية */}
      <div className="hhc-card motion" onClick={()=>window.__hhcOpenModal?.("الصيدلية الخيرية")} style={{cursor:"pointer"}}>
        <div className="hhc-img-wrap">
          <img src="/assets/ChatGPT_Image_Jul_21,_2026,_05_47_44_PM.png" alt="الصيدلية الخيرية"/>
        </div>
        <div className="hhc-body">
          <div className="hhc-title-row">
            <h3><Pill size={17}/> الصيدلية الخيرية</h3>
          </div>
          <p>توفير الأدوية للمحتاجين وأسر الأعضاء</p>
          <ul className="hhc-checklist">
            <li><Check size={13}/> أدوية أساسية ومزمنة</li>
            <li><Check size={13}/> دعم الحالات الطارئة</li>
            <li><Check size={13}/> شراكات مع صيدليات معتمدة</li>
          </ul>
          <button className="hhc-cta-outline" type="button"><HeartHandshake size={15}/> طلب دواء <ChevronLeft size={13}/></button>
          <span className="hhc-more-link">عرض المزيد <ChevronLeft size={12}/></span>
        </div>
      </div>
    </section>

    <section id="news" className="home-news page-width">
      <div className="home-section-title motion"><span/><h2>آخر الأخبار والمبادرات</h2><span/></div>
      <div className="home-news-grid">
        {news.map((item,i)=><article className="home-news-card home-news-reveal" key={item.title} style={{"--ni":i} as React.CSSProperties}>
          <div className="news-date"><b>{item.date.split(" ")[0]}</b><small>{item.date.split(" ")[1]}</small></div>
          <h3>{item.title}</h3>
          <p>{item.text}</p>
          <img src={item.image} alt={item.title}/>
          <a href="/news">اقرأ المزيد <ArrowLeft/></a>
        </article>)}
      </div>
      <div className="home-section-title motion" style={{marginTop:"2rem"}}><span/><h2>الفعاليات القادمة</h2><span/></div>
      <div className="home-events-grid">
        {homeEvents.map((ev,i)=><article className="home-event-card home-news-reveal" key={ev.title} style={{"--ni":i} as React.CSSProperties}>
          <div className="home-event-date"><b>{ev.date}</b><small>{ev.month}</small></div>
          <div className="home-event-body"><h4>{ev.title}</h4><p>{ev.excerpt}</p></div>
        </article>)}
      </div>
      <a className="all-news-link" href="/events">عرض كل الفعاليات <ArrowLeft size={13}/></a>
    </section>
  </div>
}

function SocialPage(){
  type SvcRow = {id:string;icon:string;title:string;lead:string;bullet_1:string;bullet_2:string;bullet_3:string;bullet_4:string;action_label:string;published:boolean;sort_order:number};
  type InitRow= {id:string;image_url:string;title:string;text:string;progress:number;amount:string;icon:string;action_label:string;published:boolean;sort_order:number};
  type StatRow= {id:string;value:string;label:string;icon:string;sort_order:number};
  type ValRow = {id:string;icon:string;title:string;text:string;published:boolean;sort_order:number};

  const ssIconMap:Record<string,React.ElementType>={HeartHandshake,HandHeart,MessageCircle,UsersRound,Headphones,GraduationCap,BookOpen,UserPlus,Handshake,Eye,Network,ShieldCheck,UserCheck,MapPin,Mail,Phone};

  const staticServices:SvcRow[]=[
    {id:"s1",icon:"Headphones",title:"تواصل مباشر",lead:"فريق الدعم الاجتماعي جاهز لخدمتك",bullet_1:"تواصل واتساب",bullet_2:"اتصال هاتفي",bullet_3:"زيارة ميدانية",bullet_4:"متابعة الطلبات",action_label:"تواصل معنا",published:true,sort_order:1},
    {id:"s2",icon:"HandHeart",title:"حالات إنسانية",lead:"متابعة الحالات الإنسانية وتقديم الدعم اللازم",bullet_1:"حالات مرضية",bullet_2:"أيتام وأرامل",bullet_3:"ذوو الاحتياجات",bullet_4:"كبار السن",action_label:"عرض الحالات",published:true,sort_order:2},
    {id:"s3",icon:"MessageCircle",title:"استشارة اجتماعية",lead:"احصل على استشارة من اختصاصيين اجتماعيين",bullet_1:"مشكلات أسرية",bullet_2:"دعم نفسي",bullet_3:"إرشاد اجتماعي",bullet_4:"توجيه وإرشاد",action_label:"طلب استشارة",published:true,sort_order:3},
    {id:"s4",icon:"UsersRound",title:"برامج ومبادرات",lead:"برامج توعوية وتنموية لبناء مجتمع واعٍ ومتماسك",bullet_1:"برامج توعوية",bullet_2:"دورات تدريبية",bullet_3:"تنمية أسرية",bullet_4:"لقاءات ومحاضرات",action_label:"استعرض البرامج",published:true,sort_order:4},
    {id:"s5",icon:"HeartHandshake",title:"دعم المحتاجين",lead:"مساعدات مالية وعينية للأسر المحتاجة والفئات المتضررة",bullet_1:"كفالة أسر",bullet_2:"مواد غذائية",bullet_3:"ملابس وأثاث",bullet_4:"مساعدات طارئة",action_label:"تقديم طلب",published:true,sort_order:5},
  ];
  const staticInits:InitRow[]=[
    {id:"i1",image_url:"/assets/social-project-4.jpg",title:"صندوق العلاج",text:"مساعدة المرضى في تغطية تكاليف العلاج والأدوية",progress:45,amount:"30,000 جنيه",icon:"✚",action_label:"ساهم الآن",published:true,sort_order:1},
    {id:"i2",image_url:"/assets/social-project-3.jpg",title:"مشروع ترميم المنازل",text:"ترميم المنازل المتضررة وتحسين بيئة السكن للأسر المحتاجة",progress:72,amount:"60,000 جنيه",icon:"⌂",action_label:"تبرع الآن",published:true,sort_order:2},
    {id:"i3",image_url:"/assets/social-project-2.jpg",title:"دعم التعليم",text:"دعم الرسوم الدراسية والاحتياجات التعليمية لأبناء الأسر المحتاجة",progress:55,amount:"40,000 جنيه",icon:"✦",action_label:"ساهم الآن",published:true,sort_order:3},
    {id:"i4",image_url:"/assets/social-project-1.jpg",title:"سلة الخير الرمضانية",text:"توزيع سلات غذائية على الأسر المحتاجة خلال شهر رمضان",progress:68,amount:"25,000 جنيه",icon:"♡",action_label:"تبرع الآن",published:true,sort_order:4},
  ];
  const staticStats:StatRow[]=[
    {id:"st1",value:"12,680+",label:"مستفيد من خدماتنا",icon:"UsersRound",sort_order:1},
    {id:"st2",value:"3,250+",label:"أسرة مستفيدة",icon:"HeartHandshake",sort_order:2},
    {id:"st3",value:"1,850+",label:"حالة إنسانية تم دعمها",icon:"Handshake",sort_order:3},
    {id:"st4",value:"650+",label:"فرصة دعم",icon:"GraduationCap",sort_order:4},
    {id:"st5",value:"320+",label:"طالب مستفيد",icon:"BookOpen",sort_order:5},
    {id:"st6",value:"120+",label:"متطوع نشط",icon:"UserPlus",sort_order:6},
  ];
  const staticVals:ValRow[]=[
    {id:"v1",icon:"HandHeart",title:"المسؤولية",text:"نتحمل مسؤولياتنا تجاه مجتمعنا وأسرتنا",published:true,sort_order:1},
    {id:"v2",icon:"UserCheck",title:"الاحترام",text:"نحترم كرامة الجميع ونقدم الدعم باحترام وخصوصية",published:true,sort_order:2},
    {id:"v3",icon:"ShieldCheck",title:"الأمانة",text:"نحافظ على أمانة التبرعات والمساعدات",published:true,sort_order:3},
    {id:"v4",icon:"Eye",title:"الشفافية",text:"نلتزم بالشفافية في جميع برامجنا ومبادراتنا",published:true,sort_order:4},
    {id:"v5",icon:"Network",title:"التكافل",text:"نعمل معاً لتعزيز التكافل الاجتماعي",published:true,sort_order:5},
  ];

  const [dbSvcs,  setDbSvcs]  = useState<SvcRow[]>([]);
  const [dbInits, setDbInits] = useState<InitRow[]>([]);
  const [dbStats, setDbStats] = useState<StatRow[]>([]);
  const [dbVals,  setDbVals]  = useState<ValRow[]>([]);

  useEffect(()=>{
    supabase.from("social_services").select("*").eq("published",true).order("sort_order").then(({data})=>{ if(data&&data.length>0) setDbSvcs(data); });
    supabase.from("social_initiatives").select("*").eq("published",true).order("sort_order").then(({data})=>{ if(data&&data.length>0) setDbInits(data); });
    supabase.from("social_stats").select("*").order("sort_order").then(({data})=>{ if(data&&data.length>0) setDbStats(data); });
    supabase.from("social_values").select("*").eq("published",true).order("sort_order").then(({data})=>{ if(data&&data.length>0) setDbVals(data); });
  },[]);

  const services   = dbSvcs.length  ? dbSvcs  : staticServices;
  const initiatives= dbInits.length ? dbInits : staticInits;
  const stats      = dbStats.length ? dbStats : staticStats;
  const values     = dbVals.length  ? dbVals  : staticVals;

  const contacts=[
    {icon:MapPin,title:"زيارتنا",text:"مقر الرابطة"},
    {icon:Mail,title:"البريد الإلكتروني",text:"social@nilenil.org"},
    {icon:Phone,title:"اتصال هاتفي",text:"012 345 6789"},
    {icon:MessageCircle,title:"واتساب",text:"+249 912 345 678"},
  ];

  return <div className="social-redesign">
    <section className="ss-hero">
      <div className="ss-hero-visual motion"><img src="/assets/social-hero.jpg" alt="أسرة في أيدٍ متكاتفة"/></div>
      <div className="ss-hero-copy motion"><span className="ss-people-mark"><UsersRound/></span><div className="ss-hero-text"><h1>الخدمات الاجتماعية</h1><h2>معاً.. نرعى ونساند</h2><p>نقدم برامج ومبادرات اجتماعية وإنسانية تهدف إلى دعم<br/>أبناء مجتمعنا في مختلف الظروف، لبناء مجتمع متماسك<br/>ومتكافل.</p></div></div>
      <img className="ss-hero-ribbons" src="/assets/social-hero-wave-transparent.webp" alt="" aria-hidden="true"/>
    </section>

    <section className="ss-quick page-width motion">{services.map(svc=>{const Icon=ssIconMap[svc.icon]||HeartHandshake;return <a href="#social-services" key={svc.id}><span className="ss-quick-icon" aria-hidden="true"><Icon/></span><span><b>{svc.title}</b><small>{svc.lead.slice(0,28)}...</small></span></a>;})}</section>

    <section id="social-services" className="ss-services page-width"><div className="ss-title motion"><span/><h2>خدماتنا الاجتماعية</h2><span/></div><div className="ss-service-grid">{services.map(svc=>{const Icon=ssIconMap[svc.icon]||HeartHandshake;return <article className="ss-service-card motion" key={svc.id}><div className="ss-service-icon" aria-hidden="true"><Icon/></div><h3>{svc.title}</h3><p>{svc.lead}</p><ul>{[svc.bullet_1,svc.bullet_2,svc.bullet_3,svc.bullet_4].filter(Boolean).map(b=><li key={b}>{b}</li>)}</ul><a href={svc.slug?`/social/service/${svc.slug}`:"/contact"}>{svc.action_label}<ArrowLeft/></a></article>;})}</div></section>

    <section className="ss-initiatives page-width"><div className="ss-title motion"><span/><h2>مبادراتنا الحالية</h2><span/></div><div className="ss-initiative-grid">{initiatives.map(item=><article className="ss-initiative-card motion" key={item.id}><img src={item.image_url} alt={item.title}/><div><h3>{item.title}</h3><p>{item.text}</p><small>تم جمع {item.progress}%</small><span className="ss-progress"><i style={{width:`${item.progress}%`}}/></span><footer><b>{item.amount}</b><a href={item.slug?`/social/initiative/${item.slug}`:"/contact"}>{item.action_label}</a></footer></div></article>)}</div><a className="ss-all-initiatives" href="/contact">عرض جميع المبادرات <ArrowLeft/></a></section>

    <section className="ss-stats page-width motion"><div className="ss-family-art" aria-label="التكافل الأسري"><HeartHandshake/></div>{stats.map(item=>{const Icon=ssIconMap[item.icon]||UsersRound;return <div key={item.id}><Icon aria-hidden="true"/><b>{item.value}</b><small>{item.label}</small></div>;})}</section>

    <section className="ss-support page-width motion"><div className="ss-help-copy"><Headphones aria-label="فريق الدعم"/><div><h2>نحن هنا لمساعدتك</h2><p>فريق الدعم الاجتماعي جاهز للرد على استفساراتك<br/>وتقديم المساعدة التي تحتاجها</p><a href="/contact">تواصل معنا <ArrowLeft/></a></div></div><div className="ss-contact-methods"><p>تواصل معنا عبر</p><div>{contacts.map(item=>{const Icon=item.icon;return <a href="/contact" key={item.title}><Icon/><b>{item.title}</b><small>{item.text}</small></a>;})}</div></div></section>

    <section className="ss-values page-width motion">{values.map(item=>{const Icon=ssIconMap[item.icon]||HandHeart;return <article key={item.id}><Icon aria-hidden="true"/><h3>{item.title}</h3><p>{item.text}</p></article>;})}</section>
  </div>
}

function EducationPage(){
  const heroMenu=["مدرسة نهر النيل الإلكترونية","الدورات وكورسات التقوية","المنح الدراسية","المكتبة الرقمية","الاختبارات والامتحانات","النتائج والتقارير","الاستشارات التعليمية","الأخبار والفعاليات التعليمية"];
  const heroFeatures=[
    {icon:ShieldCheck,title:"جودة تعليمية",text:"معايير عالية لضمان جودة التعليم"},
    {icon:UsersRound,title:"دعم شامل",text:"دعم الطلاب والمعلمين وأولياء الأمور"},
    {icon:Award,title:"محتوى متميز",text:"مناهج حديثة ومحتوى تعليمي معتمد"},
    {icon:Clock3,title:"تعلّم مرن",text:"تعلّم في أي وقت ومن أي مكان"},
  ];
  const stats=[
    {icon:UsersRound,n:"12,680",label:"طالب وطالبة"},
    {icon:GraduationCap,n:"65",label:"معلم ومعلمة"},
    {icon:BookOpen,n:"156",label:"مادة افتراضية"},
    {icon:UserRound,n:"420",label:"دورة تدريبية"},
    {icon:UsersRound,n:"3,250",label:"مستخدم نشط"},
    {icon:HandHeart,n:"98%",label:"نسبة رضا الطلاب"},
  ];
  const courses=[
    {image:"/assets/course-project-hq.webp",category:"إدارة",title:"إدارة المشاريع",meta:"متوسط  ·  15 درس",price:"200 ر.س"},
    {image:"/assets/course-english-hq.webp",category:"لغة",title:"اللغة الإنجليزية",meta:"20 درس  ·  مبتدئ",price:"مجاني"},
    {image:"/assets/course-design-hq.webp",category:"تصميم",title:"تصميم الجرافيك",meta:"18 درس  ·  متوسط",price:"150 ر.س"},
    {image:"/assets/course-code-hq.webp",category:"برمجة",title:"أساسيات البرمجة للمبتدئين",meta:"12 درس  ·  مبتدئ",price:"مجاني"},
  ];
  const library=[
    {icon:ReceiptText,n:"1,500+",label:"اختبارات تفاعلية"},
    {icon:FileImage,n:"3,000+",label:"ملفات تعليمية"},
    {icon:Video,n:"800+",label:"فيديوهات تعليمية"},
    {icon:BookOpen,n:"1,200+",label:"أبحاث ومقالات"},
    {icon:BookOpen,n:"2,500+",label:"كتب"},
  ];
  const news=[
    {image:"/assets/education-reference-news-1.png",title:"إطلاق منصة مدرسة نهر النيل الإلكترونية",date:"10 مايو 2025"},
    {image:"/assets/education-reference-news-2.png",title:"ورشة عمل للمعلمين عن دور التعليم الرقمي",date:"10 مايو 2025"},
    {image:"/assets/education-reference-news-3.png",title:"نتائج الاختبارات الفصلية متاحة الآن",date:"5 مايو 2025"},
  ];
  return <div className="education-redesign">
    <section className="edu-hero">
      <div className="edu-hero-photo motion"><img src="/assets/education-hero-hq.webp" alt="منصة التعليم الإلكتروني"/></div>
      <div className="edu-hero-copy motion"><h1><span>التعليم</span> .. استثمار في المستقبل</h1><p>نقدم بيئة تعليمية رقمية متكاملة تدعم الطلاب والمعلمين<br/>وتوفر محتوى تعليمي متطوراً لتلبية احتياجات التعليم<br/>في مكان وزمان يناسب الجميع.</p></div>
      <aside className="edu-hero-menu motion"><h2><GraduationCap/> خدمات التعليم</h2>{heroMenu.map((item,index)=>{const href=index===1?TRAINING_URL:index===3?"/library":index===7?"/news":"#edu-school";const external=href.startsWith("http");return <a href={href} target={external?"_blank":undefined} rel={external?"noopener noreferrer":undefined} className={index===0?"active":""} key={item}><BookOpen/>{item}{external&&<small aria-hidden>↗</small>}</a>})}</aside>
      <div className="edu-hero-features motion">{heroFeatures.map(item=>{const Icon=item.icon;return <article key={item.title}><Icon/><b>{item.title}</b><small>{item.text}</small></article>})}</div>
    </section>

    <section className="edu-stats page-width motion"><div className="edu-stats-art" aria-hidden="true"><ChartNoAxesCombined className="edu-stats-line"/><ChartPie className="edu-stats-pie"/></div>{stats.map(item=>{const Icon=item.icon;return <article key={item.label}><Icon/><b>{item.n}</b><small>{item.label}</small></article>})}<h2>أرقام وإحصائيات التعليم</h2></section>

    <div className="edu-dashboard page-width">
      <div className="edu-primary-column">
        <section id="edu-school" className="edu-school motion">
          <div className="edu-school-intro"><h2>مدرسة نهر النيل الإلكترونية</h2><p>تعليم إلكتروني شامل من المرحلة الابتدائية حتى الثانوية</p><div><img src="/assets/education-reference-school.png" alt="مدرسة نهر النيل الإلكترونية"/><ul><li>مناهج معتمدة ومحدثة</li><li>فصول افتراضية تفاعلية</li><li>أدوات تقييم ومتابعة</li><li>متابعة أداء الطالب</li><li>تواصل مباشر مع المعلمين</li></ul></div><a href="/contact">الدخول إلى المدرسة <GraduationCap/></a></div>
          <div className="edu-levels"><nav><b>المرحلة الابتدائية</b><span>المرحلة المتوسطة</span><span>المرحلة الثانوية</span></nav><div>{[
            [BookOpen,"الفصول الافتراضية","حصص مباشرة وتسجيل المحاضرات"],
            [BookOpen,"المواد الدراسية","كتب رقمية وملخصات وتمارين"],
            [Award,"الأنشطة المدرسية","أنشطة تفاعلية ومشاريع تعليمية"],
            [ReceiptText,"التقييم","اختبارات دورية وتقارير أداء"],
          ].map(([icon,title,text])=>{const Icon=icon as typeof BookOpen;return <article key={String(title)}><Icon/><b>{String(title)}</b><small>{String(text)}</small></article>})}</div><a href="#courses">استعراض جميع المراحل <ArrowLeft/></a></div>
        </section>

        <section id="courses" className="edu-courses"><header><a href={TRAINING_URL} target="_blank" rel="noopener noreferrer">عرض الكل ↗</a><h2>الدورات وكورسات التقوية</h2></header><div>{courses.map(course=><article className="motion" key={course.title}><div className="edu-course-photo"><img src={course.image} alt={course.title}/><span className="edu-course-badge">{course.category}</span></div><h3>{course.title}</h3><p>{course.meta}</p><footer><b>{course.price}</b><a href={TRAINING_URL} target="_blank" rel="noopener noreferrer" aria-label={`فتح دورة ${course.title} في مركز التدريب`}>ابدأ الآن <ArrowLeft/></a></footer></article>)}</div><span className="edu-dots">● ● ●</span></section>
      </div>

      <aside className="edu-side-column">
        <section className="edu-quick-links"><h3>روابط سريعة</h3>{["دليل الطالب","دليل المعلم","الجدول الدراسي","التقويم الأكاديمي","الرسوم والمصروفات"].map(item=><a href="/contact" key={item}><ChevronLeft/>{item}</a>)}</section>
        <section className="edu-help"><h3>تحتاج مساعدة؟</h3><p>فريق الدعم التعليمي<br/>جاهز لمساعدتك</p><a href="/contact">تواصل معنا <MessageCircle/></a></section>
        <section className="edu-scholarships"><GraduationCap/><h3>المنح الدراسية</h3><p>فرص دراسية في أفضل<br/>الجامعات والمؤسسات التعليمية</p><ul><li>منح دراسية محلية</li><li>منح دراسية خارجية</li><li>إسناد الطلاب</li><li>إرشاد ومتابعة</li></ul><a href="/contact">استعراض المنح</a></section>
      </aside>
    </div>

    <section className="edu-library page-width motion"><div className="edu-library-promo"><img src="/assets/education-reference-library-books.png" alt="كتب المكتبة الرقمية"/><div><h3>محتوى تعليمي ثري ومتجدد</h3><p>مصادر متنوعة تدعم تعلمك<br/>وتجعل المعرفة أقرب إليك</p><a href="/library">تصفح المكتبة <ArrowLeft/></a></div></div><div className="edu-library-items">{library.map(item=>{const Icon=item.icon;return <article key={item.label}><Icon/><b>{item.label}</b><small>{item.n}</small></article>})}</div><h2>المكتبة الرقمية</h2></section>

    <section className="edu-information page-width">
      <article className="edu-news motion"><header><a href="/news">عرض الكل <ArrowLeft/></a><h2>الأخبار التعليمية</h2></header>{news.map(item=><div key={item.title}><img src={item.image} alt=""/><p><b>{item.title}</b><small>{item.date}</small></p></div>)}</article>
      <article className="edu-events motion"><header><a href="/news">عرض الكل <ArrowLeft/></a><h2>الفعاليات القادمة</h2></header>{[["28","مايو","ورشة استراتيجيات التعليم الحديثة"],["05","يونيو","ندوة مستجدات التعليم في السودان"],["15","يونيو","ملتقى الطلاب والمعلمين"]].map(([day,month,title])=><div key={title}><time><b>{day}</b>{month}</time><p>{title}<small>قاعة التدريب الافتراضية</small></p></div>)}<a href="/news">اعرض كل الفعاليات</a></article>
      <article className="edu-consult motion"><img src="/assets/social-reference-help-transparent.png" alt="الدعم التعليمي"/><h2>هل لديك استفسار؟</h2><p>فريقنا التعليمي جاهز<br/>لمساعدتك</p><a href="/contact">تواصل معنا</a></article>
    </section>

    <section className="edu-quality">{[
      [Award,"شهادات معتمدة","شهادات مصدقة قابلة للتحقق"],
      [Clock3,"تعلّم مدى الحياة","طور مهاراتك باستمرار"],
      [ShieldCheck,"بيئة آمنة","حماية بياناتك وخصوصيتك"],
      [MonitorCheck,"متاح لجميع الأجهزة","تعلم من أي مكان وعلى أي جهاز"],
      [MessageCircle,"دعم فني متواصل","فريق متخصص لمساعدتك"],
    ].map(([icon,title,text])=>{const Icon=icon as typeof Award;return <article key={String(title)}><Icon/><b>{String(title)}</b><small>{String(text)}</small></article>})}</section>
  </div>
}

function HealthPage(){
  const trust=[
    {icon:Globe2,title:"في خدمتكم أينما كنتم",text:"داخل السودان وخارجه"},
    {icon:MonitorCheck,title:"متاحة إلكترونياً",text:"خدمات صحية من أي مكان"},
    {icon:Clock3,title:"خدمة سريعة",text:"استجابة ومتابعة مستمرة"},
    {icon:ShieldCheck,title:"موثوقة وآمنة",text:"خصوصية ورعاية معتمدة"},
  ];
  const medicalServices=[
    {tone:"consult",image:"/assets/health-consult-hq.webp",icon:Stethoscope,title:"الاستشارات الطبية",lead:"استشارات مع نخبة من الأطباء والاستشاريين في مختلف التخصصات",tags:["الباطنية","الأطفال","النساء والتوليد","القلب","الجراحة","وغيرها"],action:"تصفح التخصصات"},
    {tone:"clinic",image:"/assets/health-clinic-hq.webp",icon:MonitorCheck,title:"العيادة الإلكترونية",lead:"استشر الطبيب المختص عبر الإنترنت من أي مكان وفي أي وقت",tags:["مواعيد إلكترونية","كشف عن بُعد","متابعة دورية"],action:"ابدأ الاستشارة الآن",featured:true},
    {tone:"insurance",image:"/assets/health-insurance-hq.webp",icon:ShieldCheck,title:"التأمين الطبي",lead:"باقات تأمين ميسرة بأسعار تفضيلية لأعضاء الرابطة وأسرهم",tags:["شراكات مع شركات معتمدة","تغطية داخل وخارج السودان","رعاية شاملة للأسرة"],action:"معرفة المزيد"},
  ];
  const helpOptions=[
    {icon:HandHeart,title:"رفع حالة لطلب طبي"},
    {icon:Clock3,title:"طلب مساعدة صحية عاجلة"},
    {icon:MessageCircle,title:"التواصل المباشر",text:"مع لجنة الشؤون الاجتماعية"},
    {icon:ReceiptText,title:"متابعة حالة",text:"ومعرفة نتيجة الطلب"},
  ];
  const reasons=[
    {icon:UsersRound,title:"مجتمع صحي متكامل"},
    {icon:HandHeart,title:"دعم حقيقي للمحتاجين"},
    {icon:Stethoscope,title:"رعاية شاملة لك ولأسرتك"},
  ];
  const tips=[
    {icon:HeartPulse,title:"متابعة دورية",text:"لحالتك المرضية"},
    {icon:Sprout,title:"تغذية متوازنة",text:"لجسم أكثر صحة"},
    {icon:UserRound,title:"المشي 30 دقيقة",text:"يومياً لحياة أطول"},
    {icon:Globe2,title:"اشرب الماء",text:"لصحة أفضل"},
  ];
  return <div className="health-redesign">
    <section className="health-master-hero">
      <div className="health-hero-photo motion"><img src="/assets/health-hero-hq.webp" alt="طبيب من فريق الرعاية الصحية"/></div>
      <div className="health-hero-copy motion"><span className="health-heart-mark"><HeartPulse/></span><div><h1>الصحة</h1><h2>معاً من أجل صحة أفضل</h2><p>خدمات صحية متكاملة لأبناء ولاية نهر النيل<br/>في الداخل والخارج، برعاية رابطة الولاية الرقمية</p><blockquote>صحتك .. مسؤوليتنا <HeartPulse/></blockquote></div></div>
      <span className="health-hero-waves" aria-hidden="true"/>
    </section>

    <section className="health-trust page-width motion">{trust.map(item=>{const Icon=item.icon;return <a href="#health-services" key={item.title}><Icon/><span><b>{item.title}</b><small>{item.text}</small></span></a>})}</section>

    <section id="health-services" className="health-services page-width">
      <div className="health-section-title motion"><span/><h2>خدماتنا الصحية</h2><span/></div>
      <div className="health-service-grid">{medicalServices.map(service=>{const Icon=service.icon;return <article className={`health-service-card ${service.tone} ${service.featured?"featured":""} motion`} key={service.title}>
        <div className="health-service-photo"><img src={service.image} alt={service.title}/>{service.featured&&<b>الأكثر استخداماً <HeartPulse/></b>}</div>
        <header><span><Icon/></span><h3>{service.title}</h3></header><p>{service.lead}</p>
        <div className="health-tags">{service.tags.map(tag=><small key={tag}><Check/>{tag}</small>)}</div>
        <a href="/contact">{service.action}<ChevronLeft/></a>
      </article>})}</div>
    </section>

    <section className="health-secondary page-width">
      <article className="health-pharmacy motion"><div className="health-pharmacy-photo"><img src="/assets/health-pharmacy-hq.webp" alt="الصيدلية الخيرية"/></div><div><header><Pill/><h2>الصيدلية الخيرية</h2></header><p>توفير الأدوية للمحتاجين وأسر الأعضاء</p><ul><li>أدوية أساسية ومزمنة</li><li>أسعار رمزية للطلبة</li><li>شراكات مع صيدليات معتمدة</li></ul><a href="/contact">طلب دواء <ChevronLeft/></a></div></article>
      <article className="health-help-new motion"><header><HeartHandshake/><div><h2>طلب المساعدة والتواصل مع الرابطة</h2><p>نحن معك في الحالات الصحية والإنسانية</p></div></header><div>{helpOptions.map(item=>{const Icon=item.icon;return <a href="/contact" key={item.title}><Icon/><span><b>{item.title}</b>{item.text&&<small>{item.text}</small>}</span></a>})}</div><a className="health-help-cta" href="/contact">إرسال طلب المساعدة <ArrowLeft/></a></article>
    </section>

    <section className="health-reasons page-width motion"><div className="health-inline-title"><span/><h2>لماذا تستخدم خدمات الرابطة الصحية؟</h2><span/></div><div>{reasons.map(item=>{const Icon=item.icon;return <article key={item.title}><Icon/><b>{item.title}</b></article>})}</div></section>

    <section className="health-tips-new page-width"><div className="health-inline-title motion"><span/><h2>نصائح صحية</h2><span/></div><div>{tips.map(item=>{const Icon=item.icon;return <a className="motion" href="/contact" key={item.title}><Icon/><span><b>{item.title}</b><small>{item.text}</small></span><ChevronLeft/></a>})}</div></section>

    <section className="health-privacy page-width motion"><ShieldCheck/><div><h2>خصوصيتك تهمنا</h2><p>جميع بياناتك الصحية سرية وآمنة، ولا تتم مشاركتها مع أي جهة خارجية.</p></div><span><b><Clock3/> خدمة على مدار الساعة</b><b><Stethoscope/> أطباء معتمدون</b><b><LockKeyhole/> سرية تامة</b><b><ShieldCheck/> أمان البيانات</b></span></section>

    <section className="health-join page-width motion"><div className="health-pulse-line" aria-hidden="true"><HeartPulse/></div><div><h2>صحتك تهمنا .. نحن دائماً معك</h2><p>انضم إلى رابطة ولاية نهر النيل الإلكترونية وتمتع بخدمات صحية متكاملة</p></div><a href="/membership">سجل عضويتك الآن <UserRound/></a></section>
  </div>
}

// icon name → lucide component lookup for dynamic DB icons
const ICON_MAP: Record<string, React.ComponentType<{size?:number|string}>> = {
  Sprout, Landmark, Building2, UsersRound, Gem, Factory, ChartNoAxesCombined,
  MapPin, ShieldCheck, Clock3, WalletCards, ReceiptText, Percent, MessageCircle,
  UserCheck, BadgeCheck, Handshake, TrendingUp, Award, Globe2, BookOpen,
  HandHeart, HeartPulse, GraduationCap, Target, Info, Lightbulb, Banknote,
};
function DynIcon({name,fallback:Fallback}:{name:string;fallback:React.ComponentType<{size?:number|string}>}){const C=ICON_MAP[name]||Fallback;return <C/>;}

function InvestmentPage(){
  const heroMenu=[
    {icon:ChartNoAxesCombined,label:"فرص الاستثمار",href:"#investment-opportunities"},
    {icon:LayoutGrid,label:"القطاعات الاستثمارية",href:"#inv-sectors"},
    {icon:Gift,label:"الحوافز والتسهيلات",href:"#inv-incentives"},
    {icon:BookOpen,label:"دليل المستثمر",href:"/contact"},
    {icon:Award,label:"قصص نجاح",href:"#inv-stories"},
    {icon:UsersRound,label:"شركاؤنا",href:"#inv-partners"},
    {icon:MessageCircle,label:"تواصل مع إدارة الاستثمار",href:"/contact"},
  ];
  const features=[
    {icon:ChartNoAxesCombined,title:"عائد استثماري مجزٍ",text:"فرص متنوعة بعوائد مرتفعة ومستدامة",href:"#investment-opportunities"},
    {icon:Sprout,title:"موارد طبيعية غنية",text:"أراضٍ زراعية واسعة وثروات معدنية ومائية",href:"#inv-sectors"},
    {icon:MapPin,title:"موقع استراتيجي",text:"يربط بين السودان ودول الجوار والأسواق العالمية",href:"/contact"},
    {icon:ShieldCheck,title:"بيئة استثمارية آمنة",text:"تسهيلات وحوافز وتشريعات داعمة للمستثمرين",href:"#inv-incentives"},
  ];
  const trust=[
    {icon:MessageCircle,title:"دعم فني متواصل",text:"فريق متخصص لخدمة المستثمرين"},
    {icon:ReceiptText,title:"معلومات وبيانات دقيقة",text:"تقارير وإحصائيات محدثة"},
    {icon:UserCheck,title:"الشفافية والمصداقية",text:"بيئة استثمارية موثوقة"},
    {icon:BadgeCheck,title:"تواصل فعال",text:"نستمع لاحتياجاتك"},
    {icon:Clock3,title:"متابعة مستمرة",text:"من الفكرة وحتى التنفيذ"},
  ];

  // static fallbacks
  const staticStats=[
    {icon:"Sprout",value:"2.9+ مليون",label:"هكتار أراضٍ زراعية"},
    {icon:"Landmark",value:"500 ألف",label:"هكتار نيلية وشبكة مائية"},
    {icon:"Building2",value:"11+",label:"مجمعات ذات مقومات متنوعة"},
    {icon:"UsersRound",value:"850 كم",label:"من نهر النيل والسواقي"},
    {icon:"Gem",value:"3 مليون",label:"نسمة قوة بشرية شابة"},
  ];
  const staticSectors=[
    {image_url:"/assets/investment-hero-hq.webp",icon:"Sprout",name:"الزراعة والإنتاج النباتي",description:"أراضٍ خصبة ومياه وفيرة ومحاصيل استراتيجية",slug:"sector-agriculture"},
    {image_url:"/assets/invest-livestock-hq.webp",icon:"UsersRound",name:"الثروة الحيوانية",description:"ثروة حيوانية كبيرة ومراعي طبيعية واسعة",slug:"sector-livestock"},
    {image_url:"/assets/invest-industry-hq.webp",icon:"Factory",name:"الصناعة التحويلية",description:"مواد خام متوفرة وبنية صناعية متكاملة",slug:"sector-industry"},
    {image_url:"/assets/invest-mining-hq.webp",icon:"Gem",name:"التعدين والمحاجر",description:"ذهب، معادن، حجر جيري وموارد طبيعية",slug:"sector-mining"},
    {image_url:"/assets/invest-tourism-hq.webp",icon:"Landmark",name:"السياحة والضيافة",description:"مواقع أثرية وطبيعية وفنادق ومنتجعات",slug:"sector-tourism"},
  ];
  const staticOpps=[
    {image_url:"/assets/investment-orange-orchard.jpg",status:"available",title:"مشروع مزرعة فواكه استوائية",location:"شندي",min_investment:"3,000 فدان",slug:"opp-fruits"},
    {image_url:"/assets/investment-industrial-zone.jpg",status:"available",title:"مشروع منطقة صناعية متكاملة",location:"شندي",min_investment:"200 فدان",slug:"opp-industrial"},
    {image_url:"/assets/investment-red-bricks.jpg",status:"available",title:"مصنع الطوب الأحمر والبلوك",location:"بربر",min_investment:"5 هكتار",slug:"opp-bricks"},
    {image_url:"/assets/investment-hero-hq.webp",status:"available",title:"مشروع الاستزراع السمكي",location:"عطبرة",min_investment:"500 فدان",slug:"opp-fish"},
  ];
  const staticIncentives=[
    {icon:"Clock3",title:"حوافز ضريبية وجمركية"},
    {icon:"WalletCards",title:"تسهيلات في تملك الأراضي"},
    {icon:"ShieldCheck",title:"دعم فني وإرشادي متكامل"},
    {icon:"ReceiptText",title:"إجراءات سريعة وسهلة"},
    {icon:"Percent",title:"بيئة تحقق نمواً مستمراً"},
  ];

  const [dbStats, setDbStats] = useState<{icon:string;value:string;label:string}[]>([]);
  const [dbSectors, setDbSectors] = useState<{image_url:string;icon:string;name:string;description:string;slug:string}[]>([]);
  const [dbOpps, setDbOpps] = useState<{image_url:string;status:string;title:string;location:string;min_investment:string;slug:string}[]>([]);
  const [dbIncentives, setDbIncentives] = useState<{icon:string;title:string}[]>([]);
  const [dbStory, setDbStory] = useState<{name:string;title:string;story:string;image_url:string}|null>(null);

  useEffect(()=>{
    supabase.from("investment_stats").select("icon,value,label,sort_order").order("sort_order").then(({data})=>{if(data&&data.length>0)setDbStats(data)});
    supabase.from("investment_sectors").select("image_url,icon,name,description,slug").eq("published",true).order("sort_order").then(({data})=>{if(data&&data.length>0)setDbSectors(data)});
    supabase.from("investment_opportunities").select("image_url,status,title,location,min_investment,slug").eq("published",true).order("created_at",{ascending:false}).limit(4).then(({data})=>{if(data&&data.length>0)setDbOpps(data)});
    supabase.from("investment_incentives").select("icon,title").eq("published",true).order("sort_order").then(({data})=>{if(data&&data.length>0)setDbIncentives(data)});
    supabase.from("investment_success_stories").select("name,title,story,image_url").eq("published",true).order("created_at",{ascending:false}).limit(1).maybeSingle().then(({data})=>{if(data)setDbStory(data)});
  },[]);

  const stats     = dbStats.length     ? dbStats     : staticStats;
  const sectors   = dbSectors.length   ? dbSectors   : staticSectors;
  const opps      = dbOpps.length      ? dbOpps      : staticOpps;
  const incentives= dbIncentives.length? dbIncentives: staticIncentives;

  return <div className="investment-redesign">
    <section className="inv-hero">
      <div className="inv-hero-visual motion"><img src="/assets/investment-hero-hq.webp" alt="نهر النيل والأراضي الزراعية"/><article className="inv-hero-opportunity"><span>فرصة استثمارية مميزة</span><img src="/assets/investment-hero-hq.webp" alt="مشروع زراعة محورية متكامل"/><h3>مشروع زراعة محورية متكامل</h3><p>المساحة: 5,000 هكتار<br/>العائد المتوقع: 25% سنوياً</p><a href="#investment-opportunities">عرض التفاصيل <ChevronLeft/></a></article></div>
      <div className="inv-hero-copy motion"><h1>الاستثمار في<br/><span>ولاية نهر النيل</span></h1><h2>فرص واعدة .. مستقبل مستدام</h2><p>بيئة استثمارية جاذبة بموارد طبيعية غنية، موقع استراتيجي<br/>يدعم التنمية ويحقق عوائد مجزية للمستثمرين.</p><div className="inv-hero-features">{features.map(item=>{const Icon=item.icon;return <a className="inv-feature-link" href={item.href} key={item.title}><Icon/><b>{item.title}</b><small>{item.text}</small></a>})}</div></div>
      <aside className="inv-hero-menu motion"><h2><ChartNoAxesCombined/> خدمات الاستثمار</h2>{heroMenu.map((item,index)=>{const Icon=item.icon;return <a className={index===0?"active":""} href={item.href} key={item.label}><Icon/>{item.label}</a>})}</aside>
    </section>

    <section className="inv-stats page-width motion"><div className="inv-map"><svg viewBox="0 0 1653.539 1450.11" role="img" aria-label="خريطة السودان موضحاً عليها موقع ولاية نهر النيل"><use href="/assets/investment-river-nile-map.svg#States"/><use href="/assets/investment-river-nile-map.svg#Borders"/></svg></div>{stats.slice().reverse().map(item=><article key={item.label}><DynIcon name={item.icon} fallback={Sprout}/><b>{item.value}</b><small>{item.label}</small></article>)}<h2>أرقام الاستثمار في ولاية نهر النيل</h2></section>

    <div className="inv-dashboard page-width">
      <div className="inv-main-column">
        <section id="inv-sectors" className="inv-sectors"><header><a href="#inv-sectors">عرض الكل</a><h2>القطاعات الاستثمارية</h2></header><div className="inv-sector-grid">{sectors.map(item=><article className="motion" key={item.name}><div><img src={item.image_url||"/assets/investment-hero-hq.webp"} alt={item.name}/><span><DynIcon name={item.icon} fallback={Sprout}/></span></div><h3>{item.name}</h3><p>{item.description}</p><a href={`/investment/sector/${item.slug}`}>استعرض الفرص</a></article>)}</div></section>

        <section className="inv-solar motion"><img src="/assets/investment-solar-hq.webp" alt="مشروع الطاقة الشمسية"/><span>مساحة إعلانية</span><div><h2>استثمر في الطاقة الشمسية</h2><p>مشروع محطة طاقة شمسية بقدرة 50 ميجاوات</p><aside><b><Clock3/> عقد طويل الأجل</b><b><Percent/> عائد مستقر</b><b><ChartNoAxesCombined/> دعم حكومي</b></aside><a href="/contact">اعرف المزيد</a></div></section>

        <section id="investment-opportunities" className="inv-opportunities"><header><a href="#investment-opportunities">عرض الكل</a><h2>أحدث الفرص الاستثمارية</h2></header><div>{opps.map(item=><article className="motion" key={item.title}><div><img src={item.image_url||"/assets/investment-hero-hq.webp"} alt={item.title}/><span>{item.status==="available"?"فرصة جديدة":item.status==="in_progress"?"قيد التنفيذ":"مغلقة"}</span></div><h3>{item.title}</h3><p>الموقع: {item.location||"—"}<br/>الحد الأدنى: {item.min_investment||"—"}</p><a href={`/investment/opportunity/${item.slug}`}>عرض التفاصيل</a></article>)}</div><small>● ● ●</small></section>

        <section id="inv-incentives" className="inv-benefits motion"><h2>مزايا المستثمر</h2><div>{incentives.slice().reverse().map(item=><a className="inv-benefit-link" href="/contact" key={item.title}><DynIcon name={item.icon} fallback={ShieldCheck}/><b>{item.title}</b></a>)}</div></section>
      </div>

      <aside className="inv-side-column">
        <section className="inv-featured motion"><header><a href="#investment-opportunities">عرض الكل</a><h2>إعلانات فرص استثمارية مميزة</h2></header><img src="/assets/invest-industry-hq.webp" alt="مشروع مصنع زيوت نباتية"/><h3>مشروع مصنع زيوت نباتية</h3><p>الموقع: عطبرة<br/>المساحة: 10 هكتار<br/>العائد المتوقع: 22% سنوياً</p><a href="/contact">عرض التفاصيل</a></section>
        <section className="inv-resort motion"><img src="/assets/invest-tourism-hq.webp" alt="مشروع منتجع سياحي متكامل"/><h3>مشروع منتجع سياحي متكامل</h3><p>الموقع: المنطقة السياحية<br/>المساحة: 15 هكتار<br/>العائد المتوقع: 18% سنوياً</p><a href="#inv-sectors" className="inv-resort-link">استعرض القطاع السياحي</a><span>مساحة إعلانية</span></section>
        <section className="inv-partner motion"><img src="/assets/investment-partner-plant.jpg" alt="يدان تحتضنان نبتة ترمز للشراكة والتنمية"/><div><h2>شراكة .. تنمية .. ازدهار</h2><p>كن شريكاً في تطوير ولاية نهر النيل<br/>واستثمر في مستقبل واعد</p><a href="/contact">تواصل معنا</a></div><footer><b><ChartNoAxesCombined/> فرصة</b><b><Handshake/> شراكة</b><b><UsersRound/> تنمية</b></footer></section>
        <section id="inv-stories" className="inv-story motion"><header><a href="#inv-stories">عرض الكل</a><h2>قصص نجاح</h2></header><div><img src={dbStory?.image_url||"/assets/investment-poultry.jpg"} alt={dbStory?.name||"مشروع دواجن الدامر"}/><p><b>{dbStory?.name||"مشروع دواجن الدامر"}</b><span>{dbStory?.story||"بدأ المشروع بمزرعة صغيرة وأصبح اليوم من أكبر مشاريع الدواجن بالولاية."}</span><a href="/contact">اقرأ القصة كاملة</a></p></div></section>
      </aside>
    </div>

    <section className="inv-trust motion">{trust.slice().reverse().map(item=>{const Icon=item.icon;return <article key={item.title}><Icon/><span><b>{item.title}</b><small>{item.text}</small></span></article>})}</section>
  </div>
}

function CulturePage(){
  const heroMenu=[
    {icon:CalendarDays,label:"الفعاليات والأنشطة",href:"#culture-activities"},
    {icon:Newspaper,label:"الأخبار الثقافية",href:"#culture-news"},
    {icon:LibraryBig,label:"المكتبة الرقمية",href:"#culture-library"},
    {icon:Palette,label:"الفنون والأدب",href:"#culture-arts"},
    {icon:Landmark,label:"التراث والتاريخ",href:"#culture-activities"},
    {icon:GraduationCap,label:"التعليم الثقافي",href:"#culture-library"},
    {icon:MessageCircle,label:"المنتديات الثقافية",href:"#culture-associations"},
    {icon:Lightbulb,label:"المبادرات والمشاريع",href:"#culture-initiatives"},
    {icon:Trophy,label:"المسابقات والجوائز",href:"#culture-contests"},
    {icon:UsersRound,label:"الفرق والجمعيات الثقافية",href:"#culture-associations"},
  ];
  const heroFeatures=[
    {icon:Aperture,title:"الإبداع والابتكار",text:"تشجيع التفكير الإبداعي وتطوير المبادرات الثقافية"},
    {icon:Globe2,title:"التواصل الثقافي",text:"التفاعل الثقافي بين أبناء الولاية والعالم"},
    {icon:UsersRound,title:"دعم المواهب",text:"اكتشاف ورعاية المواهب في مختلف المجالات"},
    {icon:Award,title:"إحياء التراث",text:"حفظ وإحياء التراث السوداني الأصيل"},
  ];
  const stats=[
    {icon:UserRound,n:"2,450",label:"عضو نشط"},
    {icon:CalendarDays,n:"85",label:"فعالية ثقافية"},
    {icon:Lightbulb,n:"120",label:"مبادرة ثقافية"},
    {icon:UsersRound,n:"650+",label:"مبدع وفنان"},
    {icon:Landmark,n:"35",label:"فرقة وجمعية"},
  ];
  const arts=[
    {slug:"art-poetry",image:"/assets/culture-hero-hq.webp",icon:Feather,title:"القصة والشعر",text:"قصائد وأعمال أدبية"},
    {slug:"art-visual",image:"/assets/culture-gallery-hq.webp",icon:Palette,title:"الفنون التشكيلية",text:"رسم وفنون بصرية"},
    {slug:"art-music",image:"/assets/culture-poetry-hq.webp",icon:Music2,title:"الموسيقى والغناء",text:"إبداع موسيقي"},
    {slug:"art-theater",image:"/assets/culture-seminar-hq.webp",icon:UsersRound,title:"المسرح والدراما",text:"عروض وتمثيل"},
    {slug:"art-photo",image:"/assets/culture-folk-hq.webp",icon:Camera,title:"التصوير الفوتوغرافي",text:"صور وحكايات"},
  ];
  const trust=[
    {icon:RefreshCw,title:"سهولة الاستخدام",text:"واجهة بسيطة وسهلة"},
    {icon:BadgeCheck,title:"تحديثات مستمرة",text:"محتوى ثقافي أولاً بأول"},
    {icon:Award,title:"محتوى موثوق",text:"معلومات دقيقة ومعتمدة"},
    {icon:MonitorCheck,title:"منصة آمنة",text:"حماية بيانات وخصوصية"},
    {icon:MessageCircle,title:"دعم فني متواصل",text:"فريق متخصص لمساعدتك"},
  ];

  type ActivityItem = {id:string;image:string;tag:string;title:string;date:string;location:string};
  type ArtistItem   = {id:string;slug:string;image:string;name:string;role:string};
  type AssocItem    = {id:string;slug:string;icon:React.ElementType;title:string;place:string};
  type InitItem     = {id:string;slug:string;image:string;title:string;text:string};
  type ContestItem  = {title:string;date:string;prize:string};
  type NewsItem     = {id:string;image:string;title:string;date:string};
  type MediaItem    = {id:string;image:string;type:string;title:string;date:string;link:string};

  const [activities, setActivities] = useState<ActivityItem[]>([
    {id:"",image:"/assets/culture-folk-hq.webp",tag:"مهرجان تراثي",title:"مهرجان نهر النيل للتراث",date:"18 مايو 2025",location:"المدينة القديمة - عطبرة"},
    {id:"",image:"/assets/culture-seminar-hq.webp",tag:"ندوة ثقافية",title:"ندوة دور الثقافة في بناء المجتمع",date:"22 مايو 2025",location:"قاعة المؤتمرات"},
    {id:"",image:"/assets/culture-gallery-hq.webp",tag:"معرض فني",title:"معرض الفنون التشكيلية",date:"23 مايو 2025",location:"مركز الفنون"},
    {id:"",image:"/assets/culture-poetry-hq.webp",tag:"أمسية شعرية",title:"أمسية شعرية لشعراء الشباب",date:"25 مايو 2025",location:"قاعة بيت الثقافة"},
  ]);
  const [artists, setArtists] = useState<ArtistItem[]>([
    {id:"",slug:"",image:"/assets/culture-tayeb.jpg",name:"د. الطيب صالح",role:"أديب وروائي سوداني"},
    {id:"",slug:"",image:"/assets/culture-ahmed.jpg",name:"أحمد المصطفى",role:"شاعر سوداني"},
    {id:"",slug:"",image:"/assets/culture-taj.jpg",name:"تاج السر الحسن",role:"كاتب وإعلامي"},
    {id:"",slug:"",image:"/assets/culture-wardi.gif",name:"محمد وردي",role:"فنان ومطرب"},
  ]);
  const [associations, setAssociations] = useState<AssocItem[]>([
    {icon:Feather,title:"جمعية الخط العربي",place:"شندي"},
    {icon:Aperture,title:"فرقة المسرح الشبابي",place:"المتمة"},
    {icon:Globe2,title:"نادي الأدب والفنون",place:"عطبرة"},
    {icon:RefreshCw,title:"جمعية التراث السوداني",place:"بربر"},
    {icon:Landmark,title:"فرقة نهر النيل التقليدية",place:"الدامر"},
  ]);
  const [initiatives, setInitiatives] = useState<InitItem[]>([
    {image:"/assets/culture-folk-hq.webp",title:"مشروع توثيق التراث الشفهي",text:"جمع وتوثيق الحكايات والأغاني الشعبية",id:"",slug:""},
    {image:"/assets/culture-seminar-hq.webp",title:"مبادرة دعم المواهب الشابة",text:"احتضان وتنمية المبدعين في السودان",id:"",slug:""},
    {image:"/assets/culture-gallery-hq.webp",title:"مشروع المتاحف المتنقلة",text:"نشر الثقافة في المناطق المختلفة",id:"",slug:""},
  ]);
  const [contests, setContests] = useState<ContestItem[]>([
    {title:"مسابقة الشعر السنوية",date:"آخر موعد: 30 مايو 2025",prize:"جائزة مالية"},
    {title:"جائزة الإبداع الفني",date:"آخر موعد: 15 يونيو 2025",prize:"ميدالية ذهبية"},
    {title:"مسابقة التصوير الضوئي",date:"آخر موعد: 1 يوليو 2025",prize:"معرض رسمي"},
  ]);
  const [news, setNews] = useState<NewsItem[]>([
    {id:"",image:"/assets/culture-seminar-hq.webp",title:"إطلاق مبادرة إحياء التراث السوداني",date:"20 مايو 2025"},
    {id:"",image:"/assets/culture-gallery-hq.webp",title:"نجاح معرض الفنون التشكيلية الأول",date:"18 مايو 2025"},
    {id:"",image:"/assets/culture-poetry-hq.webp",title:"ندوة حول دور الشباب في الثقافة",date:"15 مايو 2025"},
    {id:"",image:"/assets/culture-folk-hq.webp",title:"توقيع اتفاقية شراكة ثقافية جديدة",date:"10 مايو 2025"},
  ]);
  const [media, setMedia] = useState<MediaItem[]>([
    {id:"",image:"/assets/culture-folk-hq.webp",type:"فيديو",title:"مهرجان التراث السوداني 2025",date:"12 مايو 2025",link:""},
    {id:"",image:"/assets/culture-poetry-hq.webp",type:"بودكاست",title:"أمسية شعرية رائعة",date:"8 مايو 2025",link:""},
    {id:"",image:"/assets/culture-gallery-hq.webp",type:"فيديو",title:"معرض الفنون التشكيلية",date:"5 مايو 2025",link:""},
  ]);

  const iconMap: Record<string, React.ElementType> = {
    BookOpen, Landmark, Palette, Music2, UsersRound, Feather, Aperture,
    Globe2, RefreshCw, Trophy, Building: Building2, Music: Music2,
  };

  const calendar=[
    {day:"25",month:"مايو",title:"أمسية شعرية للشباب",place:"قاعة بيت الثقافة - عطبرة"},
    {day:"30",month:"مايو",title:"معرض الفنون التشكيلية",place:"مركز الفنون - بربر"},
    {day:"5",month:"يونيو",title:"ندوة الثقافة والمجتمع",place:"قاعة المؤتمرات - شندي"},
    {day:"15",month:"يونيو",title:"مهرجان نهر النيل للتراث",place:"المدينة القديمة - عطبرة"},
  ];

  useEffect(()=>{
    supabase.from("culture_events").select("*").eq("published",true).order("sort_order").then(({data})=>{
      if(data&&data.length>0) setActivities(data.map(r=>({id:r.id,image:r.image_url||"/assets/culture-folk-hq.webp",tag:r.tag,title:r.title,date:r.event_date,location:r.location})));
    });
    supabase.from("culture_artists").select("*").eq("published",true).order("sort_order").then(({data})=>{
      if(data&&data.length>0) setArtists(data.map(r=>({id:r.id,slug:r.slug||"",image:r.image_url||"/assets/culture-tayeb.jpg",name:r.name,role:r.role})));
    });
    supabase.from("culture_associations").select("id,slug,title,place,icon,published,sort_order").eq("published",true).order("sort_order").then(({data})=>{
      if(data&&data.length>0) setAssociations(data.map(r=>({id:r.id,slug:r.slug||"",icon:iconMap[r.icon]||UsersRound,title:r.title,place:r.place})));
    });
    supabase.from("culture_initiatives").select("*").eq("published",true).order("sort_order").then(({data})=>{
      if(data&&data.length>0) setInitiatives(data.map(r=>({id:r.id,slug:r.slug||"",image:r.image_url||"/assets/culture-folk-hq.webp",title:r.title,text:r.text})));
    });
    supabase.from("culture_contests").select("*").eq("published",true).order("sort_order").then(({data})=>{
      if(data&&data.length>0) setContests(data.map(r=>({title:r.title,date:r.deadline,prize:r.prize||""})));
    });
    supabase.from("culture_news").select("*").eq("published",true).order("sort_order").then(({data})=>{
      if(data&&data.length>0) setNews(data.map(r=>({id:r.id,image:r.image_url||"/assets/culture-seminar-hq.webp",title:r.title,date:r.published_at?new Date(r.published_at).toLocaleDateString("ar-EG",{day:"2-digit",month:"long"}):""})));
    });
    supabase.from("culture_media").select("*").eq("published",true).order("sort_order").then(({data})=>{
      if(data&&data.length>0) setMedia(data.map(r=>({id:r.id,image:r.image_url||"/assets/culture-folk-hq.webp",type:r.type,title:r.title,date:r.media_date,link:r.link_url||""})));
    });
  },[]);
  return <div className="culture-redesign">
    <section className="cul-hero">
      <div className="cul-hero-visual motion"><img src="/assets/culture-hero-hq.webp" alt="العود والكتب وعلم السودان في مشهد يعبر عن الثقافة السودانية"/></div>
      <div className="cul-hero-copy motion"><div><h1>الثقافة .. هوية وإبداع</h1><h2>نصون تراثنا .. ونبدع لمستقبلنا</h2><p>منصة ثقافية رقمية شاملة تهدف إلى إبراز التراث السوداني الأصيل<br/>ودعم المواهب والإبداع في جميع المجالات الثقافية والفنية.</p></div><div className="cul-hero-features">{heroFeatures.map(item=>{const Icon=item.icon;return <article key={item.title}><Icon/><b>{item.title}</b><small>{item.text}</small></article>})}</div></div>
      <aside className="cul-hero-menu motion"><h2><Landmark/> الخدمات الثقافية</h2>{heroMenu.map((item,index)=>{const Icon=item.icon;return <a className={index===0?"active":""} href={item.href} key={item.label}><Icon/>{item.label}</a>})}</aside>
    </section>

    <div className="cul-dashboard page-width">
      <div className="cul-main-column">
        <section className="cul-stats motion"><h2><ChartNoAxesCombined/> أرقام وإحصائيات<br/>الثقافة</h2>{stats.map(item=>{const Icon=item.icon;return <article key={item.label}><Icon/><span><b>{item.n}</b><small>{item.label}</small></span></article>})}</section>

        <section id="culture-activities" className="cul-panel cul-activities"><CulturePanelHead title="الفعاليات والأنشطة الثقافية" href="/culture#culture-activities"/><div className="cul-activity-grid">{activities.map(item=><article className="motion" key={item.title}><div><img src={item.image} alt={item.title}/><span>{item.tag}</span></div><h3>{item.title}</h3><p><CalendarDays/> {item.date}</p><p><MapPin/> {item.location}</p><a href={item.id?`/culture/event/${item.id}`:"#"}>تفاصيل الفعالية</a></article>)}</div><small className="cul-dots">● ● ● ●</small></section>

        <div className="cul-library-arts">
          <section id="culture-library" className="cul-panel cul-library motion"><CulturePanelHead title="المكتبة الرقمية" href="/contact"/><div><img src="/assets/education-reference-library-books.png" alt="كتب وجهاز قراءة إلكتروني"/><article><h3>آلاف الكتب والمراجع<br/>الثقافية في متناول يدك</h3><ul><li><BookOpen/> كتب التراث السوداني</li><li><FileText/> الدراسات والبحوث</li><li><Newspaper/> المجلات الثقافية</li><li><FileImage/> الكتب المصورة</li></ul><a href="/contact">استكشف المكتبة <ChevronLeft/></a></article></div></section>
          <section id="culture-arts" className="cul-panel cul-arts"><CulturePanelHead title="الفنون والأدب" href="/culture#culture-arts"/><div>{arts.map(item=>{const Icon=item.icon;return <a className="motion" href={`/culture/art/${item.slug}`} key={item.title}><span><img src={item.image} alt=""/><Icon/></span><b>{item.title}</b><small>{item.text}</small></a>})}</div></section>
        </div>

        <div className="cul-assoc-initiatives">
          <section id="culture-associations" className="cul-panel cul-associations"><CulturePanelHead title="الفرق والجمعيات الثقافية" href="/culture#culture-associations"/><div>{associations.map(item=>{const Icon=item.icon;return <a className="motion" href={item.slug?`/culture/association/${item.slug}`:"#"} onClick={item.slug?undefined:(e)=>e.preventDefault()} key={item.title}><Icon/><b>{item.title}</b><small>{item.place}</small></a>})}</div></section>
          <section id="culture-initiatives" className="cul-panel cul-initiatives"><CulturePanelHead title="المبادرات والمشاريع" href="/culture#culture-initiatives"/><div>{initiatives.map(item=><a className="motion" href={item.slug?`/culture/initiative/${item.slug}`:"#"} key={item.title}><img src={item.image} alt=""/><span><b>{item.title}</b><small>{item.text}</small></span><i>+</i></a>)}</div><a className="cul-panel-action" href="/culture#culture-initiatives">عرض جميع المبادرات</a></section>
        </div>

        <div className="cul-bottom-panels">
          <section id="culture-news" className="cul-panel cul-news"><CulturePanelHead title="أحدث الأخبار الثقافية" href="/culture#culture-news"/>{news.map(item=><a className="motion" href={item.id?`/culture/news/${item.id}`:"#"} key={item.title}><img src={item.image} alt=""/><span><b>{item.title}</b><small>{item.date}</small></span></a>)}</section>
          <section className="cul-panel cul-media"><CulturePanelHead title="ميديا الثقافة" href="/culture"/>{media.map(item=><a className="motion" href={item.id?`/culture/media/${item.id}`:"#"} onClick={item.id?undefined:(e)=>e.preventDefault()} key={item.title}><span><img src={item.image} alt=""/><PlayCircle/></span><p><em>{item.type}</em><b>{item.title}</b><small>{item.date}</small></p></a>)}</section>
          <section className="cul-panel cul-calendar"><CulturePanelHead title="التقويم الثقافي" href="/events"/>{calendar.map(item=><a className="motion" href="/events" key={`${item.day}-${item.title}`}><time><b>{item.day}</b><small>{item.month}</small></time><span><b>{item.title}</b><small><MapPin/> {item.place}</small></span></a>)}</section>
        </div>
      </div>

      <aside className="cul-side-column">
        <section className="cul-panel cul-artists motion"><CulturePanelHead title="أبرز الفنانين والأدباء" href="/culture#cul-artists"/><div>{artists.map(item=><a href={item.slug?`/culture/artist/${item.slug}`:"#"} key={item.name}><img src={item.image} alt={item.name}/><span><b>{item.name}</b><small>{item.role}</small></span></a>)}</div></section>
        <section className="cul-join motion"><h2>انضم إلى مجتمع الثقافة</h2><p>شارك في المنتديات والأنشطة<br/>الثقافية وكن جزءاً من مجتمعنا</p><a href="/membership">انضم الآن <UsersRound/></a></section>
        <section id="culture-contests" className="cul-panel cul-contests"><CulturePanelHead title="المسابقات والجوائز" href="/culture#culture-contests"/><div>{contests.map(item=><a className="motion" href="/contact" key={item.title}><Trophy/><span><b>{item.title}</b><small>{item.date}</small></span></a>)}</div><a className="cul-panel-action" href="/contact">المزيد من المسابقات</a></section>
        <section className="cul-share motion"><h2>شارك محتواك الثقافي</h2><p>لديك موهبة أو محتوى ثقافي؟<br/>شاركنا وكن مبدعاً</p><div><span><Feather/><b>تدوينة</b></span><span><Video/><b>فيديو</b></span><span><FileImage/><b>صورة</b></span><span><FileText/><b>مقال</b></span></div><a href="/contact">أرسل محتواك</a></section>
      </aside>
    </div>

    <section className="cul-trust motion">{trust.map(item=>{const Icon=item.icon;return <article key={item.title}><Icon/><span><b>{item.title}</b><small>{item.text}</small></span></article>})}</section>
  </div>
}

function CulturePanelHead({title,href="/culture"}:{title:string;href?:string}){return <header className="cul-panel-head"><a href={href}>عرض الكل</a><h2>{title}</h2></header>}

function PortalHero({type}:{type:PortalKey}){const p=info[type];return <><section className={`portal-hero portal-${type}`}><div className="portal-copy motion"><h1>{p.title}</h1><h2>{p.accent}</h2><p>{p.lead}</p></div><div className="portal-image motion"><img src={p.hero} alt={p.title}/></div>{["education","investment","culture"].includes(type)&&<aside className="portal-side motion"><h3>{p.icon}&nbsp; خدمات {p.title}</h3>{p.tabs.map((t,i)=><a key={t} className={i===0?"selected":""} href="#services">{t}<span>⌃</span></a>)}</aside>}</section><section className="portal-features motion">{(type==="health"?["في خدمتكم أينما كنتم","متاحة إلكترونياً","خدمة سريعة","موثوقة وآمنة"]:type==="social"?["حالات إنسانية","تواصل مباشر","استشارة اجتماعية","برامج ومبادرات","دعم المحتاجين"]:["جودة وتميز","دعم شامل","محتوى متخصص","تعلّم مرن"]).map((x,i)=><div key={x}><i>{["◎","▣","◷","♢","♡"][i]}</i><b>{x}</b><span>خدمة رقمية متكاملة</span></div>)}</section></>}

function PortalPage({type}:{type:PortalKey}){const p=info[type];return <><PortalHero type={type}/><section className="stat-ribbon page-width motion">{p.stats.map(([n,l],i)=><div key={l}><i>{["♧","⌂","▦","↗"][i]}</i><b>{n}</b><span>{l}</span></div>)}</section><section id="services" className="section page-width"><SectionTitle mini="خدمات متكاملة بين يديك">{p.section}</SectionTitle><div className={`visual-card-grid ${type==="health"?"three-primary":""}`}>{p.cards.map((c,i)=><article className={`visual-card motion ${i===3&&type==="health"?"wide-health":""}`} key={c.title}><img src={c.image} alt={c.title}/><div><i>{c.icon}</i><h3>{c.title}</h3><p>{c.text}</p><ul><li>خدمة سهلة وسريعة</li><li>متابعة ودعم مستمر</li><li>خصوصية وأمان</li></ul><a href="/contact" className="card-action">{type==="social"?"ساهم الآن":"معرفة المزيد"} <Arrow/></a></div></article>)}</div></section>{type==="education"&&<EducationExtras/>}{type==="investment"&&<InvestmentExtras/>}{type==="culture"&&<CultureExtras/>}{type==="social"&&<SocialExtras/>}{type==="health"&&<HealthExtras/>}<SupportBar/></>}

function EducationExtras(){return <><section className="library-band page-width motion"><div><span>المكتبة الرقمية</span><h2>مصادر تعليمية موثوقة ومتنوعة</h2><div className="library-items"><b>▥ 2,500+ كتاب</b><b>▣ 1,200+ بحث ومقال</b><b>▶ 800+ فيديو</b><b>▤ 3,000+ ملف</b></div></div><img src="/assets/education-hero-hq.webp" alt="المكتبة الرقمية"/></section><section className="compact-panels page-width"><article><h3>الأخبار التعليمية</h3>{["إطلاق منصة مدرسة نهر النيل","بدء التسجيل في المنح","نتائج الاختبارات الفصلية"].map(x=><p key={x}>◫ {x}<small>مايو 2025</small></p>)}</article><article><h3>الفعاليات القادمة</h3>{["ورشة مهارات المستقبل","ندوة التعليم الرقمي","ملتقى الطلاب والمعلمين"].map(x=><p key={x}>◷ {x}<small>قريباً</small></p>)}</article></section></>}
function InvestmentExtras(){return <><section className="solar-banner page-width motion"><img src="/assets/investment-solar-hq.webp" alt="الطاقة الشمسية"/><div><h2>استثمر في الطاقة الشمسية</h2><p>مشروع محطة طاقة شمسية بقدرة 50 ميجاوات</p><a className="primary" href="/contact">اعرف المزيد</a></div></section><section className="compact-panels page-width"><article><h3>مزايا المستثمر</h3><div className="icon-row"><b>شبكة بنية تحتية</b><b>إجراءات ميسرة</b><b>دعم فني وإداري</b><b>تسويق مضمون</b></div></article><article><h3>قصة نجاح</h3><img className="mini-story" src="/assets/invest-industry-hq.webp" alt="مشروع استثماري ناجح"/><p>مشروع دواجن الدامر.. من فكرة صغيرة إلى قصة نجاح كبيرة.</p></article></section></>}
function CultureExtras(){return <><section className="compact-panels page-width"><article><h3>المكتبة الرقمية</h3><div className="culture-library"><img src="/assets/culture-hero-hq.webp" alt="كتب وتراث"/><div><h2>آلاف الكتب والمراجع الثقافية</h2><p>كتب التراث السوداني، الدراسات والبحوث، المجلات الثقافية والكتب المصورة.</p><a className="primary" href="/library">استكشف المكتبة</a></div></div></article><article><h3>المسابقات والجوائز</h3>{["مسابقة الشعر السنوية","جائزة الإبداع الفني","جائزة التصوير الضوئي"].map(x=><p key={x}>♕ {x}<small>مايو 2025</small></p>)}</article></section><section className="compact-panels page-width"><article><h3>الفرق والجمعيات الثقافية</h3><div className="icon-row"><b>جمعية الخط العربي</b><b>جمعية المسرح</b><b>نادي الأدب</b><b>فرقة نهر النيل</b></div></article><article><h3>شارك محتواك الثقافي</h3><p>لديك موهبة أو محتوى ثقافي؟ شاركه مع مجتمعنا.</p><a className="primary" href="/contact">أرسل محتواك</a></article></section></>}
function SocialExtras(){return <section className="social-counts page-width motion">{[["120+","متطوع نشط"],["320+","طالب مستفيد"],["650+","فرصة دعم"],["1,850+","حالة إنسانية"],["3,250+","أسرة مستفيدة"],["12,680+","مستفيد"]].map(([n,l])=><div key={l}><i>♧</i><b>{n}</b><span>{l}</span></div>)}</section>}
function HealthExtras(){return <><section className="health-help page-width motion"><div><h2>طلب المساعدة والتواصل مع الرابطة</h2><p>نحن معك في الحالات الصحية والإنسانية</p></div><div className="health-actions"><b>♡ رفع حالة لطلب طبي</b><b>♧ طلب مساعدة صحية عاجلة</b><b>☏ التواصل المباشر</b><b>▤ متابعة حالة</b></div><a className="primary" href="/contact">إرسال طلب المساعدة</a></section><section className="health-tips page-width"><SectionTitle>نصائح صحية</SectionTitle><div>{["متابعة دورية لحالتك المرضية","تغذية متوازنة لجسم أكثر صحة","المشي 30 دقيقة يومياً","اشرب الماء لصحة أفضل"].map((x,i)=><b className="motion" key={x}><i>{["♡","♧","♟","◉"][i]}</i>{x}</b>)}</div></section></>}
function SupportBar(){return <section className="support-bar page-width motion"><i>☏</i><div><h2>نحن هنا لمساعدتك</h2><p>فريق الدعم جاهز للرد على استفسارك وتقديم المساعدة.</p></div><div><b>واتساب</b><span>+249 912 345 678</span></div><div><b>البريد الإلكتروني</b><span>info@nilenile.org</span></div><a className="outline light" href="/contact">تواصل معنا <Arrow/></a></section>}

function InternalPage({type}:{type:InternalKey}){
  const configs={
    services:{
      badge:"بوابتك الرقمية",title:"كل خدمات الرابطة",accent:"في مكان واحد",lead:"اكتشف منظومة متكاملة من الخدمات الرقمية المصممة لخدمة أبناء ولاية نهر النيل في الداخل والخارج.",hero:"/assets/home-hero-reference-v2.webp",icon:LayoutGrid,
      stats:[["7","مسارات خدمية"],["24/7","وصول مستمر"],["35K+","مستفيد"],["98%","رضا المستخدمين"]],sectionTitle:"اختر الخدمة التي تحتاجها",sectionLead:"انتقل مباشرة إلى المجال المناسب واستفد من خدمات موثوقة وسريعة.",
      featuredImage:"/assets/home-training-hq.webp",featuredTitle:"تعلّم وتطوّر من أي مكان",featuredText:"مركز التدريب بوابتك للدورات المهنية والبرامج العملية التي تساعدك على تطوير مهاراتك.",featuredHref:TRAINING_URL,featuredLabel:"زيارة مركز التدريب",
      ctaTitle:"لم تجد الخدمة التي تبحث عنها؟",ctaText:"فريق الرابطة جاهز لمساعدتك وتوجيهك إلى المسار الصحيح.",ctaHref:"/contact",ctaLabel:"تواصل مع فريق الدعم",
      items:[
        {icon:GraduationCap,tag:"تعليم",title:"التعليم والتدريب",text:"مدرسة إلكترونية ومصادر تعليمية وبرامج تدريب مهني.",image:"/assets/education-hero-hq.webp",href:"/education"},
        {icon:Stethoscope,tag:"صحة",title:"الخدمات الصحية",text:"استشارات ورعاية صحية ومساندة للحالات الطبية.",image:"/assets/health-hero-hq.webp",href:"/health"},
        {icon:HandHeart,tag:"مجتمع",title:"الخدمات الاجتماعية",text:"دعم اجتماعي وحالات إنسانية ومبادرات للتكافل.",image:"/assets/social-hero-hq.webp",href:"/social"},
        {icon:ChartNoAxesCombined,tag:"فرص",title:"الاستثمار",text:"فرص استثمارية وقطاعات واعدة ودليل للمستثمر.",image:"/assets/investment-hero-hq.webp",href:"/investment"},
        {icon:Landmark,tag:"هوية",title:"الثقافة والتراث",text:"فعاليات ومحتوى ثقافي يحفظ تراث الولاية وإبداعها.",image:"/assets/culture-hero-hq.webp",href:"/culture"},
        {icon:ShoppingCart,tag:"خارجي",title:"السوق السوداني",text:"منصة للمنتجات والخدمات والفرص التجارية السودانية.",image:"/assets/home-market-hq.webp",href:MARKET_URL},
      ]
    },
    initiatives:{
      badge:"أثر يمتد",title:"مبادرات تصنع الفرق",accent:"معاً نحو تنمية مستدامة",lead:"مشروعات حقيقية تجمع أبناء الولاية حول التعليم والصحة والتكافل والتنمية الاقتصادية.",hero:"/assets/investment-solar-hq.webp",icon:HeartHandshake,
      stats:[["120+","مبادرة مكتملة"],["60+","شريك نجاح"],["12,680+","مستفيد"],["18","مشروعاً نشطاً"]],sectionTitle:"مبادراتنا الحالية",sectionLead:"ساهم بخبرتك أو وقتك أو دعمك، وكل مشاركة تصنع أثراً قابلاً للقياس.",
      featuredImage:"/assets/social-education-hq.webp",featuredTitle:"مبادرة دعم المدارس",featuredText:"تطوير البيئة التعليمية وتوفير الأدوات الأساسية للطلاب والمعلمين في المناطق الأكثر احتياجاً.",featuredHref:"/contact",featuredLabel:"شارك في المبادرة",
      ctaTitle:"لديك فكرة مبادرة؟",ctaText:"شاركنا فكرتك وسنساعدك على تحويلها إلى مشروع يخدم مجتمع الولاية.",ctaHref:"/contact",ctaLabel:"أرسل فكرتك الآن",
      items:[
        {icon:BookOpen,tag:"تعليم",title:"دعم المدارس",text:"تجهيز الفصول وتوفير الأدوات والمواد التعليمية.",image:"/assets/social-education-hq.webp",href:"/contact"},
        {icon:HeartPulse,tag:"صحة",title:"صندوق العلاج",text:"مساندة المرضى وتوفير العلاج والأدوية للحالات المحتاجة.",image:"/assets/social-medical-hq.webp",href:"/contact"},
        {icon:Building2,tag:"إعمار",title:"ترميم المنازل",text:"تحسين السكن للأسر المتضررة ورفع جودة الحياة.",image:"/assets/social-renovation-hq.webp",href:"/contact"},
        {icon:Sprout,tag:"تنمية",title:"الزراعة المستدامة",text:"دعم المشروعات الزراعية الصغيرة ورفع الإنتاجية.",image:"/assets/invest-livestock-hq.webp",href:"/contact"},
        {icon:Lightbulb,tag:"طاقة",title:"الطاقة الشمسية",text:"حلول طاقة نظيفة للمرافق والمجتمعات المحلية.",image:"/assets/investment-solar-hq.webp",href:"/contact"},
        {icon:UsersRound,tag:"شباب",title:"تمكين الشباب",text:"تدريب وتأهيل مهني يفتح أبواب العمل وريادة الأعمال.",image:"/assets/home-training-hq.webp",href:TRAINING_URL},
      ]
    },
    news:{
      badge:"نبض الولاية",title:"الأخبار والفعاليات",accent:"كل جديد في مكان واحد",lead:"تابع أخبار الرابطة ومشروعاتها وفعالياتها التعليمية والثقافية والاجتماعية.",hero:"/assets/culture-seminar-hq.webp",icon:Newspaper,
      stats:[["85+","فعالية سنوية"],["200+","خبر وتحديث"],["12","مجالاً مجتمعياً"],["25+","دولة مشاركة"]],sectionTitle:"أحدث الأخبار والتحديثات",sectionLead:"قصص ومبادرات وفعاليات تعكس حيوية مجتمع نهر النيل وتنوعه.",
      featuredImage:"/assets/investment-hero-hq.webp",featuredTitle:"ملتقى الاستثمار والتنمية",featuredText:"لقاء يجمع الخبرات والمستثمرين وأبناء الولاية لمناقشة الفرص الواعدة ومشروعات التنمية.",featuredHref:"/contact",featuredLabel:"تفاصيل الفعالية",
      ctaTitle:"لديك خبر أو فعالية؟",ctaText:"أرسل التفاصيل إلى فريق التحرير للمراجعة والنشر عبر منصات الرابطة.",ctaHref:"/contact",ctaLabel:"أرسل المحتوى",
      items:[
        {icon:GraduationCap,tag:"تعليم",title:"إطلاق منصة المدرسة الإلكترونية",text:"بيئة رقمية متكاملة للطلاب والمعلمين وأولياء الأمور.",image:"/assets/education-reference-news-1.png",href:"/contact"},
        {icon:UsersRound,tag:"فعالية",title:"ملتقى شباب نهر النيل",text:"مساحة للحوار وتبادل الخبرات وصناعة المبادرات.",image:"/assets/culture-seminar-hq.webp",href:"/contact"},
        {icon:Palette,tag:"ثقافة",title:"معرض الفنون السنوي",text:"احتفاء بإبداعات الفنانين والمواهب الشابة في الولاية.",image:"/assets/culture-gallery-hq.webp",href:"/contact"},
        {icon:Stethoscope,tag:"صحة",title:"أسبوع الاستشارات الطبية",text:"استشارات مجانية عن بُعد في مجموعة من التخصصات.",image:"/assets/health-consult-hq.webp",href:"/contact"},
        {icon:Sprout,tag:"استثمار",title:"فرص جديدة في القطاع الزراعي",text:"مشروعات واعدة للاستثمار الزراعي والصناعات المرتبطة.",image:"/assets/investment-orange-orchard.jpg",href:"/contact"},
        {icon:Award,tag:"تدريب",title:"بدء التسجيل في البرامج المهنية",text:"مسارات عملية في الإدارة والتقنية واللغات والتصميم.",image:"/assets/course-project-hq.webp",href:TRAINING_URL},
      ]
    },
    library:{
      badge:"معرفة بلا حدود",title:"المكتبة الرقمية",accent:"مصادر موثوقة بين يديك",lead:"بوابة معرفية تجمع الكتب والأبحاث والمرئيات والملفات التعليمية والثقافية في تجربة بحث سهلة.",hero:"/assets/education-reference-library-books.png",icon:LibraryBig,
      stats:[["2,500+","كتاب رقمي"],["1,200+","بحث ومقال"],["800+","فيديو تعليمي"],["3,000+","ملف ومصدر"]],sectionTitle:"استكشف أقسام المكتبة",sectionLead:"محتوى منظم يدعم الطلاب والباحثين والمهتمين بتاريخ وثقافة ولاية نهر النيل.",
      featuredImage:"/assets/culture-hero-hq.webp",featuredTitle:"ذاكرة نهر النيل",featuredText:"مجموعة مختارة من الوثائق والصور والحكايات التي تحفظ هوية الولاية وتاريخها للأجيال القادمة.",featuredHref:"/contact",featuredLabel:"ساهم بمادة أرشيفية",
      ctaTitle:"هل لديك كتاب أو بحث مفيد؟",ctaText:"ساهم في إثراء المكتبة وارسل مصدرك ليتم توثيقه ومراجعته قبل النشر.",ctaHref:"/contact",ctaLabel:"أضف مصدراً",
      items:[
        {icon:BookOpen,tag:"كتب",title:"الكتب الإلكترونية",text:"مراجع وكتب تعليمية وثقافية متاحة بطريقة منظمة.",image:"/assets/education-reference-library-books.png",href:"/contact"},
        {icon:FileText,tag:"أبحاث",title:"الدراسات والمقالات",text:"أبحاث ومقالات متخصصة حول الولاية ومجالات التنمية.",image:"/assets/course-project-hq.webp",href:"/contact"},
        {icon:Video,tag:"مرئيات",title:"الفيديوهات التعليمية",text:"محاضرات ودروس ولقاءات مسجلة يمكن الرجوع إليها.",image:"/assets/education-hero-hq.webp",href:TRAINING_URL},
        {icon:Landmark,tag:"تراث",title:"التراث والتاريخ",text:"محتوى يوثق تاريخ المنطقة وعاداتها وشخصياتها المؤثرة.",image:"/assets/culture-folk-hq.webp",href:"/culture"},
        {icon:FileImage,tag:"وسائط",title:"الصور والوثائق",text:"أرشيف بصري للمعالم والفعاليات والوثائق التاريخية.",image:"/assets/culture-gallery-hq.webp",href:"/contact"},
        {icon:GraduationCap,tag:"تعلّم",title:"المصادر التدريبية",text:"ملفات عملية وأدلة مساعدة لتطوير المهارات المهنية.",image:"/assets/course-design-hq.webp",href:TRAINING_URL},
      ]
    }
  };
  const config=configs[type];
  const HeroIcon=config.icon;
  return <div className={`internal-redesign internal-${type}`}>
    <section className="internal-hero">
      <div className="internal-hero-media"><img src={config.hero} alt={config.title}/><span aria-hidden/></div>
      <div className="internal-hero-copy motion"><small><HeroIcon/>{config.badge}</small><h1>{config.title}</h1><h2>{config.accent}</h2><p>{config.lead}</p><div><a href="#internal-content">استكشف الآن <ArrowLeft/></a><a href="/contact">تواصل معنا</a></div></div>
      <div className="internal-orbits" aria-hidden><i/><i/><i/></div>
    </section>

    <section className="internal-kpis page-width motion">{config.stats.map(([value,label])=><article key={label}><b>{value}</b><small>{label}</small></article>)}</section>

    <section id="internal-content" className="internal-content page-width"><header className="motion"><span/><div><small>اكتشف المزيد</small><h2>{config.sectionTitle}</h2><p>{config.sectionLead}</p></div><span/></header><div className="internal-card-grid">{config.items.map((item,index)=>{const Icon=item.icon;const external=item.href.startsWith("http");return <article className="motion" id={`internal-${type}-${index}`} key={item.title}><div className="internal-card-media"><img src={item.image} alt={item.title}/><span>{item.tag}</span></div><div><i><Icon/></i><h3>{item.title}</h3><p>{item.text}</p><a href={item.href} target={external?"_blank":undefined} rel={external?"noopener noreferrer":undefined}>{external?"فتح المنصة":"معرفة المزيد"}{external?<span aria-hidden>↗</span>:<ArrowLeft/>}</a></div></article>})}</div></section>

    <section className="internal-featured page-width motion"><img src={config.featuredImage} alt={config.featuredTitle}/><div><small>اختيار مميز</small><h2>{config.featuredTitle}</h2><p>{config.featuredText}</p><a href={config.featuredHref} target={config.featuredHref.startsWith("http")?"_blank":undefined} rel={config.featuredHref.startsWith("http")?"noopener noreferrer":undefined}>{config.featuredLabel}{config.featuredHref.startsWith("http")?<span aria-hidden>↗</span>:<ArrowLeft/>}</a></div></section>

    <section className="internal-cta page-width motion"><div><Sparkles/><span><h2>{config.ctaTitle}</h2><p>{config.ctaText}</p></span></div><a href={config.ctaHref}>{config.ctaLabel}<ArrowLeft/></a></section>
  </div>;
}

function AboutMotion(){
  useEffect(()=>{
    const root=document.querySelector<HTMLElement>(".about-redesign");
    if(!root)return;
    const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const reveals=Array.from(root.querySelectorAll<HTMLElement>(".ab-reveal"));
    const settleTimers:number[]=[];
    root.classList.add("ab-motion-ready");

    if(reduced){
      reveals.forEach(item=>item.classList.add("ab-show","ab-settled"));
      return()=>root.classList.remove("ab-motion-ready");
    }

    const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add("ab-show");
        settleTimers.push(window.setTimeout(()=>entry.target.classList.add("ab-settled"),900));
        revealObserver.unobserve(entry.target);
      }
    }),{threshold:.16,rootMargin:"0px 0px -7%"});
    reveals.forEach(item=>revealObserver.observe(item));

    const top=root.querySelector<HTMLElement>(".ab-top");
    const move=(event:PointerEvent)=>{
      if(!top)return;
      const rect=top.getBoundingClientRect();
      const x=((event.clientX-rect.left)/rect.width-.5)*2;
      const y=((event.clientY-rect.top)/rect.height-.5)*2;
      top.style.setProperty("--ab-px",`${(-x*7).toFixed(2)}px`);
      top.style.setProperty("--ab-py",`${(-y*4).toFixed(2)}px`);
    };
    const reset=()=>{top?.style.setProperty("--ab-px","0px");top?.style.setProperty("--ab-py","0px")};
    top?.addEventListener("pointermove",move);
    top?.addEventListener("pointerleave",reset);

    const cards=Array.from(root.querySelectorAll<HTMLElement>(".ab-foundations > article, .ab-values article"));
    const interactive=Array.from(root.querySelectorAll<HTMLElement>(".ab-president, .ab-foundations > article, .ab-values article, .ab-stats article, .ab-join"));
    const pointerEnter=(event:PointerEvent)=>{if(event.pointerType!=="touch")(event.currentTarget as HTMLElement).classList.add("ab-pointer")};
    const pointerLeave=(event:PointerEvent)=>(event.currentTarget as HTMLElement).classList.remove("ab-pointer");
    interactive.forEach(item=>{item.addEventListener("pointerenter",pointerEnter);item.addEventListener("pointerleave",pointerLeave)});
    const cardMoves=new Map<HTMLElement,(event:PointerEvent)=>void>();
    cards.forEach(card=>{
      const handler=(event:PointerEvent)=>{
        if(event.pointerType==="touch")return;
        card.classList.add("ab-pointer");
        const rect=card.getBoundingClientRect();
        card.style.setProperty("--mx",`${event.clientX-rect.left}px`);
        card.style.setProperty("--my",`${event.clientY-rect.top}px`);
      };
      cardMoves.set(card,handler);
      card.addEventListener("pointermove",handler);
    });

    const stats=root.querySelector<HTMLElement>(".ab-stats");
    let countFrame=0;
    const runCounters=()=>{
      const counters=Array.from(root.querySelectorAll<HTMLElement>("[data-ab-count]"));
      const started=performance.now();
      const duration=1250;
      const tick=(now:number)=>{
        const progress=Math.min(1,(now-started)/duration);
        const eased=1-Math.pow(1-progress,4);
        counters.forEach(counter=>{
          const target=Number(counter.dataset.abCount||0);
          const suffix=counter.dataset.abSuffix||"";
          const value=Math.round(target*eased);
          const formatted=counter.dataset.abGrouped==="true"?value.toLocaleString("en-US"):String(value);
          counter.textContent=`${formatted}${suffix}`;
        });
        if(progress<1)countFrame=requestAnimationFrame(tick);
      };
      countFrame=requestAnimationFrame(tick);
    };
    const countObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting){runCounters();countObserver.disconnect()}
    }),{threshold:.45});
    if(stats)countObserver.observe(stats);

    requestAnimationFrame(()=>root.classList.add("ab-loaded"));
    return()=>{
      revealObserver.disconnect();
      countObserver.disconnect();
      cancelAnimationFrame(countFrame);
      settleTimers.forEach(timer=>window.clearTimeout(timer));
      top?.removeEventListener("pointermove",move);
      top?.removeEventListener("pointerleave",reset);
      interactive.forEach(item=>{item.removeEventListener("pointerenter",pointerEnter);item.removeEventListener("pointerleave",pointerLeave)});
      cards.forEach(card=>{const handler=cardMoves.get(card);if(handler)card.removeEventListener("pointermove",handler)});
      root.classList.remove("ab-motion-ready","ab-loaded");
    };
  },[]);
  return null;
}

function AboutPage(){
  const foundations=[
    {tone:"orange",icon:Send,title:"الرسالة",text:"توحيد الجهود والطاقات لخدمة أبناء ولاية نهر النيل من خلال منصة رقمية متكاملة تقدم الخدمات والمبادرات النوعية، وتعمل على تمكين المجتمع وتعزيز التنمية المستدامة.",link:"تفاصيل الرسالة"},
    {tone:"blue",icon:Eye,title:"الرؤية",text:"أن تكون الرابطة الرائدة التي تجمع أبناء ولاية نهر النيل في منصة رقمية فاعلة ومؤثرة، تسهم في بناء مستقبل مزدهر لولايتنا وأبنائنا.",link:"تفاصيل الرؤية"},
  ];
  const goals=["تعزيز الروابط بين أبناء الولاية داخل السودان وخارجه.","دعم التعليم والتدريب والتأهيل المهني للأجيال القادمة.","المساهمة في التنمية الاقتصادية والاجتماعية بالولاية.","تقديم خدمات مجتمعية وإنسانية مستدامة.","بناء شراكات استراتيجية لتحقيق الأثر الإيجابي."];
  const stats=[
    {icon:CalendarDays,value:"2020",label:"تأسست الرابطة"},
    {icon:HandHeart,value:"120+",label:"مبادرة ومنجز"},
    {icon:Handshake,value:"60+",label:"شريك ومتعاون"},
    {icon:Globe2,value:"25+",label:"دولة حول العالم"},
    {icon:UsersRound,value:"12,680+",label:"عضو مسجل"},
  ];
  const values=[
    {icon:TrendingUp,title:"التنمية",text:"نسعى لتحقيق تنمية مستدامة لولايتنا وأبنائها.",tone:"teal"},
    {icon:HandHeart,title:"المسؤولية",text:"نتحمل مسؤوليتنا تجاه مجتمعنا ونعمل بإخلاص.",tone:"purple"},
    {icon:Lightbulb,title:"الابتكار",text:"نبحث عن حلول مبتكرة لخدمة أبناء الولاية.",tone:"orange"},
    {icon:UsersRound,title:"العمل الجماعي",text:"نؤمن بقوة الفريق وتكامل الجهود لتحقيق الأثر.",tone:"green"},
    {icon:ShieldCheck,title:"المصداقية",text:"نلتزم بالشفافية والمصداقية في كل ما نقدمه.",tone:"blue"},
  ];
  return <div className="about-redesign">
    <AboutMotion/>
    <div className="ab-top">
      <div className="ab-top-visual ab-hero-visual" aria-hidden><img src="/assets/about-top-arc-exact.webp" alt=""/></div>
      <section className="ab-hero">
        <div className="ab-hero-media"><picture><img src="/assets/about-hero-mobile-exact.webp" alt="جسر فوق نهر النيل والمناطق الزراعية المحيطة"/></picture></div>
        <div className="ab-hero-copy motion ab-hero-intro"><h1>عن الرابطة</h1><h2>معاً.. من أجل ولاية مزدهرة ومجتمع متكافئ</h2><p>رابطة ولاية نهر النيل الإلكترونية هي منصة تجمع أبناء الولاية في كل مكان.<br/>نعمل بروح واحدة لخدمة أبنائها والارتقاء بولايتنا وتنميتها في شتى المجالات.</p></div>
        <img className="ab-hero-wave" src="/assets/about-hero-wave-exact.webp" alt="" aria-hidden/>
      </section>

      <section className="ab-president page-width motion ab-reveal ab-from-left">
        <div className="ab-president-photo"><picture><img src="/assets/about-president-mobile-exact.webp" alt="الأستاذ هشام محمد الحسن رئيس الرابطة"/></picture></div>
        <article><h2>كلمة رئيس الرابطة</h2><h3>الأستاذ / هشام محمد الحسن</h3><span className="ab-title-line"/><p>نؤمن بأن العمل المؤسسي والتخطيط الاستراتيجي هما أساس التغيير الحقيقي،<br/> وسنواصل العمل معكم بروح الفريق الواحد لتحقيق التنمية المستدامة<br/> لولاية نهر النيل وخدمة أبنائها أينما كانوا.</p><p>معاً.. نصنع مستقبلاً أفضل لولايتنا وأجيالنا القادمة.</p><strong className="ab-signature">Hisham Alhassan</strong></article>
        <aside><img src="/assets/membership-mark-transparent-v2.png" alt="شعار رابطة ولاية نهر النيل"/><b>رابطة ولاية<br/>نهر النيل<br/>الإلكترونية</b><i/><em/></aside>
      </section>
    </div>

    <section className="ab-foundations page-width">
      {foundations.map(item=>{const Icon=item.icon;return <article className={`motion ab-reveal ${item.tone}`} key={item.title}><header><span><Icon/></span><h2>{item.title}</h2></header><p>{item.text}</p><a href="/contact"><Target/>{item.link}<ArrowLeft/></a></article>})}
      <article className="ab-goals motion ab-reveal"><header><span><Target/></span><h2>الأهداف</h2></header><ul>{goals.map(goal=><li key={goal}><CircleCheckBig/>{goal}</li>)}</ul><a href="/contact">عرض جميع الأهداف <ArrowLeft/></a></article>
    </section>

    <section className="ab-stats page-width motion ab-reveal">{stats.map(item=>{const Icon=item.icon;const count=Number(item.value.replace(/[^0-9]/g,""));return <article key={item.label}><Icon/><span><b data-ab-count={count} data-ab-suffix={item.value.includes("+")?"+":""} data-ab-grouped={item.value.includes(",")?"true":undefined}>{item.value}</b><small>{item.label}</small></span></article>})}</section>

    <section className="ab-values page-width"><header className="ab-reveal"><span/><h2>قيمنا</h2><span/></header><div>{values.map(item=>{const Icon=item.icon;return <article className={`motion ab-reveal ${item.tone}`} key={item.title}><Icon/><h3>{item.title}</h3><p>{item.text}</p></article>})}</div></section>

    <section className="ab-join page-width motion ab-reveal"><div className="ab-join-icon"><UsersRound/></div><div><h2>كن جزءاً من مسيرتنا</h2><p>انضم إلينا وساهم في بناء مستقبل أفضل لولاية نهر النيل وأبنائها</p></div><a href="/membership"><UserPlus/>سجل الآن</a></section>
  </div>
}

const memberPlans=[
  {name:"الباقة الأساسية",price:"50",tone:"bronze",caption:"باقة مناسبة للبداية",features:["الدخول إلى منصة الرابطة","الاشتراك في النشرة الدورية","دعوات عامة للفعاليات","المشاركة في الاستبيانات","تحديثات دورية عن أنشطة الرابطة"]},
  {name:"الباقة المميزة",price:"100",tone:"orange",caption:"باقة متوازنة بقيمة أفضل",features:["جميع مزايا الباقة الأساسية","الأولوية في التسجيل للفعاليات","خصومات حصرية لدى شركائنا","الوصول إلى المحتوى الحصري","دعوات خاصة للندوات وورش العمل","إشعارات وتنبيهات مخصصة","تقرير سنوي عن أنشطة الرابطة"]},
  {name:"الباقة الداعمة",price:"200",tone:"dark",caption:"باقة لدعم أكبر وأثر أوسع",features:["جميع مزايا الباقتين السابقتين","دعم مباشر لمشاريع الرابطة","شهادة شكر وتقدير إلكترونية","إبراز اسمك في قائمة الداعمين","دعوات VIP للفعاليات الكبرى","لقاءات خاصة مع قيادات الرابطة","تقارير دورية وتأثير مشاريع الرابطة","أولوية الاستفادة من المبادرات"]},
];

type MemberFieldSpec={label:string;required?:boolean;kind?:"text"|"email"|"date"|"number"|"select"|"radio"|"file"|"textarea"|"toggle";placeholder?:string;options?:string[]};
type MemberGroupSpec={title:string;icon:React.ComponentType<{size?:number|string}>;fields:MemberFieldSpec[]};

function MemberCardArt({compact=false}:{compact?:boolean}){return <div className={`member-card-art ${compact?"compact":""}`}><span className="member-card-ribbon"/><img src="/assets/membership-mark-transparent-v2.png" alt="شعار رابطة ولاية نهر النيل"/><div><small>عضو في</small><b>رابطة ولاية<br/>نهر النيل الرقمية</b><em>معاً.. لنبني المستقبل</em></div><footer><span>0001<br/><small>عضوية</small></span><UsersRound/></footer></div>}

function Membership(){
  const [selected,setSelected]=useState(1);
  const planIcons=[UserRound,Crown,Gem];
  const benefits=[
    {icon:UsersRound,title:"مجتمع متفاعل",text:"تواصل وتعاون مع أبناء الولاية"},
    {icon:ShieldCheck,title:"موثوق وآمن",text:"حماية بياناتك وخصوصيتك"},
    {icon:Gift,title:"مزايا حصرية",text:"خدمات وعروض خاصة للأعضاء"},
    {icon:TrendingUp,title:"مساهمة مؤثرة",text:"شارك في بناء مستقبل الولاية"},
  ];
  const allBenefits=[
    {icon:Handshake,title:"تأثير مستدام",text:"كن شريكاً في تنمية الولاية"},
    {icon:BadgePercent,title:"خدمات وعروض حصرية",text:"تخفيضات وعروض خاصة لدى شركائنا"},
    {icon:BookOpen,title:"محتوى ومعلومات حصرية",text:"تقارير ودراسات وبيانات متخصصة"},
    {icon:GraduationCap,title:"فرص تعليم وتدريب",text:"ورش ودورات وبرامج تطويرية"},
    {icon:Network,title:"شبكة علاقات واسعة",text:"تواصل مع أبناء الولاية والمهتمين"},
  ];
  return <main className="member-pricing-page">
    <section className="mp-hero">
      <div className="mp-brand"><img src="/assets/ChatGPT_Image_Jul_21,_2026,_05_25_20_PM.png" alt="رابطة ولاية نهر النيل الرقمية"/></div>
      <div className="mp-photo"><img src="/assets/membership-hero-hq.webp" alt="معلم ولاية نهر النيل عند الغروب"/></div>
      <div className="mp-copy motion"><h1>باقات العضوية</h1><h2>الاشتراكات السنوية</h2><p>اختر الباقة التي تناسبك واستمتع بمزايا حصرية<br/>تدعمك وتخدمك وتخدم أبناء ولايتك</p></div>
      <div className="mp-card-wrap motion"><MemberCardArt/></div>
    </section>
    <section className="mp-benefits motion">{benefits.map(item=>{const Icon=item.icon;return <div key={item.title}><Icon/><h3>{item.title}</h3><p>{item.text}</p></div>})}</section>
    <section className="mp-plans">{memberPlans.map((plan,index)=>{const Icon=planIcons[index];return <article key={plan.name} onClick={()=>setSelected(index)} className={`mp-plan motion ${plan.tone} ${selected===index?"selected":""}`}>
      {index===1&&<span className="mp-popular">الأكثر اختياراً</span>}
      <h2><Icon/>{plan.name}</h2><strong>{plan.price}</strong><small>ريال سنوياً</small><h4><span/>المميزات<span/></h4>
      <ul>{plan.features.map(feature=><li key={feature}><Check/>{feature}</li>)}</ul>
      <p className="mp-plan-caption"><Sparkles/>{plan.caption}</p>
      <a href={`/register?plan=${index}`} className="mp-plan-button">اختر هذه الباقة</a>
    </article>})}</section>
    <section className="mp-all"><h2><span/>مزايا لجميع الأعضاء<span/></h2><div>{allBenefits.map(item=>{const Icon=item.icon;return <article key={item.title}><Icon/><b>{item.title}</b><small>{item.text}</small></article>})}</div></section>
    <section className="mp-support"><div className="mp-help"><Phone/><span><b>تحتاج مساعدة؟</b><small>فريقنا جاهز للرد على استفساراتك</small><strong dir="ltr">+249 912 345 678</strong></span></div><div className="mp-together"><UsersRound/><span><b>معاً نصنع الفرق ..</b><strong>انضم الآن وكن جزءاً من التغيير</strong></span></div><div className="mp-qr"><QrCode/><span><b>امسح الكود</b><small>للتسجيل المباشر</small></span></div></section>
    <footer className="mp-footer"><span><Globe2/> www.nilenilelink.org</span><span><Mail/> info@nilenilelink.org</span><span><MapPin/> ولاية نهر النيل - السودان</span><b>f&nbsp;&nbsp;𝕏&nbsp;&nbsp;▶&nbsp;&nbsp;◎</b></footer>
  </main>
}

function MemberField({field}:{field:MemberFieldSpec}){
  const requiredMark=field.required?<em>*</em>:null;
  const common={required:field.required,"aria-label":field.label};
  return <label className={`member-field ${field.kind||"text"}`}><span>{field.label}{requiredMark}</span>
    {field.kind==="select"?<select {...common} defaultValue=""><option value="" disabled>اختر {field.label}</option>{field.options?.map(option=><option key={option}>{option}</option>)}</select>:
    field.kind==="radio"?<span className="member-radios">{field.options?.map(option=><label key={option}><input name={field.label} type="radio" required={field.required}/>{option}</label>)}</span>:
    field.kind==="file"?<label className="member-file"><Upload/><b>اختر صورة</b><small>JPG, PNG (2MB)</small><input {...common} type="file" accept="image/*"/></label>:
    field.kind==="textarea"?<textarea {...common} placeholder={field.placeholder||"أدخل التفاصيل"} rows={2}/>:
    field.kind==="toggle"?<span className="member-toggle"><input type="checkbox"/><i/><b>{field.placeholder}</b></span>:
    <input {...common} type={field.kind==="email"?"email":field.kind==="date"?"date":field.kind==="number"?"number":"text"} placeholder={field.placeholder||`أدخل ${field.label}`}/>}</label>
}

function WizardField({field}:{field:MemberFieldSpec}){
  const common={required:field.required,"aria-label":field.label};
  if(field.kind==="radio") return(
    <div className="wf">
      <label className="wf-label">{field.label}{field.required&&<em>*</em>}</label>
      <div className="wf-radios">
        {field.options?.map(opt=>(
          <label key={opt} className="wf-radio-opt">
            <input name={field.label} type="radio" required={field.required} value={opt}/>
            <span>{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );
  if(field.kind==="toggle") return(
    <div className="wf">
      <label className="wf-toggle-row">
        <span className="wf-toggle-track"><input type="checkbox"/><i/></span>
        <span className="wf-toggle-text">{field.placeholder||field.label}</span>
      </label>
    </div>
  );
  if(field.kind==="file") return(
    <div className="wf wf-full">
      <label className="wf-label">{field.label}</label>
      <label className="wf-file">
        <Upload size={28}/>
        <b>اختر صورة أو اسحبها هنا</b>
        <small>JPG, PNG — الحجم الأقصى 2MB</small>
        <input {...common} type="file" accept="image/*"/>
      </label>
    </div>
  );
  if(field.kind==="textarea") return(
    <div className="wf wf-full">
      <label className="wf-label">{field.label}{field.required&&<em>*</em>}</label>
      <textarea className="wf-input" {...common} placeholder={field.placeholder||"أدخل التفاصيل"} rows={4}/>
    </div>
  );
  return(
    <div className="wf">
      <label className="wf-label">{field.label}{field.required&&<em>*</em>}</label>
      {field.kind==="select"
        ?<select className="wf-input" {...common} defaultValue=""><option value="" disabled>اختر {field.label}</option>{field.options?.map(o=><option key={o}>{o}</option>)}</select>
        :<input className="wf-input" {...common} type={field.kind==="email"?"email":field.kind==="date"?"date":field.kind==="number"?"number":"text"} placeholder={field.placeholder||`أدخل ${field.label}`}/>
      }
    </div>
  );
}

function Register(){
  const params=new URLSearchParams(window.location.search);
  const planIndex=Number(params.get("plan")||"1");
  const planNames=["basic","premium","supporter"];
  const [step,setStep]=useState(0);
  const [submitting,setSubmitting]=useState(false);
  const [submitError,setSubmitError]=useState("");
  const formRef=useRef<HTMLFormElement>(null);

  const groups:MemberGroupSpec[]=[
    {title:"البيانات الشخصية",icon:UserRound,fields:[{label:"الاسم الرباعي",required:true},{label:"الاسم وفق الجواز",required:true},{label:"الجنس",required:true,kind:"radio",options:["ذكر","أنثى"]},{label:"تاريخ الميلاد",required:true,kind:"date"},{label:"الجنسية",required:true,kind:"select",options:["سوداني","سودانية","أخرى"]},{label:"الحالة الاجتماعية",required:true,kind:"select",options:["أعزب","متزوج","أخرى"]},{label:"صورة شخصية حديثة",kind:"file"}]},
    {title:"بيانات الإقامة",icon:MapPin,fields:[{label:"الدولة",required:true,kind:"select",options:["السودان","السعودية","الإمارات","قطر","مصر","أخرى"]},{label:"المدينة",required:true,kind:"select",options:["الخرطوم","الرياض","جدة","دبي","الدوحة","القاهرة"]},{label:"الحي"},{label:"العنوان بالتفصيل"},{label:"الرمز البريدي"},{label:"رقم الجوال",required:true},{label:"البريد الإلكتروني",required:true,kind:"email",placeholder:"example@mail.com"}]},
    {title:"بيانات السودان",icon:BriefcaseBusiness,fields:[{label:"الولاية",required:true,kind:"select",options:["نهر النيل","الخرطوم","الشمالية","البحر الأحمر","أخرى"]},{label:"المحلية",required:true,kind:"select",options:["الدامر","عطبرة","بربر","شندي","المتمة"]},{label:"الوحدة الإدارية"},{label:"القرية / الحي"},{label:"أصل القرية / الحي"},{label:"جهة العمل (اختياري)"}]},
    {title:"المؤهل العلمي",icon:GraduationCap,fields:[{label:"المرحلة التعليمية",required:true,kind:"select",options:["ثانوي","دبلوم","بكالوريوس","دراسات عليا"]},{label:"التخصص",required:true},{label:"اسم الجامعة",required:true},{label:"سنة التخرج",kind:"number"},{label:"الدورات والشهادات (اختياري)"},{label:"الخبرات العملية (اختياري)"}]},
    {title:"بيانات الأسرة",icon:UsersRound,fields:[{label:"الحالة",kind:"radio",options:["متزوج","أعزب"]},{label:"عدد أفراد الأسرة",kind:"number"},{label:"أعمار الأبناء",placeholder:"مثال: 5، 10، 15"},{label:"بيانات إضافية (اختياري)",kind:"textarea"}]},
    {title:"البيانات المهنية",icon:BriefcaseBusiness,fields:[{label:"المجال المهني",kind:"select",options:["التعليم","الصحة","الهندسة","التجارة","أخرى"]},{label:"المسمى الوظيفي"},{label:"سنوات الخبرة",required:true,kind:"number"},{label:"فرص العمل",kind:"toggle",placeholder:"أبحث عن فرصة عمل"},{label:"التطوع",kind:"toggle",placeholder:"مستعد للتطوع"}]},
    {title:"الحالة الصحية (اختياري)",icon:HeartPulse,fields:[{label:"مستندات صحية مزمنة",kind:"select",options:["لا توجد","يوجد"]},{label:"هل تحتاج دعماً؟",kind:"radio",options:["نعم","لا"]},{label:"توضيح",kind:"textarea",placeholder:"أدخل التوضيح"}]},
    {title:"التواصل",icon:Phone,fields:[{label:"رقم بديل"},{label:"واتساب",placeholder:"05XXXXXXXX"},{label:"البريد الإلكتروني البديل",kind:"email",placeholder:"example@mail.com"},{label:"حسابات التواصل الاجتماعي",placeholder:"@username"}]},
  ];

  const wizardSteps=[
    {title:"الشخصية",label:"البيانات الشخصية",desc:"هويتك ومعلوماتك الأساسية",icon:UserRound,groupIndices:[0]},
    {title:"الإقامة",label:"بيانات الإقامة والسودان",desc:"مكان إقامتك وأصلك من الولاية",icon:MapPin,groupIndices:[1,2]},
    {title:"التعليم والمهنة",label:"المؤهل العلمي والعمل",desc:"خبراتك ومؤهلاتك الأكاديمية",icon:GraduationCap,groupIndices:[3,5]},
    {title:"الأسرة والصحة",label:"بيانات الأسرة والصحة",desc:"حالتك الاجتماعية والصحية",icon:UsersRound,groupIndices:[4,6]},
    {title:"التواصل",label:"التواصل والاهتمامات",desc:"بيانات التواصل ومجالات الاهتمام",icon:Phone,groupIndices:[7]},
  ];
  const TOTAL=wizardSteps.length;

  const goNext=()=>{
    const form=formRef.current;
    if(!form)return;
    const stepEl=form.querySelector<HTMLElement>(`[data-step="${step}"]`);
    if(stepEl){
      const inputs=Array.from(stepEl.querySelectorAll<HTMLInputElement|HTMLSelectElement>("[required]"));
      for(const inp of inputs){
        if(inp instanceof HTMLInputElement&&inp.type==="radio"){
          const name=inp.name;
          if(!stepEl.querySelector<HTMLInputElement>(`input[name="${name}"]:checked`)){inp.reportValidity?.();return;}
        } else if(!(inp as HTMLInputElement|HTMLSelectElement).value?.trim()){
          (inp as HTMLElement).focus();inp.reportValidity?.();return;
        }
      }
    }
    setStep(s=>Math.min(s+1,TOTAL-1));
    window.scrollTo({top:0,behavior:"smooth"});
  };

  const goPrev=()=>{setStep(s=>Math.max(s-1,0));window.scrollTo({top:0,behavior:"smooth"})};

  const onSubmit=async(event:FormEvent)=>{
    event.preventDefault();
    setSubmitting(true);setSubmitError("");
    const form=event.target as HTMLFormElement;
    const get=(label:string)=>{const el=form.querySelector<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>(`[aria-label="${label}"]`);return el?.value||""};
    const getRadio=(name:string)=>{const el=form.querySelector<HTMLInputElement>(`input[name="${name}"]:checked`);return el?.value||""};
    const fullName=get("الاسم الرباعي");
    const email=get("البريد الإلكتروني");
    const phone=get("رقم الجوال");
    const gender=getRadio("الجنس");
    const birthDate=get("تاريخ الميلاد");
    const country=get("الدولة");
    const city=get("المدينة");
    const state=get("الولاية");
    const locality=get("المحلية");
    const maritalStatus=getRadio("الحالة");
    const specialization=get("التخصص");
    const jobTitle=get("المسمى الوظيفي");
    const defaultPassword=phone.replace(/\D/g,"").slice(-6)||"123456";
    const {error}=await supabase.from("members").insert({
      full_name:fullName,email,phone,gender:gender==="أنثى"?"female":"male",
      birth_date:birthDate||null,country,city,state,locality,
      marital_status:maritalStatus,specialization,job_title:jobTitle,
      membership_type:planNames[planIndex]||"basic",status:"pending",
      password_hash:defaultPassword,
    });
    setSubmitting(false);
    if(error){setSubmitError("حدث خطأ أثناء التسجيل: "+error.message);return;}
    location.href="/photo";
  };

  const interests=[{icon:GraduationCap,label:"التعليم"},{icon:MonitorCheck,label:"المباشر"},{icon:TrendingUp,label:"ريادة الأعمال"},{icon:UsersRound,label:"المرأة"},{icon:ChartNoAxesCombined,label:"الاستثمار"},{icon:Landmark,label:"الثقافة"},{icon:Handshake,label:"الاستشارات"},{icon:HandHeart,label:"اليوم العام"},{icon:Sparkles,label:"أخرى"}];
  const regBenefits=[{icon:ShieldCheck,text:"هوية رقمية موثوقة"},{icon:Gift,text:"خدمات ومبادرات حصرية"},{icon:UsersRound,text:"تواصل فعال وبناء العلاقات"},{icon:GraduationCap,text:"فرص تعليم وتدريب"},{icon:Handshake,text:"دعم ورعاية المشاريع"},{icon:UserCheck,text:"المشاركة في صنع القرار"},{icon:LockKeyhole,text:"حماية خصوصيتك وبياناتك"}];

  return <div className="register-page">
    <section className="reg-hero">
      <div className="reg-visual"><img src="/assets/membership-register-hero-v2.webp" alt="أبناء السودان حول العالم"/></div>
      <div className="reg-copy motion"><h1>سجل عضويتك</h1><h2>في رابطة ولاية نهر النيل الإلكترونية</h2><h3>انضم إلى أكبر قاعدة بيانات موثوقة لأبناء ولاية نهر النيل</h3><p>عضويتك في رابطة ولاية نهر النيل الإلكترونية تمنحك هوية رقمية موثوقة، وتفتح لك أبواب الخدمات والمبادرات والفرص داخل الولاية وخارجها.</p><div className="reg-stats"><b><UsersRound/><span>12,850+<small>أعضاء مسجلون</small></span></b><b><Globe2/><span>48+<small>دول العالم</small></span></b><b><MapPin/><span>320+<small>مدن</small></span></b></div></div>
      <aside className="reg-benefits motion"><h3>مميزات العضوية</h3>{regBenefits.map(item=>{const Icon=item.icon;return <p key={item.text}><Icon/>{item.text}</p>})}</aside>
    </section>

    <section className="reg-wizard-shell">
      <header className="reg-wizard-header">
        <h2>نموذج تسجيل العضوية</h2>
        <p>يرجى تعبئة البيانات التالية بدقة — الخطوة <strong>{step+1}</strong> من <strong>{TOTAL}</strong></p>
      </header>

      <div className="rwz-progress" role="tablist" aria-label="خطوات التسجيل">
        <div className="rwz-track"><div className="rwz-track-fill" style={{width:`${(step/(TOTAL-1))*100}%`}}/></div>
        {wizardSteps.map((ws,i)=>{
          const Icon=ws.icon;const done=i<step;const active=i===step;
          return <button key={ws.title} type="button" role="tab" aria-selected={active} className={`rwz-dot ${done?"done":active?"active":""}`} onClick={()=>{if(done)setStep(i)}} tabIndex={done?0:-1}>
            <span className="rwz-dot-circle">{done?<Check size={14}/>:<Icon size={14}/>}</span>
            <span className="rwz-dot-label">{ws.title}</span>
          </button>;
        })}
      </div>

      <form ref={formRef} className="rwz-form" onSubmit={onSubmit} noValidate>
        {wizardSteps.map((ws,si)=>{
          const StepIcon=ws.icon;
          return <div key={si} className={`rwz-step${si===step?" active":""}`} data-step={si} role="tabpanel" aria-hidden={si!==step} style={{display:si===step?"block":"none"}}>
            <div className="rwz-step-title">
              <span className="rwz-step-icon-wrap"><StepIcon size={22}/></span>
              <div><h3>{ws.label}</h3><small>{ws.desc}</small></div>
              <span className="rwz-step-num-badge">{si+1}<em>/{TOTAL}</em></span>
            </div>
            <div className="rwz-fields-wrap">
              {ws.groupIndices.map(gi=>{
                const group=groups[gi];const GIcon=group.icon;
                return <fieldset key={group.title} className="rwz-fieldset">
                  <legend><GIcon size={14}/>{group.title}</legend>
                  <div className="wf-grid">{group.fields.map(field=><WizardField key={field.label} field={field}/>)}</div>
                </fieldset>;
              })}
              {si===TOTAL-1&&<>
                <fieldset className="rwz-fieldset reg-interests">
                  <legend><Sparkles size={14}/>الاهتمامات</legend>
                  <p>اختر المجالات التي تهتم بها للمشاركة في المبادرات والأنشطة</p>
                  <div className="interests-grid">{interests.map(item=>{const Icon=item.icon;return <label key={item.label}><input type="checkbox"/><Icon/><b>{item.label}</b></label>})}</div>
                </fieldset>
                <label className="reg-privacy"><Shield/><span><b>سياسة الخصوصية</b><small>أتعهد بصحة جميع البيانات المدخلة، وأوافق على استخدامها وفق شروط وأحكام وسياسة الخصوصية للرابطة.</small></span><input required type="checkbox" aria-label="الموافقة على سياسة الخصوصية"/></label>
                {submitError&&<p className="rwz-error">{submitError}</p>}
              </>}
            </div>
          </div>;
        })}

        <div className="rwz-nav">
          <button type="button" className={`rwz-btn rwz-btn-prev${step===0?" rwz-btn-hidden":""}`} onClick={goPrev}><ArrowLeft size={16}/> السابق</button>
          <div className="rwz-dots-mini">{wizardSteps.map((_,i)=><span key={i} className={i===step?"on":""}/>)}</div>
          {step<TOTAL-1
            ? <button type="button" className="rwz-btn rwz-btn-next" onClick={goNext}>التالي <ChevronLeft size={16}/></button>
            : <button type="submit" className="rwz-btn rwz-btn-submit" disabled={submitting}>{submitting?"جاري التسجيل...":"إكمال التسجيل"}</button>
          }
        </div>
      </form>
    </section>

    <section className="reg-join-banner"><div><h2>كن جزءاً من التغيير .. <span>انضم اليوم!</span></h2><p>عضويتك تساهم في بناء مجتمع رقمي قوي ومتكامل يخدم أبناء الولاية أينما كانوا</p><div><b><UsersRound/>تواصل فعال</b><b><MapPin/>فرص أكثر</b><b><Gift/>امتيازات أعمق</b></div></div><button onClick={()=>{location.href="/photo"}}>سجل الآن <ArrowLeft/></button><MemberCardArt compact/></section>
    <section className="reg-dashboard"><h2><span/>لوحة الإحصائيات والتقارير<span/></h2><div className="reg-dash-grid"><article className="reg-bars"><h3>توزيع الأعضاء حسب الولايات</h3>{[["الخرطوم","22%"],["نهر النيل","18%"],["القاهرة","15%"],["كسلا","12%"],["أخرى","23%"]].map(([name,value],i)=><p key={name}><b style={{width:value}}/><span>{name}</span><small>{value}</small><i data-tone={i}/></p>)}</article><article><h3>توزيع الأعضاء حسب الجنس</h3><div className="donut purple"/><p>ذكور 62% &nbsp; إناث 38%</p></article><article className="reg-total"><h3>إجمالي الأعضاء</h3><strong>12,850</strong><b>مدن <em>320</em></b><b>دول <em>48</em></b><small>+245 عضو هذا الشهر</small></article><article><h3>توزيع الأعضاء حسب الفئة العمرية</h3><div className="donut multi"/><p>أقل من 20 حتى 60 فأكثر</p></article><article className="reg-map"><h3>توزيع الأعضاء حسب الدول</h3><Globe2/><a href="/contact">طلب عرض الخريطة التفاعلية</a></article></div></section>
    <section className="reg-bottom"><div className="reg-partners"><h3>شركاؤنا في النجاح</h3>{["اتحاد الجاليات السوداني","برنامج الأمم المتحدة","منظمة الصحة العالمية","البنك الزراعي السوداني","جامعة الخرطوم","وزارة التربية والتعليم"].map((name,index)=><b key={name}>{index%2?<Landmark/>:<Globe2/>}<small>{name}</small></b>)}</div><form className="reg-newsletter"><h3>اشترك في نشرتنا الإخبارية</h3><p>احصل على آخر أخبارنا وفعالياتنا</p><input type="email" placeholder="أدخل بريدك الإلكتروني"/><button>اشترك الآن</button></form></section>
  </div>
}

function MemberStepShell({children,className=""}:{children:React.ReactNode;className?:string}){return <main className={`member-step-page ${className}`}><div className="member-step-shell"><span className="step-curve top"/><span className="step-dots"/>{children}<span className="step-curve bottom"/></div></main>}

function PhotoUpload(){
  const input=useRef<HTMLInputElement>(null);const [preview,setPreview]=useState<string>();
  const pick=(file?:File)=>{if(file)setPreview(URL.createObjectURL(file))};
  const methods=[{icon:Aperture,title:"التقاط من الاستديو",text:"باستخدام إضاءة الاستديو",action:"الذهاب للاستديو"},{icon:Camera,title:"التقاط صورة",text:"باستخدام الكاميرا",action:"التقاط الآن",active:true},{icon:FileImage,title:"إرفاق ملف",text:"اختر صورة من جهازك",action:"JPG, JPEG, PNG"}];
  return <MemberStepShell className="photo-step"><div className="step-mark"><img src="/assets/membership-mark-transparent-v2.png" alt="شعار الرابطة"/></div><header className="step-heading"><h1>إرفاق صورة شخصية</h1><h2>لإصدار البطاقة الإلكترونية</h2><p>يرجى إرفاق صورة شخصية حديثة وواضحة لاستخراج بطاقتك الإلكترونية</p></header>
    <section className="photo-preview"><div className="face-frame">{preview?<img src={preview} alt="معاينة الصورة الشخصية"/>:<div className="face-silhouette" aria-hidden="true"><i/><b/></div>}</div><b>معاينة الصورة</b><p>تأكد من وضوح الصورة قبل رفعها<br/>ستستخدم لطباعة البطاقة الإلكترونية</p></section>
    <h3 className="step-section-title"><span/>اختر طريقة الإرفاق<span/></h3><section className="photo-methods">{methods.map(item=>{const Icon=item.icon;return <button type="button" className={item.active?"active":""} key={item.title} onClick={()=>input.current?.click()}><Icon/><b>{item.title}</b><small>{item.text}</small><span>{item.action}</span></button>})}</section><input ref={input} hidden type="file" accept="image/jpeg,image/png" capture="user" onChange={event=>pick(event.target.files?.[0])}/>
    <section className="photo-conditions"><h3><span/>شروط الصورة <ShieldCheck/><span/></h3><div><ul><li>صورة حديثة وواضحة</li><li>خلفية بيضاء أو فاتحة</li><li>إظهار الوجه بوضوح</li><li>بدون نظارات شمسية</li><li>بدون فلاتر أو تعديلات</li></ul><article><p><UserCheck/>أن تكون الصورة ملونة وواضحة</p><p><ScanFace/>يجب أن يظهر الوجه كاملاً من الأمام مع فتح العينين</p><p><FileImage/><b>الصيغ المدعومة:</b><br/>JPG, JPEG, PNG<br/>الحد الأقصى للحجم: 2MB</p></article></div></section>
    <section className="step-warning"><CircleAlert/><div><b>تنبيه مهم</b><p>يتم استخدام هذه الصورة فقط لإصدار بطاقتك الإلكترونية<br/>ولا يتم نشرها أو مشاركتها مع أي جهة خارجية</p></div></section>
    {preview&&<a className="step-continue" href="/payment">المتابعة إلى السداد <ArrowLeft/></a>}
  </MemberStepShell>
}

function Payment(){
  const [receipts,setReceipts]=useState<Record<string,string>>({});
  const options=[{n:"01",icon:Landmark,title:"إرفاق ما يعادلها ببنكك",text:"قم بإيداع المبلغ في حساب الرابطة وارفع ما يعادلها من كشف الحساب"},{n:"02",icon:ReceiptText,title:"إرفاق سند السداد",text:"قم برفع صورة أو ملف سند السداد الرسمي الصادر من الجهة"},{n:"03",icon:Banknote,title:"إرفاق التحويل البنكي",text:"قم برفع صورة أو ملف إثبات التحويل البنكي"}];
  const setFile=(key:string,file?:File)=>{if(file)setReceipts(current=>({...current,[key]:file.name}))};
  return <MemberStepShell className="payment-step"><div className="payment-brand"><img src="/assets/ChatGPT_Image_Jul_21,_2026,_05_25_20_PM.png" alt="رابطة ولاية نهر النيل الرقمية"/></div><header className="step-heading payment-title"><h1><span/>خيارات السداد<span/></h1><p>اختر طريقة السداد المناسبة لك وارفع المستندات المطلوبة</p></header><section className="payment-cards">
    {options.map(option=>{const Icon=option.icon;return <article key={option.n}><label><FileUp/><strong>{receipts[option.n]||"اختر ملف أو اسحب وأفلت"}</strong><small>JPG, PNG, PDF (الحد الأقصى 5MB)</small><input type="file" accept="image/jpeg,image/png,application/pdf" onChange={event=>setFile(option.n,event.target.files?.[0])}/></label><div><h2>{option.title}</h2><p>{option.text}</p>{option.n==="01"&&<button type="button">عرض بيانات الحساب <ChevronLeft/></button>}</div><aside><b>{option.n}</b><Icon/></aside></article>})}
    <article className="visa-card"><a href="/success"><CreditCard/><span>ادفع عبر فيزا</span><strong>VISA</strong></a><div><h2>السداد فيزا</h2><p>ادفع الآن مباشرة باستخدام بطاقتك البنكية عبر فيزا</p></div><aside><b>04</b><em>VISA</em></aside><footer><ShieldCheck/>دفع آمن <LockKeyhole/>تشفير SSL <BadgeCheck/>معتمد وآمن</footer></article>
  </section><section className="payment-notice"><CircleAlert/><p>سيتم التحقق من مستندات السداد وتأكيدها خلال 24 ساعة عمل<br/>وسيصل إشعار بعد اعتماد السداد وتفعيل عضويتك</p></section><p className="payment-help"><Phone/> تحتاج مساعدة؟ تواصل معنا</p>{Object.keys(receipts).length>0&&<a className="step-continue" href="/success">إرسال المستندات <ArrowLeft/></a>}</MemberStepShell>
}

function Success(){return <MemberStepShell className="success-step"><header className="success-brand"><img src="/assets/membership-mark-transparent-v2.png" alt="شعار الرابطة"/><div><h2>رابطة ولاية نهر النيل</h2><b>الإلكترونية</b></div></header><section className="success-hero"><div className="success-check"><CircleCheckBig/></div><h1>مبروك</h1><h2>أنت الآن عضو</h2><p>في رابطة ولاية نهر النيل الإلكترونية</p></section><section className="success-member-card"><div className="success-user"><UserRound/></div><h3>رقم العضوية</h3><strong>NRN-2025-000123</strong><span/><h3>الباركود</h3><div className="success-barcode"/><small>N R N 2 0 2 5 0 0 0 1 2 3</small></section><section className="success-thanks"><ShieldCheck/><div><h2>شكراً لانضمامك إلينا</h2><p>معاً نبني مجتمعاً رقمياً قوياً ومتكافلاً لخدمة أبناء الولاية</p><b>وحدتنا .. قوتنا&nbsp;&nbsp;&nbsp; ومستقبلنا .. مسؤوليتنا</b></div></section></MemberStepShell>}

function Contact(){
  // ── types ──
  type Settings = Record<string,string>;
  type InfoItem = {id:string;title:string;lines:string[];icon_name:string;link_url:string;color:string;sort_order:number};
  type FaqItem  = {id:string;title:string;description:string;icon_name:string;link_url:string;sort_order:number};

  // ── state ──
  const [settings, setSettings] = useState<Settings>({});
  const [info,     setInfo]     = useState<InfoItem[]>([]);
  const [faq,      setFaq]      = useState<FaqItem[]>([]);
  const [sent,     setSent]     = useState(false);
  const [submitting,setSubmitting]=useState(false);
  const [name,   setName]   = useState("");
  const [email,  setEmail]  = useState("");
  const [phone,  setPhone]  = useState("");
  const [subject,setSubject]=useState("");
  const [message,setMessage]=useState("");

  // ── load ──
  useEffect(()=>{
    supabase.from("contact_settings").select("key,value").then(({data})=>{
      if(data) setSettings(Object.fromEntries(data.map(r=>[r.key,r.value])));
    });
    supabase.from("contact_info_items").select("*").eq("published",true).order("sort_order").then(({data})=>setInfo(data??[]));
    supabase.from("contact_faq_items").select("*").eq("published",true).order("sort_order").then(({data})=>setFaq(data??[]));
  },[]);

  const s = (k:string,fallback="")=>settings[k]??fallback;

  // ── icon map ──
  const iconMap: Record<string,React.ComponentType<{size?:number;color?:string}>> = {
    MessageCircle, Phone, Mail, MapPin, Clock3, Send, Headphones, Info,
    CreditCard, FileText, CircleHelp: CircleHelp as unknown as React.ComponentType<{size?:number;color?:string}>,
    Handshake, UsersRound, Globe2, ShieldCheck,
  };
  const Icon = (name:string, sz=22, color="#fff")=>{
    const C = iconMap[name] ?? Info;
    return <C size={sz} color={color}/>;
  };

  // ── submit ──
  const submit = async(ev:FormEvent)=>{
    ev.preventDefault();
    setSubmitting(true);
    await supabase.from("contact_messages").insert({name,email,phone,subject,message});
    setSubmitting(false);
    setSent(true);
  };

  const heroImage = s("hero_image_url","/assets/contact-hero-hq.webp");

  return (
    <div dir="rtl" style={{background:"#f8fafc",minHeight:"100vh"}}>

      {/* ══ HERO ══════════════════════════════════════════════════════════ */}
      <div style={{position:"relative",height:"clamp(380px,55vh,520px)",overflow:"hidden",background:"#0f172a"}}>
        {heroImage && <img src={heroImage} alt="تواصل معنا" style={{width:"100%",height:"100%",objectFit:"cover"}}/>}
        <div style={{position:"absolute",inset:0,background:"linear-gradient(110deg,rgba(0,0,0,0.55) 0%,rgba(0,0,0,0.3) 55%,rgba(0,0,0,0.05) 100%)"}}/>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",justifyContent:"center",padding:"clamp(2rem,6vw,5rem)",maxWidth:"1200px",margin:"0 auto",left:0,right:0}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:"0.5rem",background:"rgba(37,99,235,0.8)",backdropFilter:"blur(10px)",color:"#fff",padding:"0.4rem 1rem",borderRadius:"9999px",fontSize:"0.78rem",fontWeight:700,marginBottom:"1.25rem",width:"fit-content",border:"1px solid rgba(255,255,255,0.2)"}}>
            <MessageCircle size={14}/> رابطة ولاية نهر النيل
          </div>
          <h1 style={{color:"#fff",fontSize:"clamp(2rem,5vw,3.5rem)",fontWeight:900,margin:"0 0 1rem",lineHeight:1.15,textShadow:"0 2px 20px rgba(0,0,0,0.5)"}}>
            {s("hero_title","تواصل معنا")}
          </h1>
          <p style={{color:"rgba(255,255,255,0.78)",fontSize:"clamp(0.9rem,1.8vw,1.1rem)",lineHeight:1.75,maxWidth:"560px",margin:0}}>
            {s("hero_subtitle","نحن هنا لخدمتكم")}
          </p>
          <div style={{display:"flex",gap:"1rem",marginTop:"2rem",flexWrap:"wrap"}}>
            <a href="#contact-form" style={{background:"#2563eb",color:"#fff",padding:"0.75rem 1.75rem",borderRadius:"0.6rem",textDecoration:"none",fontWeight:700,fontSize:"0.9rem",display:"flex",alignItems:"center",gap:"0.5rem",boxShadow:"0 4px 16px rgba(37,99,235,0.45)"}}>
              <Send size={16}/> أرسل رسالة
            </a>
            {s("whatsapp_number") && (
              <a href={`https://wa.me/${s("whatsapp_number")}`} target="_blank" rel="noopener noreferrer"
                style={{background:"rgba(255,255,255,0.12)",backdropFilter:"blur(10px)",color:"#fff",padding:"0.75rem 1.75rem",borderRadius:"0.6rem",textDecoration:"none",fontWeight:700,fontSize:"0.9rem",display:"flex",alignItems:"center",gap:"0.5rem",border:"1px solid rgba(255,255,255,0.2)"}}>
                <MessageCircle size={16}/> واتساب مباشر
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ══ INFO CARDS ════════════════════════════════════════════════════ */}
      {info.length>0 && (
        <div style={{maxWidth:"1200px",margin:"-3rem auto 0",padding:"0 1.5rem",position:"relative",zIndex:10}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:"1rem"}}>
            {info.map(item=>(
              <a key={item.id} href={item.link_url||"#"} target={item.link_url?.startsWith("http")?"_blank":"_self"} rel="noopener noreferrer"
                style={{background:"#fff",borderRadius:"1rem",padding:"1.5rem 1.25rem",boxShadow:"0 8px 30px rgba(0,0,0,0.1)",textDecoration:"none",display:"flex",flexDirection:"column",alignItems:"flex-start",gap:"0.75rem",border:"1px solid #e2e8f0",transition:"all 0.25s",borderTop:`3px solid ${item.color}`}}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow="0 16px 40px rgba(0,0,0,0.13)";}}
                onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 8px 30px rgba(0,0,0,0.1)";}}>
                <div style={{width:46,height:46,borderRadius:"0.75rem",background:`${item.color}18`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {Icon(item.icon_name,22,item.color)}
                </div>
                <div>
                  <p style={{color:"#0f172a",fontWeight:800,fontSize:"0.9rem",margin:"0 0 0.35rem"}}>{item.title}</p>
                  {item.lines.map((l,i)=><p key={i} style={{color:i===0?"#374151":"#94a3b8",fontSize:i===0?"0.82rem":"0.75rem",margin:"0.1rem 0",fontWeight:i===0?600:400}}>{l}</p>)}
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* ══ FORM + SIDE INFO ══════════════════════════════════════════════ */}
      <div id="contact-form" style={{maxWidth:"1200px",margin:"4rem auto 0",padding:"0 1.5rem",display:"grid",gridTemplateColumns:"1fr 380px",gap:"2.5rem",alignItems:"start"}} className="contact-main-grid">

        {/* Form */}
        <div style={{background:"#fff",borderRadius:"1.25rem",overflow:"hidden",boxShadow:"0 4px 24px rgba(0,0,0,0.08)",border:"1px solid #e2e8f0"}}>
          <div style={{background:"linear-gradient(135deg,#1e3a5f,#2563eb)",padding:"2rem 2.25rem"}}>
            <h2 style={{color:"#fff",fontWeight:900,fontSize:"1.35rem",margin:"0 0 0.4rem"}}>{s("form_title","أرسل لنا رسالة")}</h2>
            <p style={{color:"rgba(255,255,255,0.72)",margin:0,fontSize:"0.88rem"}}>{s("form_subtitle","نسعد بتواصلكم")}</p>
          </div>
          <div style={{padding:"2rem 2.25rem"}}>
            {sent ? (
              <div style={{textAlign:"center",padding:"3rem 1rem"}}>
                <div style={{width:72,height:72,background:"#f0fdf4",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 1.25rem"}}>
                  <CircleCheckBig size={36} color="#16a34a"/>
                </div>
                <h3 style={{color:"#0f172a",fontWeight:800,fontSize:"1.2rem",margin:"0 0 0.5rem"}}>تم إرسال رسالتك بنجاح!</h3>
                <p style={{color:"#64748b",margin:"0 0 1.5rem"}}>سنتواصل معك في أقرب وقت ممكن.</p>
                <button onClick={()=>{setSent(false);setName("");setEmail("");setPhone("");setSubject("");setMessage("");}}
                  style={{background:"#2563eb",color:"#fff",border:"none",borderRadius:"0.6rem",padding:"0.7rem 1.75rem",fontWeight:700,cursor:"pointer",fontSize:"0.9rem"}}>
                  إرسال رسالة أخرى
                </button>
              </div>
            ) : (
              <form onSubmit={submit}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem"}}>
                  {/* Name */}
                  <label style={{display:"flex",flexDirection:"column",gap:"0.4rem"}}>
                    <span style={{fontSize:"0.8rem",fontWeight:700,color:"#374151"}}>الاسم الكامل *</span>
                    <div style={{position:"relative"}}>
                      <span style={{position:"absolute",top:"50%",right:"0.85rem",transform:"translateY(-50%)",color:"#94a3b8",pointerEvents:"none"}}><UserRound size={16}/></span>
                      <input required value={name} onChange={e=>setName(e.target.value)} placeholder="أدخل اسمك الكامل"
                        style={{width:"100%",border:"1.5px solid #e2e8f0",borderRadius:"0.6rem",padding:"0.7rem 2.5rem 0.7rem 0.85rem",fontSize:"0.9rem",outline:"none",boxSizing:"border-box",transition:"border 0.2s",fontFamily:"inherit"}}
                        onFocus={e=>e.target.style.borderColor="#2563eb"} onBlur={e=>e.target.style.borderColor="#e2e8f0"}/>
                    </div>
                  </label>
                  {/* Email */}
                  <label style={{display:"flex",flexDirection:"column",gap:"0.4rem"}}>
                    <span style={{fontSize:"0.8rem",fontWeight:700,color:"#374151"}}>البريد الإلكتروني *</span>
                    <div style={{position:"relative"}}>
                      <span style={{position:"absolute",top:"50%",right:"0.85rem",transform:"translateY(-50%)",color:"#94a3b8",pointerEvents:"none"}}><Mail size={16}/></span>
                      <input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="example@email.com" dir="ltr"
                        style={{width:"100%",border:"1.5px solid #e2e8f0",borderRadius:"0.6rem",padding:"0.7rem 2.5rem 0.7rem 0.85rem",fontSize:"0.9rem",outline:"none",boxSizing:"border-box",transition:"border 0.2s",fontFamily:"inherit"}}
                        onFocus={e=>e.target.style.borderColor="#2563eb"} onBlur={e=>e.target.style.borderColor="#e2e8f0"}/>
                    </div>
                  </label>
                  {/* Phone */}
                  <label style={{display:"flex",flexDirection:"column",gap:"0.4rem"}}>
                    <span style={{fontSize:"0.8rem",fontWeight:700,color:"#374151"}}>رقم الجوال</span>
                    <div style={{position:"relative"}}>
                      <span style={{position:"absolute",top:"50%",right:"0.85rem",transform:"translateY(-50%)",color:"#94a3b8",pointerEvents:"none"}}><Phone size={16}/></span>
                      <input type="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+249 912 345 678" dir="ltr"
                        style={{width:"100%",border:"1.5px solid #e2e8f0",borderRadius:"0.6rem",padding:"0.7rem 2.5rem 0.7rem 0.85rem",fontSize:"0.9rem",outline:"none",boxSizing:"border-box",transition:"border 0.2s",fontFamily:"inherit"}}
                        onFocus={e=>e.target.style.borderColor="#2563eb"} onBlur={e=>e.target.style.borderColor="#e2e8f0"}/>
                    </div>
                  </label>
                  {/* Subject */}
                  <label style={{display:"flex",flexDirection:"column",gap:"0.4rem"}}>
                    <span style={{fontSize:"0.8rem",fontWeight:700,color:"#374151"}}>نوع الرسالة *</span>
                    <select required value={subject} onChange={e=>setSubject(e.target.value)}
                      style={{width:"100%",border:"1.5px solid #e2e8f0",borderRadius:"0.6rem",padding:"0.7rem 0.85rem",fontSize:"0.9rem",outline:"none",boxSizing:"border-box",transition:"border 0.2s",fontFamily:"inherit",background:"#fff",appearance:"none"}}
                      onFocus={e=>e.target.style.borderColor="#2563eb"} onBlur={e=>e.target.style.borderColor="#e2e8f0"}>
                      <option value="" disabled>اختر نوع الرسالة *</option>
                      <option>استفسار عام</option><option>شكوى</option><option>اقتراح</option><option>دعم فني</option><option>عضوية</option><option>استثمار وشراكة</option>
                    </select>
                  </label>
                  {/* Message */}
                  <label style={{display:"flex",flexDirection:"column",gap:"0.4rem",gridColumn:"1/-1"}}>
                    <span style={{fontSize:"0.8rem",fontWeight:700,color:"#374151"}}>نص الرسالة *</span>
                    <textarea required rows={5} value={message} onChange={e=>setMessage(e.target.value)} placeholder="اكتب رسالتك هنا..."
                      style={{width:"100%",border:"1.5px solid #e2e8f0",borderRadius:"0.6rem",padding:"0.85rem",fontSize:"0.9rem",outline:"none",boxSizing:"border-box",resize:"vertical",transition:"border 0.2s",fontFamily:"inherit",lineHeight:1.7}}
                      onFocus={e=>e.target.style.borderColor="#2563eb"} onBlur={e=>e.target.style.borderColor="#e2e8f0"}/>
                  </label>
                  {/* Submit */}
                  <button type="submit" disabled={submitting} style={{gridColumn:"1/-1",background:submitting?"#93c5fd":"#2563eb",color:"#fff",border:"none",borderRadius:"0.6rem",padding:"0.9rem 2rem",fontWeight:800,fontSize:"1rem",cursor:submitting?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:"0.6rem",transition:"all 0.2s",boxShadow:"0 4px 16px rgba(37,99,235,0.35)",fontFamily:"inherit"}}
                    onMouseEnter={e=>{if(!submitting)e.currentTarget.style.background="#1d4ed8";}} onMouseLeave={e=>{if(!submitting)e.currentTarget.style.background="#2563eb";}}>
                    <Send size={18}/>{submitting?"جاري الإرسال...":"إرسال الرسالة"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside style={{display:"flex",flexDirection:"column",gap:"1.5rem"}}>
          {/* Quick info */}
          {info.slice(0,4).map(item=>(
            <a key={item.id} href={item.link_url||"#"} target={item.link_url?.startsWith("http")?"_blank":"_self"} rel="noopener noreferrer"
              style={{background:"#fff",borderRadius:"1rem",padding:"1.25rem 1.5rem",boxShadow:"0 2px 12px rgba(0,0,0,0.06)",textDecoration:"none",display:"flex",alignItems:"center",gap:"1rem",border:"1px solid #e2e8f0",transition:"all 0.2s",borderRight:`3px solid ${item.color}`}}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateX(-3px)";e.currentTarget.style.boxShadow="0 8px 24px rgba(0,0,0,0.1)";}}
              onMouseLeave={e=>{e.currentTarget.style.transform="translateX(0)";e.currentTarget.style.boxShadow="0 2px 12px rgba(0,0,0,0.06)";}}>
              <div style={{width:44,height:44,borderRadius:"0.75rem",background:`${item.color}18`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                {Icon(item.icon_name,20,item.color)}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <p style={{color:"#0f172a",fontWeight:800,fontSize:"0.88rem",margin:"0 0 0.2rem"}}>{item.title}</p>
                {item.lines.map((l,i)=><p key={i} style={{color:i===0?"#374151":"#94a3b8",fontSize:"0.78rem",margin:"0.1rem 0",fontWeight:i===0?600:400,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l}</p>)}
              </div>
              <ChevronLeft size={16} color="#94a3b8"/>
            </a>
          ))}
          {/* Map placeholder or embed */}
          {s("map_embed_url") ? (
            <div style={{borderRadius:"1rem",overflow:"hidden",border:"1px solid #e2e8f0",boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
              <iframe src={s("map_embed_url")} width="100%" height="220" style={{border:0,display:"block"}} allowFullScreen loading="lazy" title="الموقع على الخريطة"/>
            </div>
          ) : (
            <div style={{background:"#fff",borderRadius:"1rem",padding:"1.75rem 1.5rem",boxShadow:"0 2px 12px rgba(0,0,0,0.06)",border:"1px solid #e2e8f0",textAlign:"center"}}>
              <MapPin size={32} color="#cbd5e1" style={{margin:"0 auto 0.75rem",display:"block"}}/>
              <p style={{color:"#94a3b8",fontSize:"0.82rem",margin:0}}>يمكن إضافة خريطة الموقع من لوحة التحكم</p>
            </div>
          )}
        </aside>
      </div>

      {/* ══ FAQ ═══════════════════════════════════════════════════════════ */}
      {faq.length>0 && (
        <section style={{maxWidth:"1200px",margin:"4rem auto 0",padding:"0 1.5rem"}}>
          <div style={{display:"flex",alignItems:"center",gap:"0.75rem",marginBottom:"2rem"}}>
            <div style={{width:4,height:32,background:"#2563eb",borderRadius:2}}/>
            <h2 style={{fontSize:"1.25rem",fontWeight:800,color:"#0f172a",margin:0}}>كيف يمكننا مساعدتك؟</h2>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:"1rem"}}>
            {faq.map(item=>(
              <a key={item.id} href={item.link_url||"#contact-form"}
                style={{background:"#fff",borderRadius:"1rem",padding:"1.5rem",boxShadow:"0 2px 12px rgba(0,0,0,0.06)",textDecoration:"none",display:"flex",gap:"1rem",alignItems:"flex-start",border:"1px solid #e2e8f0",transition:"all 0.25s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="#2563eb";e.currentTarget.style.boxShadow="0 8px 24px rgba(37,99,235,0.12)";e.currentTarget.style.transform="translateY(-2px)";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="#e2e8f0";e.currentTarget.style.boxShadow="0 2px 12px rgba(0,0,0,0.06)";e.currentTarget.style.transform="translateY(0)";}}>
                <div style={{width:44,height:44,borderRadius:"0.75rem",background:"#eff6ff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  {Icon(item.icon_name,20,"#2563eb")}
                </div>
                <div>
                  <p style={{color:"#0f172a",fontWeight:800,fontSize:"0.9rem",margin:"0 0 0.35rem"}}>{item.title}</p>
                  <p style={{color:"#64748b",fontSize:"0.8rem",margin:0,lineHeight:1.6}}>{item.description}</p>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ══ NEWSLETTER ════════════════════════════════════════════════════ */}
      <section style={{maxWidth:"1200px",margin:"4rem auto",padding:"0 1.5rem"}}>
        <div style={{background:"linear-gradient(135deg,#1e3a5f 0%,#2563eb 50%,#1d4ed8 100%)",borderRadius:"1.5rem",padding:"3rem 2.5rem",display:"flex",alignItems:"center",gap:"2.5rem",flexWrap:"wrap",boxShadow:"0 8px 32px rgba(37,99,235,0.3)"}}>
          <div style={{flex:1,minWidth:"240px"}}>
            <h3 style={{color:"#fff",fontWeight:900,fontSize:"1.3rem",margin:"0 0 0.5rem"}}>{s("newsletter_title","كن على تواصل دائم")}</h3>
            <p style={{color:"rgba(255,255,255,0.75)",margin:0,fontSize:"0.9rem",lineHeight:1.65}}>{s("newsletter_subtitle","اشترك في نشرتنا البريدية")}</p>
          </div>
          <form onSubmit={e=>e.preventDefault()} style={{display:"flex",gap:"0.75rem",flexWrap:"wrap",flex:1,minWidth:"260px"}}>
            <input type="email" required placeholder="أدخل بريدك الإلكتروني" dir="ltr"
              style={{flex:1,minWidth:"200px",border:"none",borderRadius:"0.6rem",padding:"0.8rem 1.25rem",fontSize:"0.9rem",outline:"none",fontFamily:"inherit"}}/>
            <button type="submit" style={{background:"#fff",color:"#1e3a5f",border:"none",borderRadius:"0.6rem",padding:"0.8rem 1.75rem",fontWeight:800,fontSize:"0.9rem",cursor:"pointer",display:"flex",alignItems:"center",gap:"0.5rem",fontFamily:"inherit",whiteSpace:"nowrap"}}>
              <Send size={16}/> اشترك الآن
            </button>
          </form>
        </div>
      </section>

    </div>
  );
}

// ─── News list page ──────────────────────────────────────────────────────────
function NewsListPage() {
  type NewsItem = {id:string;title:string;slug:string;excerpt:string;image_url:string;category:string;published_at:string|null;created_at:string};
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null);

  useEffect(() => {
    supabase.from("news").select("id,title,slug,excerpt,image_url,category,published_at,created_at").eq("published",true).order("published_at",{ascending:false}).then(({data})=>{setItems(data??[]);setLoading(false);});
  }, []);

  const heroes = items.filter(i=>i.image_url).slice(0,5);
  const ticker = items.slice(0,8);

  const prev = useCallback(()=>setSlide(s=>(s-1+heroes.length)%heroes.length),[heroes.length]);
  const next = useCallback(()=>setSlide(s=>(s+1)%heroes.length),[heroes.length]);

  useEffect(()=>{
    if(paused||heroes.length<2) return;
    timerRef.current=setInterval(next,5500);
    return ()=>{if(timerRef.current)clearInterval(timerRef.current);};
  },[next,paused,heroes.length]);

  const fmtDate=(d:string|null,c:string)=>new Date(d||c).toLocaleDateString("ar-SA",{year:"numeric",month:"long",day:"numeric"});

  return (
    <div dir="rtl" style={{background:"#f8fafc",minHeight:"100vh"}}>
      {/* ── Hero Slider ── */}
      {!loading && heroes.length>0 && (
        <div style={{position:"relative",height:"520px",overflow:"hidden",background:"#0f172a"}}
          onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)}>
          {/* Slides */}
          {heroes.map((item,i)=>(
            <div key={item.id} style={{position:"absolute",inset:0,transition:"opacity 0.8s ease",opacity:i===slide?1:0,pointerEvents:i===slide?"auto":"none"}}>
              <img src={item.image_url} alt={item.title} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
              <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,0.9) 0%,rgba(0,0,0,0.5) 45%,rgba(0,0,0,0.05) 100%)"}}/>
            </div>
          ))}
          {/* Content */}
          {heroes[slide] && (
            <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",justifyContent:"flex-end",padding:"clamp(1.5rem,4vw,3rem)",maxWidth:"900px",animation:"fadeUp 0.6s ease"}}>
              <span style={{display:"inline-flex",background:"#2563eb",color:"#fff",padding:"0.3rem 0.9rem",borderRadius:"9999px",fontSize:"0.78rem",fontWeight:700,marginBottom:"0.75rem",width:"fit-content",gap:"0.4rem",alignItems:"center"}}>
                <Newspaper size={13}/> {heroes[slide].category||"أخبار"}
              </span>
              <h1 style={{color:"#fff",fontSize:"clamp(1.4rem,3.5vw,2.2rem)",fontWeight:800,margin:"0 0 0.75rem",lineHeight:1.3,textShadow:"0 2px 16px rgba(0,0,0,0.6)"}}>
                {heroes[slide].title}
              </h1>
              {heroes[slide].excerpt && (
                <p style={{color:"rgba(255,255,255,0.75)",fontSize:"0.9rem",lineHeight:1.65,margin:"0 0 1.25rem",maxWidth:"580px"}}>
                  {heroes[slide].excerpt.slice(0,130)}...
                </p>
              )}
              <div style={{display:"flex",alignItems:"center",gap:"1rem",flexWrap:"wrap"}}>
                <a href={`/news/${heroes[slide].slug}`} style={{background:"#2563eb",color:"#fff",padding:"0.65rem 1.5rem",borderRadius:"0.5rem",textDecoration:"none",fontWeight:700,fontSize:"0.9rem",display:"flex",alignItems:"center",gap:"0.5rem"}}>
                  اقرأ المزيد <ArrowLeft size={16}/>
                </a>
                <span style={{color:"rgba(255,255,255,0.55)",fontSize:"0.8rem",display:"flex",alignItems:"center",gap:"0.4rem"}}>
                  <Calendar size={13}/>{fmtDate(heroes[slide].published_at,heroes[slide].created_at)}
                </span>
              </div>
            </div>
          )}
          {/* Arrows */}
          {heroes.length>1&&<>
            <button onClick={next} style={{position:"absolute",top:"50%",left:"1.25rem",transform:"translateY(-50%)",background:"rgba(255,255,255,0.12)",backdropFilter:"blur(10px)",border:"1px solid rgba(255,255,255,0.22)",color:"#fff",width:44,height:44,borderRadius:"50%",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"background 0.2s"}}
              onMouseEnter={e=>(e.currentTarget.style.background="rgba(255,255,255,0.25)")} onMouseLeave={e=>(e.currentTarget.style.background="rgba(255,255,255,0.12)")}>
              <ChevronLeft size={20}/>
            </button>
            <button onClick={prev} style={{position:"absolute",top:"50%",right:"1.25rem",transform:"translateY(-50%)",background:"rgba(255,255,255,0.12)",backdropFilter:"blur(10px)",border:"1px solid rgba(255,255,255,0.22)",color:"#fff",width:44,height:44,borderRadius:"50%",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"background 0.2s"}}
              onMouseEnter={e=>(e.currentTarget.style.background="rgba(255,255,255,0.25)")} onMouseLeave={e=>(e.currentTarget.style.background="rgba(255,255,255,0.12)")}>
              <ChevronRight size={20}/>
            </button>
          </>}
          {/* Dot nav */}
          <div style={{position:"absolute",bottom:"1.25rem",left:"50%",transform:"translateX(-50%)",display:"flex",gap:"0.5rem",alignItems:"center"}}>
            {heroes.map((_,i)=>(
              <button key={i} onClick={()=>setSlide(i)} style={{width:i===slide?28:8,height:8,borderRadius:9999,background:i===slide?"#fff":"rgba(255,255,255,0.4)",border:"none",cursor:"pointer",padding:0,transition:"all 0.35s ease"}}/>
            ))}
          </div>
          {/* Slide counter */}
          <div style={{position:"absolute",top:"1.5rem",left:"1.5rem",background:"rgba(0,0,0,0.4)",backdropFilter:"blur(8px)",color:"rgba(255,255,255,0.8)",padding:"0.25rem 0.7rem",borderRadius:"9999px",fontSize:"0.75rem",fontWeight:600,fontVariantNumeric:"tabular-nums"}}>
            {slide+1} / {heroes.length}
          </div>
          {/* Thumbnail strip */}
          <div style={{position:"absolute",bottom:"1.25rem",right:"1.5rem",display:"flex",gap:"0.5rem"}}>
            {heroes.map((h,i)=>i!==slide&&(
              <button key={h.id} onClick={()=>setSlide(i)} style={{width:64,height:44,borderRadius:"0.375rem",overflow:"hidden",border:"2px solid rgba(255,255,255,0.3)",cursor:"pointer",padding:0,opacity:0.75,transition:"opacity 0.2s"}}
                onMouseEnter={e=>(e.currentTarget.style.opacity="1")} onMouseLeave={e=>(e.currentTarget.style.opacity="0.75")}>
                <img src={h.image_url} alt={h.title} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
              </button>
            ))}
          </div>
        </div>
      )}
      {loading && <div style={{height:520,display:"flex",alignItems:"center",justifyContent:"center",background:"#0f172a"}}><div style={{width:40,height:40,border:"3px solid #2563eb",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/></div>}

      {/* ── Breaking news ticker ── */}
      {ticker.length>0 && (
        <div style={{background:"#1e3a5f",overflow:"hidden",display:"flex",alignItems:"stretch",boxShadow:"0 2px 8px rgba(0,0,0,0.15)"}}>
          <div style={{background:"#dc2626",padding:"0.55rem 1.1rem",display:"flex",alignItems:"center",gap:"0.4rem",fontWeight:800,fontSize:"0.82rem",color:"#fff",flexShrink:0,whiteSpace:"nowrap",letterSpacing:"0.03em"}}>
            <Megaphone size={14}/> عاجل
          </div>
          <div style={{overflow:"hidden",flex:1,display:"flex",alignItems:"center"}}>
            <div style={{display:"inline-flex",gap:"3rem",padding:"0.55rem 0",animation:"tickerScroll 35s linear infinite",whiteSpace:"nowrap"}}>
              {[...ticker,...ticker].map((item,i)=>(
                <a key={i} href={`/news/${item.slug}`} style={{color:"rgba(255,255,255,0.88)",textDecoration:"none",fontSize:"0.84rem",fontWeight:500,display:"inline-flex",alignItems:"center",gap:"0.5rem",transition:"color 0.2s"}}
                  onMouseEnter={e=>(e.currentTarget.style.color="#fff")} onMouseLeave={e=>(e.currentTarget.style.color="rgba(255,255,255,0.88)")}>
                  <span style={{color:"#facc15",fontSize:"0.7rem"}}>◆</span>{item.title}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── News grid ── */}
      <section style={{maxWidth:"1200px",margin:"0 auto",padding:"2.5rem 1.5rem"}}>
        <div style={{display:"flex",alignItems:"center",gap:"0.75rem",marginBottom:"2rem"}}>
          <div style={{width:4,height:32,background:"#2563eb",borderRadius:2}}/>
          <h2 style={{fontSize:"1.25rem",fontWeight:800,color:"#0f172a",margin:0}}>جميع الأخبار</h2>
          {items.length>0&&<span style={{background:"#eff6ff",color:"#2563eb",padding:"0.2rem 0.6rem",borderRadius:"9999px",fontSize:"0.75rem",fontWeight:700,marginRight:"auto"}}>{items.length} خبر</span>}
        </div>
        {loading && <p style={{textAlign:"center",color:"#64748b",padding:"3rem"}}>جاري التحميل...</p>}
        {!loading && items.length===0 && <p style={{textAlign:"center",color:"#64748b",padding:"3rem"}}>لا توجد أخبار منشورة حالياً</p>}
        <div className="news-grid">
          {items.map(item=>(
            <a key={item.id} href={`/news/${item.slug}`} className="news-card">
              {item.image_url ? <img src={item.image_url} alt={item.title}/> : <div className="news-card-placeholder"/>}
              <div className="news-card-body">
                <span className="news-cat">{item.category}</span>
                <h3>{item.title}</h3>
                {item.excerpt&&<p>{item.excerpt}</p>}
                <small>{fmtDate(item.published_at,item.created_at)}</small>
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}

// ─── Investment Sector Detail Page ───────────────────────────────────────────
type InquiryForm = {name:string;email:string;phone:string;message:string};
const emptyForm:InquiryForm = {name:"",email:"",phone:"",message:""};

function InvestmentInquiryForm({type,slug,title}:{type:"sector"|"opportunity";slug:string;title:string}){
  const [form,setForm] = useState<InquiryForm>(emptyForm);
  const [status,setStatus] = useState<"idle"|"sending"|"sent"|"error">("idle");
  const set = (k:keyof InquiryForm) => (e:React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) => setForm(f=>({...f,[k]:e.target.value}));
  const submit = async (e:React.FormEvent) => {
    e.preventDefault();
    if(!form.name.trim()||(!form.email.trim()&&!form.phone.trim())) return;
    setStatus("sending");
    const {error} = await supabase.from("investment_inquiries").insert({
      type, reference_slug:slug, reference_title:title,
      name:form.name, email:form.email, phone:form.phone, message:form.message,
    });
    setStatus(error?"error":"sent");
  };
  if(status==="sent") return (
    <div className="inquiry-success">
      <ShieldCheck size={40}/>
      <h3>تم استلام طلبك بنجاح</h3>
      <p>سيتواصل معك فريق الاستثمار في أقرب وقت ممكن على البريد الإلكتروني أو رقم الهاتف الذي أدخلته.</p>
      <button onClick={()=>setStatus("idle")}>إرسال طلب آخر</button>
    </div>
  );
  return (
    <form className="inquiry-form" onSubmit={submit} noValidate>
      <h3><MessageCircle/> أرسل طلب استثمار</h3>
      <div className="inquiry-row">
        <label>الاسم الكامل <span>*</span><input value={form.name} onChange={set("name")} placeholder="محمد أحمد" required/></label>
        <label>رقم الهاتف<input value={form.phone} onChange={set("phone")} placeholder="+249 9XX XXX XXX" type="tel"/></label>
      </div>
      <label>البريد الإلكتروني<input value={form.email} onChange={set("email")} placeholder="email@example.com" type="email"/></label>
      <label>رسالة أو ملاحظات<textarea value={form.message} onChange={set("message")} rows={4} placeholder="اكتب تفاصيل إضافية أو أسئلتك هنا..."/></label>
      {status==="error"&&<p className="inquiry-error">حدث خطأ، يرجى المحاولة مرة أخرى.</p>}
      <button type="submit" disabled={status==="sending"}>{status==="sending"?"جاري الإرسال...":"إرسال الطلب"}</button>
    </form>
  );
}

function InvestmentSectorDetailPage({slug}:{slug?:string}){
  type Sector = {id:string;name:string;slug:string;description:string;highlight:string;icon:string;image_url:string};
  type Opp = {id:string;title:string;slug:string;image_url:string;min_investment:string;expected_return:string;duration:string;location:string;status:string};
  const [sector,setSector] = useState<Sector|null>(null);
  const [opps,setOpps] = useState<Opp[]>([]);
  const [loading,setLoading] = useState(true);
  useEffect(()=>{
    if(!slug){setLoading(false);return;}
    supabase.from("investment_sectors").select("*").eq("slug",slug).eq("published",true).maybeSingle().then(({data})=>{
      setSector(data);
      if(data){
        supabase.from("investment_opportunities").select("id,title,slug,image_url,min_investment,expected_return,duration,location,status").eq("published",true).order("created_at",{ascending:false}).limit(6).then(({data:od})=>setOpps(od||[]));
      }
      setLoading(false);
    });
  },[slug]);
  if(loading) return <div className="inv-detail-loading"><div className="inv-detail-spinner"/></div>;
  if(!sector) return <div className="inv-detail-empty"><h2>القطاع غير موجود</h2><a href="/investment">العودة للاستثمار</a></div>;
  return (
    <div className="inv-detail-page" dir="rtl">
      <div className="inv-detail-hero" style={{backgroundImage:`url(${sector.image_url||"/assets/investment-hero-hq.webp"})`}}>
        <div className="inv-detail-hero-overlay"/>
        <div className="inv-detail-hero-content page-width">
          <a href="/investment" className="inv-detail-back"><ChevronLeft/> القطاعات الاستثمارية</a>
          <span className="inv-detail-badge"><DynIcon name={sector.icon} fallback={Sprout}/> قطاع استثماري</span>
          <h1>{sector.name}</h1>
          {sector.highlight&&<p className="inv-detail-highlight"><Gem/> {sector.highlight}</p>}
        </div>
      </div>
      <div className="inv-detail-body page-width">
        <div className="inv-detail-main">
          <section className="inv-detail-description">
            <h2>عن هذا القطاع</h2>
            <p>{sector.description}</p>
          </section>
          {opps.length>0&&(
            <section className="inv-detail-opps">
              <h2>الفرص الاستثمارية في هذا القطاع</h2>
              <div className="inv-detail-opps-grid">
                {opps.map(o=>(
                  <a href={`/investment/opportunity/${o.slug}`} key={o.id} className="inv-opp-card">
                    <img src={o.image_url||"/assets/investment-hero-hq.webp"} alt={o.title}/>
                    <div>
                      <span className="inv-opp-tag">{o.status==="available"?"فرصة متاحة":o.status==="in_progress"?"قيد التنفيذ":"مغلقة"}</span>
                      <h3>{o.title}</h3>
                      <p><MapPin size={14}/> {o.location||"ولاية نهر النيل"}</p>
                      {o.min_investment&&<p><WalletCards size={14}/> الحد الأدنى: {o.min_investment}</p>}
                      {o.expected_return&&<p><ChartNoAxesCombined size={14}/> العائد: {o.expected_return}</p>}
                      <span className="inv-opp-cta">عرض التفاصيل <ChevronLeft size={14}/></span>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}
        </div>
        <aside className="inv-detail-aside">
          <InvestmentInquiryForm type="sector" slug={sector.slug} title={sector.name}/>
          <div className="inv-detail-meta">
            <h3><Info/> معلومات القطاع</h3>
            {sector.highlight&&<p><Gem/> {sector.highlight}</p>}
            {sector.highlight2&&<p><MapPin/> {sector.highlight2}</p>}
            {sector.highlight3&&<p><ShieldCheck/> {sector.highlight3}</p>}
          </div>
        </aside>
      </div>
    </div>
  );
}

// ─── Investment Opportunity Detail Page ───────────────────────────────────────
function InvestmentOpportunityDetailPage({slug}:{slug?:string}){
  type Opp = {id:string;title:string;slug:string;description:string;details:string;image_url:string;min_investment:string;expected_return:string;duration:string;location:string;status:string};
  const [opp,setOpp] = useState<Opp|null>(null);
  const [loading,setLoading] = useState(true);
  useEffect(()=>{
    if(!slug){setLoading(false);return;}
    supabase.from("investment_opportunities").select("*").eq("slug",slug).eq("published",true).maybeSingle().then(({data})=>{setOpp(data);setLoading(false);});
  },[slug]);
  if(loading) return <div className="inv-detail-loading"><div className="inv-detail-spinner"/></div>;
  if(!opp) return <div className="inv-detail-empty"><h2>الفرصة غير موجودة</h2><a href="/investment">العودة للاستثمار</a></div>;
  return (
    <div className="inv-detail-page" dir="rtl">
      <div className="inv-detail-hero" style={{backgroundImage:`url(${opp.image_url||"/assets/investment-hero-hq.webp"})`}}>
        <div className="inv-detail-hero-overlay"/>
        <div className="inv-detail-hero-content page-width">
          <a href="/investment" className="inv-detail-back"><ChevronLeft/> الفرص الاستثمارية</a>
          <span className="inv-detail-badge"><ChartNoAxesCombined/> {opp.status==="available"?"فرصة متاحة":opp.status==="in_progress"?"قيد التنفيذ":"مغلقة"}</span>
          <h1>{opp.title}</h1>
          {opp.location&&<p className="inv-detail-highlight"><MapPin/> {opp.location}</p>}
        </div>
      </div>
      <div className="inv-detail-body page-width">
        <div className="inv-detail-main">
          <section className="inv-detail-description">
            <h2>تفاصيل الفرصة الاستثمارية</h2>
            <p>{opp.description}</p>
            {opp.details&&<p>{opp.details}</p>}
          </section>
          {opp.show_specs!==false&&<div className="inv-detail-specs">
            {opp.min_investment&&<div><WalletCards/><b>الحد الأدنى للاستثمار</b><span>{opp.min_investment}</span></div>}
            {opp.expected_return&&<div><ChartNoAxesCombined/><b>العائد المتوقع</b><span>{opp.expected_return} سنوياً</span></div>}
            {opp.duration&&<div><Clock3/><b>مدة المشروع</b><span>{opp.duration}</span></div>}
            {opp.location&&<div><MapPin/><b>الموقع</b><span>{opp.location}</span></div>}
          </div>}
        </div>
        <aside className="inv-detail-aside">
          <InvestmentInquiryForm type="opportunity" slug={opp.slug} title={opp.title}/>
          {opp.show_specs!==false&&<div className="inv-detail-meta">
            <h3><Info/> ملخص الفرصة</h3>
            {opp.min_investment&&<p><WalletCards/> الحد الأدنى: {opp.min_investment}</p>}
            {opp.expected_return&&<p><Percent/> العائد: {opp.expected_return}</p>}
            {opp.duration&&<p><Clock3/> المدة: {opp.duration}</p>}
            <p><ShieldCheck/> فرصة مدعومة من الولاية</p>
          </div>}
        </aside>
      </div>
    </div>
  );
}

// ─── News detail page ─────────────────────────────────────────────────────────
function NewsDetailPage({slug}:{slug?:string}) {
  type NewsItem={id:string;title:string;slug:string;body:string;excerpt:string;image_url:string;category:string;published_at:string|null;created_at:string;author_name:string;author_image_url:string;read_time:number};
  const [item, setItem] = useState<NewsItem|null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) return;
    supabase.from("news").select("*").eq("slug",slug).eq("published",true).maybeSingle().then(({data})=>{setItem(data as NewsItem|null);setLoading(false);});
  }, [slug]);

  const pageUrl = typeof window!=="undefined" ? window.location.href : "";
  const share = (platform: string) => {
    const text = encodeURIComponent(item?.title||"");
    const url = encodeURIComponent(pageUrl);
    const urls: Record<string,string> = {
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
      twitter:  `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      telegram: `https://t.me/share/url?url=${url}&text=${text}`,
    };
    if(urls[platform]) window.open(urls[platform],"_blank","noopener,noreferrer,width=600,height=450");
  };
  const copyLink = () => {
    navigator.clipboard.writeText(pageUrl).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);});
  };

  const fmtDate=(d:string|null,c:string)=>new Date(d||c).toLocaleDateString("ar-SA",{weekday:"long",year:"numeric",month:"long",day:"numeric"});

  if (loading) return (
    <div style={{minHeight:"60vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{textAlign:"center",color:"#64748b"}}><div style={{width:40,height:40,border:"3px solid #2563eb",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 1rem"}}/><p>جاري التحميل...</p></div>
    </div>
  );
  if (!item) return (
    <div style={{minHeight:"60vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"1rem"}}>
      <h2 style={{color:"#0f172a"}}>الخبر غير موجود</h2>
      <a href="/news" style={{background:"#2563eb",color:"#fff",padding:"0.65rem 1.5rem",borderRadius:"0.5rem",textDecoration:"none",fontWeight:700}}>العودة للأخبار</a>
    </div>
  );

  return (
    <div dir="rtl" style={{background:"#f8fafc",minHeight:"100vh"}}>
      {/* ── Hero ── */}
      <div style={{position:"relative",height:"460px",overflow:"hidden",background:"#0f172a"}}>
        {item.image_url
          ? <img src={item.image_url} alt={item.title} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
          : <div style={{width:"100%",height:"100%",background:"linear-gradient(135deg,#1e3a5f,#2563eb)"}}/>
        }
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,0.88) 0%,rgba(0,0,0,0.45) 55%,rgba(0,0,0,0.05) 100%)"}}/>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",justifyContent:"flex-end",padding:"clamp(1.5rem,4vw,3rem)",maxWidth:"1200px",margin:"0 auto",left:0,right:0}}>
          <div style={{display:"flex",flexWrap:"wrap",gap:"0.5rem",marginBottom:"0.9rem"}}>
            {item.category && <span style={{background:"#2563eb",color:"#fff",padding:"0.3rem 0.9rem",borderRadius:"9999px",fontSize:"0.78rem",fontWeight:700}}>{item.category}</span>}
            {item.read_time>0 && <span style={{background:"rgba(255,255,255,0.12)",backdropFilter:"blur(8px)",color:"rgba(255,255,255,0.85)",padding:"0.3rem 0.9rem",borderRadius:"9999px",fontSize:"0.78rem",fontWeight:600,border:"1px solid rgba(255,255,255,0.15)",display:"flex",alignItems:"center",gap:"0.3rem"}}><Clock3 size={12}/> {item.read_time} دقائق قراءة</span>}
          </div>
          <h1 style={{color:"#fff",fontSize:"clamp(1.5rem,3.5vw,2.4rem)",fontWeight:900,margin:"0 0 0.9rem",lineHeight:1.3,textShadow:"0 2px 16px rgba(0,0,0,0.5)",maxWidth:"860px"}}>
            {item.title}
          </h1>
          {/* Author + date row */}
          <div style={{display:"flex",alignItems:"center",gap:"1.5rem",flexWrap:"wrap"}}>
            {item.author_name && (
              <div style={{display:"flex",alignItems:"center",gap:"0.6rem"}}>
                {item.author_image_url
                  ? <img src={item.author_image_url} alt={item.author_name} style={{width:36,height:36,borderRadius:"50%",objectFit:"cover",border:"2px solid rgba(255,255,255,0.4)"}}/>
                  : <div style={{width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#2563eb,#1d4ed8)",display:"flex",alignItems:"center",justifyContent:"center",border:"2px solid rgba(255,255,255,0.4)"}}><UserRound size={18} color="#fff"/></div>
                }
                <div>
                  <p style={{color:"rgba(255,255,255,0.55)",fontSize:"0.68rem",margin:"0 0 0.1rem",fontWeight:500}}>كاتب الخبر</p>
                  <p style={{color:"#fff",fontSize:"0.85rem",margin:0,fontWeight:700}}>{item.author_name}</p>
                </div>
              </div>
            )}
            <div style={{display:"flex",alignItems:"center",gap:"0.4rem",color:"rgba(255,255,255,0.65)",fontSize:"0.82rem"}}>
              <Calendar size={13}/>{fmtDate(item.published_at,item.created_at)}
            </div>
          </div>
        </div>
      </div>

      {/* ── Content + Sidebar ── */}
      <div style={{maxWidth:"1200px",margin:"0 auto",padding:"2.5rem 1.5rem",display:"grid",gridTemplateColumns:"1fr 300px",gap:"2.5rem",alignItems:"start"}} className="news-detail-grid">
        {/* Main article */}
        <div>
          {item.excerpt && (
            <div style={{background:"linear-gradient(135deg,#eff6ff,#dbeafe)",borderRight:"4px solid #2563eb",borderRadius:"0 0.75rem 0.75rem 0",padding:"1.25rem 1.5rem",marginBottom:"2rem"}}>
              <p style={{color:"#1e3a5f",fontSize:"1.05rem",lineHeight:1.7,margin:0,fontWeight:500}}>{item.excerpt}</p>
            </div>
          )}
          <div style={{background:"#fff",borderRadius:"1rem",padding:"2rem 2.25rem",boxShadow:"0 1px 6px rgba(0,0,0,0.06)",lineHeight:1.95,color:"#374151",fontSize:"1rem"}}
            dangerouslySetInnerHTML={{__html:item.body.replace(/\n/g,"<br/>")}}/>

          {/* Tags + back */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:"2rem",flexWrap:"wrap",gap:"1rem"}}>
            <a href="/news" style={{display:"inline-flex",alignItems:"center",gap:"0.5rem",color:"#2563eb",fontWeight:700,textDecoration:"none",fontSize:"0.9rem",padding:"0.6rem 1.25rem",border:"2px solid #2563eb",borderRadius:"0.5rem",transition:"all 0.2s"}}
              onMouseEnter={e=>{e.currentTarget.style.background="#2563eb";e.currentTarget.style.color="#fff";}} onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="#2563eb";}}>
              <ChevronRight size={16}/> العودة للأخبار
            </a>
            {item.category && <span style={{background:"#eff6ff",color:"#2563eb",padding:"0.4rem 1rem",borderRadius:"9999px",fontSize:"0.82rem",fontWeight:700,border:"1px solid #bfdbfe"}}># {item.category}</span>}
          </div>
        </div>

        {/* Sidebar */}
        <aside style={{display:"flex",flexDirection:"column",gap:"1.5rem",position:"sticky",top:"5rem"}}>
          {/* Author card */}
          {item.author_name && (
            <div style={{background:"#fff",borderRadius:"1rem",padding:"1.5rem",boxShadow:"0 4px 20px rgba(0,0,0,0.08)",border:"1px solid #e2e8f0",textAlign:"center"}}>
              <div style={{marginBottom:"0.75rem",display:"flex",justifyContent:"center"}}>
                {item.author_image_url
                  ? <img src={item.author_image_url} alt={item.author_name} style={{width:80,height:80,borderRadius:"50%",objectFit:"cover",border:"3px solid #eff6ff",boxShadow:"0 2px 12px rgba(37,99,235,0.15)"}}/>
                  : <div style={{width:80,height:80,borderRadius:"50%",background:"linear-gradient(135deg,#2563eb,#1d4ed8)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 12px rgba(37,99,235,0.2)"}}><UserRound size={36} color="#fff"/></div>
                }
              </div>
              <p style={{color:"#64748b",fontSize:"0.72rem",margin:"0 0 0.25rem",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em"}}>كاتب الخبر</p>
              <p style={{color:"#0f172a",fontWeight:800,fontSize:"1rem",margin:0}}>{item.author_name}</p>
            </div>
          )}

          {/* Date card */}
          <div style={{background:"#fff",borderRadius:"1rem",padding:"1.25rem 1.5rem",boxShadow:"0 4px 20px rgba(0,0,0,0.08)",border:"1px solid #e2e8f0"}}>
            <p style={{color:"#64748b",fontSize:"0.75rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",margin:"0 0 0.75rem",display:"flex",alignItems:"center",gap:"0.4rem"}}><Calendar size={13}/> تاريخ النشر</p>
            <p style={{color:"#0f172a",fontWeight:700,fontSize:"0.92rem",margin:0}}>{fmtDate(item.published_at,item.created_at)}</p>
            {item.read_time>0 && <p style={{color:"#64748b",fontSize:"0.8rem",margin:"0.5rem 0 0",display:"flex",alignItems:"center",gap:"0.4rem"}}><Clock3 size={12}/> وقت القراءة: {item.read_time} دقائق</p>}
          </div>

          {/* Share card */}
          <div style={{background:"#fff",borderRadius:"1rem",padding:"1.25rem 1.5rem",boxShadow:"0 4px 20px rgba(0,0,0,0.08)",border:"1px solid #e2e8f0"}}>
            <p style={{color:"#64748b",fontSize:"0.75rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",margin:"0 0 1rem",display:"flex",alignItems:"center",gap:"0.4rem"}}><Share2 size={13}/> شارك الخبر</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.5rem"}}>
              {[
                {id:"whatsapp",label:"واتساب",bg:"#25d366",hover:"#1da851"},
                {id:"telegram",label:"تيليغرام",bg:"#0088cc",hover:"#006fa3"},
                {id:"twitter",label:"X (تويتر)",bg:"#000",hover:"#222"},
                {id:"facebook",label:"فيسبوك",bg:"#1877f2",hover:"#1264c9"},
              ].map(p=>(
                <button key={p.id} onClick={()=>share(p.id)} style={{background:p.bg,color:"#fff",border:"none",borderRadius:"0.5rem",padding:"0.55rem 0.5rem",fontSize:"0.76rem",fontWeight:700,cursor:"pointer",transition:"all 0.2s",width:"100%"}}
                  onMouseEnter={e=>(e.currentTarget.style.background=p.hover)} onMouseLeave={e=>(e.currentTarget.style.background=p.bg)}>
                  {p.label}
                </button>
              ))}
            </div>
            <button onClick={copyLink} style={{width:"100%",marginTop:"0.5rem",background:copied?"#16a34a":"#f1f5f9",color:copied?"#fff":"#475569",border:"none",borderRadius:"0.5rem",padding:"0.55rem",fontSize:"0.76rem",fontWeight:700,cursor:"pointer",transition:"all 0.25s",display:"flex",alignItems:"center",justifyContent:"center",gap:"0.4rem"}}>
              {copied ? <><CircleCheckBig size={13}/> تم النسخ!</> : <><Share2 size={13}/> نسخ الرابط</>}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ─── Events list page ─────────────────────────────────────────────────────────
function EventsListPage() {
  type EventItem={id:string;title:string;slug:string;excerpt:string;image_url:string;location:string;event_date:string};
  const [items, setItems] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null);

  useEffect(() => {
    supabase.from("events").select("id,title,slug,excerpt,image_url,location,event_date").eq("published",true).order("event_date",{ascending:false}).then(({data})=>{setItems(data??[]);setLoading(false);});
  }, []);

  const heroes = items.filter(i=>i.image_url).slice(0,5);
  const next = useCallback(()=>setSlide(s=>(s+1)%heroes.length),[heroes.length]);
  const prev = useCallback(()=>setSlide(s=>(s-1+heroes.length)%heroes.length),[heroes.length]);

  useEffect(()=>{
    if(paused||heroes.length<2) return;
    timerRef.current=setInterval(next,6000);
    return ()=>{if(timerRef.current)clearInterval(timerRef.current);};
  },[next,paused,heroes.length]);

  const fmtDate=(d:string)=>new Date(d).toLocaleDateString("ar-SA",{year:"numeric",month:"long",day:"numeric"});

  return (
    <div dir="rtl" style={{background:"#f8fafc",minHeight:"100vh"}}>
      {/* ── Events Hero Slider ── */}
      {!loading && heroes.length>0 && (
        <div style={{position:"relative",height:"540px",overflow:"hidden",background:"#0a2a1a"}}
          onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)}>
          {/* Slides */}
          {heroes.map((item,i)=>(
            <div key={item.id} style={{position:"absolute",inset:0,transition:"opacity 0.9s ease",opacity:i===slide?1:0,pointerEvents:i===slide?"auto":"none"}}>
              <img src={item.image_url} alt={item.title} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
              <div style={{position:"absolute",inset:0,background:"linear-gradient(110deg,rgba(0,0,0,0.87) 0%,rgba(0,0,0,0.5) 50%,rgba(0,0,0,0.1) 100%)"}}/>
            </div>
          ))}
          {/* Date strip decoration */}
          {heroes[slide] && (
            <div style={{position:"absolute",top:0,right:0,width:"3px",height:"100%",background:"linear-gradient(to bottom,transparent,#16a34a,transparent)"}}/>
          )}
          {/* Content */}
          {heroes[slide] && (
            <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",justifyContent:"center",padding:"clamp(1.5rem,5vw,4rem)",maxWidth:"720px",animation:"fadeUp 0.6s ease"}}>
              {/* Date badge */}
              <div style={{display:"inline-flex",alignItems:"center",gap:"0.5rem",background:"rgba(22,163,74,0.85)",backdropFilter:"blur(8px)",color:"#fff",padding:"0.4rem 1rem",borderRadius:"9999px",fontSize:"0.8rem",fontWeight:700,marginBottom:"1.25rem",width:"fit-content",border:"1px solid rgba(255,255,255,0.2)"}}>
                <CalendarDays size={14}/>
                {fmtDate(heroes[slide].event_date)}
              </div>
              <span style={{display:"inline-flex",background:"rgba(255,255,255,0.1)",backdropFilter:"blur(8px)",color:"rgba(255,255,255,0.9)",padding:"0.25rem 0.85rem",borderRadius:"9999px",fontSize:"0.75rem",fontWeight:600,marginBottom:"0.85rem",width:"fit-content",border:"1px solid rgba(255,255,255,0.15)"}}>
                فعالية قادمة
              </span>
              <h1 style={{color:"#fff",fontSize:"clamp(1.5rem,4vw,2.4rem)",fontWeight:900,margin:"0 0 0.85rem",lineHeight:1.25,textShadow:"0 2px 16px rgba(0,0,0,0.6)"}}>
                {heroes[slide].title}
              </h1>
              {heroes[slide].excerpt && (
                <p style={{color:"rgba(255,255,255,0.72)",fontSize:"0.92rem",lineHeight:1.65,margin:"0 0 0.75rem",maxWidth:"540px"}}>
                  {heroes[slide].excerpt.slice(0,120)}...
                </p>
              )}
              {heroes[slide].location && (
                <div style={{display:"flex",alignItems:"center",gap:"0.4rem",color:"rgba(255,255,255,0.6)",fontSize:"0.82rem",marginBottom:"1.5rem"}}>
                  <MapPin size={14}/>{heroes[slide].location}
                </div>
              )}
              <a href={`/events/${heroes[slide].slug}`} style={{background:"#16a34a",color:"#fff",padding:"0.75rem 1.75rem",borderRadius:"0.6rem",textDecoration:"none",fontWeight:700,fontSize:"0.9rem",display:"flex",alignItems:"center",gap:"0.5rem",width:"fit-content",boxShadow:"0 4px 16px rgba(22,163,74,0.4)"}}>
                تفاصيل الفعالية <ArrowLeft size={16}/>
              </a>
            </div>
          )}
          {/* Arrows */}
          {heroes.length>1&&<>
            <button onClick={next} style={{position:"absolute",top:"50%",left:"1.5rem",transform:"translateY(-50%)",background:"rgba(255,255,255,0.1)",backdropFilter:"blur(10px)",border:"1px solid rgba(255,255,255,0.2)",color:"#fff",width:46,height:46,borderRadius:"50%",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s"}}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(22,163,74,0.7)";e.currentTarget.style.borderColor="rgba(22,163,74,0.8)";}} onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.1)";e.currentTarget.style.borderColor="rgba(255,255,255,0.2)";}}>
              <ChevronLeft size={20}/>
            </button>
            <button onClick={prev} style={{position:"absolute",top:"50%",right:"1.5rem",transform:"translateY(-50%)",background:"rgba(255,255,255,0.1)",backdropFilter:"blur(10px)",border:"1px solid rgba(255,255,255,0.2)",color:"#fff",width:46,height:46,borderRadius:"50%",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s"}}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(22,163,74,0.7)";e.currentTarget.style.borderColor="rgba(22,163,74,0.8)";}} onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.1)";e.currentTarget.style.borderColor="rgba(255,255,255,0.2)";}}>
              <ChevronRight size={20}/>
            </button>
          </>}
          {/* Progress bar */}
          <div style={{position:"absolute",bottom:0,left:0,right:0,height:3,background:"rgba(255,255,255,0.1)"}}>
            <div key={`${slide}-prog`} style={{height:"100%",background:"#16a34a",animation:paused?"none":"progressBar 6s linear",width:paused?"auto":"100%"}}/>
          </div>
          {/* Dot nav */}
          <div style={{position:"absolute",bottom:"1.5rem",left:"50%",transform:"translateX(-50%)",display:"flex",gap:"0.5rem",alignItems:"center"}}>
            {heroes.map((_,i)=>(
              <button key={i} onClick={()=>setSlide(i)} style={{width:i===slide?28:8,height:8,borderRadius:9999,background:i===slide?"#16a34a":"rgba(255,255,255,0.35)",border:"none",cursor:"pointer",padding:0,transition:"all 0.35s ease",boxShadow:i===slide?"0 0 8px rgba(22,163,74,0.6)":"none"}}/>
            ))}
          </div>
          {/* Side thumbnails */}
          <div style={{position:"absolute",bottom:"1.5rem",right:"1.75rem",display:"flex",gap:"0.5rem"}}>
            {heroes.map((h,i)=>i!==slide&&(
              <button key={h.id} onClick={()=>setSlide(i)} style={{width:70,height:48,borderRadius:"0.375rem",overflow:"hidden",border:"2px solid rgba(255,255,255,0.25)",cursor:"pointer",padding:0,opacity:0.7,transition:"all 0.2s"}}
                onMouseEnter={e=>{e.currentTarget.style.opacity="1";e.currentTarget.style.borderColor="rgba(22,163,74,0.8)";}} onMouseLeave={e=>{e.currentTarget.style.opacity="0.7";e.currentTarget.style.borderColor="rgba(255,255,255,0.25)";}}>
                <img src={h.image_url} alt={h.title} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
              </button>
            ))}
          </div>
        </div>
      )}
      {loading && <div style={{height:540,display:"flex",alignItems:"center",justifyContent:"center",background:"#0a2a1a"}}><div style={{width:40,height:40,border:"3px solid #16a34a",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/></div>}

      {/* ── Events grid ── */}
      <section style={{maxWidth:"1200px",margin:"0 auto",padding:"2.5rem 1.5rem"}}>
        <div style={{display:"flex",alignItems:"center",gap:"0.75rem",marginBottom:"2rem"}}>
          <div style={{width:4,height:32,background:"#16a34a",borderRadius:2}}/>
          <h2 style={{fontSize:"1.25rem",fontWeight:800,color:"#0f172a",margin:0}}>جميع الفعاليات</h2>
          {items.length>0&&<span style={{background:"#f0fdf4",color:"#16a34a",padding:"0.2rem 0.6rem",borderRadius:"9999px",fontSize:"0.75rem",fontWeight:700,marginRight:"auto"}}>{items.length} فعالية</span>}
        </div>
        {!loading && items.length===0 && <p style={{textAlign:"center",color:"#64748b",padding:"3rem"}}>لا توجد فعاليات منشورة حالياً</p>}
        <div className="news-grid">
          {items.map(item=>(
            <a key={item.id} href={`/events/${item.slug}`} className="news-card">
              {item.image_url?<img src={item.image_url} alt={item.title}/>:<div className="news-card-placeholder" style={{background:"linear-gradient(135deg,#14532d,#16a34a)"}}/>}
              <div className="news-card-body">
                <span className="news-cat" style={{background:"#16a34a"}}><CalendarDays size={11}/> {fmtDate(item.event_date)}</span>
                <h3>{item.title}</h3>
                {item.excerpt&&<p>{item.excerpt}</p>}
                {item.location&&<small style={{display:"flex",alignItems:"center",gap:"0.3rem"}}><MapPin size={11}/>{item.location}</small>}
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}

// ─── Event detail page ────────────────────────────────────────────────────────
function EventDetailPage({slug}:{slug?:string}) {
  type EventItem={id:string;title:string;slug:string;body:string;excerpt:string;image_url:string;location:string;event_date:string;event_end_date:string|null;author_name:string;author_image_url:string;organizer:string;created_at:string};
  const [item, setItem] = useState<EventItem|null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) return;
    supabase.from("events").select("*").eq("slug",slug).eq("published",true).maybeSingle().then(({data})=>{setItem(data as EventItem|null);setLoading(false);});
  }, [slug]);

  const pageUrl = typeof window!=="undefined" ? window.location.href : "";
  const share = (platform: string) => {
    const text = encodeURIComponent(item?.title||"");
    const url = encodeURIComponent(pageUrl);
    const urls: Record<string,string> = {
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
      twitter:  `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      telegram: `https://t.me/share/url?url=${url}&text=${text}`,
    };
    if(urls[platform]) window.open(urls[platform],"_blank","noopener,noreferrer,width=600,height=450");
  };
  const copyLink = () => {
    navigator.clipboard.writeText(pageUrl).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);});
  };

  const fmtDate=(d:string)=>new Date(d).toLocaleDateString("ar-SA",{weekday:"long",year:"numeric",month:"long",day:"numeric"});
  const fmtTime=(d:string)=>new Date(d).toLocaleTimeString("ar-SA",{hour:"2-digit",minute:"2-digit"});

  if (loading) return (
    <div style={{minHeight:"60vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{textAlign:"center",color:"#64748b"}}><div style={{width:40,height:40,border:"3px solid #16a34a",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 1rem"}}/><p>جاري التحميل...</p></div>
    </div>
  );
  if (!item) return (
    <div style={{minHeight:"60vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"1rem"}}>
      <h2 style={{color:"#0f172a"}}>الفعالية غير موجودة</h2>
      <a href="/events" style={{background:"#16a34a",color:"#fff",padding:"0.65rem 1.5rem",borderRadius:"0.5rem",textDecoration:"none",fontWeight:700}}>العودة للفعاليات</a>
    </div>
  );

  const isUpcoming = new Date(item.event_date) > new Date();

  return (
    <div dir="rtl" style={{background:"#f8fafc",minHeight:"100vh"}}>
      {/* ── Hero ── */}
      <div style={{position:"relative",height:"480px",overflow:"hidden",background:"#0a2a1a"}}>
        {item.image_url
          ? <img src={item.image_url} alt={item.title} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
          : <div style={{width:"100%",height:"100%",background:"linear-gradient(135deg,#14532d,#16a34a)"}}/>
        }
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,0.92) 0%,rgba(0,0,0,0.5) 55%,rgba(0,0,0,0.05) 100%)"}}/>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",justifyContent:"flex-end",padding:"clamp(1.5rem,4vw,3rem)",maxWidth:"1200px",margin:"0 auto",left:0,right:0}}>
          <div style={{display:"flex",flexWrap:"wrap",gap:"0.5rem",marginBottom:"0.9rem"}}>
            <span style={{background:isUpcoming?"#16a34a":"#6b7280",color:"#fff",padding:"0.3rem 0.9rem",borderRadius:"9999px",fontSize:"0.78rem",fontWeight:700,display:"flex",alignItems:"center",gap:"0.3rem"}}>
              <CalendarDays size={12}/>{isUpcoming?"فعالية قادمة":"فعالية منتهية"}
            </span>
            {item.location && <span style={{background:"rgba(255,255,255,0.12)",backdropFilter:"blur(8px)",color:"rgba(255,255,255,0.85)",padding:"0.3rem 0.9rem",borderRadius:"9999px",fontSize:"0.78rem",fontWeight:600,border:"1px solid rgba(255,255,255,0.15)",display:"flex",alignItems:"center",gap:"0.3rem"}}><MapPin size={12}/>{item.location}</span>}
          </div>
          <h1 style={{color:"#fff",fontSize:"clamp(1.5rem,3.5vw,2.4rem)",fontWeight:900,margin:"0 0 0.9rem",lineHeight:1.3,textShadow:"0 2px 16px rgba(0,0,0,0.5)",maxWidth:"860px"}}>
            {item.title}
          </h1>
          <div style={{display:"flex",alignItems:"center",gap:"1.5rem",flexWrap:"wrap"}}>
            {item.author_name && (
              <div style={{display:"flex",alignItems:"center",gap:"0.6rem"}}>
                {item.author_image_url
                  ? <img src={item.author_image_url} alt={item.author_name} style={{width:36,height:36,borderRadius:"50%",objectFit:"cover",border:"2px solid rgba(255,255,255,0.4)"}}/>
                  : <div style={{width:36,height:36,borderRadius:"50%",background:"rgba(22,163,74,0.7)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",border:"2px solid rgba(255,255,255,0.3)"}}><UserRound size={18} color="#fff"/></div>
                }
                <div>
                  <p style={{color:"rgba(255,255,255,0.55)",fontSize:"0.68rem",margin:"0 0 0.1rem",fontWeight:500}}>المُنظِّم</p>
                  <p style={{color:"#fff",fontSize:"0.85rem",margin:0,fontWeight:700}}>{item.author_name}</p>
                </div>
              </div>
            )}
            <div style={{display:"flex",alignItems:"center",gap:"0.4rem",color:"rgba(255,255,255,0.65)",fontSize:"0.82rem"}}>
              <Calendar size={13}/>{fmtDate(item.event_date)}
            </div>
          </div>
        </div>
      </div>

      {/* ── Content + Sidebar ── */}
      <div style={{maxWidth:"1200px",margin:"0 auto",padding:"2.5rem 1.5rem",display:"grid",gridTemplateColumns:"1fr 300px",gap:"2.5rem",alignItems:"start"}} className="news-detail-grid">
        {/* Main */}
        <div>
          {item.excerpt && (
            <div style={{background:"linear-gradient(135deg,#f0fdf4,#dcfce7)",borderRight:"4px solid #16a34a",borderRadius:"0 0.75rem 0.75rem 0",padding:"1.25rem 1.5rem",marginBottom:"2rem"}}>
              <p style={{color:"#14532d",fontSize:"1.05rem",lineHeight:1.7,margin:0,fontWeight:500}}>{item.excerpt}</p>
            </div>
          )}
          <div style={{background:"#fff",borderRadius:"1rem",padding:"2rem 2.25rem",boxShadow:"0 1px 6px rgba(0,0,0,0.06)",lineHeight:1.95,color:"#374151",fontSize:"1rem"}}
            dangerouslySetInnerHTML={{__html:item.body.replace(/\n/g,"<br/>")}}/>

          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:"2rem",flexWrap:"wrap",gap:"1rem"}}>
            <a href="/events" style={{display:"inline-flex",alignItems:"center",gap:"0.5rem",color:"#16a34a",fontWeight:700,textDecoration:"none",fontSize:"0.9rem",padding:"0.6rem 1.25rem",border:"2px solid #16a34a",borderRadius:"0.5rem",transition:"all 0.2s"}}
              onMouseEnter={e=>{e.currentTarget.style.background="#16a34a";e.currentTarget.style.color="#fff";}} onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="#16a34a";}}>
              <ChevronRight size={16}/> العودة للفعاليات
            </a>
          </div>
        </div>

        {/* Sidebar */}
        <aside style={{display:"flex",flexDirection:"column",gap:"1.5rem",position:"sticky",top:"5rem"}}>
          {/* Event details card */}
          <div style={{background:"#fff",borderRadius:"1rem",overflow:"hidden",boxShadow:"0 4px 20px rgba(0,0,0,0.08)",border:"1px solid #e2e8f0"}}>
            <div style={{background:"linear-gradient(135deg,#16a34a,#15803d)",padding:"1rem 1.25rem"}}>
              <p style={{color:"rgba(255,255,255,0.8)",fontSize:"0.72rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",margin:"0 0 0.25rem"}}>تفاصيل الفعالية</p>
              <p style={{color:"#fff",fontWeight:800,fontSize:"0.95rem",margin:0}}>{item.title.slice(0,45)}{item.title.length>45?"...":""}</p>
            </div>
            <div style={{padding:"1.25rem"}}>
              <div style={{display:"flex",flexDirection:"column",gap:"0.85rem"}}>
                <div style={{display:"flex",gap:"0.75rem",alignItems:"flex-start"}}>
                  <div style={{width:32,height:32,background:"#f0fdf4",borderRadius:"0.5rem",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><CalendarDays size={16} color="#16a34a"/></div>
                  <div><p style={{color:"#64748b",fontSize:"0.7rem",fontWeight:600,margin:"0 0 0.1rem"}}>تاريخ البداية</p><p style={{color:"#0f172a",fontWeight:700,fontSize:"0.85rem",margin:0}}>{fmtDate(item.event_date)}</p><p style={{color:"#64748b",fontSize:"0.78rem",margin:"0.1rem 0 0"}}>{fmtTime(item.event_date)}</p></div>
                </div>
                {item.event_end_date && (
                  <div style={{display:"flex",gap:"0.75rem",alignItems:"flex-start"}}>
                    <div style={{width:32,height:32,background:"#fef9c3",borderRadius:"0.5rem",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><CalendarDays size={16} color="#ca8a04"/></div>
                    <div><p style={{color:"#64748b",fontSize:"0.7rem",fontWeight:600,margin:"0 0 0.1rem"}}>تاريخ النهاية</p><p style={{color:"#0f172a",fontWeight:700,fontSize:"0.85rem",margin:0}}>{fmtDate(item.event_end_date)}</p><p style={{color:"#64748b",fontSize:"0.78rem",margin:"0.1rem 0 0"}}>{fmtTime(item.event_end_date)}</p></div>
                  </div>
                )}
                {item.location && (
                  <div style={{display:"flex",gap:"0.75rem",alignItems:"flex-start"}}>
                    <div style={{width:32,height:32,background:"#eff6ff",borderRadius:"0.5rem",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><MapPin size={16} color="#2563eb"/></div>
                    <div><p style={{color:"#64748b",fontSize:"0.7rem",fontWeight:600,margin:"0 0 0.1rem"}}>الموقع</p><p style={{color:"#0f172a",fontWeight:700,fontSize:"0.85rem",margin:0}}>{item.location}</p></div>
                  </div>
                )}
                {item.organizer && (
                  <div style={{display:"flex",gap:"0.75rem",alignItems:"flex-start"}}>
                    <div style={{width:32,height:32,background:"#fdf4ff",borderRadius:"0.5rem",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><UsersRound size={16} color="#9333ea"/></div>
                    <div><p style={{color:"#64748b",fontSize:"0.7rem",fontWeight:600,margin:"0 0 0.1rem"}}>الجهة المنظِّمة</p><p style={{color:"#0f172a",fontWeight:700,fontSize:"0.85rem",margin:0}}>{item.organizer}</p></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Organizer card */}
          {item.author_name && (
            <div style={{background:"#fff",borderRadius:"1rem",padding:"1.5rem",boxShadow:"0 4px 20px rgba(0,0,0,0.08)",border:"1px solid #e2e8f0",textAlign:"center"}}>
              <div style={{marginBottom:"0.75rem",display:"flex",justifyContent:"center"}}>
                {item.author_image_url
                  ? <img src={item.author_image_url} alt={item.author_name} style={{width:80,height:80,borderRadius:"50%",objectFit:"cover",border:"3px solid #f0fdf4",boxShadow:"0 2px 12px rgba(22,163,74,0.15)"}}/>
                  : <div style={{width:80,height:80,borderRadius:"50%",background:"linear-gradient(135deg,#16a34a,#15803d)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 12px rgba(22,163,74,0.2)"}}><UserRound size={36} color="#fff"/></div>
                }
              </div>
              <p style={{color:"#64748b",fontSize:"0.72rem",margin:"0 0 0.25rem",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em"}}>المُنظِّم</p>
              <p style={{color:"#0f172a",fontWeight:800,fontSize:"1rem",margin:0}}>{item.author_name}</p>
            </div>
          )}

          {/* Share */}
          <div style={{background:"#fff",borderRadius:"1rem",padding:"1.25rem 1.5rem",boxShadow:"0 4px 20px rgba(0,0,0,0.08)",border:"1px solid #e2e8f0"}}>
            <p style={{color:"#64748b",fontSize:"0.75rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",margin:"0 0 1rem",display:"flex",alignItems:"center",gap:"0.4rem"}}><Share2 size={13}/> شارك الفعالية</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.5rem"}}>
              {[
                {id:"whatsapp",label:"واتساب",bg:"#25d366",hover:"#1da851"},
                {id:"telegram",label:"تيليغرام",bg:"#0088cc",hover:"#006fa3"},
                {id:"twitter",label:"X (تويتر)",bg:"#000",hover:"#222"},
                {id:"facebook",label:"فيسبوك",bg:"#1877f2",hover:"#1264c9"},
              ].map(p=>(
                <button key={p.id} onClick={()=>share(p.id)} style={{background:p.bg,color:"#fff",border:"none",borderRadius:"0.5rem",padding:"0.55rem 0.5rem",fontSize:"0.76rem",fontWeight:700,cursor:"pointer",transition:"all 0.2s",width:"100%"}}
                  onMouseEnter={e=>(e.currentTarget.style.background=p.hover)} onMouseLeave={e=>(e.currentTarget.style.background=p.bg)}>
                  {p.label}
                </button>
              ))}
            </div>
            <button onClick={copyLink} style={{width:"100%",marginTop:"0.5rem",background:copied?"#16a34a":"#f1f5f9",color:copied?"#fff":"#475569",border:"none",borderRadius:"0.5rem",padding:"0.55rem",fontSize:"0.76rem",fontWeight:700,cursor:"pointer",transition:"all 0.25s",display:"flex",alignItems:"center",justifyContent:"center",gap:"0.4rem"}}>
              {copied ? <><CircleCheckBig size={13}/> تم النسخ!</> : <><Share2 size={13}/> نسخ الرابط</>}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}


function CultureArtDetailPage({slug}:{slug?:string}){
  type ArtRow={id:string;slug:string;title:string;icon:string;image_url:string;description:string;activities:string;published:boolean};
  const [item,setItem]=useState<ArtRow|null>(null);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{
    if(!slug){setLoading(false);return;}
    supabase.from("culture_art_categories").select("*").eq("slug",slug).maybeSingle().then(({data})=>{setItem(data as ArtRow|null);setLoading(false);});
  },[slug]);
  if(loading)return(<div style={{minHeight:"60vh",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{textAlign:"center",color:"#64748b"}}><div style={{width:40,height:40,border:"3px solid #0e7490",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 1rem"}}/><p>جاري التحميل...</p></div></div>);
  if(!item)return(<div style={{minHeight:"60vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"1rem"}}><h2 style={{color:"#0f172a"}}>الصفحة غير موجودة</h2><a href="/culture" style={{background:"#0e7490",color:"#fff",padding:"0.6rem 1.5rem",borderRadius:"0.5rem",textDecoration:"none",fontWeight:600}}>العودة للثقافة</a></div>);
  const acts=(item.activities||'').split(',').map(s=>s.trim()).filter(Boolean);
  return(
    <div dir="rtl" style={{background:"#f8fafc",minHeight:"100vh"}}>
      <div style={{position:"relative",height:"400px",overflow:"hidden"}}>
        {item.image_url?<img src={item.image_url} alt={item.title} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<div style={{width:"100%",height:"100%",background:"linear-gradient(135deg,#134e4a,#0e7490)"}}/>}
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,0.75),rgba(0,0,0,0.15))"}}/>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",justifyContent:"flex-end",padding:"2.5rem",maxWidth:"1200px",margin:"0 auto",left:0,right:0}}>
          <span style={{fontSize:"2.5rem",marginBottom:"0.5rem"}}>{item.icon}</span>
          <span style={{display:"inline-flex",background:"#0e7490",color:"#fff",padding:"0.3rem 0.9rem",borderRadius:"9999px",fontSize:"0.78rem",fontWeight:700,marginBottom:"0.75rem",width:"fit-content"}}>فن وثقافة</span>
          <h1 style={{color:"#fff",fontSize:"clamp(1.6rem,4vw,2.4rem)",fontWeight:800,margin:0,textShadow:"0 2px 8px rgba(0,0,0,0.4)"}}>{item.title}</h1>
        </div>
      </div>
      <div style={{maxWidth:"1200px",margin:"0 auto",padding:"2.5rem 1.5rem",display:"grid",gridTemplateColumns:"1fr 280px",gap:"2rem",alignItems:"start"}} className="soc-svc-grid">
        <div>
          <div style={{background:"#fff",borderRadius:"1rem",padding:"2rem",boxShadow:"0 1px 6px rgba(0,0,0,0.06)",marginBottom:"1.5rem"}}>
            <div style={{color:"#374151",lineHeight:1.9,fontSize:"0.95rem"}} dangerouslySetInnerHTML={{__html:item.description.replace(/\n/g,"<br/>")}}/>
          </div>
          <a href="/culture" style={{display:"inline-flex",alignItems:"center",gap:"0.5rem",color:"#0e7490",fontWeight:600,textDecoration:"none",fontSize:"0.9rem"}}>
            <ArrowLeft size={16}/> العودة للثقافة
          </a>
        </div>
        {acts.length>0&&<div style={{background:"#fff",borderRadius:"1rem",padding:"1.75rem",boxShadow:"0 4px 20px rgba(0,0,0,0.1)",border:"1px solid #e2e8f0"}}>
          <h3 style={{fontSize:"0.95rem",fontWeight:700,color:"#0f172a",marginBottom:"1.25rem",paddingBottom:"0.75rem",borderBottom:"2px solid #ecfeff"}}>الفعاليات والأنشطة</h3>
          {acts.map(a=><div key={a} style={{display:"flex",alignItems:"flex-start",gap:"0.5rem",marginBottom:"0.625rem"}}><span style={{color:"#0e7490",fontWeight:700,flexShrink:0}}>◈</span><span style={{fontSize:"0.85rem",color:"#374151",lineHeight:1.5}}>{a}</span></div>)}
        </div>}
      </div>
    </div>
  );
}

function CultureAssociationDetailPage({slug}:{slug?:string}){
  type AssocRow={id:string;title:string;place:string;icon:string;description:string;founded_year:string;members_count:string;email:string;phone:string;image_url:string};
  const [item,setItem]=useState<AssocRow|null>(null);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{
    if(!slug){setLoading(false);return;}
    supabase.from("culture_associations").select("*").eq("slug",slug).maybeSingle().then(({data})=>{setItem(data as AssocRow|null);setLoading(false);});
  },[slug]);
  if(loading)return(<div style={{minHeight:"60vh",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{textAlign:"center",color:"#64748b"}}><div style={{width:40,height:40,border:"3px solid #0e7490",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 1rem"}}/><p>جاري التحميل...</p></div></div>);
  if(!item)return(<div style={{minHeight:"60vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"1rem"}}><h2 style={{color:"#0f172a"}}>الجمعية غير موجودة</h2><a href="/culture" style={{background:"#0e7490",color:"#fff",padding:"0.6rem 1.5rem",borderRadius:"0.5rem",textDecoration:"none",fontWeight:600}}>العودة للثقافة</a></div>);
  return(
    <div dir="rtl" style={{background:"#f8fafc",minHeight:"100vh"}}>
      <div style={{position:"relative",height:"380px",overflow:"hidden"}}>
        {item.image_url?<img src={item.image_url} alt={item.title} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<div style={{width:"100%",height:"100%",background:"linear-gradient(135deg,#134e4a,#0e7490,#0891b2)"}}/>}
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,0.78),rgba(0,0,0,0.2))"}}/>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",justifyContent:"flex-end",padding:"2.5rem",maxWidth:"1200px",margin:"0 auto",left:0,right:0}}>
          <div style={{display:"flex",alignItems:"center",gap:"0.75rem",marginBottom:"0.75rem"}}>
            <span style={{width:52,height:52,background:"rgba(255,255,255,0.15)",backdropFilter:"blur(8px)",borderRadius:"0.875rem",display:"flex",alignItems:"center",justifyContent:"center",border:"1px solid rgba(255,255,255,0.25)"}}><DynIcon name={item.icon} fallback={Landmark} style={{width:"1.6rem",height:"1.6rem",color:"#fff"}}/></span>
            <span style={{background:"#0e7490",color:"#fff",padding:"0.3rem 0.9rem",borderRadius:"9999px",fontSize:"0.78rem",fontWeight:700}}>جمعية ثقافية</span>
          </div>
          <h1 style={{color:"#fff",fontSize:"clamp(1.6rem,4vw,2.2rem)",fontWeight:800,margin:"0 0 0.4rem",textShadow:"0 2px 8px rgba(0,0,0,0.4)"}}>{item.title}</h1>
          <div style={{display:"flex",flexWrap:"wrap",gap:"1rem"}}>
            <span style={{color:"rgba(255,255,255,0.8)",fontSize:"0.85rem",display:"flex",alignItems:"center",gap:"0.3rem"}}><MapPin size={14}/>{item.place}</span>
            {item.founded_year&&<span style={{color:"rgba(255,255,255,0.8)",fontSize:"0.85rem",display:"flex",alignItems:"center",gap:"0.3rem"}}><Calendar size={14}/>تأسست {item.founded_year}</span>}
            {item.members_count&&<span style={{color:"rgba(255,255,255,0.8)",fontSize:"0.85rem",display:"flex",alignItems:"center",gap:"0.3rem"}}><UsersRound size={14}/>{item.members_count}</span>}
          </div>
        </div>
      </div>
      <div style={{maxWidth:"1200px",margin:"0 auto",padding:"2.5rem 1.5rem",display:"grid",gridTemplateColumns:"1fr 300px",gap:"2rem",alignItems:"start"}} className="soc-svc-grid">
        <div>
          {item.description&&<div style={{background:"#fff",borderRadius:"1rem",padding:"2rem",boxShadow:"0 1px 6px rgba(0,0,0,0.06)",marginBottom:"1.5rem"}}>
            <h2 style={{fontSize:"1.05rem",fontWeight:700,color:"#0f172a",marginBottom:"1.25rem",paddingBottom:"0.75rem",borderBottom:"2px solid #ecfeff",display:"flex",alignItems:"center",gap:"0.5rem"}}><span style={{color:"#0e7490"}}>◈</span> عن الجمعية</h2>
            <div style={{color:"#374151",lineHeight:1.9,fontSize:"0.95rem"}} dangerouslySetInnerHTML={{__html:item.description.replace(/\n/g,"<br/>")}}/>  
          </div>}
          <a href="/culture" style={{display:"inline-flex",alignItems:"center",gap:"0.5rem",color:"#0e7490",fontWeight:600,textDecoration:"none",fontSize:"0.9rem"}}><ArrowLeft size={16}/> العودة للثقافة</a>
        </div>
        {(item.email||item.phone)&&<div style={{background:"#fff",borderRadius:"1rem",padding:"1.75rem",boxShadow:"0 4px 20px rgba(0,0,0,0.1)",border:"1px solid #e2e8f0"}}>
          <h3 style={{fontSize:"0.95rem",fontWeight:700,color:"#0f172a",marginBottom:"1.25rem"}}>التواصل مع الجمعية</h3>
          {item.email&&<a href={`mailto:${item.email}`} style={{display:"flex",alignItems:"center",gap:"0.5rem",color:"#0e7490",textDecoration:"none",marginBottom:"0.75rem",fontSize:"0.9rem"}}><Mail size={16}/>{item.email}</a>}
          {item.phone&&<a href={`tel:${item.phone}`} style={{display:"flex",alignItems:"center",gap:"0.5rem",color:"#0e7490",textDecoration:"none",fontSize:"0.9rem"}}><Phone size={16}/>{item.phone}</a>}
        </div>}
      </div>
    </div>
  );
}

function CultureMediaDetailPage({slug}:{slug?:string}){
  const [item,setItem]=useState<{id:string;title:string;image_url:string;type:string;media_date:string;link_url:string;description:string}|null>(null);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{
    if(!slug)return;
    supabase.from("culture_media").select("*").eq("id",slug).maybeSingle().then(({data})=>{setItem(data);setLoading(false);});
  },[slug]);
  if(loading)return <div style={{padding:"6rem 1rem",textAlign:"center",color:"#64748b"}}>جاري التحميل...</div>;
  if(!item)return <div style={{padding:"6rem 1rem",textAlign:"center"}}><h2 style={{color:"#dc2626"}}>العنصر غير موجود</h2><a href="/culture" style={{color:"#2563eb"}}>العودة للثقافة</a></div>;
  return(
    <div dir="rtl">
      {item.image_url&&<div className="detail-hero-img" style={{position:"relative"}}><img src={item.image_url} alt={item.title}/>{item.link_url&&<a href={item.link_url} target="_blank" rel="noopener noreferrer" style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,.35)"}}><svg width="72" height="72" viewBox="0 0 72 72" fill="none"><circle cx="36" cy="36" r="36" fill="rgba(255,255,255,.9)"/><polygon points="28,20 56,36 28,52" fill="#0e7490"/></svg></a>}</div>}
      <article className="detail-article page-width">
        <span className="news-cat" style={{background:item.type==="بودكاست"?"#7c3aed":"#0e7490"}}>{item.type}</span>
        <h1>{item.title}</h1>
        {item.media_date&&<small className="detail-date">{item.media_date}</small>}
        {item.description&&<div className="detail-body" dangerouslySetInnerHTML={{__html:item.description.replace(/\n/g,"<br/>")}}/>}
        {item.link_url&&<a href={item.link_url} target="_blank" rel="noopener noreferrer" style={{display:"inline-flex",alignItems:"center",gap:".5rem",marginTop:"1.5rem",padding:".75rem 1.5rem",background:"#0e7490",color:"#fff",borderRadius:".5rem",fontWeight:600,textDecoration:"none"}}>مشاهدة / استماع <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></a>}
        <a href="/culture" className="detail-back" style={{display:"block",marginTop:"2rem"}}>← العودة للثقافة</a>
      </article>
    </div>
  );
}

function CultureEventDetailPage({slug}:{slug?:string}){
  const [item,setItem]=useState<{id:string;title:string;image_url:string;tag:string;event_date:string;location:string;description:string}|null>(null);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{
    if(!slug)return;
    supabase.from("culture_events").select("*").eq("id",slug).maybeSingle().then(({data})=>{setItem(data);setLoading(false);});
  },[slug]);
  if(loading)return <div style={{padding:"6rem 1rem",textAlign:"center",color:"#64748b"}}>جاري التحميل...</div>;
  if(!item)return <div style={{padding:"6rem 1rem",textAlign:"center"}}><h2 style={{color:"#dc2626"}}>الفعالية غير موجودة</h2><a href="/culture" style={{color:"#2563eb"}}>العودة للثقافة</a></div>;
  return(
    <div dir="rtl">
      {item.image_url&&<div className="detail-hero-img"><img src={item.image_url} alt={item.title}/></div>}
      <article className="detail-article page-width">
        <span className="news-cat" style={{background:"#7c3aed"}}>{item.tag||"فعالية ثقافية"}</span>
        <h1>{item.title}</h1>
        <div className="detail-meta">
          {item.event_date&&<span><CalendarDays size={15}/> {item.event_date}</span>}
          {item.location&&<span><MapPin size={15}/> {item.location}</span>}
        </div>
        {item.description&&<div className="detail-body" dangerouslySetInnerHTML={{__html:item.description.replace(/\n/g,"<br/>")}}/>}
        <a href="/culture" className="detail-back">← العودة للثقافة</a>
      </article>
    </div>
  );
}

function CultureNewsDetailPage({slug}:{slug?:string}){
  const [item,setItem]=useState<{id:string;title:string;image_url:string;excerpt:string;body:string;published_at:string|null;created_at:string}|null>(null);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{
    if(!slug)return;
    supabase.from("culture_news").select("*").eq("id",slug).maybeSingle().then(({data})=>{setItem(data);setLoading(false);});
  },[slug]);
  if(loading)return <div style={{padding:"6rem 1rem",textAlign:"center",color:"#64748b"}}>جاري التحميل...</div>;
  if(!item)return <div style={{padding:"6rem 1rem",textAlign:"center"}}><h2 style={{color:"#dc2626"}}>الخبر غير موجود</h2><a href="/culture" style={{color:"#2563eb"}}>العودة للثقافة</a></div>;
  return(
    <div dir="rtl">
      {item.image_url&&<div className="detail-hero-img"><img src={item.image_url} alt={item.title}/></div>}
      <article className="detail-article page-width">
        <span className="news-cat" style={{background:"#0e7490"}}>أخبار ثقافية</span>
        <h1>{item.title}</h1>
        <small className="detail-date">{item.published_at?new Date(item.published_at).toLocaleDateString("ar-EG",{year:"numeric",month:"long",day:"numeric"}):new Date(item.created_at).toLocaleDateString("ar-EG",{year:"numeric",month:"long",day:"numeric"})}</small>
        {item.excerpt&&<p className="detail-excerpt">{item.excerpt}</p>}
        {item.body&&<div className="detail-body" dangerouslySetInnerHTML={{__html:item.body.replace(/\n/g,"<br/>")}}/>}
        <a href="/culture" className="detail-back">← العودة للثقافة</a>
      </article>
    </div>
  );
}

function CultureArtistDetailPage({slug}:{slug?:string}){
  const [item,setItem]=useState<{id:string;name:string;image_url:string;role:string;bio:string}|null>(null);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{
    if(!slug){setLoading(false);return;}
    supabase.from("culture_artists").select("*").eq("slug",slug).maybeSingle().then(({data})=>{setItem(data);setLoading(false);});
  },[slug]);
  if(loading)return(<div style={{minHeight:"60vh",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{textAlign:"center",color:"#64748b"}}><div style={{width:40,height:40,border:"3px solid #0e7490",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 1rem"}}/><p>جاري التحميل...</p></div></div>);
  if(!item)return(<div style={{minHeight:"60vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"1rem"}}><h2 style={{color:"#0f172a"}}>الفنان غير موجود</h2><a href="/culture" style={{background:"#0e7490",color:"#fff",padding:"0.6rem 1.5rem",borderRadius:"0.5rem",textDecoration:"none",fontWeight:600}}>العودة للثقافة</a></div>);
  return(
    <div dir="rtl" style={{background:"#f8fafc",minHeight:"100vh"}}>
      {/* ── Hero full-width ── */}
      <div style={{position:"relative",height:"420px",overflow:"hidden"}}>
        {item.image_url?<img src={item.image_url} alt={item.name} style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"top"}}/>:<div style={{width:"100%",height:"100%",background:"linear-gradient(135deg,#134e4a,#0e7490)"}}/>}
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,0.82) 0%,rgba(0,0,0,0.3) 55%,transparent 100%)"}}/>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",justifyContent:"flex-end",padding:"2.5rem",maxWidth:"1200px",margin:"0 auto",left:0,right:0}}>
          <span style={{display:"inline-block",background:"#0e7490",color:"#fff",padding:"0.3rem 0.9rem",borderRadius:"9999px",fontSize:"0.78rem",fontWeight:700,marginBottom:"0.75rem",width:"fit-content"}}>فنان وثقافة</span>
          <h1 style={{color:"#fff",fontSize:"clamp(1.8rem,4vw,2.6rem)",fontWeight:800,margin:"0 0 0.3rem",textShadow:"0 2px 8px rgba(0,0,0,0.4)"}}>{item.name}</h1>
          <p style={{color:"rgba(255,255,255,0.75)",fontSize:"1.05rem",margin:0}}>{item.role}</p>
        </div>
      </div>
      {/* ── Bio ── */}
      <div style={{maxWidth:"900px",margin:"0 auto",padding:"2.5rem 1.5rem"}}>
        {item.bio&&<div style={{background:"#fff",borderRadius:"1rem",padding:"2rem",boxShadow:"0 1px 6px rgba(0,0,0,0.06)",marginBottom:"1.5rem"}}>
          <h2 style={{fontSize:"1.05rem",fontWeight:700,color:"#0f172a",marginBottom:"1.25rem",paddingBottom:"0.75rem",borderBottom:"2px solid #ecfeff",display:"flex",alignItems:"center",gap:"0.5rem"}}><span style={{color:"#0e7490"}}>◈</span> السيرة الذاتية</h2>
          <div style={{color:"#374151",lineHeight:1.9,fontSize:"0.95rem"}} dangerouslySetInnerHTML={{__html:item.bio.replace(/\n/g,"<br/>")}}/>  
        </div>}
        <a href="/culture" style={{display:"inline-flex",alignItems:"center",gap:"0.5rem",color:"#0e7490",fontWeight:600,textDecoration:"none",fontSize:"0.9rem"}}><ArrowLeft size={16}/> العودة للثقافة</a>
      </div>
    </div>
  );
}

function SocialServiceDetailPage({slug}:{slug?:string}){
  type SvcRow={id:string;title:string;lead:string;icon:string;bullet_1:string;bullet_2:string;bullet_3:string;bullet_4:string;action_label:string;full_description:string;image_url:string;published:boolean};
  const [item,setItem]=useState<SvcRow|null>(null);
  const [loading,setLoading]=useState(true);
  const iconMap2:Record<string,React.ElementType>={HeartHandshake,HandHeart,MessageCircle,UsersRound,Headphones,GraduationCap,BookOpen,UserPlus,Handshake,Eye,Network,ShieldCheck,UserCheck};
  useEffect(()=>{
    if(!slug){setLoading(false);return;}
    supabase.from("social_services").select("*").eq("slug",slug).maybeSingle().then(({data})=>{setItem(data as SvcRow|null);setLoading(false);});
  },[slug]);

  if(loading)return(
    <div style={{minHeight:"60vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{textAlign:"center",color:"#64748b"}}>
        <div style={{width:40,height:40,border:"3px solid #0f766e",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 1rem"}}/>
        <p>جاري التحميل...</p>
      </div>
    </div>
  );
  if(!item)return(
    <div style={{minHeight:"60vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"1rem"}}>
      <h2 style={{color:"#0f172a"}}>الخدمة غير موجودة</h2>
      <a href="/social" style={{background:"#0f766e",color:"#fff",padding:"0.6rem 1.5rem",borderRadius:"0.5rem",textDecoration:"none",fontWeight:600}}>العودة للخدمات الاجتماعية</a>
    </div>
  );

  const Icon=iconMap2[item.icon]||HeartHandshake;
  const bullets=[item.bullet_1,item.bullet_2,item.bullet_3,item.bullet_4].filter(Boolean);
  return(
    <div dir="rtl" style={{background:"#f8fafc",minHeight:"100vh"}}>
      {/* ── Hero ── */}
      <div style={{position:"relative",height:"380px",overflow:"hidden"}}>
        {item.image_url
          ? <img src={item.image_url} alt={item.title} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
          : <div style={{width:"100%",height:"100%",background:"linear-gradient(135deg,#064e3b,#0f766e,#14b8a6)"}}/>
        }
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(6,30,25,0.82) 0%,rgba(6,30,25,0.35) 55%,rgba(6,30,25,0.1) 100%)"}}/>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",justifyContent:"flex-end",padding:"2.5rem",maxWidth:"1200px",margin:"0 auto",left:0,right:0}}>
          <div style={{display:"flex",alignItems:"center",gap:"0.75rem",marginBottom:"0.75rem"}}>
            <span style={{background:"rgba(255,255,255,0.15)",backdropFilter:"blur(8px)",color:"#fff",width:52,height:52,borderRadius:"0.875rem",display:"flex",alignItems:"center",justifyContent:"center",border:"1px solid rgba(255,255,255,0.25)"}}>
              <Icon size={26}/>
            </span>
            <span style={{background:"#0f766e",color:"#fff",padding:"0.3rem 0.9rem",borderRadius:"9999px",fontSize:"0.78rem",fontWeight:700}}>خدمة اجتماعية</span>
          </div>
          <h1 style={{color:"#fff",fontSize:"clamp(1.6rem,4vw,2.2rem)",fontWeight:800,margin:"0 0 0.4rem",textShadow:"0 2px 8px rgba(0,0,0,0.4)"}}>{item.title}</h1>
          <p style={{color:"rgba(255,255,255,0.8)",fontSize:"1rem",maxWidth:"580px",margin:0,lineHeight:1.6}}>{item.lead}</p>
        </div>
      </div>

      {/* ── Main content ── */}
      <div style={{maxWidth:"1200px",margin:"0 auto",padding:"2.5rem 1.5rem",display:"grid",gridTemplateColumns:"1fr 320px",gap:"2rem",alignItems:"start"}} className="soc-svc-grid">
        {/* Left */}
        <div>
          {item.full_description&&(
            <div style={{background:"#fff",borderRadius:"1rem",padding:"2rem",boxShadow:"0 1px 6px rgba(0,0,0,0.06)",marginBottom:"1.5rem"}}>
              <h2 style={{fontSize:"1.05rem",fontWeight:700,color:"#0f172a",marginBottom:"1.25rem",paddingBottom:"0.75rem",borderBottom:"2px solid #f0fdfa",display:"flex",alignItems:"center",gap:"0.5rem"}}>
                <span style={{color:"#0f766e",fontSize:"1.1rem"}}>◈</span> تفاصيل الخدمة
              </h2>
              <div style={{color:"#374151",lineHeight:1.9,fontSize:"0.95rem"}} dangerouslySetInnerHTML={{__html:item.full_description.replace(/\n/g,"<br/>")}}/>
            </div>
          )}
          {!item.full_description&&(
            <div style={{background:"#fff",borderRadius:"1rem",padding:"2rem",boxShadow:"0 1px 6px rgba(0,0,0,0.06)",marginBottom:"1.5rem"}}>
              <p style={{color:"#64748b",lineHeight:1.8,fontSize:"0.95rem"}}>{item.lead}</p>
            </div>
          )}
          {/* Bullets as feature cards */}
          {bullets.length>0&&(
            <div style={{background:"#fff",borderRadius:"1rem",padding:"1.75rem",boxShadow:"0 1px 6px rgba(0,0,0,0.06)",marginBottom:"1.5rem"}}>
              <h3 style={{fontSize:"0.95rem",fontWeight:700,color:"#0f172a",marginBottom:"1.25rem"}}>ما تشمله هذه الخدمة</h3>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:"0.75rem"}}>
                {bullets.map(b=>(
                  <div key={b} style={{display:"flex",alignItems:"center",gap:"0.625rem",padding:"0.75rem 1rem",background:"#f0fdfa",borderRadius:"0.625rem",border:"1px solid #ccfbf1"}}>
                    <span style={{color:"#0f766e",fontWeight:800,fontSize:"1rem",flexShrink:0}}>✓</span>
                    <span style={{fontSize:"0.85rem",fontWeight:600,color:"#0f172a"}}>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <a href="/social" style={{display:"inline-flex",alignItems:"center",gap:"0.5rem",color:"#0f766e",fontWeight:600,textDecoration:"none",fontSize:"0.9rem"}}>
            <ArrowLeft size={16}/> العودة لجميع الخدمات الاجتماعية
          </a>
        </div>

        {/* Right — action card */}
        <div style={{position:"sticky",top:"6rem"}}>
          <div style={{background:"#fff",borderRadius:"1rem",padding:"1.75rem",boxShadow:"0 4px 20px rgba(0,0,0,0.1)",border:"1px solid #e2e8f0"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",width:64,height:64,background:"linear-gradient(135deg,#0f766e,#14b8a6)",borderRadius:"1rem",margin:"0 auto 1.25rem",boxShadow:"0 4px 12px rgba(15,118,110,0.35)"}}>
              <Icon size={32} color="#fff"/>
            </div>
            <h3 style={{textAlign:"center",fontSize:"1rem",fontWeight:700,color:"#0f172a",marginBottom:"0.5rem"}}>{item.title}</h3>
            <p style={{textAlign:"center",fontSize:"0.8rem",color:"#64748b",marginBottom:"1.5rem",lineHeight:1.6}}>{item.lead}</p>
            <div style={{borderTop:"1px solid #f1f5f9",paddingTop:"1.25rem",marginBottom:"1.25rem"}}>
              {bullets.map(b=>(
                <div key={b} style={{display:"flex",alignItems:"center",gap:"0.5rem",marginBottom:"0.5rem"}}>
                  <span style={{color:"#0f766e",fontWeight:700,fontSize:"0.85rem"}}>✓</span>
                  <span style={{fontSize:"0.82rem",color:"#475569"}}>{b}</span>
                </div>
              ))}
            </div>
            <a href="/contact" style={{display:"block",background:"#0f766e",color:"#fff",padding:"0.85rem",borderRadius:"0.625rem",textAlign:"center",fontWeight:700,textDecoration:"none",fontSize:"0.95rem"}}
              onMouseEnter={e=>(e.currentTarget.style.background="#0d6460")}
              onMouseLeave={e=>(e.currentTarget.style.background="#0f766e")}
            >{item.action_label}</a>
            <p style={{fontSize:"0.72rem",color:"#94a3b8",textAlign:"center",marginTop:"0.625rem"}}>تواصل معنا للمزيد من المعلومات</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SocialInitiativeDetailPage({slug}:{slug?:string}){
  type InitRow = {id:string;title:string;image_url:string;text:string;full_description:string;progress:number;amount:string;icon:string;action_label:string;published:boolean};
  const [item,setItem]=useState<InitRow|null>(null);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{
    if(!slug){setLoading(false);return;}
    supabase.from("social_initiatives").select("*").eq("slug",slug).maybeSingle().then(({data})=>{setItem(data as InitRow|null);setLoading(false);});
  },[slug]);

  if(loading)return(
    <div style={{minHeight:"60vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{textAlign:"center",color:"#64748b"}}>
        <div style={{width:40,height:40,border:"3px solid #0f766e",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 1rem"}}/>
        <p>جاري التحميل...</p>
      </div>
    </div>
  );
  if(!item)return(
    <div style={{minHeight:"60vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"1rem"}}>
      <div style={{fontSize:"3rem"}}>🔍</div>
      <h2 style={{color:"#0f172a",fontSize:"1.25rem"}}>المبادرة غير موجودة</h2>
      <a href="/social" style={{background:"#0f766e",color:"#fff",padding:"0.6rem 1.5rem",borderRadius:"0.5rem",textDecoration:"none",fontWeight:600}}>العودة للخدمات الاجتماعية</a>
    </div>
  );

  const progressColor = item.progress >= 75 ? "#15803d" : item.progress >= 40 ? "#0f766e" : "#d97706";
  return(
    <div dir="rtl" style={{background:"#f8fafc",minHeight:"100vh"}}>
      {/* ── Hero ── */}
      <div style={{position:"relative",height:"420px",overflow:"hidden"}}>
        {item.image_url
          ? <img src={item.image_url} alt={item.title} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
          : <div style={{width:"100%",height:"100%",background:"linear-gradient(135deg,#0f766e,#14b8a6)"}}/>
        }
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,0.75) 0%,rgba(0,0,0,0.3) 50%,rgba(0,0,0,0.1) 100%)"}}/>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",justifyContent:"flex-end",padding:"2.5rem",maxWidth:"1200px",margin:"0 auto",left:0,right:0}}>
          <span style={{display:"inline-flex",alignItems:"center",gap:"0.4rem",background:"#0f766e",color:"#fff",padding:"0.3rem 0.9rem",borderRadius:"9999px",fontSize:"0.78rem",fontWeight:700,marginBottom:"0.75rem",width:"fit-content"}}>
            <HeartHandshake size={14}/> مبادرة اجتماعية
          </span>
          <h1 style={{color:"#fff",fontSize:"clamp(1.6rem,4vw,2.4rem)",fontWeight:800,margin:"0 0 0.5rem",textShadow:"0 2px 8px rgba(0,0,0,0.4)"}}>{item.title}</h1>
          <p style={{color:"rgba(255,255,255,0.85)",fontSize:"1rem",maxWidth:"600px",margin:0,lineHeight:1.55}}>{item.text}</p>
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div style={{background:"#0f766e",padding:"0 2rem"}}>
        <div style={{maxWidth:"1200px",margin:"0 auto",display:"flex",gap:0,flexWrap:"wrap"}}>
          {[
            {label:"المبلغ المستهدف",value:item.amount,icon:"💰"},
            {label:"نسبة الإنجاز",value:`${item.progress}%`,icon:"📊"},
            {label:"حالة المبادرة",value:item.progress>=100?"مكتملة":item.progress>0?"جارية":"قيد التخطيط",icon:"✅"},
          ].map((s,i)=>(
            <div key={i} style={{flex:"1 1 200px",padding:"1.25rem 1.5rem",borderRight:"1px solid rgba(255,255,255,0.15)",display:"flex",alignItems:"center",gap:"0.75rem"}}>
              <span style={{fontSize:"1.5rem"}}>{s.icon}</span>
              <div>
                <div style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.7)",marginBottom:"0.15rem"}}>{s.label}</div>
                <div style={{fontSize:"1.1rem",fontWeight:800,color:"#fff"}}>{s.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main content ── */}
      <div style={{maxWidth:"1200px",margin:"0 auto",padding:"2.5rem 1.5rem",display:"grid",gridTemplateColumns:"1fr 340px",gap:"2rem",alignItems:"start"}} className="soc-init-grid">
        {/* Left — description */}
        <div>
          {item.full_description&&(
            <div style={{background:"#fff",borderRadius:"1rem",padding:"2rem",boxShadow:"0 1px 6px rgba(0,0,0,0.06)",marginBottom:"1.5rem"}}>
              <h2 style={{fontSize:"1.1rem",fontWeight:700,color:"#0f172a",marginBottom:"1.25rem",paddingBottom:"0.75rem",borderBottom:"2px solid #f0fdfa",display:"flex",alignItems:"center",gap:"0.5rem"}}>
                <span style={{color:"#0f766e"}}>◈</span> تفاصيل المبادرة
              </h2>
              <div style={{color:"#374151",lineHeight:1.85,fontSize:"0.95rem"}} dangerouslySetInnerHTML={{__html:item.full_description.replace(/\n/g,"<br/>")}}/>
            </div>
          )}
          {!item.full_description&&item.text&&(
            <div style={{background:"#fff",borderRadius:"1rem",padding:"2rem",boxShadow:"0 1px 6px rgba(0,0,0,0.06)",marginBottom:"1.5rem"}}>
              <div style={{color:"#374151",lineHeight:1.85,fontSize:"0.95rem"}} dangerouslySetInnerHTML={{__html:item.text.replace(/\n/g,"<br/>")}}/>
            </div>
          )}
          <a href="/social" style={{display:"inline-flex",alignItems:"center",gap:"0.5rem",color:"#0f766e",fontWeight:600,textDecoration:"none",fontSize:"0.9rem"}}>
            <ArrowLeft size={16}/> العودة لجميع الخدمات الاجتماعية
          </a>
        </div>

        {/* Right — progress card */}
        <div style={{position:"sticky",top:"6rem"}}>
          <div style={{background:"#fff",borderRadius:"1rem",padding:"1.75rem",boxShadow:"0 4px 20px rgba(0,0,0,0.1)",border:"1px solid #e2e8f0"}}>
            <h3 style={{fontSize:"1rem",fontWeight:700,color:"#0f172a",marginBottom:"1.25rem"}}>حالة جمع التبرعات</h3>

            {/* Progress circle */}
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",marginBottom:"1.5rem"}}>
              <svg width="120" height="120" viewBox="0 0 120 120" style={{marginBottom:"0.75rem"}}>
                <circle cx="60" cy="60" r="52" fill="none" stroke="#f0fdfa" strokeWidth="12"/>
                <circle cx="60" cy="60" r="52" fill="none" stroke={progressColor} strokeWidth="12"
                  strokeDasharray={`${2*Math.PI*52}`}
                  strokeDashoffset={`${2*Math.PI*52*(1-item.progress/100)}`}
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                  style={{transition:"stroke-dashoffset 0.8s ease"}}
                />
                <text x="60" y="56" textAnchor="middle" fill={progressColor} fontSize="22" fontWeight="800" fontFamily="Cairo,sans-serif">{item.progress}%</text>
                <text x="60" y="72" textAnchor="middle" fill="#94a3b8" fontSize="11" fontFamily="Cairo,sans-serif">مكتمل</text>
              </svg>
              <div style={{fontSize:"0.8rem",color:"#64748b",textAlign:"center"}}>تم جمع {item.progress}% من المبلغ المستهدف</div>
            </div>

            <div style={{background:"#f8fafc",borderRadius:"0.625rem",padding:"1rem",marginBottom:"1.25rem",textAlign:"center"}}>
              <div style={{fontSize:"0.72rem",color:"#64748b",marginBottom:"0.25rem"}}>المبلغ المستهدف</div>
              <div style={{fontSize:"1.5rem",fontWeight:800,color:"#0f766e"}}>{item.amount}</div>
            </div>

            <a href="/contact" style={{display:"block",background:"#0f766e",color:"#fff",padding:"0.85rem",borderRadius:"0.625rem",textAlign:"center",fontWeight:700,textDecoration:"none",fontSize:"0.95rem",transition:"background 0.2s"}}
              onMouseEnter={e=>(e.currentTarget.style.background="#0d6460")}
              onMouseLeave={e=>(e.currentTarget.style.background="#0f766e")}
            >{item.action_label}</a>
            <p style={{fontSize:"0.72rem",color:"#94a3b8",textAlign:"center",marginTop:"0.625rem"}}>يمكنك التواصل معنا لمزيد من المعلومات</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CultureInitiativeDetailPage({slug}:{slug?:string}){
  const [item,setItem]=useState<{id:string;title:string;image_url:string;text:string}|null>(null);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{
    if(!slug)return;
    supabase.from("culture_initiatives").select("*").eq("slug",slug).maybeSingle().then(({data})=>{setItem(data);setLoading(false);});
  },[slug]);
  if(loading)return <div style={{padding:"6rem 1rem",textAlign:"center",color:"#64748b"}}>جاري التحميل...</div>;
  if(!item)return <div style={{padding:"6rem 1rem",textAlign:"center"}}><h2 style={{color:"#dc2626"}}>المبادرة غير موجودة</h2><a href="/culture" style={{color:"#2563eb"}}>العودة للثقافة</a></div>;
  return(
    <div dir="rtl">
      {item.image_url&&<div className="detail-hero-img"><img src={item.image_url} alt={item.title}/></div>}
      <article className="detail-article page-width">
        <span className="news-cat" style={{background:"#15803d"}}>مبادرة ثقافية</span>
        <h1>{item.title}</h1>
        {item.text&&<div className="detail-body" dangerouslySetInnerHTML={{__html:item.text.replace(/\n/g,"<br/>")}}/>}
        <a href="/culture" className="detail-back">← العودة للثقافة</a>
      </article>
    </div>
  );
}

export default function NileSite({page,slug}:{page:string;slug?:string}){const active=routeMap[page]||"home";useSeo(active);const hideHeader=["membership","photo","payment","success"].includes(active);const hideFooter=["membership","photo","payment","success"].includes(active);return <div dir="rtl"><Motion/>{!hideHeader&&<Header active={active}/>}<main>{active==="home"?<Home/>:active==="about"?<AboutPage/>:active==="social"?<SocialPage/>:active==="education"?<EducationPage/>:active==="health"?<HealthPage/>:active==="investment"?<InvestmentPage/>:active==="inv-sector"?<InvestmentSectorDetailPage slug={slug}/>:active==="inv-opportunity"?<InvestmentOpportunityDetailPage slug={slug}/>:active==="culture"?<CulturePage/>:active==="social-initiative-detail"?<SocialInitiativeDetailPage slug={slug}/>:active==="social-service-detail"?<SocialServiceDetailPage slug={slug}/>:active==="culture-art-detail"?<CultureArtDetailPage slug={slug}/>:
active==="culture-association-detail"?<CultureAssociationDetailPage slug={slug}/>:
active==="culture-media-detail"?<CultureMediaDetailPage slug={slug}/>:active==="culture-event-detail"?<CultureEventDetailPage slug={slug}/>:active==="culture-news-detail"?<CultureNewsDetailPage slug={slug}/>:active==="culture-artist-detail"?<CultureArtistDetailPage slug={slug}/>:active==="culture-initiative-detail"?<CultureInitiativeDetailPage slug={slug}/>:["services","initiatives","library"].includes(active)?<InternalPage type={active as InternalKey}/>:active==="news"?<NewsListPage/>:active==="news-detail"?<NewsDetailPage slug={slug}/>:active==="events"?<EventsListPage/>:active==="events-detail"?<EventDetailPage slug={slug}/>:active==="membership"?<Membership/>:active==="register"?<Register/>:active==="photo"?<PhotoUpload/>:active==="payment"?<Payment/>:active==="success"?<Success/>:active==="contact"?<Contact/>:<Home/>}</main>{!hideFooter&&<Footer/>}</div>}
