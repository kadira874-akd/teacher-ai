# TeacherAI Database Schema

## School

- id
- name
- npsn
- address

---

## Teacher

- id
- schoolId
- name
- nip
- email

---

## Class

- id
- teacherId
- name
- grade

---

## Student

- id
- classId
- nisn
- name
- gender

---

## Learning Session

- id
- classId
- teacherId
- subject
- date

---

## Attendance

- id
- learningSessionId
- studentId
- status

---

## Assessment

- id
- learningSessionId
- studentId
- score

---

## Report

- id
- studentId
- semester
- description