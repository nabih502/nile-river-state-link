import { useEffect, useState } from "react";
import { supabase } from "./supabase";

interface Setting { key: string; value: string; updated_at: string; }

const SETTING_LABELS: Record<string, string> = {
  site_name: "اسم الموقع",
  site_tagline: "الشعار الفرعي",
  contact_email: "البريد الإلكتروني",
  contact_phone: "الهاتف",
  contact_address: "العنوان",
  facebook_url: "رابط Facebook",
  twitter_url: "رابط X (Twitter)",
  instagram_url: "رابط Instagram",
  youtube_url: "رابط YouTube",
  linkedin_url: "رابط LinkedIn",
  whatsapp_number: "رقم WhatsApp",
  about_short: "نبذة مختصرة (الفوتر)",
  membership_fee: "رسوم العضوية",
  currency: "العملة",
  maintenance_mode: "وضع الصيانة (true/false)",
};

const DEFAULT_SETTINGS: Record<string, string> = {
  site_name: "رابطة ولاية نهر النيل الرقمية",
  site_tagline: "منصة رقمية شاملة لأبناء ولاية نهر النيل",
  contact_email: "info@nilenile.org",
  contact_phone: "+249 912 345 678",
  contact_address: "ولاية نهر النيل - السودان",
  facebook_url: "",
  twitter_url: "",
  instagram_url: "",
  youtube_url: "",
  linkedin_url: "",
  whatsapp_number: "",
  about_short: "منصة رقمية شاملة لخدمة أبناء ولاية نهر النيل في الداخل والخارج.",
  membership_fee: "0",
  currency: "SDG",
  maintenance_mode: "false",
};

export default function AdminSettingsSection() {
  const [settings, setSettings] = useState<Record<string, string>>(DEFAULT_SETTINGS);
  const [original, setOriginal] = useState<Record<string, string>>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("site_settings").select("key,value");
    if (data && data.length > 0) {
      const obj: Record<string, string> = { ...DEFAULT_SETTINGS };
      data.forEach((r: Setting) => { obj[r.key] = r.value; });
      setSettings(obj);
      setOriginal(obj);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    const upserts = Object.entries(settings).map(([key, value]) => ({
      key, value, updated_at: new Date().toISOString(),
    }));
    await supabase.from("site_settings").upsert(upserts, { onConflict: "key" });
    setOriginal({ ...settings });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const isDirty = JSON.stringify(settings) !== JSON.stringify(original);
  const groups = [
    { label: "معلومات الموقع", keys: ["site_name", "site_tagline", "about_short"] },
    { label: "معلومات التواصل", keys: ["contact_email", "contact_phone", "contact_address", "whatsapp_number"] },
    { label: "وسائل التواصل الاجتماعي", keys: ["facebook_url", "twitter_url", "instagram_url", "youtube_url", "linkedin_url"] },
    { label: "إعدادات العضوية", keys: ["membership_fee", "currency"] },
    { label: "إعدادات متقدمة", keys: ["maintenance_mode"] },
  ];

  if (loading) return <div className="adm-loading">جاري التحميل...</div>;

  return (
    <div className="adm-section">
      <div className="adm-settings-wrap">
        {groups.map(group => (
          <div key={group.label} className="adm-settings-group">
            <h3 className="adm-settings-group-title">{group.label}</h3>
            <div className="adm-form">
              {group.keys.map(key => (
                <div key={key} className="adm-form-row">
                  <label>{SETTING_LABELS[key] ?? key}</label>
                  {key === "about_short" ? (
                    <textarea rows={3} value={settings[key] ?? ""} onChange={e => setSettings({ ...settings, [key]: e.target.value })} />
                  ) : (
                    <input
                      value={settings[key] ?? ""}
                      onChange={e => setSettings({ ...settings, [key]: e.target.value })}
                      dir={["facebook_url","twitter_url","instagram_url","youtube_url","linkedin_url","contact_email"].includes(key) ? "ltr" : undefined}
                      type={["contact_email"].includes(key) ? "email" : "text"}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className="adm-settings-footer">
          {saved && <span className="adm-saved-badge">✓ تم حفظ الإعدادات بنجاح</span>}
          <button className="adm-btn-save" onClick={save} disabled={saving || !isDirty}>
            {saving ? "جاري الحفظ..." : "حفظ جميع الإعدادات"}
          </button>
        </div>
      </div>
    </div>
  );
}
