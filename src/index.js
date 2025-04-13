// vue-firestore-subscriber/index.js

import { reactive, readonly, watchEffect } from 'vue';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';

// Shared state
const state = reactive({
  loading: true,
});

let _db = null;
let _collections = {};
let _authUnsubscribe = null;
let _activeListeners = new Map();

function buildQuery(db, collectionName, whereConditions, uid) {
  if (!Array.isArray(whereConditions) || whereConditions.length === 0) {
    return [query(collection(db, collectionName))];
  }

  return whereConditions.map((conditions) => {
    const queryConstraints = conditions.map((c) => {
      const [field, op, value] = c;
      const actualValue = typeof value === 'string' && value.includes('{userId}')
        ? value.replace('{userId}', uid)
        : value;
      return where(field, op, actualValue);
    });
    return query(collection(db, collectionName), ...queryConstraints);
  });
}

function subscribeToCollection(collectionName, whereConditions, uid) {
  if (_activeListeners.has(collectionName)) {
    _activeListeners.get(collectionName)();
  }

  const firestoreQueries = buildQuery(_db, collectionName, whereConditions, uid);
  let combinedData = [];
  const unsubscribeList = [];

  firestoreQueries.forEach((firestoreQuery) => {
    const unsubscribe = onSnapshot(firestoreQuery, (snapshot) => {
      snapshot.docs.forEach((doc) => {
        const docData = { id: doc.id, ...doc.data() };
        if (!combinedData.some((item) => item.id === docData.id)) {
          combinedData.push(docData);
        }
      });
      state[collectionName] = combinedData;
      state.loading = false;
    });

    unsubscribeList.push(unsubscribe);
  });

  _activeListeners.set(collectionName, () => {
    unsubscribeList.forEach((u) => u());
  });
}

function unsubscribeAll() {
  _activeListeners.forEach((unsubscribe) => unsubscribe());
  _activeListeners.clear();

  Object.keys(state).forEach((key) => {
    if (key !== 'loading') delete state[key];
  });

  state.loading = true;
}

export function initFirestoreSubscriber(db, collections) {
  _db = db;
  _collections = collections;

  const auth = getAuth();

  if (_authUnsubscribe) _authUnsubscribe();

  _authUnsubscribe = onAuthStateChanged(auth, (user) => {
    unsubscribeAll();

    if (user && user.uid) {
      Object.entries(_collections).forEach(([collectionName, whereConditions]) => {
        subscribeToCollection(collectionName, whereConditions, user.uid);
      });
    }
  });
}

export function useFirestoreData() {
  return {
    data: readonly(state),
    loading: readonly(state).loading,
  };
}
