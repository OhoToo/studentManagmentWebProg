CREATE TYPE role AS ENUM ('ADMIN', 'USER');

CREATE TABLE app_users (
    id UUID PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role role NOT NULL,
    CONSTRAINT uk_user_username UNIQUE (username)
);

CREATE TABLE students (
    id UUID PRIMARY KEY,
    full_name TEXT NOT NULL,
    group_name VARCHAR(255) NOT NULL,
    isu VARCHAR(6) NOT NULL,
    dorm_number INTEGER,
    room INTEGER,
    date_arrived DATE,
    foreign_student BOOLEAN NOT NULL,
    notes TEXT NOT NULL,
    CONSTRAINT uk_student_isu UNIQUE (isu)
);
