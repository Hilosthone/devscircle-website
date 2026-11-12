```
# DevsCircle Academy 🚀

DevsCircle Academy is a modern, production-grade, AI-powered and role-based EdTech platform engineered for full-stack software engineering bootcamps, technical instruction, and cohort-based learning. 

Built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and a unified monolithic backend API architecture, it features three distinct, secure portals for **Administrators**, **Tutors**, and **Students**.

---

## ✨ Key Features & Portals

### 🛡️ 1. Administrator Suite (`/admin/*`)
* **Admissions Pipeline:** Review applicant submissions, background data, and make approve/reject decisions.
* **Programmes & Curriculum:** Manage bootcamps, modules, and tuition pricing models.
* **Cohort Management:** Create cohort batches, track enrolments, and assign tutors.
* **Live Classes & Assessments Hub:** Schedule live classes and publish assignments, bi-weekly tests, and capstone milestones.
* **Cohort Grading:** Batch-compute final grades and inspect academic standings.
* **IAM & Permissions:** Provision system users (`ADMIN`, `TUTOR`, `STUDENT`), configure custom roles, and manage permissions.
* **Audit Logs:** Monitor security events, actor actions, and entity modifications.
* **Financial Reconciliation:** Reconcile manual payments and issue verifiable graduation certificates.

### 👩‍🏫 2. Tutor Faculty Portal (`/tutor/*`)
* **Faculty Overview:** Track assigned teaching cohorts, upcoming lectures, and quick faculty metrics.
* **Live Class Management:** Access meeting rooms (`joinUrl`) and attach recorded session video links.
* **Attendance Register:** Take roll call (`bulkMark`) across Present, Absent, Late, and Excused statuses.
* **Evaluations & Grading:** Grade student code repositories (`submissionUrl`) and evaluate capstone projects.
* **Coursework Builder:** Create and publish assignments, tests, and capstones directly for assigned cohorts.
* **Student Directory & Timetables:** Inspect student contact details and view weekly timetable grids.

### 🚀 3. Student Learning Portal (`/student/*`)
* **Student Overview:** Track active enrolment standing, cumulative GPA, and upcoming learning milestones.
* **Classroom & Live Feed:** Join video meeting rooms and stream recorded lecture sessions.
* **Split Assessments Hub:**
  * `/student/assessments/assignments` — Submit weekly coding repositories.
  * `/student/assessments/tests` — Take timed online bi-weekly quizzes.
  * `/student/assessments/final-exam` — Upload final capstone repositories and live deployment URLs.
* **Grades & Leaderboard:** Inspect score breakdowns and view cohort rank.
* **Certificates:** View and verify earned course completion diplomas.

---

## 🛠️ Tech Stack

* **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS, Lucide Icons.
* **Backend Integration:** Monolithic REST API client (`axios`-based with interceptors, token persistence, and error handling).
* **State & Security:** Role-Based Access Control (RBAC) via custom `useAuth` hook and delegated permission mapping (`PATH_PERMISSION_MAP`).

---

## 📁 Project Directory Structure

```text
src/
├── app/
│   ├── (dashboard)/
│   │   ├── admin/       # Admin suite (applications, cohorts, iam, payments, etc.)
│   │   ├── tutor/       # Tutor portal (overview, classes, attendance, evaluations, assessments)
│   │   └── student/     # Student portal (overview, classes, assessments, grades, certificates)
│   └── layout.tsx       # Root layout & global providers
├── components/
│   ├── common/          # Error listeners & shared UI components
│   └── dashboard/       # Sidebar layout, mobile drawers, and nav configuration
├── hooks/
│   └── use-auth.ts      # Authentication & RBAC permission hook
└── lib/
    ├── api.ts           # Unified backend API monolith (auth, cohorts, classes, assessments, etc.)
    ├── api-client.ts    # Axios instance configuration
    ├── constants.ts     # Site configuration and branding constants
    └── types/           # TypeScript API and role definitions

```

---

## 🚀 Getting Started Locally

### Prerequisites

* Node.js 18+ installed
* npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository:**
```bash
git clone [https://github.com/Hilosthone/devscircle-website.git](https://github.com/Hilosthone/devscircle-website.git)
cd devscircle-website

```


2. **Install dependencies:**
```bash
npm install

```


3. **Configure Environment Variables:**
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_API_BASE_URL=[https://your-backend-api-url.com/api](https://your-backend-api-url.com/api)

```


4. **Run the development server:**
```bash
npm run dev

```


5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📄 License

This project is proprietary and confidential to DevsCircle Academy.

```

```