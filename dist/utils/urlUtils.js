"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateURLPath = void 0;
// Function to update the URL path dynamically
const updateURLPath = (pagePath) => {
    window.history.replaceState(null, '', pagePath);
    console.log(`URL path updated to: ${pagePath}`);
};
exports.updateURLPath = updateURLPath;
