# Vue Firestore Subscriber

🔥 A lightweight Vue composable for **Firestore subscriptions**.

## 🚀 Installation
```sh
npm install vue-firestore-subscriber
```

## 🔥 Usage
```vue
<script setup>
import { useFirestoreSubscriptions } from "vue-firestore-subscriber";
import { useAuth } from "@/composables/useAuth";

const { user } = useAuth();
const collections = {
  users: [],
  gameTypes: [],
  friendRequests: [
    [["users", "array-contains", "{userId}"]],
  ],
};

const { data } = useFirestoreSubscriptions(user, collections);
</script>

<template>
  <div>
    <h1>Users</h1>
    <ul v-if="!data.loading">
      <li v-for="user in data.users" :key="user.id">{{ user.name }}</li>
    </ul>
    <p v-else>Loading...</p>
  </div>
</template>
```

## 🛠 Features
✔ **Realtime Firestore Subscriptions**  
✔ **Dynamic Query Filters (`where`, `array-contains`, etc.)**  
✔ **Easy Integration with Vue 3**  
