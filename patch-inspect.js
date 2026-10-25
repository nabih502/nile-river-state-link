const f=require('fs');
let s=f.readFileSync('src/site.tsx','utf8');
const r=f.readFileSync('/tmp/site-repl.txt','utf8');
const a=s.indexOf('function Payment(){');
const b=s.indexOf('function Contact(){',a);
if(a<0||b<0)throw new Error('payment markers not found');
s=s.slice(0,a)+r+s.slice(b);
s=s.replace('"payment" | "success" |','"payment" | "success" | "membership-status" |');
s=s.replace('payment:"payment", success:"success", contact:','payment:"payment", success:"success", "membership-status":"membership-status", contact:');
s=s.replace('<a className="primary compact" href="/membership"><UserRound size={16}/><span>انضم الآن</span></a>','<a className="hdr-panel-btn status-link" href="/membership-status"><Search size={15}/><span>متابعة الطلب</span></a><a className="primary compact" href="/membership"><UserRound size={16}/><span>انضم الآن</span></a>');
s=s.replace('active==="success"?<Success/>:active==="contact"?','active==="success"?<Success/>:active==="membership-status"?<MembershipStatusPage/>:active==="contact"?');
f.writeFileSync('src/site.tsx',s);
let c=f.readFileSync('src/globals.css','utf8');
if(!c.includes('Membership bank transfer, tracking and digital card'))c+='
'+f.readFileSync('/tmp/member-css.txt','utf8');
f.writeFileSync('src/globals.css',c);
console.log('PATCH_OK',a,b,s.includes('MembershipStatusPage'),s.includes('021117376310033040000'));
