import { ensureProductImageBucket } from "../lib/storage";

ensureProductImageBucket()
  .then(() => console.log("Product image bucket ready."))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
