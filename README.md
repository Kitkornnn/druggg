# Dashboard ร้านยาจำลอง — การจ่ายยาและยาคงคลัง

Dashboard เว็บหน้าเดียว (HTML + CSS + JavaScript ล้วน ไม่ต้องติดตั้งอะไร) แสดงข้อมูลการจ่ายยาและสต็อกของร้านยาจำลอง

> ⚠️ ข้อมูลทั้งหมดเป็นข้อมูลจำลองเพื่อการเรียนเท่านั้น (รหัสผู้ป่วยเป็นรหัสแฝง) ไม่ใช่ข้อมูลจริง

## แท็บในหน้าเว็บ

| แท็บ | เนื้อหา |
|---|---|
| การจ่ายยา | KPI, แนวโน้มรายวัน, ยาที่จ่ายบ่อย, สต็อก, ล็อตใกล้หมดอายุ |
| Drug Overview | สรุปบัญชียาแยกตามหมวด / ATC / รูปแบบยา |
| Inventory Planning | คำนวณจุดสั่งซื้อและปริมาณแนะนำ (ปรับ lead time / safety stock ได้) |
| Drug Explorer | ค้นหา กรอง และดูรายละเอียดยาทีละรายการ |
| คุณภาพข้อมูล | exception log และดาวน์โหลด CSV |

## โครงสร้างไฟล์

```
├── index.html      # ทั้งหมดอยู่ในไฟล์นี้ไฟล์เดียว (โครงหน้า + สไตล์ + ข้อมูล + โค้ด)
├── .nojekyll       # ให้ GitHub Pages เสิร์ฟไฟล์ตรง ๆ
└── README.md
```

> ข้อมูลอยู่ในตัวแปร `const D = {...}` ภายในแท็กสคริปต์ของ `index.html`

## ดูในเครื่อง

ดับเบิลคลิก `index.html` เพื่อเปิดในเบราว์เซอร์ได้เลย (ไม่ต้องมีเซิร์ฟเวอร์)

## เผยแพร่บน GitHub Pages

1. สร้าง repository ใหม่บน GitHub
2. ลากไฟล์ทั้งหมดในโฟลเดอร์นี้ไปวางที่หน้า **Add file → Upload files** แล้วกด **Commit changes**
3. ไปที่ **Settings → Pages** เลือก **Deploy from a branch**, branch `main`, โฟลเดอร์ `/ (root)` แล้วกด **Save**
4. รอประมาณ 1–2 นาที เว็บจะอยู่ที่ `https://<ชื่อผู้ใช้>.github.io/<ชื่อ-repo>/`

## ใช้ Git จากเทอร์มินัล

```bash
git init
git add .
git commit -m "Add pharmacy dashboard"
git branch -M main
git remote add origin https://github.com/<ชื่อผู้ใช้>/<ชื่อ-repo>.git
git push -u origin main
```
