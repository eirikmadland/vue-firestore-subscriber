// vue-firestore-subscriber/index.js

import { reactive, readonly, watchEffect, computed } from 'vue';
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
  error: null,
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
  const unsubscribeList = [];

  const queryResults = new Map();
  
  firestoreQueries.forEach((firestoreQuery, index) => {
    const unsubscribe = onSnapshot(
      firestoreQuery,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        queryResults.set(index, docs);
  
        const merged = Array.from(queryResults.values()).flat();
        const unique = merged.reduce((acc, curr) => {
          if (!acc.find(item => item.id === curr.id)) acc.push(curr);
          return acc;
        }, []);
  
        state[collectionName] = unique;
        state.loading = false;
      },
      (error) => {
        console.error(`[Firestore error] ${collectionName}:`, error);
        state.error = `Failed to load ${collectionName}: ${error.message}`;
        state.loading = false;
      }
    );
  
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
    if (key !== 'loading' && key !== 'error') delete state[key];
  });

  state.loading = true;
  state.error = null;
}

export function initFirestoreSubscriber(db, collections) {
  _db = db;
  _collections = collections;
  
  Object.keys(collections).forEach((collectionName) => {
    if (!(collectionName in state)) {
      state[collectionName] = [];
    }
  });

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
    error: computed(() => state.error),
  };
}
