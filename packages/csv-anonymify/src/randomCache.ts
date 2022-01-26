const randomPick = (arr: any[]) => {
  const randomIndex = Math.round(Math.random() * (arr.length - 1));
  return arr[randomIndex];
};

const MAX_LENGTH = 100;

const randomCaches = new WeakMap();

// cache up to 500 records then return random items
export const randomCache =
  (fn: Function, { limit: number = MAX_LENGTH } = {}) =>
  (...args: any) => {
    const key = args.length ? JSON.stringify(args) : "";
    const cachedFunction = randomCaches.get(fn) || {};
    const cachedValues = cachedFunction[key] || [];
    // console.log("cachedValues", cachedValues.length);
    if (cachedValues.length >= MAX_LENGTH) {
      const cachedValue = randomPick(cachedValues);
      return cachedValue;
    }
    const value = fn(...args);
    if (cachedValues.indexOf(value) === -1) {
      cachedValues.push(value);
      cachedFunction[key] = cachedValues;
      randomCaches.set(fn, cachedFunction);
    }
    return value;
  };
