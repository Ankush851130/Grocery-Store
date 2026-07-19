const loadScript = (sourceUrl) => {
  return new Promise((resolve) => {
    const existingScript = document.querySelector(`script[src="${sourceUrl}"]`);

    if (existingScript) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = sourceUrl;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default loadScript;
