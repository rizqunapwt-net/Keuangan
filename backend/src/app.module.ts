import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AttendanceModule } from './attendance/attendance.module';
import { EmployeeModule } from './employee/employee.module';
import { LeaveModule } from './leave/leave.module';
import { OvertimeModule } from './overtime/overtime.module';
import { PayrollModule } from './payroll/payroll.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    AttendanceModule,
    EmployeeModule,
    LeaveModule,
    OvertimeModule,
    PayrollModule,
    NotificationModule,
  ],
})
export class AppModule {}
