'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';

export default function LoginForm({
  azureAdConfigured,
  devLoginEnabled,
}: {
  azureAdConfigured: boolean;
  devLoginEnabled: boolean;
}) {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  return (
    <>
      {azureAdConfigured && (
        <button
          className="btn primary"
          type="button"
          style={{ width: '100%', marginBottom: 14 }}
          onClick={() => signIn('azure-ad', { callbackUrl: '/' })}
        >
          เข้าสู่ระบบด้วย KMUTT SSO
        </button>
      )}

      {!azureAdConfigured && (
        <p className="notice small">
          ยังไม่ได้ตั้งค่าการเชื่อมต่อ KMUTT SSO (Azure AD) — ใส่ค่า AZURE_AD_CLIENT_ID / AZURE_AD_CLIENT_SECRET /
          AZURE_AD_TENANT_ID ใน .env เพื่อเปิดใช้งาน
        </p>
      )}

      {devLoginEnabled && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setSubmitting(true);
            await signIn('dev-login', { email, callbackUrl: '/' });
          }}
          style={{ marginTop: 18, borderTop: '1px solid var(--line)', paddingTop: 18 }}
        >
          <p className="small muted" style={{ margin: '0 0 10px' }}>
            โหมดพัฒนา (ไม่ใช่ SSO จริง) — ใช้สำหรับทดสอบก่อนเชื่อมต่อ Azure AD
          </p>
          <div className="field">
            <label>อีเมล</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@mail.kmutt.ac.th"
            />
          </div>
          <button className="btn outline" type="submit" style={{ width: '100%' }} disabled={submitting}>
            {submitting ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ (Dev)'}
          </button>
        </form>
      )}
    </>
  );
}
