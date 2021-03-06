import { shallowMount } from '@vue/test-utils';
import Complete from '@/pages/Setup/Steps/Complete';
import { localVue, i18n, createRouter } from '@/helpers/SetupLocalVue';
import { createMocks as createStoreMocks } from '@/store/__mocks__/store.js';

describe('Complete.vue', () => {
  let store;
  let wrapper;
  let accountInitializer;
  let BackEndService;
  let backEndService;
  let errorHandler;
  let storeMocks;
  let router;
  let setOnline = true;
  const delay = 501;
  const propsData = {};
  const map = [];

  function wrapperInit(options) {
    window.addEventListener = jest.fn((event, cb) => {
      map[event] = cb;
    });
    return shallowMount(Complete, options);
  }

  function storeInit(custom) {
    errorHandler = jest.fn();
    backEndService = {
      connect: jest.fn(),
      loadPriceFeed: jest.fn(),
    };
    BackEndService = jest.fn().mockImplementation(() => {
      return {
        connect: jest.fn(),
        loadPriceFeed: jest.fn(),
      };
    });
    accountInitializer = {
      createAccount: jest.fn(() => { return { id: 5 }; }),
      createWallets: jest.fn(),
      createERC20Wallets: jest.fn(),
    };
    storeMocks = createStoreMocks(custom);
    router = createRouter(storeMocks.store);
    router.push({ path: '/setup/7' });
    wrapper = wrapperInit({
      i18n,
      router,
      localVue,
      propsData,
      store: storeMocks.store,
      mocks: {
        accountInitializer,
        BackEndService,
        backEndService,
        errorHandler,
      },
    });
    store = wrapper.vm.$store;
  }

  beforeEach(() => {
    Object.defineProperty(window.navigator, 'onLine', { value: setOnline, configurable: true });
    storeInit();
  });

  it('renders and matches snapshot', () => {
    expect(wrapper.element).toMatchSnapshot();
  });

  it('displays a loading modal', (done) => {
    setTimeout(() => {
      expect(storeMocks.actions.setLoading).toHaveBeenCalled();
      setOnline = false;
      done();
    }, delay);
  });

  it('displays reconnect to internet screen if offline', (done) => {
    map.offline();
    wrapper.vm.$nextTick(() => {
      setTimeout(() => {
        expect(wrapper.vm.showContent).toBe(true);
        expect(wrapper.text()).toMatch(wrapper.vm.$t('completeSetup'));
        expect(wrapper.text()).toMatch(wrapper.vm.$t('reconnectToInternet'));
        done();
      }, delay);
    });
  });

  it('enables activate wallet button when connected to internet', (done) => {
    map.offline();
    wrapper.vm.$nextTick(() => {
      setTimeout(() => {
        expect(wrapper.contains('q-btn-stub[disabled="true"')).toBe(true);
        map.online();
        setTimeout(() => {
          expect(wrapper.contains('q-btn-stub[disabled="true"')).toBe(false);
          setOnline = true;
          done();
        }, delay);
      }, delay);
    });
  });

  describe('complete()', () => {
    it('creates an account and adds it to the database', (done) => {
      wrapper.vm.$nextTick(() => {
        setTimeout(() => {
          expect(accountInitializer.createAccount).toHaveBeenCalled();
          expect(storeMocks.actions.setAuthenticatedAccount).toHaveBeenCalled();
          done();
        }, delay);
      });
    });

    it('calls accountInitializer to generate the wallets', (done) => {
      wrapper.vm.$nextTick(() => {
        setTimeout(() => {
          expect(accountInitializer.createWallets).toHaveBeenCalled();
          expect(accountInitializer.createERC20Wallets).toHaveBeenCalled();
          done();
        }, delay);
      });
    });

    it('initialises the back end service and fetches the price feed', (done) => {
      wrapper.vm.$nextTick(() => {
        setTimeout(() => {
          expect(backEndService.connect).toHaveBeenCalled();
          expect(backEndService.loadPriceFeed).toHaveBeenCalled();
          done();
        }, delay);
      });
    });

    it('clears the setup data and loads the wallet screen', (done) => {
      wrapper.vm.$nextTick(() => {
        setTimeout(() => {
          expect(storeMocks.actions.clearSetupData).toHaveBeenCalled();
          expect(store.state.route.path).toBe('/wallet');
          done();
        }, delay);
      });
    });

    it('handles errors', (done) => {
      backEndService.connect.mockImplementation(() => { throw new Error('Test Error'); });
      wrapper.vm.$nextTick(() => {
        setTimeout(() => {
          expect(wrapper.vm.errorHandler).toHaveBeenCalled();
          done();
        }, delay);
      });
    });
  });
});
