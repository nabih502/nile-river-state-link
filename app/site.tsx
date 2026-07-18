"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import {
  Aperture, ArrowLeft, Award, BadgeCheck, BadgePercent, Banknote,
  BookOpen, BriefcaseBusiness, Building2, Camera, ChartNoAxesCombined,
  Check, ChevronLeft, CircleAlert, CircleCheckBig, Clock3, CreditCard, Crown,
  Factory, FileImage, FileUp, Gem, Gift, Globe2, GraduationCap,
  HandHeart, Handshake, HeartHandshake, HeartPulse,
  Landmark, LayoutGrid, Menu, Megaphone, MonitorCheck, Network,
  LockKeyhole, Mail, MapPin, Percent, Phone, QrCode, ReceiptText,
  ScanFace, Search, Settings2, Share2, Shield, ShieldCheck,
  ShoppingCart, Sparkles, Sprout, Store, Tags, TrendingUp, Truck,
  Upload, UserCheck, UserRound, UsersRound, Video, WalletCards, X,
} from "lucide-react";

type PageKey = "home" | "social" | "education" | "health" | "investment" | "culture" | "membership" | "register" | "photo" | "payment" | "success" | "contact";
type PortalKey = "social" | "education" | "health" | "investment" | "culture";

const routeMap: Record<string, PageKey> = {
  home:"home", social:"social", education:"education", health:"health", investment:"investment", culture:"culture",
  membership:"membership", register:"register", photo:"photo", payment:"payment", success:"success", contact:"contact",
};

const nav = [["/","الرئيسية"],["/membership","عن الرابطة"],["/social","الخدمات"],["/investment","المبادرات"],["/culture","الثقافة"],["/education","التعليم"],["/contact","تواصل معنا"]];
const homeNav = [["/","الرئيسية"],["/membership","عن الرابطة"],["/education","التعليم"],["/social","الاجتماعية"],["/culture","الثقافية"],["#market","السوق السوداني"],["/investment","الاستثمار"],["#news","الأخبار والفعاليات"],["/contact","تواصل معنا"]];

