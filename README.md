# 📡 Vue Firestore Subscriber

**A lightweight Vue composable for managing real-time Firestore subscriptions effortlessly.**  
Automatically handles subscriptions, authentication, and data filtering—so you can focus on building your app!

---

## 🚀 Features

✔ **Live Firestore updates** with `onSnapshot`  
✔ **Auto-subscribe & unsubscribe** when users log in/out  
✔ **Supports filters & dynamic queries** (e.g., `array-contains`)  
✔ **Minimal setup, just import & use**  
✔ **Designed for Vue 3 + Firebase**  

---

## 📦 Installation

Install the package via **npm**:

```sh
npm install vue-firestore-subscriber
```

Ensure you have **Firebase** installed:
```sh
npm install firebase
```

---

## 🔥 Quick Start

### **1️⃣ Set Up Firebase (`firebase.js`)**

Before using this package, make sure you **initialize Firebase** and **export Firestore (`db`)**:

```js
// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
```

---

### **2️⃣ Subscribe to Firestore in `App.vue`**

```vue
<script setup>
import { ref, onMounted } from "vue";
import { auth } from "@/firebase"; // Import Firebase Auth
import { useFirestoreSubscriptions } from "vue-firestore-subscriber";

const user = ref(null);

// Detect authentication state changes
onMounted(() => {
  auth.onAuthStateChanged((firebaseUser) => {
    user.value = firebaseUser;
  });
});

// Define Firestore collections to subscribe to
const collections = {
  users: [],
  posts: [["status", "==", "published"]],
  comments: [["postId", "==", "{userId}"]], // `{userId}` will be replaced dynamically
};

// Activate subscriptions
const { data } = useFirestoreSubscriptions(user, collections);
</script>
```

---

### **3️⃣ Display Data in a Component**

```vue
<script setup>
import { useFirestoreSubscriptions } from "vue-firestore-subscriber";

// Access Firestore data anywhere in your app
const { data } = useFirestoreSubscriptions();
</script>

<template>
  <div>
    <h2>Posts</h2>
    <p v-if="data.loading">Loading...</p>
    
    <ul v-else>
      <li v-for="post in data.posts" :key="post.id">
        <h3>{{ post.title }}</h3>
        <p>{{ post.content }}</p>
      </li>
    </ul>
  </div>
</template>
```

---

## 🎯 Filtering Data with Firestore Queries

Define **where filters** in `App.vue`:

```js
const collections = {
  users: [["role", "==", "admin"]],  // Fetch only admins
  posts: [["createdAt", ">", "2024-01-01"]],  // Fetch posts from 2024 onward
  comments: [
    [["postId", "==", "{userId}"]],  // Fetch comments for the logged-in user
  ],
};
```

### **🚀 How Filters Work**
- **Exact match:** `["status", "==", "published"]`
- **Date filtering:** `["createdAt", ">", "2024-01-01"]`
- **Array contains:** `["tags", "array-contains", "VueJS"]`
- **Replace `{userId}` dynamically** → `{userId}` becomes `auth.currentUser.uid`

---

## 🔥 Auto-Unsubscribe & Cleanup

**All Firestore listeners are automatically removed** when:
- The user **logs out**
- The component **unmounts**

**You don’t have to manually unsubscribe!**

---

## 🎯 Best Practices

✔ **Use Firebase rules to secure data**  
✔ **Avoid too many subscriptions to optimize performance**  
✔ **Keep filters specific to reduce Firestore costs**  

---

## 📜 License

MIT © 2025 **Eirik Madland**

---

## 🔗 Useful Links

- 🔥 **Vue Firestore Subscriber (npm)**: [npmjs.com/package/vue-firestore-subscriber](https://www.npmjs.com/package/vue-firestore-subscriber)
- 📚 **Firebase Firestore Docs**: [firebase.google.com/docs/firestore](https://firebase.google.com/docs/firestore)
