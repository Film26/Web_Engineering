import path from 'node:path';
import { Document, Page, View, Text, StyleSheet, Font } from '@react-pdf/renderer';
import type { ApplicationFormData } from '@/lib/applicationForm';
import { RESIDENCE_TYPES, PARENT_STATUSES, LOAN_STATUSES } from '@/lib/applicationForm';
import { formatThaiDateTime } from '@/lib/format';

let fontsRegistered = false;
function ensureFonts() {
  if (fontsRegistered) return;
  Font.register({
    family: 'Sarabun',
    fonts: [
      { src: path.join(process.cwd(), 'src/fonts/Sarabun-Regular.ttf'), fontWeight: 'normal' },
      { src: path.join(process.cwd(), 'src/fonts/Sarabun-Bold.ttf'), fontWeight: 'bold' },
    ],
  });
  fontsRegistered = true;
}

const styles = StyleSheet.create({
  page: { fontFamily: 'Sarabun', fontSize: 10, padding: 32, color: '#172033' },
  title: { fontSize: 14, fontWeight: 'bold', textAlign: 'center', marginBottom: 2 },
  subtitle: { fontSize: 11, textAlign: 'center', marginBottom: 10 },
  sectionHeading: { fontSize: 11, fontWeight: 'bold', marginTop: 12, marginBottom: 4, backgroundColor: '#f3f0f0', padding: 4 },
  row: { flexDirection: 'row', marginBottom: 3 },
  cell: { flex: 1, paddingRight: 8 },
  label: { color: '#667085', fontSize: 8 },
  value: { fontSize: 10 },
  table: { marginTop: 4, borderWidth: 1, borderColor: '#e6dcdc' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#e6dcdc' },
  tableHeaderCell: { flex: 1, padding: 4, fontSize: 8, fontWeight: 'bold', backgroundColor: '#fafbfc' },
  tableCell: { flex: 1, padding: 4, fontSize: 9 },
  footer: { position: 'absolute', bottom: 20, left: 32, right: 32, fontSize: 8, color: '#98a2b3', textAlign: 'center' },
});

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <View style={styles.cell}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value?.trim() ? value : '-'}</Text>
    </View>
  );
}

function labelFor(options: readonly { value: string; label: string }[], value?: string) {
  return options.find((o) => o.value === value)?.label ?? value ?? '-';
}