const info: Record<PortalKey, {title:string; accent:string; lead:string; hero:string; icon:string; tabs:string[]; stats:[string,string][]; cards:{title:string;text:string;image?:string;icon:string}[]; section:string}> = {
  social:{title:"الخدمات الاجتماعية",accent:"معاً.. نرعى ونساند",lead:"نقدم برامج ومبادرات اجتماعية وإنسانية تهدف إلى دعم أبناء مجتمعنا في مختلف الظروف، لبناء مجتمع متماسك ومتكافل.",hero:"/assets/social-hero-hq.webp",icon:"♡",tabs:["حالات إنسانية","تواصل مباشر","استشارة اجتماعية","برامج ومبادرات","دعم المحتاجين"],stats:[["12,680+","مستفيد من خدماتنا"],["3,250+","أسرة مستفيدة"],["1,850+","حالة إنسانية"],["650+","فرصة دعم"]],section:"مبادراتنا الحالية",cards:[{title:"صندوق العلاج",text:"مساعدة المرضى في تغطية تكاليف العلاج والأدوية",image:"/assets/social-medical-hq.webp",icon:"✚"},{title:"مشروع ترميم المنازل",text:"ترميم المنازل المتضررة وتحسين بيئة السكن",image:"/assets/social-renovation-hq.webp",icon:"⌂"},{title:"دعم التعليم",text:"دعم الرسوم والاحتياجات التعليمية لأبناء الأسر",image:"/assets/social-education-hq.webp",icon:"✦"},{title:"سلة الخير الرمضانية",text:"توزيع سلات غذائية على الأسر المحتاجة",image:"/assets/social-basket-hq.webp",icon:"♡"}]},
  education:{title:"التعليم",accent:"استثمار في المستقبل",lead:"نقدم بيئة تعليمية رقمية متكاملة تدعم الطلاب والمعلمين، وتوفر محتوى تعليمياً متطوراً لتلبية احتياجات التعليم في مكان وزمان يناسب الجميع.",hero:"/assets/education-hero-hq.webp",icon:"▣",tabs:["مدرسة نهر النيل الإلكترونية","الدورات وكورسات التقوية","المنح الدراسية","المكتبة الرقمية","الاختبارات والامتحانات","النتائج والتقارير","الاستشارات التعليمية","الأخبار والفعاليات التعليمية"],stats:[["12,680","طالب وطالبة"],["65","معلماً ومعلمة"],["156","مادة افتراضية"],["420","دورة تدريبية"]],section:"الدورات وكورسات التقوية",cards:[{title:"إدارة المشاريع",text:"دورة عملية لتطوير المهارات الإدارية",image:"/assets/course-project-hq.webp",icon:"◫"},{title:"اللغة الإنجليزية",text:"مسار متدرج لجميع المستويات",image:"/assets/course-english-hq.webp",icon:"A"},{title:"تصميم الجرافيك",text:"أساسيات التصميم للمهتمين",image:"/assets/course-design-hq.webp",icon:"✎"},{title:"أساسيات البرمجة للمبتدئين",text:"مدخل عملي للعالم الرقمي",image:"/assets/course-code-hq.webp",icon:"⌘"}]},
  health:{title:"الصحة",accent:"معاً من أجل صحة أفضل",lead:"خدمات صحية متكاملة لأبناء ولاية نهر النيل في الداخل والخارج، برعاية رابطة الولاية الرقمية.",hero:"/assets/health-hero-hq.webp",icon:"✚",tabs:["الاستشارات الطبية","العيادة الإلكترونية","التأمين الطبي","الصيدلية الخيرية","طلب المساعدة والتواصل مع الرابطة"],stats:[["24/7","خدمة مستمرة"],["40+","طبيب معتمد"],["12","تخصصاً طبياً"],["98%","رضا المستفيدين"]],section:"خدماتنا الصحية",cards:[{title:"الاستشارات الطبية",text:"استشارات مع نخبة من الأطباء في مختلف التخصصات",image:"/assets/health-consult-hq.webp",icon:"☏"},{title:"العيادة الإلكترونية",text:"استشر الطبيب المناسب عبر الإنترنت من أي مكان",image:"/assets/health-clinic-hq.webp",icon:"▣"},{title:"التأمين الطبي",text:"باقات تأمين ميسرة لأعضاء الرابطة وأسرهم",image:"/assets/health-insurance-hq.webp",icon:"♢"},{title:"الصيدلية الخيرية",text:"توفير الأدوية للمحتاجين بأسعار رمزية",image:"/assets/health-pharmacy-hq.webp",icon:"✚"}]},
  investment:{title:"الاستثمار في ولاية نهر النيل",accent:"فرص واعدة.. مستقبل مستدام",lead:"بيئة استثمارية جاذبة بموارد طبيعية غنية وموقع استراتيجي يدعم التنمية ويحقق عوائد مجزية للمستثمرين.",hero:"/assets/investment-hero-hq.webp",icon:"↗",tabs:["فرص الاستثمار","القطاعات الاستثمارية","الحوافز والتسهيلات","دليل المستثمر","قصص نجاح"],stats:[["2.9 مليون+","هكتار زراعي"],["500 ألف","هكتار مروي"],["11+","مجمعات صناعية"],["850 كم","من نهر النيل"]],section:"القطاعات الاستثمارية",cards:[{title:"السياحة والضيافة",text:"مواقع أثرية وطبيعية وفنادق ومنتجعات",image:"/assets/invest-tourism-hq.webp",icon:"⌁"},{title:"التعدين والمحاجر",text:"ذهب ومعادن ومحاجر متنوعة",image:"/assets/invest-mining-hq.webp",icon:"◆"},{title:"الصناعة التحويلية",text:"مواد غذائية وصناعات هندسية",image:"/assets/invest-industry-hq.webp",icon:"▦"},{title:"الثروة الحيوانية",text:"ثروة حيوانية ومشروعات متكاملة",image:"/assets/invest-livestock-hq.webp",icon:"♧"}]},
  culture:{title:"الثقافة",accent:"هوية وإبداع.. نصون تراثنا ونبدع لمستقبلنا",lead:"منصة ثقافية رقمية شاملة تهدف إلى إبراز التراث السوداني الأصيل ودعم المواهب والإبداع في جميع المجالات الثقافية والفنية.",hero:"/assets/culture-hero-hq.webp",icon:"◈",tabs:["الفعاليات والأنشطة","الأخبار الثقافية","المكتبة الرقمية","الفنون والأدب","التراث والتاريخ"],stats:[["35","فرقة وجمعية"],["650+","عضو فني"],["120","مبادرة ثقافية"],["85","فعالية ثقافية"]],section:"الفعاليات والأنشطة الثقافية",cards:[{title:"ندوة دور الثقافة",text:"ندوة حول الثقافة في بناء المجتمع",image:"/assets/culture-seminar-hq.webp",icon:"♙"},{title:"معرض الفنون",text:"معرض الفنون التشكيلية السنوي",image:"/assets/culture-gallery-hq.webp",icon:"▥"},{title:"أمسية شعرية",text:"أمسية للشعراء والشباب",image:"/assets/culture-poetry-hq.webp",icon:"♩"},{title:"مهرجان تراث النيل",text:"مهرجان تراثي يحتفي بالهوية",image:"/assets/culture-folk-hq.webp",icon:"◈"}]},
};

