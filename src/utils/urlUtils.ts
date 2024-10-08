// Function to update the URL path dynamically
export const updateURLPath = (pagePath: string): void => {
    window.history.replaceState(null, '', pagePath);
    console.log(`URL path updated to: ${pagePath}`);
};
