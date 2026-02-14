/*
  Warnings:

  - You are about to drop the column `approved_by` on the `leave_requests` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `leave_requests` table. All the data in the column will be lost.
  - You are about to drop the column `approved_by` on the `overtime_requests` table. All the data in the column will be lost.
  - Added the required column `leave_type_id` to the `leave_requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `request_number` to the `leave_requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_days` to the `leave_requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `leave_requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `request_number` to the `overtime_requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_hours` to the `overtime_requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `overtime_requests` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "leave_types" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "max_days" INTEGER NOT NULL,
    "requires_doc" BOOLEAN NOT NULL DEFAULT false,
    "color" TEXT NOT NULL DEFAULT '#6366f1',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "leave_balances" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employee_id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "leave_type_id" TEXT NOT NULL,
    "total_quota" INTEGER NOT NULL,
    "used" INTEGER NOT NULL DEFAULT 0,
    "remaining" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "leave_balances_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "leave_balances_leave_type_id_fkey" FOREIGN KEY ("leave_type_id") REFERENCES "leave_types" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "payrolls" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "payroll_number" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "base_salary" REAL NOT NULL,
    "attendance_days" INTEGER NOT NULL DEFAULT 0,
    "daily_salary" REAL NOT NULL,
    "overtime_hours" REAL NOT NULL DEFAULT 0,
    "overtime_pay" REAL NOT NULL DEFAULT 0,
    "late_deduction" REAL NOT NULL DEFAULT 0,
    "absent_deduction" REAL NOT NULL DEFAULT 0,
    "allowances" REAL NOT NULL DEFAULT 0,
    "deductions" REAL NOT NULL DEFAULT 0,
    "gross_pay" REAL NOT NULL,
    "net_pay" REAL NOT NULL,
    "is_paid" BOOLEAN NOT NULL DEFAULT false,
    "paid_at" DATETIME,
    "slip_url" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "payrolls_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employee_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "action_url" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notifications_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "announcements" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "published_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" DATETIME,
    "department" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "image_url" TEXT,
    "file_url" TEXT,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "created_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_leave_requests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "request_number" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "leave_type_id" TEXT NOT NULL,
    "start_date" DATETIME NOT NULL,
    "end_date" DATETIME NOT NULL,
    "total_days" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "submitted_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" DATETIME,
    "reviewed_by" TEXT,
    "review_notes" TEXT,
    "attachment_url" TEXT,
    "attendances_synced" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "leave_requests_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "leave_requests_leave_type_id_fkey" FOREIGN KEY ("leave_type_id") REFERENCES "leave_types" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "leave_requests_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_leave_requests" ("created_at", "employee_id", "end_date", "id", "reason", "start_date", "status") SELECT "created_at", "employee_id", "end_date", "id", "reason", "start_date", "status" FROM "leave_requests";
DROP TABLE "leave_requests";
ALTER TABLE "new_leave_requests" RENAME TO "leave_requests";
CREATE UNIQUE INDEX "leave_requests_request_number_key" ON "leave_requests"("request_number");
CREATE TABLE "new_overtime_requests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "request_number" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "overtime_date" DATETIME NOT NULL,
    "start_time" DATETIME NOT NULL,
    "end_time" DATETIME NOT NULL,
    "total_hours" REAL NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "submitted_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" DATETIME,
    "reviewed_by" TEXT,
    "review_notes" TEXT,
    "attendance_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "overtime_requests_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "overtime_requests_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_overtime_requests" ("created_at", "employee_id", "end_time", "id", "overtime_date", "reason", "start_time", "status") SELECT "created_at", "employee_id", "end_time", "id", "overtime_date", "reason", "start_time", "status" FROM "overtime_requests";
DROP TABLE "overtime_requests";
ALTER TABLE "new_overtime_requests" RENAME TO "overtime_requests";
CREATE UNIQUE INDEX "overtime_requests_request_number_key" ON "overtime_requests"("request_number");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "leave_types_code_key" ON "leave_types"("code");

-- CreateIndex
CREATE UNIQUE INDEX "leave_balances_employee_id_year_leave_type_id_key" ON "leave_balances"("employee_id", "year", "leave_type_id");

-- CreateIndex
CREATE UNIQUE INDEX "payrolls_payroll_number_key" ON "payrolls"("payroll_number");

-- CreateIndex
CREATE UNIQUE INDEX "payrolls_employee_id_month_year_key" ON "payrolls"("employee_id", "month", "year");
