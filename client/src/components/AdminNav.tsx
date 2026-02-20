export default function AdminNav() {
    return (
        <nav className="flex items-center gap-4">
            <a href="/admin" className="text-sm font-medium text-gray-800">Dashboard</a>
            <a href="/admin/attendance" className="text-sm text-gray-600">Attendance</a>
            <a href="/admin/users" className="text-sm text-gray-600">Users</a>
        </nav>
    );
}
