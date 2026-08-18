'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  type ApplicationFormData,
  RESIDENCE_TYPES,
  PARENT_STATUSES,
  LOAN_STATUSES,
} from '@/lib/applicationForm';
import { saveDraft, submitApplication } from './actions';

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
    </div>
  );
}

export default function ApplicationForm({
  applicationId,
  initialData,
  status,
  scholarshipName,
  roundName,
}: {
  applicationId: string;
  initialData: ApplicationFormData;
  status: string;
  scholarshipName: string;
  roundName: string;
}) {
  const [data, setData] = useState<ApplicationFormData>(initialData);
  const [pdpaConsent, setPdpaConsent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(status !== 'DRAFT');
  const dirtyRef = useRef(false);

  const readOnly = submitted;

  function set<K extends keyof ApplicationFormData>(key: K, value: ApplicationFormData[K]) {
    dirtyRef.current = true;
    setData((prev) => ({ ...prev, [key]: value }));
  }
  function setNested<P extends 'homeAddress' | 'parentAddress' | 'father' | 'mother'>(
    parent: P,
    field: string,
    value: string
  ) {
    dirtyRef.current = true;
    setData((prev) => ({ ...prev, [parent]: { ...(prev[parent] as object), [field]: value } }));
  }

  async function doSave(silent = false) {
    if (readOnly) return;
    setSaving(true);
    setError(null);
    try {
      await saveDraft(applicationId, data);
      dirtyRef.current = false;
      setLastSaved(new Date().toLocaleTimeString('th-TH'));
    } catch (e) {
      if (!silent) setError(e instanceof Error ? e.message : 'บันทึกไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  }

  // Auto-save every 20s while there are unsaved changes.
  useEffect(() => {
    if (readOnly) return;
    const id = setInterval(() => {
      if (dirtyRef.current) doSave(true);
    }, 20000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readOnly, data]);

  async function handleSubmit() {
    setError(null);
    try {
      await submitApplication(applicationId, data, pdpaConsent);
      setSubmitted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ส่งใบสมัครไม่สำเร็จ');
    }
  }

  return (
    <div>
      <div className="notice">
        สมัคร: <strong>{scholarshipName}</strong> ({roundName})
        {submitted ? (
          <span style={{ color: 'var(--green)', fontWeight: 700 }}> — ส่งใบสมัครแล้ว</span>
        ) : (
          <span className="muted"> — สถานะ: ฉบับร่าง</span>
        )}
      </div>

      {error && (
        <div className="notice" style={{ borderColor: '#f04438', background: '#fde8e6', color: '#a3242a' }}>
          {error}
        </div>
      )}

      {submitted && (
        <div className="notice" style={{ borderColor: 'var(--green)', background: 'var(--green-bg)' }}>
          ส่งใบสมัครเรียบร้อยแล้ว —{' '}
          <a className="text-link" href={`/api/applications/${applicationId}/pdf`}>
            ดาวน์โหลดเอกสารใบสมัคร (PDF) →
          </a>
        </div>
      )}

      <fieldset disabled={readOnly} style={{ border: 0, padding: 0, margin: 0 }}>
        <details open className="panel faq" style={{ marginBottom: 14 }}>
          <summary>1. ข้อมูลนักศึกษา</summary>
          <div style={{ paddingTop: 12 }}>
            <div className="two-col">
              <Field label="ชื่อ-สกุลนักศึกษา *">
                <input value={data.fullName} onChange={(e) => set('fullName', e.target.value)} required />
              </Field>
              <Field label="อายุ (ปี) *">
                <input value={data.age} onChange={(e) => set('age', e.target.value)} required />
              </Field>
            </div>
            <div className="two-col">
              <Field label="วันเดือนปีเกิด *">
                <input type="date" value={data.birthDate} onChange={(e) => set('birthDate', e.target.value)} required />
              </Field>
              <Field label="รหัสประจำตัวนักศึกษา *">
                <input value={data.studentId} onChange={(e) => set('studentId', e.target.value)} required />
              </Field>
            </div>
            <div className="two-col">
              <Field label="เลขที่บัตรประชาชน *">
                <input value={data.nationalId} onChange={(e) => set('nationalId', e.target.value)} required />
              </Field>
              <Field label="ชั้นปี / ห้อง *">
                <div style={{ display: 'flex', gap: 8 }}>
                  <input placeholder="ชั้นปี" value={data.year} onChange={(e) => set('year', e.target.value)} required />
                  <input placeholder="ห้อง" value={data.section ?? ''} onChange={(e) => set('section', e.target.value)} />
                </div>
              </Field>
            </div>
            <div className="two-col">
              <Field label="GPAX *">
                <input value={data.gpa} onChange={(e) => set('gpa', e.target.value)} required />
              </Field>
              <Field label="ภาควิชา *">
                <input value={data.department} onChange={(e) => set('department', e.target.value)} required />
              </Field>
            </div>
            <Field label="ชื่อ-สกุลอาจารย์ที่ปรึกษา *">
              <input value={data.advisorName} onChange={(e) => set('advisorName', e.target.value)} required />
            </Field>

            <p className="small muted" style={{ margin: '10px 0 4px' }}>ที่อยู่ตามภูมิลำเนา</p>
            <div className="two-col">
              <Field label="บ้านเลขที่ / หมู่ / ถนน">
                <input
                  placeholder="บ้านเลขที่ หมู่ ถนน"
                  value={data.homeAddress.houseNo ?? ''}
                  onChange={(e) => setNested('homeAddress', 'houseNo', e.target.value)}
                />
              </Field>
              <Field label="ตำบล / อำเภอ / จังหวัด">
                <input
                  placeholder="ตำบล อำเภอ จังหวัด"
                  value={data.homeAddress.tambon ?? ''}
                  onChange={(e) => setNested('homeAddress', 'tambon', e.target.value)}
                />
              </Field>
            </div>

            <div className="two-col">
              <Field label="เบอร์โทรศัพท์มือถือ *">
                <input value={data.mobilePhone} onChange={(e) => set('mobilePhone', e.target.value)} required />
              </Field>
              <Field label="อีเมล *">
                <input type="email" value={data.email} onChange={(e) => set('email', e.target.value)} required />
              </Field>
            </div>
            <Field label="โทรศัพท์ติดต่อกรณีติดตามมารับทุน">
              <input
                value={data.scholarshipContactPhone ?? ''}
                onChange={(e) => set('scholarshipContactPhone', e.target.value)}
              />
            </Field>

            <div className="two-col">
              <Field label="ที่พักอาศัยขณะศึกษา *">
                <select value={data.residenceType} onChange={(e) => set('residenceType', e.target.value as ApplicationFormData['residenceType'])}>
                  {RESIDENCE_TYPES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="รายละเอียดเพิ่มเติม (ชื่อหอ / อื่น ๆ)">
                <input value={data.residenceDetail ?? ''} onChange={(e) => set('residenceDetail', e.target.value)} />
              </Field>
            </div>

            <p className="small muted" style={{ margin: '10px 0 4px' }}>บิดา</p>
            <div className="two-col">
              <Field label="ชื่อ-สกุลบิดา">
                <input value={data.father.name ?? ''} onChange={(e) => setNested('father', 'name', e.target.value)} />
              </Field>
              <Field label="อาชีพ / รายได้บาทต่อปี">
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    placeholder="อาชีพ"
                    value={data.father.occupation ?? ''}
                    onChange={(e) => setNested('father', 'occupation', e.target.value)}
                  />
                  <input
                    placeholder="รายได้/ปี"
                    value={data.father.incomePerYear ?? ''}
                    onChange={(e) => setNested('father', 'incomePerYear', e.target.value)}
                  />
                </div>
              </Field>
            </div>
            <p className="small muted" style={{ margin: '10px 0 4px' }}>มารดา</p>
            <div className="two-col">
              <Field label="ชื่อ-สกุลมารดา">
                <input value={data.mother.name ?? ''} onChange={(e) => setNested('mother', 'name', e.target.value)} />
              </Field>
              <Field label="อาชีพ / รายได้บาทต่อปี">
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    placeholder="อาชีพ"
                    value={data.mother.occupation ?? ''}
                    onChange={(e) => setNested('mother', 'occupation', e.target.value)}
                  />
                  <input
                    placeholder="รายได้/ปี"
                    value={data.mother.incomePerYear ?? ''}
                    onChange={(e) => setNested('mother', 'incomePerYear', e.target.value)}
                  />
                </div>
              </Field>
            </div>
          </div>
        </details>

        <details className="panel faq" style={{ marginBottom: 14 }}>
          <summary>2. สถานภาพครอบครัว</summary>
          <div style={{ paddingTop: 12 }}>
            <Field label="สถานภาพบิดามารดา *">
              <select value={data.parentStatus} onChange={(e) => set('parentStatus', e.target.value as ApplicationFormData['parentStatus'])}>
                {PARENT_STATUSES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </Field>
            <div className="two-col">
              <Field label="พี่น้องทั้งหมด (คน) / ชาย / หญิง">
                <div style={{ display: 'flex', gap: 8 }}>
                  <input placeholder="รวม" value={data.siblingsTotal ?? ''} onChange={(e) => set('siblingsTotal', e.target.value)} />
                  <input placeholder="ชาย" value={data.siblingsMale ?? ''} onChange={(e) => set('siblingsMale', e.target.value)} />
                  <input placeholder="หญิง" value={data.siblingsFemale ?? ''} onChange={(e) => set('siblingsFemale', e.target.value)} />
                </div>
              </Field>
              <Field label="ประกอบอาชีพแล้ว / กำลังศึกษา / อื่น ๆ">
                <div style={{ display: 'flex', gap: 8 }}>
                  <input placeholder="อาชีพ" value={data.siblingsWorking ?? ''} onChange={(e) => set('siblingsWorking', e.target.value)} />
                  <input placeholder="ศึกษา" value={data.siblingsStudying ?? ''} onChange={(e) => set('siblingsStudying', e.target.value)} />
                  <input placeholder="อื่น ๆ" value={data.siblingsNeither ?? ''} onChange={(e) => set('siblingsNeither', e.target.value)} />
                </div>
              </Field>
            </div>
            <Field label="ภาระหนี้สินของบิดามารดา">
              <textarea value={data.parentDebt ?? ''} onChange={(e) => set('parentDebt', e.target.value)} />
            </Field>
          </div>
        </details>

        <details className="panel faq" style={{ marginBottom: 14 }}>
          <summary>3. ผู้อุปการะ (ถ้ามี)</summary>
          <div style={{ paddingTop: 12 }}>
            <label className="small muted" style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 10 }}>
              <input type="checkbox" checked={data.hasGuardian} onChange={(e) => set('hasGuardian', e.target.checked)} />
              มีผู้อุปการะ
            </label>
            {data.hasGuardian && (
              <>
                <div className="two-col">
                  <Field label="ชื่อ-นามสกุลผู้อุปการะ">
                    <input value={data.guardianName ?? ''} onChange={(e) => set('guardianName', e.target.value)} />
                  </Field>
                  <Field label="เกี่ยวข้องเป็น / อาชีพ">
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input placeholder="เกี่ยวข้องเป็น" value={data.guardianRelation ?? ''} onChange={(e) => set('guardianRelation', e.target.value)} />
                      <input placeholder="อาชีพ" value={data.guardianOccupation ?? ''} onChange={(e) => set('guardianOccupation', e.target.value)} />
                    </div>
                  </Field>
                </div>
                <div className="two-col">
                  <Field label="รายได้ (บาท/เดือน)">
                    <input value={data.guardianIncome ?? ''} onChange={(e) => set('guardianIncome', e.target.value)} />
                  </Field>
                  <Field label="โทรศัพท์">
                    <input value={data.guardianPhone ?? ''} onChange={(e) => set('guardianPhone', e.target.value)} />
                  </Field>
                </div>
              </>
            )}
          </div>
        </details>

        <details className="panel faq" style={{ marginBottom: 14 }}>
          <summary>4. ผู้ให้การอุปการะทางการเงินหลัก</summary>
          <div style={{ paddingTop: 12 }}>
            <div className="two-col">
              <Field label="ชื่อ-นามสกุล">
                <input value={data.supporterName ?? ''} onChange={(e) => set('supporterName', e.target.value)} />
              </Field>
              <Field label="เกี่ยวข้องเป็น / อาชีพ">
                <div style={{ display: 'flex', gap: 8 }}>
                  <input placeholder="เกี่ยวข้องเป็น" value={data.supporterRelation ?? ''} onChange={(e) => set('supporterRelation', e.target.value)} />
                  <input placeholder="อาชีพ" value={data.supporterOccupation ?? ''} onChange={(e) => set('supporterOccupation', e.target.value)} />
                </div>
              </Field>
            </div>
            <div className="two-col">
              <Field label="รายได้ (บาท/เดือน)">
                <input value={data.supporterIncome ?? ''} onChange={(e) => set('supporterIncome', e.target.value)} />
              </Field>
              <Field label="ให้เงินนักศึกษาประมาณ (บาท/เดือน)">
                <input value={data.supporterMonthlyAllowance ?? ''} onChange={(e) => set('supporterMonthlyAllowance', e.target.value)} />
              </Field>
            </div>
          </div>
        </details>

        <details className="panel faq" style={{ marginBottom: 14 }}>
          <summary>5. ทุนการศึกษาที่เคยได้รับ &amp; การกู้ยืม กยศ.</summary>
          <div style={{ paddingTop: 12 }}>
            {data.priorScholarships.map((row, i) => (
              <div className="two-col" key={i} style={{ marginBottom: 4 }}>
                <input
                  placeholder="ปีการศึกษา"
                  value={row.year ?? ''}
                  onChange={(e) => {
                    const next = [...data.priorScholarships];
                    next[i] = { ...next[i], year: e.target.value };
                    set('priorScholarships', next);
                  }}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    placeholder="จำนวนเงิน"
                    value={row.amount ?? ''}
                    onChange={(e) => {
                      const next = [...data.priorScholarships];
                      next[i] = { ...next[i], amount: e.target.value };
                      set('priorScholarships', next);
                    }}
                  />
                  <input
                    placeholder="จาก"
                    value={row.from ?? ''}
                    onChange={(e) => {
                      const next = [...data.priorScholarships];
                      next[i] = { ...next[i], from: e.target.value };
                      set('priorScholarships', next);
                    }}
                  />
                  <button
                    type="button"
                    className="btn-link-danger"
                    onClick={() => set('priorScholarships', data.priorScholarships.filter((_, idx) => idx !== i))}
                  >
                    ลบ
                  </button>
                </div>
              </div>
            ))}
            {data.priorScholarships.length < 3 && (
              <button
                type="button"
                className="text-link"
                onClick={() => set('priorScholarships', [...data.priorScholarships, {}])}
              >
                + เพิ่มรายการทุนที่เคยได้รับ
              </button>
            )}

            <p className="small muted" style={{ margin: '14px 0 4px' }}>การกู้ยืมเงินทุนการศึกษาของรัฐบาล (กยศ.)</p>
            <div className="two-col">
              <Field label="สถานะ">
                <select value={data.loanStatus ?? ''} onChange={(e) => set('loanStatus', (e.target.value || undefined) as ApplicationFormData['loanStatus'])}>
                  <option value="">— ไม่ระบุ —</option>
                  {LOAN_STATUSES.map((l) => (
                    <option key={l.value} value={l.value}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="ปีการศึกษา / จำนวนเงิน">
                <div style={{ display: 'flex', gap: 8 }}>
                  <input placeholder="ปีการศึกษา" value={data.loanYear ?? ''} onChange={(e) => set('loanYear', e.target.value)} />
                  <input placeholder="จำนวนเงิน" value={data.loanAmount ?? ''} onChange={(e) => set('loanAmount', e.target.value)} />
                </div>
              </Field>
            </div>
          </div>
        </details>

        <details className="panel faq" style={{ marginBottom: 14 }}>
          <summary>6. ค่าใช้จ่าย &amp; รายได้พิเศษ</summary>
          <div style={{ paddingTop: 12 }}>
            <Field label="ค่าใช้จ่ายที่ไม่ใช่ค่าเล่าเรียน รวม (บาท/เดือน)">
              <input value={data.monthlyNonTuitionExpense ?? ''} onChange={(e) => set('monthlyNonTuitionExpense', e.target.value)} />
            </Field>
            <div className="two-col">
              <Field label="ค่าเช่าที่พัก (บาท/เดือน)">
                <input value={data.expenseRent ?? ''} onChange={(e) => set('expenseRent', e.target.value)} />
              </Field>
              <Field label="ค่าอาหาร (บาท/เดือน)">
                <input value={data.expenseFood ?? ''} onChange={(e) => set('expenseFood', e.target.value)} />
              </Field>
            </div>
            <div className="two-col">
              <Field label="ค่ารถ/น้ำมัน (บาท/เดือน)">
                <input value={data.expenseTransport ?? ''} onChange={(e) => set('expenseTransport', e.target.value)} />
              </Field>
              <Field label="ค่าอุปกรณ์การเรียน / เสื้อผ้า (บาท/ปี)">
                <div style={{ display: 'flex', gap: 8 }}>
                  <input placeholder="อุปกรณ์การเรียน" value={data.expenseSuppliesPerYear ?? ''} onChange={(e) => set('expenseSuppliesPerYear', e.target.value)} />
                  <input placeholder="เสื้อผ้า" value={data.expenseClothingPerYear ?? ''} onChange={(e) => set('expenseClothingPerYear', e.target.value)} />
                </div>
              </Field>
            </div>
            <p className="small muted" style={{ margin: '10px 0 4px' }}>รายได้พิเศษจากการทำงาน</p>
            <div className="two-col">
              <Field label="ตำแหน่ง / รายได้">
                <div style={{ display: 'flex', gap: 8 }}>
                  <input placeholder="ตำแหน่ง" value={data.extraIncomePosition ?? ''} onChange={(e) => set('extraIncomePosition', e.target.value)} />
                  <input placeholder="รายได้" value={data.extraIncomeAmount ?? ''} onChange={(e) => set('extraIncomeAmount', e.target.value)} />
                </div>
              </Field>
              <Field label="สถานที่ทำงาน / โทรศัพท์">
                <div style={{ display: 'flex', gap: 8 }}>
                  <input placeholder="สถานที่ทำงาน" value={data.extraIncomeWorkplace ?? ''} onChange={(e) => set('extraIncomeWorkplace', e.target.value)} />
                  <input placeholder="โทรศัพท์" value={data.extraIncomePhone ?? ''} onChange={(e) => set('extraIncomePhone', e.target.value)} />
                </div>
              </Field>
            </div>
          </div>
        </details>

        <details className="panel faq" style={{ marginBottom: 14 }}>
          <summary>7. เพื่อนสนิท กิจกรรม &amp; ความสามารถพิเศษ</summary>
          <div style={{ paddingTop: 12 }}>
            <div className="two-col">
              <Field label="ชื่อเพื่อนสนิท / ห้อง">
                <div style={{ display: 'flex', gap: 8 }}>
                  <input placeholder="ชื่อ" value={data.friendName ?? ''} onChange={(e) => set('friendName', e.target.value)} />
                  <input placeholder="ห้อง" value={data.friendRoom ?? ''} onChange={(e) => set('friendRoom', e.target.value)} />
                </div>
              </Field>
              <Field label="โทรศัพท์เพื่อนสนิท">
                <input value={data.friendPhone ?? ''} onChange={(e) => set('friendPhone', e.target.value)} />
              </Field>
            </div>
            <Field label="ประวัติการทำกิจกรรม">
              <textarea value={data.activityHistory ?? ''} onChange={(e) => set('activityHistory', e.target.value)} />
            </Field>
            <div className="two-col">
              <Field label="พิมพ์ดีด (คำ/นาที) ไทย / อังกฤษ">
                <div style={{ display: 'flex', gap: 8 }}>
                  <input placeholder="ไทย" value={data.typingThaiWpm ?? ''} onChange={(e) => set('typingThaiWpm', e.target.value)} />
                  <input placeholder="อังกฤษ" value={data.typingEnglishWpm ?? ''} onChange={(e) => set('typingEnglishWpm', e.target.value)} />
                </div>
              </Field>
              <Field label="โปรแกรมคอมพิวเตอร์ที่ถนัด">
                <input value={data.computerPrograms ?? ''} onChange={(e) => set('computerPrograms', e.target.value)} />
              </Field>
            </div>
            <div className="two-col">
              <Field label="ดนตรี (ประเภท)">
                <input value={data.musicType ?? ''} onChange={(e) => set('musicType', e.target.value)} />
              </Field>
              <Field label="กีฬา (ประเภท)">
                <input value={data.sportsType ?? ''} onChange={(e) => set('sportsType', e.target.value)} />
              </Field>
            </div>
            <div className="two-col">
              <Field label="ช่างฝีมือ">
                <input value={data.craftsmanship ?? ''} onChange={(e) => set('craftsmanship', e.target.value)} />
              </Field>
              <Field label="อื่น ๆ">
                <input value={data.otherSkills ?? ''} onChange={(e) => set('otherSkills', e.target.value)} />
              </Field>
            </div>
          </div>
        </details>

        {!submitted && (
          <label className="small" style={{ display: 'flex', gap: 8, alignItems: 'flex-start', margin: '18px 0' }}>
            <input type="checkbox" checked={pdpaConsent} onChange={(e) => setPdpaConsent(e.target.checked)} style={{ marginTop: 3 }} />
            <span>
              ข้าพเจ้ายินยอมให้คณะฯ เก็บ รวบรวม ใช้ และเปิดเผยข้อมูลส่วนบุคคลข้างต้น เพื่อวัตถุประสงค์ในการพิจารณาทุนการศึกษาเท่านั้น
              ตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล (PDPA) และรับรองว่าข้อมูลที่กรอกเป็นความจริงทุกประการ
            </span>
          </label>
        )}
      </fieldset>

      {!submitted && (
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button className="btn outline" type="button" onClick={() => doSave(false)} disabled={saving}>
            {saving ? 'กำลังบันทึก...' : 'บันทึกร่าง'}
          </button>
          <button className="btn primary" type="button" onClick={handleSubmit} disabled={!pdpaConsent}>
            ส่งใบสมัคร
          </button>
          {lastSaved && <span className="small muted">บันทึกร่างล่าสุด {lastSaved}</span>}
        </div>
      )}
    </div>
  );
}