export function ApplicationPdfDocument({
  data,
  scholarshipName,
  roundName,
  applicantEmail,
  submittedAt,
}: {
  data: ApplicationFormData;
  scholarshipName: string;
  roundName: string;
  applicantEmail: string;
  submittedAt: Date | null;
}) {
  ensureFonts();

  return (
    <Document title={`ใบสมัครขอรับทุน - ${data.fullName}`}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>ใบสมัครขอรับทุนการศึกษา</Text>
        <Text style={styles.subtitle}>คณะวิศวกรรมศาสตร์ มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี</Text>
        <Text style={{ fontSize: 9, textAlign: 'center', color: '#667085', marginBottom: 4 }}>
          ทุน: {scholarshipName} ({roundName})
        </Text>

        <View style={styles.sectionHeading}>
          <Text>1. ข้อมูลนักศึกษา</Text>
        </View>
        <View style={styles.row}>
          <Field label="ชื่อ-สกุลนักศึกษา" value={data.fullName} />
          <Field label="อายุ" value={data.age} />
          <Field label="วันเดือนปีเกิด" value={data.birthDate} />
        </View>
        <View style={styles.row}>
          <Field label="รหัสประจำตัวนักศึกษา" value={data.studentId} />
          <Field label="เลขที่บัตรประชาชน" value={data.nationalId} />
          <Field label="ชั้นปี / ห้อง" value={`${data.year || '-'} / ${data.section || '-'}`} />
        </View>
        <View style={styles.row}>
          <Field label="GPAX" value={data.gpa} />
          <Field label="ภาควิชา" value={data.department} />
          <Field label="อาจารย์ที่ปรึกษา" value={data.advisorName} />
        </View>
        <View style={styles.row}>
          <Field
            label="ที่อยู่ตามภูมิลำเนา"
            value={[data.homeAddress.houseNo, data.homeAddress.tambon].filter(Boolean).join(' ')}
          />
          <Field label="โทรศัพท์มือถือ" value={data.mobilePhone} />
          <Field label="อีเมล" value={data.email} />
        </View>
        <View style={styles.row}>
          <Field label="ที่พักอาศัยขณะศึกษา" value={labelFor(RESIDENCE_TYPES, data.residenceType)} />
          <Field label="รายละเอียดที่พัก" value={data.residenceDetail} />
          <Field label="โทรศัพท์ติดต่อกรณีรับทุน" value={data.scholarshipContactPhone} />
        </View>
        <View style={styles.row}>
          <Field label="ชื่อบิดา / อาชีพ / รายได้ต่อปี" value={`${data.father.name || '-'} / ${data.father.occupation || '-'} / ${data.father.incomePerYear || '-'}`} />
          <Field label="ชื่อมารดา / อาชีพ / รายได้ต่อปี" value={`${data.mother.name || '-'} / ${data.mother.occupation || '-'} / ${data.mother.incomePerYear || '-'}`} />
        </View>

        <View style={styles.sectionHeading}>
          <Text>2. สถานภาพครอบครัว</Text>
        </View>
        <View style={styles.row}>
          <Field label="สถานภาพบิดามารดา" value={labelFor(PARENT_STATUSES, data.parentStatus)} />
          <Field label="พี่น้องทั้งหมด (ชาย/หญิง)" value={`${data.siblingsTotal || '-'} (${data.siblingsMale || '-'}/${data.siblingsFemale || '-'})`} />
          <Field label="ประกอบอาชีพ/ศึกษา/อื่นๆ" value={`${data.siblingsWorking || '-'}/${data.siblingsStudying || '-'}/${data.siblingsNeither || '-'}`} />
        </View>
        <View style={styles.row}>
          <Field label="ภาระหนี้สินของบิดามารดา" value={data.parentDebt} />
        </View>

        {data.hasGuardian && (
          <>
            <View style={styles.sectionHeading}>
              <Text>3. ผู้อุปการะ</Text>
            </View>
            <View style={styles.row}>
              <Field label="ชื่อผู้อุปการะ" value={data.guardianName} />
              <Field label="เกี่ยวข้องเป็น / อาชีพ" value={`${data.guardianRelation || '-'} / ${data.guardianOccupation || '-'}`} />
              <Field label="รายได้ / โทรศัพท์" value={`${data.guardianIncome || '-'} / ${data.guardianPhone || '-'}`} />
            </View>
          </>
        )}

        <View style={styles.sectionHeading}>
          <Text>4. ผู้ให้การอุปการะทางการเงินหลัก</Text>
        </View>
        <View style={styles.row}>
          <Field label="ชื่อ" value={data.supporterName} />
          <Field label="เกี่ยวข้องเป็น / อาชีพ" value={`${data.supporterRelation || '-'} / ${data.supporterOccupation || '-'}`} />
          <Field label="ให้เงินนักศึกษาต่อเดือน" value={data.supporterMonthlyAllowance} />
        </View>

        <View style={styles.sectionHeading}>
          <Text>5. ทุนการศึกษาที่เคยได้รับ / การกู้ยืม กยศ.</Text>
        </View>
        {data.priorScholarships.length > 0 ? (
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.tableHeaderCell}>ปีการศึกษา</Text>
              <Text style={styles.tableHeaderCell}>จำนวนเงิน</Text>
              <Text style={styles.tableHeaderCell}>จาก</Text>
            </View>
            {data.priorScholarships.map((row, i) => (
              <View style={styles.tableRow} key={i}>
                <Text style={styles.tableCell}>{row.year || '-'}</Text>
                <Text style={styles.tableCell}>{row.amount || '-'}</Text>
                <Text style={styles.tableCell}>{row.from || '-'}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={{ fontSize: 9, color: '#667085' }}>ไม่มีข้อมูล</Text>
        )}
        <View style={[styles.row, { marginTop: 6 }]}>
          <Field label="สถานะการกู้ กยศ." value={data.loanStatus ? labelFor(LOAN_STATUSES, data.loanStatus) : '-'} />
          <Field label="ปีการศึกษา / จำนวนเงิน" value={`${data.loanYear || '-'} / ${data.loanAmount || '-'}`} />
        </View>

        <View style={styles.sectionHeading}>
          <Text>6. ค่าใช้จ่าย &amp; รายได้พิเศษ</Text>
        </View>
        <View style={styles.row}>
          <Field label="ค่าใช้จ่ายที่ไม่ใช่ค่าเล่าเรียนรวม/เดือน" value={data.monthlyNonTuitionExpense} />
          <Field label="ค่าเช่าที่พัก/เดือน" value={data.expenseRent} />
          <Field label="ค่าอาหาร/เดือน" value={data.expenseFood} />
        </View>
        <View style={styles.row}>
          <Field label="ค่ารถ/น้ำมันต่อเดือน" value={data.expenseTransport} />
          <Field label="ค่าอุปกรณ์การเรียน/ปี" value={data.expenseSuppliesPerYear} />
          <Field label="ค่าเสื้อผ้า/ปี" value={data.expenseClothingPerYear} />
        </View>
        <View style={styles.row}>
          <Field label="รายได้พิเศษ (ตำแหน่ง/รายได้)" value={`${data.extraIncomePosition || '-'} / ${data.extraIncomeAmount || '-'}`} />
          <Field label="สถานที่ทำงาน / โทร" value={`${data.extraIncomeWorkplace || '-'} / ${data.extraIncomePhone || '-'}`} />
        </View>

        <View style={styles.sectionHeading}>
          <Text>7. เพื่อนสนิท กิจกรรม และความสามารถพิเศษ</Text>
        </View>
        <View style={styles.row}>
          <Field label="เพื่อนสนิท / ห้อง / โทร" value={`${data.friendName || '-'} / ${data.friendRoom || '-'} / ${data.friendPhone || '-'}`} />
        </View>
        <View style={styles.row}>
          <Field label="ประวัติการทำกิจกรรม" value={data.activityHistory} />
        </View>
        <View style={styles.row}>
          <Field label="พิมพ์ดีด ไทย/อังกฤษ (คำ/นาที)" value={`${data.typingThaiWpm || '-'} / ${data.typingEnglishWpm || '-'}`} />
          <Field label="โปรแกรมคอมพิวเตอร์" value={data.computerPrograms} />
        </View>
        <View style={styles.row}>
          <Field label="ดนตรี" value={data.musicType} />
          <Field label="กีฬา" value={data.sportsType} />
          <Field label="ช่างฝีมือ / อื่น ๆ" value={`${data.craftsmanship || '-'} / ${data.otherSkills || '-'}`} />
        </View>

        <View style={{ marginTop: 20 }}>
          <Text style={{ fontSize: 9 }}>
            ข้าพเจ้าขอรับรองว่าข้อมูลที่กรอกในระบบนี้เป็นจริงทุกประการ ({applicantEmail})
          </Text>
          <Text style={{ fontSize: 9, marginTop: 4 }}>
            ส่งใบสมัครเมื่อ: {submittedAt ? formatThaiDateTime(submittedAt) : '-'}
          </Text>
        </View>

        <Text style={styles.footer}>
          เอกสารนี้สร้างจากระบบทุนการศึกษาออนไลน์ — โปรดแนบเอกสารประกอบตามที่ประกาศทุนกำหนด
          (ใบแสดงผลการเรียน, สำเนาบัตรนักศึกษา, หนังสือรับรองจากอาจารย์ที่ปรึกษา, เรียงความครอบครัว)
        </Text>
      </Page>
    </Document>
  );
}
