/**
 * The store caches its value in module scope, so each test re-imports it
 * after resetting the module registry to get a fresh "page load", rather
 * than putting a reset hook in production code for tests to call.
 */

function mockMatchMedia(reduceMotion: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: reduceMotion && query.includes("reduce"),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia;
}

async function loadStore() {
  jest.resetModules();
  return import("../animation-preference");
}

beforeEach(() => {
  window.localStorage.clear();
  mockMatchMedia(false);
});

describe("default preference", () => {
  it("is on when nothing is stored and motion is welcome", async () => {
    expect((await loadStore()).getAnimationPreference()).toBe(true);
  });

  it("is off when the visitor asked for reduced motion", async () => {
    mockMatchMedia(true);
    expect((await loadStore()).getAnimationPreference()).toBe(false);
  });

  it("lets an explicit choice override the reduced-motion default", async () => {
    mockMatchMedia(true);
    window.localStorage.setItem("cm-animation", "on");
    expect((await loadStore()).getAnimationPreference()).toBe(true);
  });

  it("falls back to the default when the stored value is nonsense", async () => {
    window.localStorage.setItem("cm-animation", "banana");
    expect((await loadStore()).getAnimationPreference()).toBe(true);
  });

  it("renders as on during SSR, before any browser state is known", async () => {
    expect((await loadStore()).getServerAnimationPreference()).toBe(true);
  });
});

describe("setting the preference", () => {
  it("reports the new value back", async () => {
    const store = await loadStore();

    store.setAnimationPreference(false);

    expect(store.getAnimationPreference()).toBe(false);
  });

  it("survives a reload", async () => {
    (await loadStore()).setAnimationPreference(false);

    expect((await loadStore()).getAnimationPreference()).toBe(false);
  });

  it("keeps working when localStorage refuses to store anything", async () => {
    const store = await loadStore();
    const setItem = jest
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        // Safari in private mode throws here.
        throw new DOMException("QuotaExceededError");
      });

    expect(() => store.setAnimationPreference(false)).not.toThrow();
    expect(store.getAnimationPreference()).toBe(false);

    setItem.mockRestore();
  });
});

describe("subscribers", () => {
  it("is notified when the preference changes", async () => {
    const store = await loadStore();
    const listener = jest.fn();
    store.subscribeToAnimationPreference(listener);

    store.setAnimationPreference(false);

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("is not notified when the value did not actually change", async () => {
    const store = await loadStore();
    const listener = jest.fn();
    store.subscribeToAnimationPreference(listener);

    store.setAnimationPreference(true);

    expect(listener).not.toHaveBeenCalled();
  });

  it("stops hearing about changes once unsubscribed", async () => {
    const store = await loadStore();
    const listener = jest.fn();
    const unsubscribe = store.subscribeToAnimationPreference(listener);

    unsubscribe();
    store.setAnimationPreference(false);

    expect(listener).not.toHaveBeenCalled();
  });
});
