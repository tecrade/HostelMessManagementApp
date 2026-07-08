# 🍽️ Hostel Mess Management App

A modern, cloud-based **Hostel Mess Management System** built with **React, Firebase Authentication, and Cloud Firestore**. The application enables hostel administrators to manage daily meal attendance, special food items, and monthly billing while allowing students to securely view their own mess records without editing privileges.

Designed as a **multi-tenant SaaS application**, each hostel or mess operates independently using a unique **Mess Code**, allowing unlimited hostel administrations to use the same platform.

---

## ✨ Features

### 👨‍💼 Admin Portal

- Secure Firebase Authentication
- Admin Sign Up & Login
- Password Reset
- Change Password
- Dashboard Analytics
- Add/Edit/Delete Members
- Update Daily Attendance
- Configure Meal Prices
- Manage Special Food Items
- View Monthly Reports
- Real-time Database Updates

---

### 👨‍🎓 Student Portal

- No Login Required
- Join using Mess Code
- View Member List
- View Monthly Attendance
- View Daily Meal Details
- View Monthly Bill
- Responsive Mobile Interface
- Real-time Data Synchronization

---

## 🍛 Meal Management

Supports recording attendance for:

- ✅ Breakfast
- ✅ Lunch
- ✅ Dinner

Each meal is individually tracked.

Example:

| Date | Breakfast | Lunch | Dinner |
|------|-----------|--------|---------|
| 10 Jul | ✅ | ✅ | ❌ |

---

## 🍗 Special Items

Instead of manually entering prices every day, administrators maintain a reusable menu of special food items.

Example

| Item | Price |
|------|--------|
| Fish Curry | ₹80 |
| Chicken Fry | ₹120 |
| Egg Roast | ₹20 |
| Beef Curry | ₹100 |

While updating attendance, admins simply select the special item from a dropdown.

The application automatically calculates the total.

---

## 💰 Billing System

Monthly bill is calculated automatically.

Daily Total

```
Breakfast Price
+ Lunch Price
+ Dinner Price
+ Selected Special Items
```

Monthly Total

```
Sum of all Daily Totals
```

Administrators can change meal prices anytime from the Settings page.

---

## 🏢 Multi-Tenant Architecture

Every hostel has its own isolated workspace.

```
Admin A
│
├── Members
├── Attendance
├── Specials
└── Settings

Admin B
│
├── Members
├── Attendance
├── Specials
└── Settings
```

Students access their hostel by entering a unique **Mess Code**.

Example

```
NSSCE-A
HOSTEL01
BOYS-HOSTEL
```

The same application supports unlimited hostels.

---

## 🔥 Firebase Services

- Firebase Authentication
- Cloud Firestore
- Firebase Hosting

---

## 📂 Firestore Structure

```
admins
    adminUID
        profile
            name
            email
            messCode

        members

        attendance

        specials

        settings

messCodes
    NSSCE-A
        adminUid

    HOSTEL01
        adminUid
```

---

## 📊 Dashboard

### Home Dashboard

- Member Cards
- Monthly Expense
- Meal Count
- Search Members

### Member Details

- Monthly History
- Monthly Expense
- Meal Statistics

### Monthly Details

- Daily Attendance
- Special Items
- Daily Total
- Monthly Summary

---

## 🔐 Security

### Admin

- Read
- Write
- Update
- Delete

### Student

- Read Only

Firestore Security Rules ensure that administrators can access only their own hostel data while students have read-only access to the selected hostel.

---

## 📱 Responsive Design

Optimized for

- Desktop
- Laptop
- Tablet
- Mobile

Responsive components include:

- Navigation
- Dashboard
- Attendance Table
- Login Dialog
- Member Cards
- Reports
- Admin Dashboard

---

## ⚡ Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- Lucide Icons

### Backend

- Firebase Authentication
- Cloud Firestore

### Deployment

- Firebase Hosting

---

## 📁 Project Structure

```
src
│
├── components
│
├── pages
│
├── hooks
│
├── firebase
│
├── utils
│
├── context
│
└── assets
```

---

## 🚀 Installation

Clone the repository

```bash
git clone https://github.com/yourusername/HostelMessManagementApp.git
```

Move into the project

```bash
cd HostelMessManagementApp
```

Install dependencies

```bash
npm install
```

Start the development server

```bash
npm run dev
```

---

## 🔧 Build

```bash
npm run build
```

Preview production build

```bash
npm run preview
```

---

## 🌐 Deployment

Deploy using Firebase Hosting

```bash
firebase login
firebase init
firebase deploy
```

---

## 📌 Future Enhancements

- QR Code Attendance
- Excel Export
- PDF Bill Generation
- WhatsApp Bill Sharing
- Push Notifications
- Meal Booking
- Hostel Analytics Dashboard
- Multiple Admin Roles
- Offline Support (PWA)
- Dark Mode

---

## 📄 License

This project is intended for educational and hostel management purposes.

---

## 👨‍💻 Author

**Jovin John**

Founder — **Tecrade**

🌐 Portfolio : https://tecrade.github.io