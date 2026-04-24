#backend plan

APPLICATIONS
GET    /applications
POST   /applications
PATCH  /applications/{id}/approve
PATCH  /applications/{id}/reject

EMPLOYEES
GET    /employees

ATTENDANCE
POST   /attendance/sign-in
POST   /attendance/sign-out
GET    /attendance
