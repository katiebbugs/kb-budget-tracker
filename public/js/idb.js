let db;
const request = indexedDB.open('budget-tracker', 1);

request.onupgradeneeded = function(event) {
    const db = event.target.result;

    console.log(event);

    db.createObjectStore('new_transaction', { autoIncrement: true });
};

request.onsuccess = function(event) {
    db = event.target.result;

    console.log('Success!' + event.type);

    if (navigator.onLine) {
      uploadTransaction();
    }
};
  
request.onerror = function(event) {
console.log(event.target.errorCode);
};

function saveRecord(record) {
    const transaction = db.transaction(['new_transaction'], 'readwrite'); 
    const store = transaction.objectStore('new_transaction');

    console.log('Record Saving');
  
    store.add(record);
};

function uploadTransaction() {
    const transaction = db.transaction(['new_transaction'], 'readwrite');
    const store = transaction.objectStore('new_transaction');
    const getAll = store.getAll();

    console.log('Record Uploading');
  
    getAll.onsuccess = function() {
    if (getAll.result.length > 0) {
      fetch('/api/transaction', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        }
      })
        .then(response => response.json())
        .then(serverResponse => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }

          const transaction = db.transaction(['new_transaction'], 'readwrite');
          const store = transaction.objectStore('new_transaction');

          store.clear();

          alert('Back Online: all transactions have been submitted');
        })
        .catch(err => {
          console.log(err);
        });
    }
  }
}

// listening for app to come back online
window.addEventListener('online', uploadTransaction);