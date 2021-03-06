/* eslint-disable no-magic-numbers */
import SendSuccess from '@/components/Modals/SendSuccess/SendSuccessContent.vue';
import SendSuccessModal from '@/components/Modals/SendSuccess';

import { mount } from '@vue/test-utils';
import { localVue, i18n, createRouter } from '@/helpers/SetupLocalVue';
import { createMocks as createStoreMocks } from '@/store/__mocks__/store.js';
import Wallet from '@/store/wallet/entities/wallet';
import cordovaMocks from '~/test/CordovaMocks';
import Coin from '@/store/wallet/entities/coin';
import LatestPrice from '@/store/latestPrice';

describe('modals/SendSuccess', () => {
  let wrapper;
  let router;
  let storeMocks;

  const walletData = JSON.parse('{"$id":3,"id":3,"account_id":1,"name":"Bitcoin","displayName":"Bitcoin","symbol":"BTC","sdk":"Bitcoin","network":"BITCOIN_TESTNET","internalChainAddressIndex":23,"externalChainAddressIndex":15,"externalAddress":"2NGBz7mknbB1GxFSddxa47C3S6qS4FuTnyd","confirmedBalance":0.52543197,"unconfirmedBalance":0,"imported":false,"enabled":false,"lastBlockHeight":0,"parentName":"","parentSdk":"","contractAddress":"","decimals":"","hdWallet":{"bip":49,"ext":{"xpriv":"xprv9ztbaJYMADTpxd5o1wyCqJAfnBjbLvSqWsqgk2HKSgDsi4BQPBf5PdJ4XLPZd4ugHQ9o45sExCuJuWBnxyu61Gt7fVj1kAPoB1hsze1XNAC","xpub":"xpub6Dswyp5Ezb28B7AG7yWDCS7QLDa5kPAgt6mHYQgw11krarWYviyKwRcYNbeutQRsNtQn1DD9SnaXHMpwpzAEDnBxvZZrDFQ2ehUGw8kxH6u"},"int":{"xpriv":"xprv9ztbaJYMADTpzuEkRPVdJkHNUmdBg98S2VUv91asoQzVTZtHsavn9SYuxy4iYwjpLZrmNy4oUJQoS6fGUJBMvT7Kfm3uvw1Q9b3DhJY23i5","xpub":"xpub6Dswyp5Ezb28DPKDXR2dftE72oTg5brHPiQWwPzVMkXULNDSR8F2hEsPpEZKhymsboomxhqiwmnvec5FTc36WuFWSGPtjQrL6YrQ6JWSBnh"},"type":1,"network":{"name":"BITCOIN_TESTNET","type":"testnet","bip":1,"segwit":true,"discovery":"http://92.207.178.198:3001/api","broadcastUrl":"https://chain.so/api/v2/send_tx/BTCTEST","feeApi":"https://api.blockcypher.com/v1/btc/main","connect":{"messagePrefix":"0018Bitcoin Signed Message:","bech32":"tb","bip32":{"public":70617039,"private":70615956},"pubKeyHash":111,"scriptHash":196,"wif":239}}},"erc20Wallet":""}');
  const erc20WalletData = JSON.parse('{"$id":4,"id":4,"account_id":1,"name":"Catalyst","displayName":"Catalyst","symbol":"CAT","sdk":"ERC20","network":"ETHEREUM","internalChainAddressIndex":0,"externalChainAddressIndex":1,"externalAddress":null,"confirmedBalance":10,"unconfirmedBalance":0,"imported":true,"enabled":true,"lastBlockHeight":0,"parentName":"Ethereum","parentSdk":"Ethereum","contractAddress":"123","decimals":"3","hdWallet":{"bip":49,"ext":{"xpriv":"xprv9zZZrtcYB6bg2sxhoVYYKAM8duZHP1MwV1SYNVLStU6qpY6NCKfuTCeeHe1MsBeYDt7XipqZYtshoGC9ghNZ6EVwugKxUPM7m2tFmExu2mt","xpub":"xpub6DYvGQ9S1U9yFN3AuX5YgJHsBwPmnU5nrEN9Ask4SodphLRWjrz9zzy88v6HFPGJuDoMg7hhEG2yFFhU7Djqx3AoE57hEL748iFp26JLXtC"},"int":{"xpriv":"xprv9zZZrtcYB6bg6LXLr8kweVuqCWUTc5dnFDJ526bEyz5pLHdfHRx2D1UPLE8bZy6hK8f1YpXQHeGF2FWEds5S1MSbTH2boaQRNUoz6vy4MRq","xpub":"xpub6DYvGQ9S1U9yJpboxAHx1drZkYJx1YMdcSDfpUzrYKcoD5xopyGGkonsBXbmCnHteYYMcjgWRU7EyByaGf8Mav4y5BTkYmC2TD2JVPmkJxs"},"type":1,"network":{"name":"BITCOIN_TESTNET","type":"testnet","bip":1,"segwit":true,"discovery":"http://92.207.178.198:3001/api","broadcastUrl":"https://chain.so/api/v2/send_tx/BTCTEST","feeApi":"https://api.blockcypher.com/v1/btc/main","connect":{"messagePrefix":"Bitcoin Signed Message:","bech32":"tb","bip32":{"public":70617039,"private":70615956},"pubKeyHash":111,"scriptHash":196,"wif":239}}},"erc20Wallet":""}');

  const erc20CoinData = JSON.parse('{"$id":"Catalyst","name":"Catalyst","displayName":"Catalyst","minConfirmations":11,"sdk":"ERC20","symbol":"CAT","network":"ETHEREUM_ROPSTEN","denomination":"0.000","parentName":"Ethereum","parentSdk":"Ethereum","contractAddress":"123","decimals":"4"}');
  const bitcoinCoinData = JSON.parse('{"$id":"Bitcoin","name":"Bitcoin","displayName":"Bitcoin","minConfirmations":6,"sdk":"Bitcoin","symbol":"BTC","network":"BITCOIN_TESTNET","denomination":"0.00000000","parentName":"","parentSdk":"","contractAddress":"","decimals":""}');
  const latestPriceData = JSON.parse('{"$id":"BTC_GBP","coin":"BTC","currency":"GBP","updated":1554305869988,"data":{"VOLUME24HOURTO":10147125.523436274,"PRICE":3818.12,"CHANGEPCT24HOUR":4.734003741558176}}');

  const customStore = {
    state: {
      modals: {
        sendConfirmTxData: {
          transaction: {
            receiver: ['123'],
            value: 1,
            fee: 0.01,
            hash: '0000',
          },
        },
      },
    },
  };

  const defaultProps = {};
  function wrapperInit(options) {
    return mount(SendSuccess, options);
  }

  function storeInit(custom, propsData, path = '/wallet/single/send/3') {
    storeMocks = createStoreMocks(custom);
    Wallet.insert({ data: [walletData, erc20WalletData] });
    LatestPrice.insert({ data: latestPriceData });
    Coin.insert({ data: [bitcoinCoinData, erc20CoinData] });

    router = createRouter(storeMocks.store);
    router.push({ path });
    wrapper = wrapperInit({
      i18n,
      router,
      localVue,
      propsData,
      parentComponent: SendSuccessModal,
      store: storeMocks.store,
      mocks: {
        errorHandler: jest.fn(),
      },
    });
  }

  beforeEach(() => {
    cordovaMocks.initMocks();
    storeInit(customStore, defaultProps);
  });

  afterEach(() => { cordovaMocks.destroyMocks(); });

  it('renders and matches snapshot', () => {
    expect(wrapper.element).toMatchSnapshot();
  });

  it('displays the txData', () => {
    expect(wrapper.text()).toMatch('1 BTC');
    expect(wrapper.text()).toMatch('0000');
    expect(wrapper.text()).toMatch('123');
  });

  it('does not display the price in fiat if no data available', () => {
    storeInit(customStore, defaultProps, '/wallet/single/send/4');
    expect(wrapper.text()).toMatch('1 CAT');
    expect(wrapper.text()).toMatch('0000');
    expect(wrapper.text()).toMatch('123');
  });

  it('closes the modal and returns to previous page when close button is clicked ', () => {
    wrapper.findAll('button').at(2).trigger('click');
    expect(storeMocks.actions.setSendSuccessModalOpened.mock.calls[0][1]).toBe(false);
  });

  describe('copyToClipboard()', () => {
    it('can copy the address when the copy button is clicked', (done) => {
      wrapper.vm.$toast.create = jest.fn();
      cordova.plugins.clipboard.mockBehaviour = 1;
      wrapper.findAll('button').at(1).trigger('click');
      setTimeout(() => {
        expect(wrapper.vm.$toast.create).toHaveBeenCalled();
        done();
      }, 0);
    });

    it('can handle errors if tx cannot be copied', (done) => {
      customStore.state.modals.sendConfirmTxData.transaction.receiver = '123';
      storeInit(customStore, defaultProps);
      wrapper.vm.$toast.create = jest.fn();
      cordova.plugins.clipboard.mockBehaviour = 2;
      wrapper.findAll('button').at(1).trigger('click');
      setTimeout(() => {
        expect(wrapper.vm.errorHandler).toHaveBeenCalled();
        done();
      }, 0);
    });
  });

  describe('parent modal', () => {
    it('opens and closes the modal', () => {
      wrapper.vm.$parent.$store = wrapper.vm.$store;
      wrapper.vm.$parent.sendSuccessModalOpened = false;
      expect(wrapper.vm.$parent.sendSuccessModalOpened).toBe(false);
      expect(storeMocks.actions.setSendSuccessModalOpened.mock.calls[1][1]).toBe(false);
      wrapper.vm.$parent.sendSuccessModalOpened = true;
      expect(storeMocks.actions.setSendSuccessModalOpened.mock.calls[2][1]).toBe(true);
    });
  });
});
