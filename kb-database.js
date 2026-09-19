// Public browser configuration. Database policies must enforce access.
(function () {
  'use strict';
  const url = "https://tuiljcklknbjjkbulriq.supabase.co";
  const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1aWxqY2tsa25iamprYnVscmlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NDY0MTYsImV4cCI6MjA5NTEyMjQxNn0.v45fdp9jfRbXA4Lr57AV3a4hbHyHn6Fxq5CXpdNf4Ic";
  let client;
  window.KBDatabase = Object.freeze({
    url, key,
    getClient() {
      if (!window.supabase) throw new Error('Databasetilkoblingen kunne ikke lastes. Last siden på nytt.');
      if (!client) client = window.supabase.createClient(url, key);
      return client;
    }
  });
})();