function Brand({light=false}:{light?:boolean}){return <a href="/" className={`brand ${light?"light":""}`} aria-label="رابطة ولاية نهر النيل الرقمية"><img src={light?"/assets/home-logo-dark.jpg":"/assets/logo.jpeg"} alt="رابطة ولاية نهر النيل الرقمية"/></a>}

function Header({active}:{active:PageKey}){
  const [open,setOpen]=useState(false);
  const dark=active==="home"||active==="register";
  const links=active==="home"?homeNav:nav;
  return <header className={`topbar ${dark?"dark":""} ${active==="home"?"home-topbar":""}`}><div className="topbar-inner"><Brand light={dark}/><nav className={open?"open":""}>{links.map(([href,label])=><a key={`${href}-${label}`} href={href} className={(href==="/"&&active==="home")||href.includes(active)?"current":""}>{label}</a>)}</nav><div className="header-tools"><button className="search-btn" aria-label="البحث"><Search size={19}/></button><a className="primary compact" href="/membership"><UserRound size={16}/><span>تسجيل الدخول</span></a><button className="mobile-menu" onClick={()=>setOpen(!open)} aria-label="فتح القائمة">{open?<X size={21}/>:<Menu size={21}/>}</button></div></div></header>
}

function Footer(){return <footer className="site-footer"><div className="footer-inner"><div className="footer-brand"><Brand light/><p>منصة رقمية شاملة لخدمة أبناء ولاية نهر النيل في الداخل والخارج.</p></div><div><h4>تواصل معنا</h4><p>☎ +249 912 345 678</p><p>✉ info@nilenile.org</p><p>⌖ ولاية نهر النيل - السودان</p></div><div><h4>الدعم والمساعدة</h4><a href="/contact">الأسئلة الشائعة</a><a href="/contact">سياسة الخصوصية</a><a href="/contact">الشروط والأحكام</a></div><div><h4>خدمات الرابطة</h4><a href="/education">التعليم</a><a href="/health">الصحة</a><a href="/investment">الاستثمار</a><a href="/culture">الثقافة</a></div><div><h4>روابط سريعة</h4><a href="/">الرئيسية</a><a href="/membership">عن الرابطة</a><a href="/contact">تواصل معنا</a></div></div><div className="footer-bottom"><span>جميع الحقوق محفوظة © 2026</span><span className="socials"><b>f</b><b>𝕏</b><b>▶</b><b>◎</b><b>in</b></span></div></footer>}

