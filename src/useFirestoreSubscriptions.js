import { reactive, watch } from "vue";
import { collection, query, where, onSnapshot } from "firebase/firestore";

const activeListeners = new Map();
const data = reactive({ loading: true });

function buildQuery(db, collectionName, whereConditions) {
  if (!Array.isArray(whereConditions) || whereConditions.length === 0) {
    return [query(collection(db, collectionName))];
  }

  return whereConditions.map((conditions) => {
    const queryConstraints = conditions.map((c) => where(...c));
    return query(collection(db, collectionName), ...queryConstraints);
  });
}

function subscribeToCollection(db, collectionName, whereConditions = []) {
  if (activeListeners.has(collectionName)) {
    activeListeners.get(collectionName)();
  }

  const firestoreQueries = buildQuery(db, collectionName, whereConditions);
  const unsubscribeList = [];

  firestoreQueries.forEach((firestoreQuery) => {
    const unsubscribe = onSnapshot(firestoreQuery, (snapshot) => {
      const updatedData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // 🔥 Update `data` reactively
      data[collectionName] = updatedData;
      data.loading = false;
    });

    unsubscribeList.push(unsubscribe);
  });

  activeListeners.set(collectionName, () => {
    unsubscribeList.forEach((unsubscribe) => unsubscribe());
  });
}

function unsubscribeAll() {
  if (activeListeners.size > 0) {
    activeListeners.forEach((unsubscribe) => unsubscribe());
    activeListeners.clear();

    Object.keys(data).forEach((key) => {
      if (key !== "loading") {
        delete data[key];
      }
    });

    data.loading = true;
  }
}

/**
 * 🔥 Hook for managing Firestore subscriptions dynamically.
 * @param {Object} db - Firestore instance (user-provided)
 * @param {Object} user - The logged-in Firebase user.
 * @param {Object} collections - An object where keys are Firestore collections, and values are filter conditions.
 */
export function useFirestoreSubscriptions(db, user, collections = {}) {
  if (!db || !user) return { data };

  watch(user, (newUser) => {
    unsubscribeAll();

    if (newUser) {
      Object.entries(collections).forEach(([collectionName, whereConditions]) => {
        if (!Array.isArray(whereConditions)) return;

        const processedWhere = whereConditions.map((cond) =>
          cond.map((c) => (c.includes("{userId}") ? [c[0], c[1], newUser.uid] : c))
        );

        subscribeToCollection(db, collectionName, processedWhere);
      });
    }
  }, { immediate: true });

  return { data };
}