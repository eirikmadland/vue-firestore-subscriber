# vue-firestore-subscriber

A simple Vue 3 composable library to handle centralized Firestore subscriptions — initialized once in your app and accessible anywhere.

🔥 Automatically tracks Firebase Auth state, sets up live listeners, and makes your Firestore data globally available.

---

## ✨ Features

- 🔥 One-time setup in `App.vue`
- 🔐 Firebase Authentication-aware (`onAuthStateChanged` internally handled)
- 📡 Reactive live Firestore subscriptions
- 🧠 `userId` placeholder support in query filters
- 📦 No need for Vuex/Pinia
- ⚙️ Tiny API: `initFirestoreSubscriber()` and `useFirestoreData()`

---

## 🚀 Installation

```bash
npm install vue-firestore-subscriber
```

---

## 🛠 Usage

### 1. Setup in `App.vue`

```js
import { initFirestoreSubscriber } from 'vue-firestore-subscriber';
import { db } from './firebase';

initFirestoreSubscriber(db, {
  users: [],
  posts: [[['authorId', '==', '{userId}']]],
  comments: [[['visible', '==', true]]],
});
```

### 2. Use in any component

```js
import { useFirestoreData } from 'vue-firestore-subscriber';

const { data, loading } = useFirestoreData();

watchEffect(() => {
  if (!loading.value) {
    console.log(data.value.posts);
  }
});
```

---

## 🔧 Collection Query Syntax

```js
{
  collectionName: [
    [ [field, operator, value], ... ],
    [ [field, operator, value], ... ],
  ]
}
```

Use `{userId}` as a placeholder to auto-fill with current user UID.

---

## ✅ Example

```js
const collections = {
  users: [],
  posts: [[['authorId', '==', '{userId}']]],
  comments: [[['visible', '==', true]]]
};

initFirestoreSubscriber(db, collections);
```

---

## 📦 API

### `initFirestoreSubscriber(db, collections)`
Initializes the library and sets up subscriptions.

- `db`: Your Firebase Firestore instance
- `collections`: Object of collection filters

### `useFirestoreData()`
Returns a global reactive object:

```js
{
  data: reactive({ collectionName: [...] }),
  loading: ref(true/false)
}
```

---

## ❓FAQ

### What happens when the user logs out?
All subscriptions are automatically cleaned up.

### Can I use this in multiple Vue files?
Yes! Just call `useFirestoreData()` anywhere after `initFirestoreSubscriber()` has been called.

---

## 📃 License
MIT