function Motion(){useEffect(()=>{const obs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add("in")}),{threshold:.08});document.querySelectorAll(".motion").forEach(el=>obs.observe(el));return()=>obs.disconnect()},[]);return null}
function SectionTitle({children,mini}:{children:React.ReactNode;mini?:string}){return <div className="section-heading motion">{mini&&<span>{mini}</span>}<h2>{children}</h2></div>}
function Arrow(){return <ArrowLeft size={15} aria-hidden/>}

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
    {title:"السوق السوداني الإلكتروني",icon:ShoppingCart,items:["المنتجات","الخدمات","الوظائف","الشركات"],href:"#market",tone:"purple",button:"الدخول للسوق"},
    {title:"الخدمات الاجتماعية",icon:HandHeart,items:["طلب المساعدة","التكافل الاجتماعي","دعم المرضى","رعاية الأيتام والأرامل"],href:"/social",tone:"green",button:"الدخول للخدمة"},
  ];
  const news=[
    {title:"مشروع التنمية المستدامة",date:"02 مايو",image:"/assets/investment-hero-hq.webp",text:"مشروع رائد للتنمية المستدامة في الولاية"},
    {title:"دورات تدريبية متخصصة",date:"10 مايو",image:"/assets/course-project-hq.webp",text:"دورات للشباب في مجالات متعددة داخل الولاية"},
    {title:"مبادرة دعم المدارس",date:"18 مايو",image:"/assets/social-education-hq.webp",text:"مبادرة لدعم وتطوير المدارس وبيئة التعليم"},
    {title:"ملتقى شباب نهر النيل 2025",date:"25 مايو",image:"/assets/culture-seminar-hq.webp",text:"ملتقى شبابي يجمع أبناء الولاية للحوار وتبادل الخبرات"},
  ];
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
          <a className="home-outline" href="#services">تعرّف على خدماتنا <LayoutGrid/></a>
        </div>
      </div>
      <div className="home-hero-stage motion">
        <img src="/assets/home-hero-reference-v2.webp" alt="نهر النيل والجسور في ولاية نهر النيل"/>
        <div className="home-image-fade" aria-hidden/>
        <aside className="home-benefit-panel">
          {heroBenefits.map(item=>{const Icon=item.icon;return <div key={item.title}><Icon/><span><b>{item.title}</b><small>{item.text}</small></span></div>})}
        </aside>
      </div>
    </section>

    <section className="home-metrics page-width motion">
      {metrics.map(item=>{const Icon=item.icon;return <div key={item.label}><Icon/><span><b>{item.number}</b><small>{item.label}</small></span></div>})}
    </section>

    <section className="home-join page-width motion">
      <div className="home-member-card">
        <img src="/assets/home-logo-dark.jpg" alt="رابطة ولاية نهر النيل الرقمية"/>
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
          <a href={service.href}>{service.button}<ArrowLeft/></a>
        </article>})}
      </div>
    </section>

    <section className="home-investment page-width motion">
      <img className="investment-bg" src="/assets/home-investment-banner-v2.webp" alt="القطاع الصناعي والزراعة في ولاية نهر النيل"/>
      <div className="investment-center">
        <h2>الاستثمار في ولاية نهر النيل</h2>
        <p>فرص استثمارية واعدة في القطاعات الصناعية والزراعية والسكنية</p>
        <div>
          <b><Building2/><small>سكني</small></b>
          <b><Sprout/><small>زراعي</small></b>
          <b><Sprout/><small>زراعي</small></b>
          <b><Factory/><small>صناعي</small></b>
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
          <a href="/education">الدخول إلى المعهد <ArrowLeft/></a>
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
      <a href="#"><ShoppingCart/> تصفح السوق الآن</a>
    </section>

    <section id="news" className="home-news page-width">
      <div className="home-section-title motion"><span/><h2>آخر الأخبار والمبادرات</h2><span/></div>
      <div className="home-news-grid">
        {news.map(item=><article className="home-news-card motion" key={item.title}>
          <div className="news-date"><b>{item.date.split(" ")[0]}</b><small>{item.date.split(" ")[1]}</small></div>
          <h3>{item.title}</h3>
          <p>{item.text}</p>
          <img src={item.image} alt={item.title}/>
          <a href="/culture">اقرأ المزيد <ArrowLeft/></a>
        </article>)}
      </div>
      <a className="all-news-link" href="/culture">عرض المزيد من الأخبار والفعاليات</a>
    </section>
  </div>
}

function PortalHero({type}:{type:PortalKey}){const p=info[type];return <><section className={`portal-hero portal-${type}`}><div className="portal-copy motion"><h1>{p.title}</h1><h2>{p.accent}</h2><p>{p.lead}</p></div><div className="portal-image motion"><img src={p.hero} alt={p.title}/></div>{["education","investment","culture"].includes(type)&&<aside className="portal-side motion"><h3>{p.icon}&nbsp; خدمات {p.title}</h3>{p.tabs.map((t,i)=><a key={t} className={i===0?"selected":""} href="#services">{t}<span>⌃</span></a>)}</aside>}</section><section className="portal-features motion">{(type==="health"?["في خدمتكم أينما كنتم","متاحة إلكترونياً","خدمة سريعة","موثوقة وآمنة"]:type==="social"?["حالات إنسانية","تواصل مباشر","استشارة اجتماعية","برامج ومبادرات","دعم المحتاجين"]:["جودة وتميز","دعم شامل","محتوى متخصص","تعلّم مرن"]).map((x,i)=><div key={x}><i>{["◎","▣","◷","♢","♡"][i]}</i><b>{x}</b><span>خدمة رقمية متكاملة</span></div>)}</section></>}

function PortalPage({type}:{type:PortalKey}){const p=info[type];return <><PortalHero type={type}/><section className="stat-ribbon page-width motion">{p.stats.map(([n,l],i)=><div key={l}><i>{["♧","⌂","▦","↗"][i]}</i><b>{n}</b><span>{l}</span></div>)}</section><section id="services" className="section page-width"><SectionTitle mini="خدمات متكاملة بين يديك">{p.section}</SectionTitle><div className={`visual-card-grid ${type==="health"?"three-primary":""}`}>{p.cards.map((c,i)=><article className={`visual-card motion ${i===3&&type==="health"?"wide-health":""}`} key={c.title}><img src={c.image} alt={c.title}/><div><i>{c.icon}</i><h3>{c.title}</h3><p>{c.text}</p><ul><li>خدمة سهلة وسريعة</li><li>متابعة ودعم مستمر</li><li>خصوصية وأمان</li></ul><a href="/contact" className="card-action">{type==="social"?"ساهم الآن":"معرفة المزيد"} <Arrow/></a></div></article>)}</div></section>{type==="education"&&<EducationExtras/>}{type==="investment"&&<InvestmentExtras/>}{type==="culture"&&<CultureExtras/>}{type==="social"&&<SocialExtras/>}{type==="health"&&<HealthExtras/>}<SupportBar/></>}

function EducationExtras(){return <><section className="library-band page-width motion"><div><span>المكتبة الرقمية</span><h2>مصادر تعليمية موثوقة ومتنوعة</h2><div className="library-items"><b>▥ 2,500+ كتاب</b><b>▣ 1,200+ بحث ومقال</b><b>▶ 800+ فيديو</b><b>▤ 3,000+ ملف</b></div></div><img src="/assets/education-hero-hq.webp" alt="المكتبة الرقمية"/></section><section className="compact-panels page-width"><article><h3>الأخبار التعليمية</h3>{["إطلاق منصة مدرسة نهر النيل","بدء التسجيل في المنح","نتائج الاختبارات الفصلية"].map(x=><p key={x}>◫ {x}<small>مايو 2025</small></p>)}</article><article><h3>الفعاليات القادمة</h3>{["ورشة مهارات المستقبل","ندوة التعليم الرقمي","ملتقى الطلاب والمعلمين"].map(x=><p key={x}>◷ {x}<small>قريباً</small></p>)}</article></section></>}
function InvestmentExtras(){return <><section className="solar-banner page-width motion"><img src="/assets/investment-solar-hq.webp" alt="الطاقة الشمسية"/><div><h2>استثمر في الطاقة الشمسية</h2><p>مشروع محطة طاقة شمسية بقدرة 50 ميجاوات</p><a className="primary" href="/contact">اعرف المزيد</a></div></section><section className="compact-panels page-width"><article><h3>مزايا المستثمر</h3><div className="icon-row"><b>شبكة بنية تحتية</b><b>إجراءات ميسرة</b><b>دعم فني وإداري</b><b>تسويق مضمون</b></div></article><article><h3>قصة نجاح</h3><img className="mini-story" src="/assets/invest-industry-hq.webp" alt="مشروع استثماري ناجح"/><p>مشروع دواجن الدامر.. من فكرة صغيرة إلى قصة نجاح كبيرة.</p></article></section></>}
function CultureExtras(){return <><section className="compact-panels page-width"><article><h3>المكتبة الرقمية</h3><div className="culture-library"><img src="/assets/culture-hero-hq.webp" alt="كتب وتراث"/><div><h2>آلاف الكتب والمراجع الثقافية</h2><p>كتب التراث السوداني، الدراسات والبحوث، المجلات الثقافية والكتب المصورة.</p><a className="primary" href="#">استكشف المكتبة</a></div></div></article><article><h3>المسابقات والجوائز</h3>{["مسابقة الشعر السنوية","جائزة الإبداع الفني","جائزة التصوير الضوئي"].map(x=><p key={x}>♕ {x}<small>مايو 2025</small></p>)}</article></section><section className="compact-panels page-width"><article><h3>الفرق والجمعيات الثقافية</h3><div className="icon-row"><b>جمعية الخط العربي</b><b>جمعية المسرح</b><b>نادي الأدب</b><b>فرقة نهر النيل</b></div></article><article><h3>شارك محتواك الثقافي</h3><p>لديك موهبة أو محتوى ثقافي؟ شاركه مع مجتمعنا.</p><a className="primary" href="/contact">أرسل محتواك</a></article></section></>}
function SocialExtras(){return <section className="social-counts page-width motion">{[["120+","متطوع نشط"],["320+","طالب مستفيد"],["650+","فرصة دعم"],["1,850+","حالة إنسانية"],["3,250+","أسرة مستفيدة"],["12,680+","مستفيد"]].map(([n,l])=><div key={l}><i>♧</i><b>{n}</b><span>{l}</span></div>)}</section>}
function HealthExtras(){return <><section className="health-help page-width motion"><div><h2>طلب المساعدة والتواصل مع الرابطة</h2><p>نحن معك في الحالات الصحية والإنسانية</p></div><div className="health-actions"><b>♡ رفع حالة لطلب طبي</b><b>♧ طلب مساعدة صحية عاجلة</b><b>☏ التواصل المباشر</b><b>▤ متابعة حالة</b></div><a className="primary" href="/contact">إرسال طلب المساعدة</a></section><section className="health-tips page-width"><SectionTitle>نصائح صحية</SectionTitle><div>{["متابعة دورية لحالتك المرضية","تغذية متوازنة لجسم أكثر صحة","المشي 30 دقيقة يومياً","اشرب الماء لصحة أفضل"].map((x,i)=><b className="motion" key={x}><i>{["♡","♧","♟","◉"][i]}</i>{x}</b>)}</div></section></>}
function SupportBar(){return <section className="support-bar page-width motion"><i>☏</i><div><h2>نحن هنا لمساعدتك</h2><p>فريق الدعم جاهز للرد على استفسارك وتقديم المساعدة.</p></div><div><b>واتساب</b><span>+249 912 345 678</span></div><div><b>البريد الإلكتروني</b><span>info@nilenile.org</span></div><a className="outline light" href="/contact">تواصل معنا <Arrow/></a></section>}

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
      <div className="mp-brand"><img src="/assets/membership-logo-v2.jpg" alt="رابطة ولاية نهر النيل الرقمية"/></div>
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

function Register(){
  const onSubmit=(event:FormEvent)=>{event.preventDefault();location.href="/photo"};
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
  const interests=[{icon:GraduationCap,label:"التعليم"},{icon:MonitorCheck,label:"المباشر"},{icon:TrendingUp,label:"ريادة الأعمال"},{icon:UsersRound,label:"المرأة"},{icon:ChartNoAxesCombined,label:"الاستثمار"},{icon:Landmark,label:"الثقافة"},{icon:Handshake,label:"الاستشارات"},{icon:HandHeart,label:"اليوم العام"},{icon:Sparkles,label:"أخرى"}];
  const regBenefits=[{icon:ShieldCheck,text:"هوية رقمية موثوقة"},{icon:Gift,text:"خدمات ومبادرات حصرية"},{icon:UsersRound,text:"تواصل فعال وبناء العلاقات"},{icon:GraduationCap,text:"فرص تعليم وتدريب"},{icon:Handshake,text:"دعم ورعاية المشاريع"},{icon:UserCheck,text:"المشاركة في صنع القرار"},{icon:LockKeyhole,text:"حماية خصوصيتك وبياناتك"}];
  return <div className="register-page">
    <section className="reg-hero">
      <div className="reg-visual"><img src="/assets/membership-register-hero-v2.webp" alt="أبناء السودان حول العالم"/></div>
      <div className="reg-copy motion"><h1>سجل عضويتك</h1><h2>في رابطة ولاية نهر النيل الإلكترونية</h2><h3>انضم إلى أكبر قاعدة بيانات موثوقة لأبناء ولاية نهر النيل</h3><p>عضويتك في رابطة ولاية نهر النيل الإلكترونية تمنحك هوية رقمية موثوقة، وتفتح لك أبواب الخدمات والمبادرات والفرص داخل الولاية وخارجها.</p><div className="reg-stats"><b><UsersRound/><span>12,850+<small>أعضاء مسجلون</small></span></b><b><Globe2/><span>48+<small>دول العالم</small></span></b><b><MapPin/><span>320+<small>مدن</small></span></b></div></div>
      <aside className="reg-benefits motion"><h3>مميزات العضوية</h3>{regBenefits.map(item=>{const Icon=item.icon;return <p key={item.text}><Icon/>{item.text}</p>})}</aside>
    </section>
    <section className="reg-form-shell"><header><h2>نموذج تسجيل العضوية</h2><p>يرجى تعبئة البيانات التالية بدقة لاستكمال إجراءات تسجيل العضوية</p></header><form className="reg-form" onSubmit={onSubmit}>
      {groups.map(group=>{const Icon=group.icon;return <fieldset key={group.title}><legend><Icon/>{group.title}</legend>{group.fields.map(field=><MemberField key={field.label} field={field}/>)}</fieldset>})}
      <fieldset className="reg-interests"><legend>الاهتمامات</legend><p>اختر المجالات التي تهتم بها للمشاركة في المبادرات والأنشطة</p><div>{interests.map(item=>{const Icon=item.icon;return <label key={item.label}><input type="checkbox"/><Icon/><b>{item.label}</b></label>})}</div></fieldset>
      <label className="reg-privacy"><Shield/><span><b>سياسة الخصوصية</b><small>أتعهد بصحة جميع البيانات المدخلة، وأوافق على استخدامها وفق شروط وأحكام وسياسة الخصوصية للرابطة.</small></span><input required type="checkbox" aria-label="الموافقة على سياسة الخصوصية"/></label>
      <button className="reg-hidden-submit" aria-label="إكمال التسجيل">إكمال التسجيل</button>
    </form></section>
    <section className="reg-join-banner"><div><h2>كن جزءاً من التغيير .. <span>انضم اليوم!</span></h2><p>عضويتك تساهم في بناء مجتمع رقمي قوي ومتكامل يخدم أبناء الولاية أينما كانوا</p><div><b><UsersRound/>تواصل فعال</b><b><MapPin/>فرص أكثر</b><b><Gift/>امتيازات أعمق</b></div></div><button onClick={()=>{location.href="/photo"}}>سجل الآن <ArrowLeft/></button><MemberCardArt compact/></section>
    <section className="reg-dashboard"><h2><span/>لوحة الإحصائيات والتقارير<span/></h2><div className="reg-dash-grid"><article className="reg-bars"><h3>توزيع الأعضاء حسب الولايات</h3>{[["الخرطوم","22%"],["نهر النيل","18%"],["القاهرة","15%"],["كسلا","12%"],["أخرى","23%"]].map(([name,value],i)=><p key={name}><b style={{width:value}}/><span>{name}</span><small>{value}</small><i data-tone={i}/></p>)}</article><article><h3>توزيع الأعضاء حسب الجنس</h3><div className="donut purple"/><p>ذكور 62% &nbsp; إناث 38%</p></article><article className="reg-total"><h3>إجمالي الأعضاء</h3><strong>12,850</strong><b>مدن <em>320</em></b><b>دول <em>48</em></b><small>+245 عضو هذا الشهر</small></article><article><h3>توزيع الأعضاء حسب الفئة العمرية</h3><div className="donut multi"/><p>أقل من 20 حتى 60 فأكثر</p></article><article className="reg-map"><h3>توزيع الأعضاء حسب الدول</h3><Globe2/><a href="#">عرض الخريطة التفاعلية</a></article></div></section>
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
  return <MemberStepShell className="payment-step"><div className="payment-brand"><img src="/assets/membership-logo-v2.jpg" alt="رابطة ولاية نهر النيل الرقمية"/></div><header className="step-heading payment-title"><h1><span/>خيارات السداد<span/></h1><p>اختر طريقة السداد المناسبة لك وارفع المستندات المطلوبة</p></header><section className="payment-cards">
    {options.map(option=>{const Icon=option.icon;return <article key={option.n}><label><FileUp/><strong>{receipts[option.n]||"اختر ملف أو اسحب وأفلت"}</strong><small>JPG, PNG, PDF (الحد الأقصى 5MB)</small><input type="file" accept="image/jpeg,image/png,application/pdf" onChange={event=>setFile(option.n,event.target.files?.[0])}/></label><div><h2>{option.title}</h2><p>{option.text}</p>{option.n==="01"&&<button type="button">عرض بيانات الحساب <ChevronLeft/></button>}</div><aside><b>{option.n}</b><Icon/></aside></article>})}
    <article className="visa-card"><a href="/success"><CreditCard/><span>ادفع عبر فيزا</span><strong>VISA</strong></a><div><h2>السداد فيزا</h2><p>ادفع الآن مباشرة باستخدام بطاقتك البنكية عبر فيزا</p></div><aside><b>04</b><em>VISA</em></aside><footer><ShieldCheck/>دفع آمن <LockKeyhole/>تشفير SSL <BadgeCheck/>معتمد وآمن</footer></article>
  </section><section className="payment-notice"><CircleAlert/><p>سيتم التحقق من مستندات السداد وتأكيدها خلال 24 ساعة عمل<br/>وسيصل إشعار بعد اعتماد السداد وتفعيل عضويتك</p></section><p className="payment-help"><Phone/> تحتاج مساعدة؟ تواصل معنا</p>{Object.keys(receipts).length>0&&<a className="step-continue" href="/success">إرسال المستندات <ArrowLeft/></a>}</MemberStepShell>
}

function Success(){return <MemberStepShell className="success-step"><header className="success-brand"><img src="/assets/membership-mark-transparent-v2.png" alt="شعار الرابطة"/><div><h2>رابطة ولاية نهر النيل</h2><b>الإلكترونية</b></div></header><section className="success-hero"><div className="success-check"><CircleCheckBig/></div><h1>مبروك</h1><h2>أنت الآن عضو</h2><p>في رابطة ولاية نهر النيل الإلكترونية</p></section><section className="success-member-card"><div className="success-user"><UserRound/></div><h3>رقم العضوية</h3><strong>NRN-2025-000123</strong><span/><h3>الباركود</h3><div className="success-barcode"/><small>N R N 2 0 2 5 0 0 0 1 2 3</small></section><section className="success-thanks"><ShieldCheck/><div><h2>شكراً لانضمامك إلينا</h2><p>معاً نبني مجتمعاً رقمياً قوياً ومتكافلاً لخدمة أبناء الولاية</p><b>وحدتنا .. قوتنا&nbsp;&nbsp;&nbsp; ومستقبلنا .. مسؤوليتنا</b></div></section></MemberStepShell>}

function Contact(){const [sent,setSent]=useState(false);const submit=(e:FormEvent)=>{e.preventDefault();setSent(true)};return <><section className="contact-hero exact-hero"><div className="hero-content motion"><h1>تواصل معنا</h1><h2>نحن هنا لخدمتكم</h2><p>نسعد بتواصلكم واستقبال استفساراتكم ومقترحاتكم وشكاواكم، فريقنا جاهز للرد عليكم وتقديم الدعم في أسرع وقت ممكن.</p></div><div className="hero-photo motion"><img src="/assets/contact-hero-hq.webp" alt="تواصل معنا"/></div></section><section className="member-benefits page-width motion">{[["♧","نحن معكم","نتواصل معكم بما يسهم في تطوير خدماتنا"],["◎","خدمتكم أينما كنتم","ندعمكم من داخل وخارج الولاية"],["♢","خصوصية وأمان","نحافظ على سرية معلوماتكم"],["◷","استجابة سريعة","نرد على رسائلكم في أسرع وقت"],["☏","فريق متخصص","فريق دعم متكامل لخدمتكم"]].map(([i,t,d])=><div key={t}><i>{i}</i><h3>{t}</h3><p>{d}</p></div>)}</section><section className="contact-layout page-width"><aside><h2>طرق التواصل</h2>{[["◉","واتساب","+249 912 345 678"],["☏","اتصال هاتفي","+249 123 456 789"],["✉","البريد الإلكتروني","info@nilenile.org"],["⌖","العنوان","ولاية نهر النيل - السودان"],["◷","ساعات العمل","الأحد إلى الخميس · 9ص - 5م"]].map(([i,t,d])=><div key={t}><i>{i}</i><span><b>{t}</b>{d}</span></div>)}</aside><form onSubmit={submit}><h2>أرسل لنا رسالة</h2>{sent?<div className="sent"><i>✓</i><h2>تم إرسال رسالتك بنجاح</h2><p>سنتواصل معك في أقرب وقت.</p></div>:<><div className="form-row"><label>الاسم الكامل *<input required/></label><label>البريد الإلكتروني *<input required type="email"/></label></div><label>رقم الجوال<input type="tel"/></label><label>اختر نوع الرسالة *<select required><option>استفسار عام</option><option>شكوى</option><option>اقتراح</option><option>دعم فني</option></select></label><label>نص الرسالة *<textarea required rows={5}/></label><label className="file-field">⇧ إرفاق ملف (اختياري)<input type="file"/></label><button className="primary">إرسال الرسالة <Arrow/></button></>}</form></section><section className="section page-width"><SectionTitle>أسئلة شائعة</SectionTitle><div className="faq-cards">{[["الخدمات والبرامج","تفاصيل عن خدماتنا وبرامجنا"],["الدعم الفني","المساعدة في استخدام المنصة"],["العضوية والدفع","الاستفسار عن العضوية وطرق الدفع"],["الشكاوى والمقترحات","نستقبل شكاواكم ومقترحاتكم"],["الاستفسارات العامة","إجابات على أكثر الأسئلة الشائعة"]].map(([t,d])=><a href="#" key={t}><i>◫</i><b>{t}</b><span>{d}</span></a>)}</div></section><section className="newsletter page-width motion"><div><h2>كن على تواصل دائم</h2><p>اشترك في نشرتنا البريدية ليصلك كل جديد من أخبار الرابطة والفعاليات والخدمات.</p></div><form><input type="email" placeholder="البريد الإلكتروني"/><button className="primary">اشترك الآن</button></form></section></>}

export default function NileSite({page}:{page:string}){const active=routeMap[page]||"home";const hideHeader=["membership","photo","payment","success"].includes(active);const hideFooter=["membership","photo","payment","success"].includes(active);return <div dir="rtl"><Motion/>{!hideHeader&&<Header active={active}/>}<main>{active==="home"?<Home/>:active==="membership"?<Membership/>:active==="register"?<Register/>:active==="photo"?<PhotoUpload/>:active==="payment"?<Payment/>:active==="success"?<Success/>:active==="contact"?<Contact/>:<PortalPage type={active}/>}</main>{!hideFooter&&<Footer/>}</div>}
